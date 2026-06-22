# RD Finance — Architecture

## Overview

Monorepo with separate `client/` and `server/` packages, run concurrently in dev.

```
client  (Vite + React)  → :5173  → proxies /api/* to server
server  (Express)       → :3001  → serves JSON API, owns SQLite DB
```

## Data flow

1. React components call hooks in `src/hooks/useApi.js`
2. Hooks use TanStack Query — caches responses, handles loading/error states
3. Queries hit Express routes on `:3001/api/*`
4. Routes call `getDb()` to get a singleton better-sqlite3 connection
5. Server returns JSON; client renders with Recharts + Tailwind

## Database

SQLite file at `server/data/rd-finance.db` (git-ignored).
Schema in `server/src/db/schema.js` — created on `initDb()` at server start.
Seed in `server/src/db/seed.js` — runs once to load Amex credits + category rules.

## Key decisions

**Dark mode only** — no light/dark toggle. `color-scheme: dark` globally.

**JTT ring-fencing** — JTT transactions use `type='JTT'`, never counted in Core/Choice personal spend totals. Revenue tagged `type='Income', subcategory='JTT Revenue'`.

**Money Map Score (0–3)** — one point each if 401k ≥15%, Roth ≥15%, HSA ≥10% of income. Shown as dots in dashboard header.

**Fun spend** — Restaurants + Bars + Food Delivery + Coffee + Entertainment combined as "Fun Spend", target 25% of income.

**Card optimiser** — deterministic rule table: category → recommended card. Lives in both `server/src/utils/cardOptimiser.js` (API) and `client/src/utils/cardOptimiser.js` (instant lookup).

## Phase completion

| Phase | Status | Notes |
|---|---|---|
| 1 — Foundation | ✅ Done | Scaffold, schema, seed, dashboard shell |
| 2 — Budget Tracker | 🔜 Next | CSV import, budget targets, month detail |
| 3 — JTT Module | 🔜 | Deal table, analytics, budget integration |
| 4 — Amex + Wealth | 🔜 | Credit tracker, net worth snapshot |
| 5 — Analytics + Cards + Mobile | 🔜 | Full analytics, card optimiser, PWA |
