# StockLens

Event-driven inventory management with **FIFO costing**, Kafka (Redpanda) ingestion, and a live warehouse dashboard.

Purchase and sale events flow through Kafka → a consumer applies FIFO valuation in PostgreSQL → the dashboard updates in real time over Socket.IO.

## Live demos

| Service | URL |
|---|---|
| **Frontend** | `https://YOUR-FRONTEND-URL` |
| **Backend API** | `https://YOUR-BACKEND-URL` |

> Replace the placeholders above with your deployed URLs.

## What it does

- **Kafka ingestion** — topic `inventory-events` for `PURCHASE` / `SALE` events
- **FIFO costing** — purchases open batches; sales consume oldest batches first and record exact cost
- **Live dashboard** — stock levels, FIFO value, batch layers, ledger, and websocket activity feed
- **Event publisher** — manually publish purchase/sale events from the UI
- **Run Demo** — built-in simulator that pushes 5 or 10 Kafka events (optional auto-seed stock)
- **Auth** — cookie-based login to access the dashboard and APIs

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Messaging | Redpanda Cloud (Kafka-compatible) |
| Realtime | Socket.IO |
| Frontend | Next.js (React) |
| Deploy | Vercel / Render / Railway / similar |

## FIFO logic (brief)

1. **Purchase** — create an inventory batch with `quantity` and `unit_price`. Unit price is required.
2. **Sale** — do **not** send a sale unit price. The system consumes remaining quantity from the **oldest open batches first**, summing cost from those layers.
3. Each sale records the FIFO cost and which batch quantities were consumed.
4. Product stock value = sum of `(remaining_quantity × purchase_price)` across open batches.

Example: buy 50 @ $100, then buy 30 @ $120. Sell 60 → 50 × $100 + 10 × $120 = **$6,200** FIFO cost; 20 units remain at $120.

## Architecture

```
UI (Publish / Run Demo)
        │
        ▼
   REST API ──► Kafka producer ──► inventory-events
                                        │
                                        ▼
                                 Kafka consumer
                                        │
                                        ▼
                              FIFO processor (Postgres)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
              REST (dashboard,                     Socket.IO
               products, ledger)              (live activity)
```

## Local setup

**Prerequisites:** Node.js 22+, pnpm 10+, Neon Postgres, Redpanda Cloud topic `inventory-events`.

### Backend

```bash
cd backend
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, Kafka creds
pnpm install
pnpm check:env
pnpm db:migrate
pnpm db:seed
pnpm dev               # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm install
pnpm dev                     # http://localhost:3000
```

Open http://localhost:3000/login. Seed user values are set in `backend/.env` (see `.env.example`).

### Environment (backend)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Min 16 characters |
| `CORS_ORIGIN` | Frontend origin (e.g. `http://localhost:3000`) |
| `KAFKA_BROKERS` | Redpanda broker URL(s) |
| `KAFKA_USERNAME` / `KAFKA_PASSWORD` | SASL credentials |
| `KAFKA_TOPIC_INVENTORY_EVENTS` | Default: `inventory-events` |

## How to run the producer / simulator

### From the dashboard (recommended)

1. Sign in → **Run Demo**
2. Choose **5** or **10** events (auto-seed on by default)
3. Watch **Live Activity Log**, stock table, and ledger update as Kafka events are processed

Or use **Publish Event** to send a single purchase/sale.

### Via API

```bash
# Login (use email/password from backend/.env after seed)
curl -c cookies.txt -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<SEED_USER_EMAIL>","password":"<SEED_USER_PASSWORD>"}'

# Start burst simulator (5 or 10 events)
curl -b cookies.txt -X POST http://localhost:4000/api/v1/simulator/start \
  -H "Content-Type: application/json" \
  -d '{"eventCount":5,"autoSeed":true}'

# Or publish one event (productId from GET /api/v1/products)
curl -b cookies.txt -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"eventType":"PURCHASE","productId":"<uuid>","quantity":50,"unitPrice":100}'

curl -b cookies.txt -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"eventType":"SALE","productId":"<uuid>","quantity":10}'
```

### Useful endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login |
| `GET` | `/api/v1/products` | List products |
| `POST` | `/api/v1/events` | Publish inventory event to Kafka |
| `POST` | `/api/v1/simulator/start` | Run 5/10-event Kafka demo |
| `POST` | `/api/v1/simulator/stop` | Stop running demo |
| `GET` | `/api/v1/dashboard` | KPIs + stock overview |
| `GET` | `/api/v1/transactions` | Paginated ledger (`?limit=10&offset=0`) |

### Reset inventory (fresh demo)

Clears batches, transactions, consumptions, and event audit rows. Keeps users and products.

```bash
cd backend
pnpm db:reset-inventory --confirm
```

### Verify FIFO math

```bash
cd backend
pnpm verify:fifo   # API + Redpanda must be running
```

## Dashboard highlights

- Product stock overview (SKU, qty on hand, FIFO value, status)
- FIFO layers panel — click a product to inspect open batches
- Live activity log — all-product websocket stream
- Paginated transaction ledger with FIFO cost on sales
- Kafka connection status in the header

## Repo layout

```
backend/     Express API, Kafka producer/consumer, FIFO, simulator
frontend/    Next.js dashboard, auth, live Socket.IO UI
```
