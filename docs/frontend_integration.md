# MaskanScan Frontend Integration Guide & API Contract

Welcome to the **Maskanscan Frontend Integration Guide**! This document provides complete specifications for the Next.js frontend team to interact with the backend API, render property search filters, display interactive map pins, and render multi-source real estate listings.

---

## 1. Core System Architecture & Contract

- **Decoupled Architecture:** The frontend **never triggers or waits for live scraping**. The background scraper automatically ingests real estate listings from Divar, Sheypoor, Kilid, and MrEstate every 5–10 minutes into the PostgreSQL database.
- **Unified Currency:** All financial fields are strictly in **Tomans** (not Rials).
- **Standardized Timestamps:** All dates (`publishedAt`, `scrapedAt`) are strict **ISO 8601 UTC timestamp strings** (e.g. `"2026-07-31T18:00:00.000Z"`).
- **Guaranteed Map Pins:** 100% of all listings contain valid `latitude` and `longitude` coordinates (resolved via exact source pins or verified neighborhood centroid fallbacks).

---

## 2. Universal Location Hierarchy & Cascading Filters

### 2.1 Full Location Tree Endpoint (Recommended)
- **Endpoint:** `GET /api/locations/tree`
- **Description:** Returns the complete compiled location tree (31 Provinces $\rightarrow$ 1,130 Cities $\rightarrow$ 4,780 Districts).
- **Frontend Usage:** Fetch once when the app mounts or cache statically via Next.js ISR. Enables **instant, zero-latency cascading dropdowns** without spinner delays.

#### Example Response:
```json
{
  "success": true,
  "provincesCount": 31,
  "tree": [
    {
      "provinceId": "tehran-province",
      "provinceName": "تهران",
      "cities": [
        {
          "cityId": "tehran",
          "cityName": "تهران",
          "latitude": 35.6892,
          "longitude": 51.389,
          "districts": [
            {
              "districtId": "janat-abad-markazi",
              "districtName": "جنت آباد مرکزی",
              "latitude": 35.7656,
              "longitude": 51.3
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 Sub-Resource Endpoints (For Lazy-Loading Micro Clients)
- `GET /api/locations/provinces`: Returns list of 31 provinces.
- `GET /api/locations/cities?provinceId=tehran-province`: Returns cities for a province.

---

## 3. Unified Listing Data Schema (`UnifiedListing`)

Every property item returned by the backend conforms to the unified schema:

```ts
export interface UnifiedListing {
  source: "divar" | "sheypoor" | "kilid" | "mrestate";
  externalId: string;
  url: string;

  // UI Display Strings (Persian)
  title: string;
  description?: string;
  cityPersian: string;        // e.g. "تهران" (ALWAYS USE THIS IN UI)
  districtPersian?: string;    // e.g. "جنت آباد مرکزی" (ALWAYS USE THIS IN UI)

  // URL & Search Slugs (English ASCII)
  city: string;               // e.g. "tehran"
  district?: string;          // e.g. "janat-abad-markazi"

  // Deal Type & Pricing (ALL VALUES IN TOMANS)
  dealType: "rent" | "buy";
  depositTomans?: number;               // Rent: Deposit (رهن)
  rentTomans?: number;                  // Rent: Monthly Rent (اجاره ماهانه)
  equivalentFullDepositTomans?: number; // Rent: Converted Full Deposit (رهن کامل معادل)
  isAgreedDeposit?: boolean;            // true if deposit is "توافقی" (Negotiable/Agreed)
  isAgreedRent?: boolean;               // true if monthly rent is "توافقی" (Negotiable/Agreed)
  totalPriceTomans?: number;            // Buy: Total Sale Price (قیمت کل)
  pricePerSqMeterTomans?: number;       // Buy: Price per m² (قیمت هر متر)
  isAgreedPrice?: boolean;              // true if total price is "توافقی" (Negotiable/Agreed)

  // Map Coordinates
  location: {
    latitude: number;
    longitude: number;
    isFuzzy: boolean;        // true if map pin is approximate
    isFallback: boolean;     // true if map pin resolved to neighborhood centroid
  };

  // Physical Attributes
  attributes: {
    areaSqMeters: number;
    landAreaSqMeters?: number;
    yearBuilt?: number;
    bedrooms?: number;
    floor?: number | string;
    totalFloorsInBuilding?: number;
    unitsPerFloor?: number;
    parkingSpots?: number;      // Exact count of parking spots (e.g. 1, 2)
    hasElevator?: boolean;    // Strict boolean
    hasParking?: boolean;     // Strict boolean
    hasStorage?: boolean;     // Strict boolean
    hasBalcony?: boolean;     // Strict boolean
    isConvertible?: boolean;  // Strict boolean
    isFurnished?: boolean;    // Strict boolean
    hasLobby?: boolean;       // Strict boolean
    hasPool?: boolean;        // Strict boolean
    hasSauna?: boolean;       // Strict boolean
    hasJacuzzi?: boolean;     // Strict boolean
    hasGym?: boolean;         // Strict boolean
    hasRoofGarden?: boolean;  // Strict boolean
    wcCount?: number;         // Count of bathrooms (e.g. 3)
    wcType?: string;          // e.g. "ایرانی و فرنگی"
    coolingSystem?: string;   // e.g. "داکت اسپلیت"
    heatingSystem?: string;   // e.g. "داکت اسپلیت"
    waterHeater?: string;     // e.g. "موتور خانه"
    flooringType?: string;    // e.g. "پارکت چوب"
    buildingFacade?: string;  // e.g. "نمای ترکیبی"
    unitDirection?: string;   // e.g. "شمالی"
    features?: string[];      // Array of Persian amenity strings
  };

  // Images & Publisher
  images: string[];
  publisherType?: "personal" | "agency";
  publisherPhone?: string;

  // Alternate Sources (Cross-Platform Deduplication)
  alternateSources?: Array<{
    source: string;           // e.g. "sheypoor"
    url: string;              // e.g. "https://www.sheypoor.com/v/..."
    externalId: string;
    scrapedAt: string;
  }>;

  // Timestamps & Ingestion Metadata
  publishedAt?: string;       // ISO 8601 UTC
  scrapedAt: string;          // ISO 8601 UTC
  ingestionStrategy?: "fast_search" | "eager_detail"; // Ingestion strategy used
}
```

---

## 4. Querying Listings Read API (`GET /api/listings`)

- **Endpoint:** `GET /api/listings`
- **Supported Query Parameters:**

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `city` | string | `tehran` | English city slug |
| `district` | string | `janat-abad-markazi` | English district slug |
| `dealType` | string | `rent` or `buy` | Filter by deal type |
| `minDeposit` | number | `500000000` | Minimum deposit in Tomans |
| `maxDeposit` | number | `1500000000` | Maximum deposit in Tomans |
| `minRent` | number | `0` | Minimum monthly rent in Tomans |
| `maxRent` | number | `10000000` | Maximum monthly rent in Tomans |
| `minEquivalentDeposit` | number | `800000000` | Minimum equivalent full deposit |
| `maxEquivalentDeposit` | number | `2000000000` | Maximum equivalent full deposit |
| `minPrice` | number | `5000000000` | Minimum total price in Tomans |
| `maxPrice` | number | `15000000000` | Maximum total price in Tomans |
| `minArea` | number | `60` | Minimum area in m² |
| `maxArea` | number | `120` | Maximum area in m² |
| `bedrooms` | number | `2` | Number of bedrooms |
| `hasParking` | boolean | `true` | Must have parking |
| `hasElevator` | boolean | `true` | Must have elevator |
| `hasStorage` | boolean | `true` | Must have storage |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page (max 100) |

---

## 5. Rendering Cross-Platform Deduplicated Listings in UI

When a property was posted across multiple platforms (e.g., both Divar and Sheypoor):
- The API returns **a single listing card** (no duplicate markers on the map!).
- `source` and `url` contain the primary source link.
- `alternateSources` contains the links for secondary platforms:

```tsx
// Frontend UI Component Example (React / Next.js)
export function PropertySourceBadges({ listing }: { listing: UnifiedListing }) {
  return (
    <div className="flex gap-2 items-center">
      {/* Primary Source Badge */}
      <a href={listing.url} target="_blank" rel="noreferrer" className="badge badge-primary">
        مشاهده در {getSourceLabel(listing.source)}
      </a>

      {/* Alternate Source Badges (Multi-platform duplicate matching) */}
      {listing.alternateSources?.map((alt) => (
        <a key={alt.externalId} href={alt.url} target="_blank" rel="noreferrer" className="badge badge-secondary">
          مشاهده در {getSourceLabel(alt.source)}
        </a>
      ))}
    </div>
  );
}

function getSourceLabel(source: string) {
  switch (source) {
    case "divar": return "دیوار";
    case "sheypoor": return "شیپور";
    case "kilid": return "کلید";
    case "mrestate": return "مستر ملک";
    default: return source;
  }
}
```

---

## 6. Rendering Map Pins & Markers

When rendering map markers (MapLibre GL JS / Leaflet / Deck.gl):
- Always use `listing.location.latitude` and `listing.location.longitude`.
- If `listing.location.isFallback === true`, you can optionally display a subtle visual indicator (e.g. dashed marker border or "محدوده محله" tooltip) indicating that the map pin represents the neighborhood center.

---

## 7. Development & Local Testing Setup

To run the backend server locally for frontend development:

```bash
# 1. Install dependencies
bun install

# 2. Run backend dev server on port 9000
bun run dev

# 3. Open Admin Control Dashboard
http://localhost:9000/dashboard
```

Base URL for all frontend API calls: **`http://localhost:9000`**

---

## 8. Health Monitoring & Admin Scraping Endpoints

### 8.1 Scraper Health Check (`GET /api/health/scrapers`)
- **Endpoint:** `GET /api/health/scrapers`
- **Description:** Pings all 4 external platforms and verifies response Zod schema validity live.
- **Response Example:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-08-01T17:40:02.983Z",
    "sources": {
      "divar": { "status": "healthy", "latencyMs": 1181 },
      "sheypoor": { "status": "healthy", "latencyMs": 2380 },
      "kilid": { "status": "healthy", "latencyMs": 3860 },
      "mrestate": { "status": "healthy", "latencyMs": 3726 }
    }
  }
  ```

### 8.2 Admin Manual Scraper Trigger (`POST /api/scraper/trigger`)
- **Endpoint:** `POST /api/scraper/trigger`
- **Description:** Manually triggers a scrape run for a single platform or all platforms. Supports filtering by `source`, `dealType`, `province`, `strategy`, `maxPages`, and synchronous/asynchronous mode (`sync`).
- **Targeted Async Request Body Example:**
  ```json
  {
    "source": "all",
    "dealType": "rent",
    "province": "tehran",
    "strategy": "fast_search",
    "maxPages": 0,
    "sync": false
  }
  ```
- **Async Response (202 Accepted):**
  ```json
  {
    "success": true,
    "message": "Background scrape job triggered for source: all",
    "status": "processing"
  }
  ```

### 8.3 Scraper Status & Database Analytics (`GET /api/scraper/status`)
- **Endpoint:** `GET /api/scraper/status`
- **Description:** Returns detailed metrics from the last scrape run, total active listings count in the database grouped by platform and deal type, and all active cursor states.

### 8.4 Emergency Stop Kill Switch (`POST /api/scraper/stop`)
- **Endpoint:** `POST /api/scraper/stop`
- **Description:** Immediately sends a global abort signal to terminate all active background and synchronous scraper worker streams across all sources.
- **Response:**
  ```json
  {
    "success": true,
    "message": "Emergency stop signal sent! All active background scrape streams are terminating.",
    "status": "aborted"
  }
  ```
