# RFC: MaskanScan – A Scalable Housing Search Platform

**Status:** v1.0 
**Author:** Danial Abdoli
**Date:** 2026-05-20  

---

## 1. Executive Summary

MaskanScan is a full-stack web application that helps users find the perfect home by aggregating property listings from multiple Iranian real estate sources. It provides an interactive map, advanced filters, saved searches, and notification features. A subscription model unlocks premium capabilities. The system consists of a Next.js frontend, a dedicated Node.js scraper, and a shared PostgreSQL database. This document outlines the complete technical design, architecture, and development plan.

---

## 2. Background & Motivation

The Iranian property market lacks a unified, user-friendly platform that consolidates listings from various websites. MaskanScan aims to fill this gap by:

- Scraping 4–5 major listing sources via their open APIs (no login required).
- Normalizing all data into a single, coherent structure.
- Displaying results on an interactive map with powerful filtering.
- Offering paid subscriptions for advanced features like cron-based alerts, ad-free browsing, and exclusive filters.

The project is built by a single developer, so pragmatism, simplicity, and maintainability are paramount.

---

## 3. Core Functional Requirements (User Stories)

1. **As a visitor**, I want to see aggregated property listings on a map so that I can quickly compare options.
2. **As a user**, I want to filter by price, bedrooms, area, and map bounds to narrow my search.
3. **As a user**, I want to click a marker to see detailed information and a link back to the original source.
4. **As a subscriber**, I want to save complex search filters and get notified (email/PWA push) when new matching properties appear.
5. **As a subscriber**, I want an ad-free experience and access to advanced filters.
6. **As an admin**, I want to trigger on-demand re-scrapes (without waiting for users) and monitor scraper health.
7. **As a future seller**, I want to submit my own property listing and manage it in my panel.

---

## 4. High-Level Architecture

┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│  Next.js (Frontend + API)   │  ← Hosted on Liara/Parspack PaaS
│  - SSR / SPA (App Router)   │
│  - Better Auth (auth)       │
│  - API routes (query DB)    │
│  - Drizzle ORM               │
└──────────────┬──────────────┘
               │
               │  Read/write
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│         (shared)             │
└────────────────▲─────────────┘
                 │
                 │  Read/write
                 │
┌────────────────┴─────────────┐
│  Node.js Scraper Service    │
│  - Reads scraping_state     │
│  - Upserts scraped_listings │
│  - Periodic full sync       │
│  - Schema monitoring        │
│  - Cron jobs (matching)     │
│  - Runs on schedule only    │
└──────────────────────────────┘


All sensitive logic (authentication, subscription checks) lives in Next.js. The scraper is a pure data ingestion worker. The browser never talks to the scraper directly.

---

## 5. Data Pipeline & Scraping Strategy

### 5.1 Scraping Flow (Decoupled)

1. The Node.js scraper runs on a **fixed schedule** (e.g., every 5–10 minutes for incremental, every 6 hours for full sync).
2. It fetches data from external APIs, normalizes it, and **upserts** directly into the shared PostgreSQL `scraped_listings` table.
3. Separately, when a user opens the app or changes filters/map bounds, the browser calls a Next.js API route (`/api/listings`).
4. The API route verifies user session and subscription via Better Auth.
5. If authorized, Next.js **queries the database directly** for the requested filters and returns results to the client.
6. The scraper is never triggered by user actions. The frontend always reads the latest available data snapshot.

If a "refresh" button is needed later, the Next.js API can send an asynchronous signal to the scraper (e.g., HTTP call to a `/trigger` endpoint) and return `202 Accepted`—but the user's request does not wait for scraping to complete.

### 5.2 Incremental Scraping by Latest ID

- For each source, we store the latest `external_id` ever seen in a `scraping_state` table.
- Subsequent scrapes only fetch records with IDs after than the stored value.
- New/updated records are upserted into `scraped_listings` using a unique key of `(source, external_id)`.

### 5.3 Normalization

All external data is transformed into a common schema before insertion. The scraper logic is isolated per source and returns a uniform object.

### 5.4 Handling Staleness & Removals

- Each row contains a `last_seen_at` timestamp that is updated on every upsert.
- A **periodic full sync** (every 6 hours or daily) scans the last 30 days of listing IDs from each source. Any existing listing found gets its `last_seen_at` updated. Listings not seen for a configurable window (e.g., 24 hours) are soft-deleted (`is_active = false`).
- A daily cleanup job can permanently delete records that have been inactive for a long period.

### 5.5 Schema Monitoring

- Before each scrape, a health-check script compares the API response structure against an expected schema (JSON paths we care about).
- If a mismatch is detected, the source is temporarily disabled and an alert is sent (e.g., Telegram bot). The logic is configurable without redeployment.

---

## 6. Database Schema (PostgreSQL + Drizzle ORM)

### `scraped_listings` (Sample fields)

| Column         | Type                     | Description                              |
|----------------|--------------------------|------------------------------------------|
| id             | serial (PK)              | Internal auto-increment ID               |
| source         | varchar(50)              | e.g., 'source_a', 'source_b'             |
| external_id    | varchar(100)             | Original listing ID from the source      |
| title          | text                     |                                          |
| description    | text                     |                                          |
| price          | bigint                   | In Rials                                |
| lat            | double precision         | Latitude                                 |
| lng            | double precision         | Longitude                                |
| attributes     | jsonb                    | Bedrooms, area, floor, etc.              |
| images         | text[]                   | Array of image URLs                      |
| url            | text                     | Original listing URL (link back)         |
| last_seen_at   | timestamp with time zone | Updated on every scrape/upsert           |
| is_active      | boolean (default true)   | Soft-flag for removal                    |
| created_at     | timestamp with time zone |                                          |
| updated_at     | timestamp with time zone |                                          |

**Unique index:** `UNIQUE(source, external_id)`

### `scraping_state`

| Column         | Type                     | Description                              |
|----------------|--------------------------|------------------------------------------|
| source         | varchar(50) (PK)         |                                          |
| last_fetched_id| varchar(100)             | Highest external_id processed            |
| last_full_sync | timestamp                | Last time a full scan was done           |
| is_enabled     | boolean                  | Disabled by schema monitor if broken     |

### `users` (managed by Better Auth adapter)

Standard user table extended with:

- `phone` (verified)
- `role` (free, pro, admin)

### `subscriptions`

| Column         | Type                     |
|----------------|--------------------------|
| id             | serial (PK)              |
| user_id        | uuid (FK to users)       |
| plan           | varchar (free, pro)      |
| status         | varchar (active, expired)|
| zibal_payment_id | varchar (nullable)     |
| expires_at     | timestamp                |

### `saved_searches`

| Column         | Type                     |
|----------------|--------------------------|
| id             | serial (PK)              |
| user_id        | uuid (FK)                |
| filters        | jsonb                    | (price range, bedrooms, map bounds, etc.)
| created_at     | timestamp                |
| is_active      | boolean                  |

### `favorites`

| Column         | Type                     |
|----------------|--------------------------|
| user_id        | uuid (FK)                |
| listing_id     | int (FK to scraped_listings)|
| created_at     | timestamp                |

**Future:** `user_listings` table will extend `scraped_listings` with a nullable `user_id` and `source = 'user'`. This avoids schema migration later.

---

## 7. Authentication & Authorization

- **Library:** Better Auth (Next.js native, database session strategy).
- **User verification:** Phone number verification via SMS (service TBD, possibly Kavenegar or similar Iranian provider).
- **Authorization flow:**
  - Protected API routes check session and subscription tier.
  - Middleware on `/api/*` extracts user from session and attaches to request context.
  - Subscription gating: if a route requires `pro`, middleware returns 402/403 before reaching business logic.

---

## 8. Subscription & Payments

- **Provider:** Zibal (Iranian IPG).
- **Flow:**
  1. User selects plan → Next.js creates a `subscriptions` record with status `pending`.
  2. Redirect to Zibal payment page.
  3. Zibal callback hits a Next.js webhook; on success, subscription status becomes `active` and `expires_at` is set.
- **Feature gating:**
  - Ad display: conditionally render ad component based on `subscription.plan`.
  - Advanced filters & cron alerts: middleware checks active subscription before allowing access.

---

## 9. Notifications & Cron Jobs

- **Saved search matching:** A cron job (inside the Node.js scraper or a scheduled Next.js endpoint) runs every 15 minutes.
  1. Query `saved_searches` where `is_active = true` and `user.subscription.plan = 'pro'`.
  2. For each search, query `scraped_listings` with the saved filters and a `last_seen_at > last_notification_sent` window.
  3. If new matches exist, send notification.
- **Channels:**
  - Email (e.g., using Resend or an Iranian SMTP provider).
  - PWA push notifications (future, requires service worker and VAPID keys).
- **Rate control:** We store a `last_notification_sent_at` per saved search to avoid spamming users on every cron tick.

---

## 10. Frontend & Map

- **Framework:** Next.js 14+ (App Router), React, TypeScript.
- **Styling:** Tailwind CSS + shadcn/ui components.
- **Map:** Maplibre GL JS (free, open-source) with Deck.gl overlay for clustering.
- **Geocoding:** Neshan (Iranian map/geocoding service) for address-to-coordinates conversion during scraping.
- **Data fetching:** Server Components for static content, client-side API calls (`fetch` to Next.js API routes) for map data.
- **State:** Filters are maintained in URL search params to enable sharing/bookmarking.
- **Map interaction:**
  - The app fetches all listings matching the active filters and default city at once (no bounding-box queries).
  - Markers are clustered using Deck.gl’s `ScatterplotLayer` with `cluster` option.
  - Clicking a cluster zooms in; clicking a single marker shows a popup with details and a link to the original source.

---

## 11. Hosting & Infrastructure

- **Next.js:** Deployed on an Iranian PaaS (Liara or Parspack) with Node.js runtime, auto-scaling if needed.
- **Node.js scraper:** Separate service on the same PaaS (internal network) or a small VPS. Both share the same PostgreSQL instance.
- **Database:** Managed PostgreSQL (provided by the PaaS) with backups enabled.
- **File storage (future):** S3-compatible object storage (Liara/Parspack) for user-submitted images.
- **Environment variables:** `.env` for each service, managed via PaaS dashboard. Never committed to version control.
- **CI/CD:** Git-based deployment hooks; simple but effective for a solo dev.

---

## 12. Development Roadmap & Priority

| Phase | Focus                                          |
|-------|------------------------------------------------|
| 1     | Single source scraper → DB → map with markers (MVP proof of concept) |
| 2     | All 4–5 sources, incremental scrape, proxy API, basic filters |
| 3     | Authentication, user roles, favorites          |
| 4     | Subscriptions (Zibal), ad logic, saved searches & cron engine |
| 5     | Admin panel (scraper health, manual triggers), PWA push (optional) |
| 6     | User-submitted listings, user panel, file uploads |

---

## 13. Risks & Mitigations

| Risk                                     | Mitigation |
|------------------------------------------|------------|
| External API changes break scrapers      | Schema monitoring + auto-disable + alerts |
| High volume of listings slows DB queries | Proper indexing (lat/lng, price, source) and eventual caching layer |
| Legal issues with scraping               | Use public APIs only, respect robots.txt, link back to sources |
| Solo developer burnout                   | Phased delivery, automate everything possible, keep stack boring |
| Payment provider downtime                | Store subscription status locally with grace period |

---

## 14. Open Questions (for future refinement)

- Exact Zibal integration details (callback URL, verification).
- SMS provider for phone verification.
- Email delivery limits and fallback.
- Full PWA offline support or only push notifications?
- Analytics and error tracking (e.g., Sentry, Plausible self-hosted).

---

## 15. Conclusion

MaskanScan is designed as a practical, maintainable platform that respects Iranian infrastructure realities and the constraints of a solo developer. The architecture cleanly separates concerns, minimises external exposure, and uses proven, “boring” technology. With this blueprint, development can proceed incrementally with a clear technical direction and a strong foundation for future growth.

---

*This document is a living RFC. As implementation progresses, it should be updated to reflect discovered complexities and refined decisions.*

