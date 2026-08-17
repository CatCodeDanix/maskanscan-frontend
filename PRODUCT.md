# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Renters and home-seekers searching for residential rental properties across Tehran Province who want a single, unified geospatial view instead of switching between fragmented portals.
- **Secondary:** Individual landlords and property owners submitting and managing direct rental listings without agency friction.

## Product Purpose

MaskanScan aggregates residential rental properties across Tehran into a unified, high-performance interactive map interface. It eliminates fragmented cross-site searches by normalizing listings from major Iranian portals, enabling precise neighborhood boundary filtering, custom polygon searches, mortgage/rent conversion calculations, and saved-search notifications.

## Positioning

The dedicated real-time rental aggregation and geospatial discovery platform for Tehran Province—combining cross-portal listing synchronization, Deck.gl/MapLibre boundary overlays, and dynamic deposit-to-rent (تبدیل رهن و اجاره) conversion in a clean Persian RTL interface.

## Operating Context

- **Usage scene:** Mobile web during on-the-go neighborhood visits and desktop web for deep comparative analysis of rental homes in Tehran.
- **Key workflows:** Navigating Tehran neighborhoods/districts via interactive map, toggling mortgage/rent budget ratios (رهن کامل تا اجاره ماهانه), filtering by building attributes (پارکینگ، آسانسور، انباری، سال ساخت), reviewing listing details with photos, and following direct links back to original sources.

## Capabilities and Constraints

- **Scope:** Exclusively rental properties (**رهن و اجاره**)—purchase/sale listings are out of scope.
- **Geographic Boundary:** Strictly **Tehran Province** (استان تهران).
- **Core Technology:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Bun, Tailwind CSS v4, shadcn/ui, MapLibre GL JS + Deck.gl, Drizzle ORM + PostgreSQL, Better Auth.
- **Interface & Localization:** Persian language (فا), IRANSansX typography, strict RTL layout, Persian numerals/dates (Jalali), and Toman price units.
- **Aggregation Policy:** Normalizes external listings with clear source attribution and direct outbound links to original portals.

## Brand Commitments

- **Name:** MaskanScan (مسکن‌اسکن)
- **Voice & Tone:** Modern, transparent, fast, utility-focused, and trustworthy.
- **Identity Assets:** Custom IRANSansX font integration, teal/emerald accent palette with neutral dark/light modes, specialized map pins and cluster badges.

## Evidence on Hand

- Interactive map architecture in src/components/BaseMap.tsx and src/components/DeckGLOverlay.tsx.
- Geospatial polygon pipeline & data specifications in docs/geospatial-pipeline-plan.md.
- End-to-end architecture and data model in docs/ARCHITECTURE.md.

## Product Principles

1. **Tehran Rental Specialization:** Every filter, metric, and conversion formula is purpose-built for the reality of renting in Tehran.
2. **Spatial-First Discovery:** The map is the primary navigation surface; data, cards, and drawers support and respond to the map bounds and selections.
3. **Clarity Over Clutter:** Present normalized, high-density listing data clearly without ads or fake duplicate listings.
4. **First-Class Persian RTL Experience:** Flawless typographic hierarchy, logical spacing, and smooth mobile touch gestures designed natively for Persian users.

## Accessibility & Inclusion

- Strict RTL layout compliance and WCAG AA contrast ratios across light and dark themes.
- Touch-target sizing optimized for mobile map navigation and filter drawers.
