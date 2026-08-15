# MaskanScan (مسکن‌اسکن)

> A scalable housing search and property aggregation platform for the Iranian real estate market.

MaskanScan aggregates property listings from multiple Iranian real estate sources into a unified, user-friendly interactive map interface featuring advanced filters, custom search overlays, saved searches, and subscription tiers.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/)
- **Language & Runtime**: [TypeScript](https://www.typescriptlang.org/) & [Bun](https://bun.sh/)
- **Map & Data Visualization**: [MapLibre GL JS](https://maplibre.org/) & [Deck.gl](https://deck.gl/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & ORM**: PostgreSQL & [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Tooling & Code Quality**: [Biome](https://biomejs.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- [PostgreSQL](https://www.postgresql.org/) database instance

### 1. Installation

```bash
bun install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54328/maskanscan"
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

## 📜 Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `bun dev` | `next dev` | Start development server |
| `bun run build` | `next build` | Build production bundle |
| `bun start` | `next start` | Start production server |
| `bun run check` | `biome check --write .` | Format, lint & organize imports with Biome |
| `bun run lint` | `biome lint .` | Run Biome linter |
| `bun run db:push` | `drizzle-kit push` | Push schema changes to database |
| `bun run db:generate` | `drizzle-kit generate` | Generate Drizzle migrations |

---

## 🏛 Architecture

Detailed technical specifications, database schema diagrams, and data pipeline designs are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
