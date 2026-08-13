<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Testing Conventions & Architectural Guidelines

This project uses a hybrid testing strategy combining **Vitest + React Testing Library (RTL)** for unit/component tests, **Mock Service Worker (MSW)** for network mocking, and **Playwright** for End-to-End (E2E) testing.

---

## 1. Test Organization & Co-location

### Unit, Logic, & Component Tests
- **Framework**: Vitest (`globals: true`, `environment: "jsdom"`) + React Testing Library + `@testing-library/user-event`.
- **Location**: Co-located directly alongside source files using `[name].test.ts` or `[name].test.tsx`.
  - Examples:
    - `src/components/ui/button.test.tsx`
    - `src/components/ui/switch.test.tsx`
    - `src/components/PropertyCard.test.tsx`
    - `src/lib/geospatial.test.ts`
    - `src/app/actions/locations.test.ts`
- **Execution**: Always run in non-watch mode:
  ```bash
  bun run test
  # or
  bunx vitest run
  ```

### End-to-End (E2E) Tests
- **Framework**: Playwright (`@playwright/test`).
- **Location**: Root-level `/e2e` directory using `[feature].spec.ts`.
  - Example: `e2e/smoke.spec.ts`
- **Execution**:
  ```bash
  bun run test:e2e
  # or
  bunx playwright test
  ```

---

## 2. Network Mocking with MSW
- **Location**: `src/mocks/handlers.ts` and `src/mocks/node.ts`.
- **Global Setup**: `vitest.setup.ts` initializes MSW (`server.listen()`, `server.resetHandlers()`, `server.close()`).
- **Per-Test Overrides**: Use `server.use(http.get(...))` inside individual test files to simulate API failures, custom status codes, or payload variations.

---

## 3. Global Test Setup (`vitest.setup.ts`)
- Imports `@testing-library/jest-dom/vitest`.
- Mocks `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `useParams`).
- Polyfills browser APIs in JSDOM (`matchMedia`, `ResizeObserver`).
