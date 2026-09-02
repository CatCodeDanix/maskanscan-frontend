# Geospatial data pipeline — implementation plan

Stack: Next.js (App Router) · deck.gl + react-map-gl · Neon Postgres/PostGIS · TanStack Query · Vercel

All backend access goes through **Next.js Server Actions**, not API routes. No `/api/*` handlers for this pipeline — every data fetch (map data, list pagination, refresh) is a Server Action called directly from client components. This applies uniformly to every data path described below.

---

## 1. Core constraints this plan is built around

- Point data changes quickly → no precomputed/materialized clustering, no long-lived tile caching. Aggregation must be cheap enough to compute live, per request.
- Default viewport alone can exceed 150k points → viewport (bbox) filtering alone is not sufficient at low zoom; aggregation is mandatory below the zoom threshold.
- Vercel Hobby constraints (10s execution ceiling, 4 CPU-hrs/month) → live aggregation must stay cheap (grid-based, not DBSCAN) and payloads must stay small.

---

## 2. Zoom-tier data strategy

**Threshold: zoom 14** (tune empirically against actual data density — see §8).

### Zoom < 14 — backend aggregation tier
- Every `moveend` in this tier triggers a **Server Action** call with `{ bbox, zoom, filters }`.
- Backend computes, live, per request:
  - **Clusters** for dense sub-regions of the bbox — grid/geohash aggregation (`ST_SnapToGrid` + `GROUP BY` + `COUNT` + centroid), not `ST_ClusterDBSCAN`. Cheap enough to run on every request against fast-changing data; DBSCAN is not.
  - **Raw points with full attribute data** for sparse sub-regions where density doesn't warrant clustering.
  - Both returned in one response payload.
- No client-side caching of the *raw* dataset here — only the request/response is cached via TanStack Query (see §3). Every genuine bbox change is a live refetch, by design, because staleness tolerance in this tier follows the same freshness rules as everywhere else.

### Zoom ≥ 14 — frontend clustering tier
- On crossing into this tier, fetch **once**: raw points for the zoom-14-equivalent bbox, padded with a margin (see §4).
- All further zoom-in (15, 16, 17...) is handled **entirely client-side** via `supercluster` — no additional requests.
- Panning within the padded zoom-14 bbox: no refetch, re-filter client-side.
- Panning **outside** the padded zoom-14 bbox, or zooming back down below 14: triggers a new fetch (see §4 for exact rule).

---

## 3. Caching — TanStack Query

- **Cache duration: 20 minutes** (`staleTime` and `gcTime` both set to 20 min), matching the polling interval so cache expiry and poll cadence stay in sync.
- **Query key**: `['mapData', snappedBbox, zoomTier, filters]`
  - `snappedBbox`: the request bbox rounded to a coarse grid (e.g. ~0.01–0.02° depending on measured data density) before being used as a key. This prevents near-identical viewports (a few pixels of pan) from being treated as distinct cache entries and refetching unnecessarily.
  - `zoomTier`: `'clustered'` (< 14) or `'raw'` (≥ 14) — not the raw zoom number, since within a tier the fetch behavior doesn't change.
  - `filters`: current active frontend filters, so filtered and unfiltered views never collide in cache.
- **Zooming out**: since the cache key is bbox+tier scoped, returning to a previously-visited (bbox, tier) combination within 20 minutes serves from cache automatically — no special-case logic needed beyond the key design itself.

---

## 4. Reconciliation check (avoiding redundant fetches on pan/zoom)

Before firing a request on `moveend`:

1. Determine current zoom tier (< 14 or ≥ 14).
2. If the tier is unchanged from the last fetch:
   - Compare the new viewport bbox against the **last-fetched bbox expanded by a fixed margin** (e.g. 20–30% of viewport dimensions, tuned in §8).
   - If new bbox ⊆ padded last-fetched bbox → **skip the network call**, re-filter/re-render from already-held client data.
   - If not contained → fetch.
3. If the tier changed (crossed the zoom-14 boundary in either direction) → always fetch, regardless of bbox containment.

This single check covers both the "user pans slightly, don't refetch" case and the "user pans far while zoomed in past 14, still needs new data" case flagged during review — the zoom-14 one-time-fetch only holds *within* the padded region, not unconditionally.

---

## 5. Trigger layer

| Trigger | Behavior |
|---|---|
| `moveend` (pan or zoom settles) | Debounce ~150–200ms → reconciliation check (§4) → fetch via Server Action if needed |
| Idle poll | Timer resets on every `moveend`. If no map interaction for **15–20 minutes**, poll current bbox/zoom via Server Action. Never fires while the user is actively interacting. |
| Manual refresh button | Calls `queryClient.invalidateQueries()` with **no key scoping** — invalidates the entire cache, not just the active bbox/zoom. Ensures that after refresh, navigating to any other previously-cached zoom/bbox also pulls fresh data rather than serving a pre-refresh snapshot. |
| Locate button (from item drawer) | Map flies to the item's location. This move naturally fires `moveend`, which goes through the normal trigger path above — no separate fetch logic required. |

While a fetch is in flight (any trigger), **keep the previous data rendered** — don't clear the layer or show a blank/loading map. Swap to new data only once the response resolves. Avoids flicker on every pan/zoom/poll.

---

## 6. Infinite scroll list

- Independent from the map's clustering logic, but **shares the same bbox and active filters**.
- Separate TanStack Query, separate Server Action, separate debounce — fired alongside the map's request on the same `moveend`/filter-change events, but not merged into a single request. Two independent calls, same triggering conditions.
- Pagination: request latest 20 items; on further scroll, request the next page (cursor- or offset-based) within the current bbox + filters.
- On `moveend` producing a new bbox (i.e., one that fails the reconciliation containment check in §4), the list resets pagination and refetches from page 1 for the new bbox — it should reflect "what's currently in view," not accumulate across different viewports.

---

## 7. Item selection → map highlighting

- Clicking a list item opens a detail drawer/panel.
- The drawer holds the item's id and lat/lng.
- **No separate pin layer, no map data refetch triggered by selection itself.** The deck.gl data layer checks, at render time, whether the currently-loaded dataset contains an entry matching the selected id, and if so renders that point with a distinct icon/color to indicate selection.
- **Locate button**: triggers fly-to (map moves → normal `moveend` fetch cycle runs regardless, per §5).
- **Fallback for missing selection**: after any fetch, check whether the selected id is present in the returned raw points.
  - If present → normal per-render highlighting handles it, as above.
  - If absent (the item's point got absorbed into a cluster at the current zoom, or falls outside the current bbox/tier) → render a lightweight, always-on marker layer for just that one id, positioned using the lat/lng already held from the drawer. This guarantees the selection indicator never silently disappears regardless of what the main data layer currently contains.

---

## 8. Values to tune empirically once real data/usage is available

- **Zoom-tier boundary (currently 14)**: validate by querying max row count per bbox at candidate zoom levels across your actual data distribution — the threshold should guarantee the client-side raw-point payload stays in the low thousands, not tens of thousands, everywhere, not just in low-density regions.
- **Reconciliation margin** (pan tolerance before refetch): start around 20–30% of viewport dimensions, adjust based on how it feels in practice.
- **Bbox snapping precision** for cache keys: tune to actual point density so nearby viewports collapse into shared cache entries without over-merging distinct areas.
- **Poll interval** (15–20 min) and **cache TTL** (20 min): keep these aligned; if one changes, reconsider the other.

---

## 9. Server Actions — architectural note

All backend calls in this pipeline are Server Actions, not REST/API routes:

- Map data fetch (clustered or raw, by tier) → Server Action
- List pagination → Server Action
- Manual refresh → re-invokes the same Server Actions after cache invalidation, no separate endpoint
- No `/app/api/*` route handlers for any of the above

This keeps the data-fetching surface consistent with Next.js App Router conventions used elsewhere in the app, and avoids maintaining a parallel REST layer for what is otherwise entirely server-to-client data flow within the same application.
