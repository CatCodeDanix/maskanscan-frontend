# MaskanScan Frontend Integration Guide & Direct DB Contract

Welcome to the **Maskanscan Frontend Integration Guide**! This document provides technical specifications for the Next.js web application to query property listings directly from PostgreSQL via **Next.js Server Actions / Drizzle ORM**, as well as the list of available Hono API endpoints provided by the scraper engine.

---

## 1. System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│             maskanscan-backend (This Repo)             │
│  - Background Scheduler & Scraper Engines              │
│  - Rate Limit Cycle Batchers & Fast Bulk Ingestion     │
│  - Post-Full-Scrape Deactivation Engine                │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ (Upserts & Soft-Deletes)
                            ▼
           ┌──────────────────────────────────┐
           │   Shared PostgreSQL Database     │
           │   Table: `scraped_listings`      │
           └────────────────┬─────────────────┘
                            ▲
                            │ (Direct SQL / Drizzle ORM)
                            │
┌───────────────────────────┴────────────────────────────┐
│              Next.js Frontend Application               │
│  - React Server Components (RSC)                       │
│  - Next.js Server Actions (`actions/listings.ts`)      │
│  - Interactive Map & Filters UI                        │
└────────────────────────────────────────────────────────┘
```

### Key Architectural Principles:
1. **Direct DB Connection:** Next.js Server Actions connect directly to the shared PostgreSQL database via Drizzle ORM / Prisma. The frontend **never makes HTTP hops through `maskanscan-backend` to query property listings**.
2. **Autonomous Background Scraper:** The background scraper runs independently, refreshing real estate listings every 20 minutes and executing nightly full syncs at 2:00 AM.
3. **Tomans Currency Standard:** All financial fields (`depositTomans`, `rentTomans`, `equivalentFullDepositTomans`) are strictly in **Tomans** (not Rials).
4. **Guaranteed Coordinates:** 100% of all active listings contain valid `latitude` and `longitude` coordinates for map pin rendering.
5. **Strict Rent Focus:** Default deal type across all scrapers is strictly `"rent"`.

---

## 2. PostgreSQL Database Schema (`scraped_listings`)

Next.js Server Actions query the `scraped_listings` PostgreSQL table directly.

### 2.1 Table Structure & Types

| Column Name | SQL Type | TypeScript Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | `number` | Unique internal autoincrement ID |
| `source` | `VARCHAR(50) NOT NULL` | `"divar"` \| `"sheypoor"` \| `"kilid"` \| `"mrestate"` | Platform source |
| `external_id` | `VARCHAR(255) NOT NULL` | `string` | Unique token / ID on upstream platform |
| `fingerprint_hash` | `VARCHAR(64)` | `string` | SHA-256 fingerprint for deduplication |
| `url` | `TEXT NOT NULL` | `string` | Web URL to original post |
| `title` | `TEXT NOT NULL` | `string` | Listing title string (Persian) |
| `description` | `TEXT` | `string` | Full body description text |
| `deal_type` | `VARCHAR(20) NOT NULL` | `"rent"` \| `"buy"` | Deal type (Rent / Sale) |
| `city` | `VARCHAR(100) NOT NULL` | `string` | English city slug (e.g. `"tehran"`) |
| `district` | `VARCHAR(100)` | `string` | English district slug (e.g. `"janat-abad-markazi"`) |
| `city_persian` | `VARCHAR(100) NOT NULL` | `string` | Persian city name (e.g. `"تهران"`) |
| `district_persian` | `VARCHAR(100)` | `string` | Persian district name (e.g. `"جنت آباد مرکزی"`) |
| `deposit_tomans` | `BIGINT` | `number` | Rent: Deposit in Tomans (رهن) |
| `rent_tomans` | `BIGINT` | `number` | Rent: Monthly rent in Tomans (اجاره ماهانه) |
| `equivalent_full_deposit_tomans` | `BIGINT` | `number` | Rent: Converted full deposit in Tomans (رهن کامل معادل) |
| `total_price_tomans` | `BIGINT` | `number` | Buy: Total sale price in Tomans (قیمت کل) |
| `price_per_sq_meter_tomans` | `BIGINT` | `number` | Buy: Price per m² in Tomans (قیمت هر متر) |
| `is_agreed_deposit` | `BOOLEAN DEFAULT false` | `boolean` | `true` if deposit is "توافقی" |
| `is_agreed_rent` | `BOOLEAN DEFAULT false` | `boolean` | `true` if monthly rent is "توافقی" |
| `is_agreed_price` | `BOOLEAN DEFAULT false` | `boolean` | `true` if total price is "توافقی" |
| `latitude` | `DOUBLE PRECISION NOT NULL` | `number` | Latitude map coordinate |
| `longitude` | `DOUBLE PRECISION NOT NULL` | `number` | Longitude map coordinate |
| `is_fuzzy` | `BOOLEAN DEFAULT false` | `boolean` | `true` if pin position is approximate |
| `is_fallback` | `BOOLEAN DEFAULT false` | `boolean` | `true` if pin resolved to district centroid |
| `attributes` | `JSONB` | `Record<string, any>` | JSON object containing physical amenities |
| `images` | `JSONB` | `string[]` | Array of image URL strings |
| `publisher_type` | `VARCHAR(50)` | `"personal"` \| `"agency"` | Publisher type |
| `publisher_phone` | `VARCHAR(50)` | `string` | Contact phone number (if available) |
| `alternate_sources` | `JSONB` | `Array<{ source, url, externalId, scrapedAt }>` | Cross-platform duplicate listings |
| `published_at` | `TIMESTAMP WITH TIME ZONE` | `string` | ISO 8601 published date |
| `scraped_at` | `TIMESTAMP WITH TIME ZONE` | `string` | ISO 8601 scraped date |
| `last_seen_at` | `TIMESTAMP WITH TIME ZONE` | `string` | ISO 8601 last seen timestamp |
| `ingestion_strategy` | `VARCHAR(50)` | `"fast_search"` \| `"eager_detail"` | Ingestion quality strategy |
| `is_active` | `BOOLEAN DEFAULT true` | `boolean` | `true` if active; `false` if deleted/deactivated |

### 2.2 JSONB Attributes Schema

The `attributes` JSONB column stores physical property features:

```ts
export interface ListingAttributes {
  areaSqMeters?: number;          // Floor area in m²
  bedrooms?: number;              // Number of bedrooms
  yearBuilt?: number;             // Year built (Solar Hijri e.g. 1398)
  hasElevator?: boolean;        // Elevator available
  hasParking?: boolean;         // Parking available
  hasStorage?: boolean;         // Storage room (انباری) available
  hasBalcony?: boolean;         // Balcony available
  floor?: number | string;        // Floor number (e.g. 3, "همکف", ">30")
}
```

---

## 3. Production Next.js Server Action Code Examples

Below is a production-ready Drizzle ORM implementation for your Next.js frontend (`actions/listings.ts`):

```ts
// app/actions/listings.ts
"use server";

import { db } from "@/db"; // Your Next.js Drizzle DB instance
import { scrapedListings } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export interface FilterParams {
  city?: string;
  district?: string;
  dealType?: "rent" | "buy";
  minDeposit?: number;
  maxDeposit?: number;
  minRent?: number;
  maxRent?: number;
  minEquivalentDeposit?: number;
  maxEquivalentDeposit?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  hasParking?: boolean;
  hasElevator?: boolean;
  hasStorage?: boolean;
  hasBalcony?: boolean;
  page?: number;
  limit?: number;
}

export async function queryListingsAction(filters: FilterParams) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const offset = (page - 1) * limit;

  // Always filter for active listings only
  const conditions = [eq(scrapedListings.isActive, true)];

  if (filters.city) {
    conditions.push(eq(scrapedListings.city, filters.city.toLowerCase()));
  }
  if (filters.district) {
    conditions.push(eq(scrapedListings.district, filters.district.toLowerCase()));
  }
  
  // Default to "rent" if dealType is omitted
  conditions.push(eq(scrapedListings.dealType, filters.dealType || "rent"));

  if (filters.minDeposit) conditions.push(gte(scrapedListings.depositTomans, filters.minDeposit));
  if (filters.maxDeposit) conditions.push(lte(scrapedListings.depositTomans, filters.maxDeposit));
  if (filters.minRent) conditions.push(gte(scrapedListings.rentTomans, filters.minRent));
  if (filters.maxRent) conditions.push(lte(scrapedListings.rentTomans, filters.maxRent));
  
  if (filters.minEquivalentDeposit) {
    conditions.push(gte(scrapedListings.equivalentFullDepositTomans, filters.minEquivalentDeposit));
  }
  if (filters.maxEquivalentDeposit) {
    conditions.push(lte(scrapedListings.equivalentFullDepositTomans, filters.maxEquivalentDeposit));
  }

  // Amenity filters inside JSONB column
  if (filters.hasParking !== undefined) {
    conditions.push(sql`${scrapedListings.attributes}->>'hasParking' = ${String(filters.hasParking)}`);
  }
  if (filters.hasElevator !== undefined) {
    conditions.push(sql`${scrapedListings.attributes}->>'hasElevator' = ${String(filters.hasElevator)}`);
  }
  if (filters.hasStorage !== undefined) {
    conditions.push(sql`${scrapedListings.attributes}->>'hasStorage' = ${String(filters.hasStorage)}`);
  }
  if (filters.hasBalcony !== undefined) {
    conditions.push(sql`${scrapedListings.attributes}->>'hasBalcony' = ${String(filters.hasBalcony)}`);
  }

  const whereClause = and(...conditions);

  const items = await db
    .select()
    .from(scrapedListings)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  return {
    page,
    limit,
    count: items.length,
    items,
  };
}
```

---

## 4. List of Available Hono Endpoints Provided by `maskanscan-backend`

While Next.js queries property listings directly from PostgreSQL, `maskanscan-backend` exposes the following Hono HTTP API endpoints for location metadata, scraper health monitoring, admin triggers, and control:

### 4.1 Location Taxonomy Endpoints

#### 1. Universal Location Tree (`GET /api/locations/tree`)
- **Endpoint:** `GET /api/locations/tree`
- **Description:** Returns the complete compiled location hierarchy (31 Provinces $\rightarrow$ 1,130 Cities $\rightarrow$ 4,780 Districts).
- **Usage:** Cache in Next.js ISR or fetch on app mount to power zero-latency cascading location selection dropdowns.

#### 2. Provinces List (`GET /api/locations/provinces`)
- **Endpoint:** `GET /api/locations/provinces`
- **Description:** Returns a simplified array of all 31 Iranian provinces.

#### 3. Cities by Province (`GET /api/locations/cities?provinceId=tehran-province`)
- **Endpoint:** `GET /api/locations/cities`
- **Query Params:** `provinceId` (optional e.g. `"tehran-province"`).
- **Description:** Returns cities filtered by province.

---

### 4.2 Scraper Health & Administration Endpoints

#### 4. Scraper Health Check & Zod Schema Monitor (`GET /api/health/scrapers`)
- **Endpoint:** `GET /api/health/scrapers`
- **Description:** Performs live HTTP ping requests against Divar, Sheypoor, Kilid, and MrEstate APIs and validates response payloads against strict Zod schemas.
- **HTTP Status:** Returns `200 OK` when healthy, or `270` when degraded/error.

#### 5. Admin Manual Scraper Trigger (`POST /api/scraper/trigger`)
- **Endpoint:** `POST /api/scraper/trigger`
- **Request Body Example:**
  ```json
  {
    "source": "divar-map",
    "dealType": "rent",
    "isIncremental": true,
    "sync": false
  }
  ```
- **Description:** Manually triggers a scrape job for a specific platform (`"divar-map"`, `"sheypoor"`, `"kilid"`, `"mrestate"`, or `"all"`).

#### 6. Scraper Status & Database Metrics (`GET /api/scraper/status`)
- **Endpoint:** `GET /api/scraper/status`
- **Description:** Returns metrics from the latest scrape runs, active background jobs, and total active database listing counts grouped by source.

#### 7. Emergency Stop Kill Switch (`POST /api/scraper/stop`)
- **Endpoint:** `POST /api/scraper/stop`
- **Description:** Triggers `scraperAbortManager.stopAllScrapes()`, immediately terminating all active background and synchronous scraper worker streams.

#### 8. HTTP Read Listings API Fallback (`GET /api/listings`)
- **Endpoint:** `GET /api/listings`
- **Description:** Optional HTTP API endpoint that queries PostgreSQL listings via Hono (useful for standalone mobile/curl testing).
