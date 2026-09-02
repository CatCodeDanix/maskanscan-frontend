# MaskanScan (مسکن‌اسکن)

[![Next.js 16](https://img.shields.io/badge/Next.js-16_(Turbopack)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Deck.gl](https://img.shields.io/badge/Deck.gl-9-darkgreen?style=flat-square)](https://deck.gl/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-6-navy?style=flat-square)](https://maplibre.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-orange?style=flat-square)](https://orm.drizzle.team/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-fbf0df?style=flat-square&logo=bun)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Biome-Linter_&_Formatter-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4-yellow?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> A high-performance real estate aggregation and geospatial discovery platform for residential rentals across Tehran Province.

MaskanScan aggregates, normalizes, and visualizes property rental listings from multiple Iranian portals onto a unified, GPU-accelerated interactive map interface featuring sub-20ms spatial queries, custom transit overlays (Metro & BRT), mortgage-to-rent dynamic conversion calculations, and a fully localized Persian RTL user experience.

---

## 🏗️ Technical & Architectural Highlights

- **Two-Tier Geospatial Data Pipeline:**
  - **Zoom < 14 (Backend Spatial Aggregation):** Single-query dynamic SQL grid clustering (`FLOOR(coords / gridSize)` + centroid calculation) executing in **< 15ms** across tens of thousands of listings.
  - **Zoom ≥ 14 (Client-Side Supercluster):** Padded bounding-box fetch with high-performance client-side clustering for seamless pan & zoom without server roundtrips.
- **Zero-REST Server Actions Contract:** Next.js Server Actions connect directly to PostgreSQL via **Drizzle ORM**, eliminating unnecessary HTTP proxy layers while maintaining full type safety and instant cache invalidation.
- **Hardware-Accelerated WebGL Visualization:**
  - **MapLibre GL JS + Deck.gl:** Hybrid rendering with `ScatterplotLayer` antialiased cluster badges, SDF text rendering, and GPU-composited Tehran Metro & BRT transit GeoJSON overlays.
  - **Three.js 3D Scene:** Interactive Tehran cityscape on the landing page with 3D neighborhood pins and smooth camera animations.
- **Instant Optimistic UX:** Multi-source listing cache with 0ms drawer open latency, swipeable image galleries, and synchronized URL query parameters.
- **RTL & Persian-Native Design:** Complete Right-to-Left typographic hierarchy, Persian numeral conversions, and responsive desktop/mobile drawers.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) & React 19 |
| **Language & Runtime** | TypeScript 5 & Bun 1.2+ |
| **Map & Geospatial** | MapLibre GL JS v6, Deck.gl v9, Supercluster |
| **3D Graphics & Animation** | Three.js, GSAP, DotLottie |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui, Radix UI primitives, Vaul |
| **Database & ORM** | PostgreSQL & Drizzle ORM |
| **State Management** | Zustand (with localStorage persistence) & TanStack Query v5 |
| **Testing** | Vitest, React Testing Library, MSW (Mock Service Worker), Playwright E2E |
| **Tooling & Code Quality** | Biome (Linting & Formatting) |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- [PostgreSQL](https://www.postgresql.org/) (v15+)

### 1. Installation

```bash
bun install
```

### 2. Environment Configuration

Copy the example environment file and configure your database connection:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/maskanscan"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration

```bash
bun run db:push
```

### 4. Development Server

Start the Next.js development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

```bash
# Run unit and component test suites (Vitest + RTL + MSW)
bun run test

# Run End-to-End tests (Playwright)
bun run test:e2e

# Run Biome code quality check (Linter & Formatter)
bun run check

# Automatically apply formatting and lint fixes
bun run check --write
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `bun dev` | `next dev` | Start Next.js Turbopack development server |
| `bun run build` | `next build` | Build optimized production bundle |
| `bun start` | `next start` | Start production Node.js server |
| `bun run test` | `vitest run` | Run Vitest test suites |
| `bun run test:e2e` | `playwright test` | Run Playwright E2E tests |
| `bun run check` | `biome check --write .` | Format, lint & organize imports with Biome |
| `bun run lint` | `biome lint .` | Run Biome linter |
| `bun run db:push` | `drizzle-kit push` | Push schema changes directly to PostgreSQL |
| `bun run db:generate` | `drizzle-kit generate` | Generate Drizzle migration files |

---

## 🏛 Documentation

Detailed engineering specifications and technical designs:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture, ingestion pipeline & database schema.
- [`docs/geospatial-pipeline-plan.md`](docs/geospatial-pipeline-plan.md) — Two-tier spatial clustering and viewport cache strategy.
- [`docs/frontend_integration.md`](docs/frontend_integration.md) — Server Action contracts and type definitions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **Danial Abdoli**
