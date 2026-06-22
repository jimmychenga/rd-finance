# RD Finance

Personal finance dashboard with three integrated modules:

- **Budget Tracker** — monthly + yearly personal spend tracking
- **JTT (Just The Ticket)** — ticket resale side hustle P&L tracker
- **Wealth Snapshot** — liquid net worth tracker across all accounts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (dark mode, slate/navy) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | SQLite via better-sqlite3 |
| CSV import | Papa Parse |
| PWA | Vite PWA plugin |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Run (dev)

```bash
# From repo root — starts both server (port 3001) and client (port 5173)
npm run dev
```

### Seed database

```bash
npm run db:seed
```

This populates accounts, credit cards, Amex credits, and category rules. Import real transaction data via the CSV import feature in the app.

### Reset database

```bash
npm run db:reset && npm run db:seed
```

## Project Structure

```
rd-finance/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Dashboard, Month, Analytics, JTT, Amex, Wealth, Cards, Mobile
│   │   ├── components/  # Shared UI components
│   │   ├── hooks/       # Data-fetching hooks
│   │   └── utils/       # cardOptimiser, formatters, flagEngine
│   └── public/
├── server/          # Express + SQLite backend
│   ├── src/
│   │   ├── db/          # schema.js, seed.js, reset.js
│   │   ├── routes/      # transactions, summary, tickets, amex, accounts, flags, cards
│   │   └── utils/       # categoryMatcher, flagGenerator, moneyMap
│   └── data/            # rd-finance.db (git-ignored)
└── docs/            # Architecture notes, data dictionary
```

## Modules

### Budget Tracker

Monthly and yearly personal spend across Core / Choice / Compound / Income categories. CSV import with auto-categorisation. Smart flags. Money Map Score (0–3).

### JTT (Just The Ticket)

Ring-fenced P&L tracker for ticket resale. Deals tracked from purchase through sale. Budget integration prompts on buy and sell. Source and platform analytics.

### Wealth Snapshot

Manual monthly balance snapshots across all accounts. Liquid net worth trend. Emergency fund health check. JTT capital-at-risk overlay.

## Credit Cards Tracked

| Card | Best For | Rewards |
|---|---|---|
| Amex Platinum | Travel, Flights, Hotels | 5x MR |
| Amex Gold | Dining, Groceries | 4x MR |
| Amex Blue Business Plus | JTT Purchases | 2x MR |
| Bilt Mastercard | Rent | 1x Bilt pts |
| Robinhood Gold | Subscriptions, Catch-all | 3% CB |
| Wells Fargo Autograph | Rideshare, Transit, Gas | 3x pts |
| Amex Delta | Delta flights | 2x miles |
| Discover It | Rotating categories | 5% CB |

## Money Map Score

| Tier | Criteria |
|---|---|
| ● 401k | ≥15% of income |
| ● Roth | ≥15% of income |
| ● HSA | ≥10% of income |

Score: 0–3 shown as filled/empty dots in dashboard header.

## Build Phases

- [x] **Phase 1** — Foundation: scaffold, schema, seed, dashboard shell
- [ ] **Phase 2** — Budget Tracker: budget bars, CSV import, month detail, flags
- [ ] **Phase 3** — JTT Module: deal table, analytics, budget integration
- [ ] **Phase 4** — Amex + Wealth: credit tracker, net worth snapshot
- [ ] **Phase 5** — Analytics + Card Optimiser + Mobile PWA
