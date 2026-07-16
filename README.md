# StockLens

Real-time inventory monitoring platform (event-driven FIFO valuation).

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10+
- Neon PostgreSQL database
- Redpanda Cloud cluster (Kafka-compatible)

Install dependencies separately in `backend/` and `frontend/` (no root workspace).

## Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm check:env          # fails fast if required env vars are missing
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:reset-inventory --confirm   # wipe batches/transactions/events; keeps users + products
pnpm dev                # http://localhost:4000
```

### Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Min 16 characters |
| `KAFKA_BROKERS` | Redpanda Cloud broker URL(s), comma-separated |
| `KAFKA_USERNAME` | SASL username |
| `KAFKA_PASSWORD` | SASL password |
| `KAFKA_TOPIC_INVENTORY_EVENTS` | Default: `inventory-events` |

Create topic `inventory-events` in Redpanda Cloud before publishing events.

Seed user: `admin@stocklens.com` / `StockLens@123`

### Phase 2 API (auth required)

```bash
# Login (saves cookie)
curl -c cookies.txt -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stocklens.com","password":"StockLens@123"}'

# Publish purchase event (productId = UUID from GET /products)
curl -b cookies.txt -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"eventType":"PURCHASE","productId":"<uuid>","quantity":50,"unitPrice":100}'

# Ledger
curl -b cookies.txt "http://localhost:4000/api/v1/transactions?limit=10&offset=0"

# Dashboard KPIs
curl -b cookies.txt http://localhost:4000/api/v1/dashboard
```

### FIFO verification

With the API running and Redpanda configured:

```bash
cd backend
pnpm verify:fifo
```

### Reset inventory (fresh demo / handover)

Clears FIFO batches, transactions, consumptions, and event audit rows. Does **not** delete users or products.

```bash
cd backend
pnpm db:reset-inventory --confirm
```

Then open the dashboard and use **Run Demo** (with auto-seed) or publish purchases manually.

## Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm install
pnpm dev                     # http://localhost:3000
```

Open http://localhost:3000/login and sign in with the seed user.

### Phase 3 UI

After login, the dashboard includes:

- **KPI cards** — active products, units on hand, inventory value
- **Product stock table** — per-SKU quantity and value (click a row for FIFO layers)
- **FIFO layers panel** — live batch queue for the selected product
- **Event publisher** — publish `PURCHASE` / `SALE` events
- **Run Demo** — backend simulator that pushes 5 or 10 Kafka events
- **Transaction ledger** — recent processed events
- **Live activity feed** — Socket.IO updates on `inventory.event.processed`

Run backend (`pnpm dev` on port 4000) and frontend together for the full live flow.
