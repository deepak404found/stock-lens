# StockLens

Real-time inventory monitoring platform (event-driven FIFO valuation).

## Phase 1

Backend auth + Neon schema/seed, and a Next.js login page.

### Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10+
- Neon PostgreSQL database

Install dependencies separately in `backend/` and `frontend/` (no root workspace).

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL (Neon), JWT_SECRET, CORS_ORIGIN
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev               # http://localhost:4000
```

Seed user: `admin@stocklens.com` / `StockLens@123`

A claimable Neon database may be used for local development (`https://neon.new`). Claim it to your Neon account before it expires if you want to keep the data.

Current claimable DB (dev): https://neon.new/claim/019f6bc5-6b2b-742e-a372-69c51e0c2dfe (expires ~72h unless claimed).

### Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev               # http://localhost:3000
```

Open http://localhost:3000/login and sign in with the seed user.
