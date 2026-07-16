/**
 * Phase 2 FIFO verification script.
 * Prerequisites: backend running (pnpm dev), Neon + Redpanda configured in .env
 *
 * Run: pnpm check:env && pnpm dev (separate terminal) && pnpm verify:fifo
 */
import { config } from "dotenv";

config({ path: ".env" });

const API = process.env.API_BASE_URL ?? "http://localhost:4000";
const EMAIL = process.env.SEED_USER_EMAIL ?? "admin@stocklens.com";
const PASSWORD = process.env.SEED_USER_PASSWORD ?? "StockLens@123";

async function request(
  path: string,
  options: RequestInit = {},
  cookie?: string,
): Promise<{ status: number; body: unknown; cookie?: string }> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (cookie) headers.set("Cookie", cookie);

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const setCookie = res.headers.get("set-cookie") ?? undefined;
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, cookie: setCookie ?? cookie };
}

async function waitForTransactions(expectedMin: number, cookie: string, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    const { body } = await request("/api/v1/transactions", { method: "GET" }, cookie);
    const data = body as { data?: { transactions?: unknown[] } };
    const count = data.data?.transactions?.length ?? 0;
    if (count >= expectedMin) return data.data?.transactions ?? [];
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Timed out waiting for ${expectedMin} transactions`);
}

async function main() {
  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "KAFKA_BROKERS",
    "KAFKA_USERNAME",
    "KAFKA_PASSWORD",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing env: ${missing.join(", ")}`);
    console.error("Configure backend/.env (see .env.example) before running verify:fifo");
    process.exit(1);
  }

  const login = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (login.status !== 200 || !login.cookie) {
    console.error("Login failed", login.body);
    process.exit(1);
  }
  const cookie = login.cookie;

  const productsRes = await request("/api/v1/products", { method: "GET" }, cookie);
  const products = (productsRes.body as { data?: { products?: { id: string }[] } }).data?.products;
  if (!products?.length) {
    console.error("No products found. Run pnpm db:seed first.");
    process.exit(1);
  }
  const productId = products[0].id;

  const publish = async (eventType: "PURCHASE" | "SALE", quantity: number, unitPrice: number) => {
    const res = await request(
      "/api/v1/events",
      {
        method: "POST",
        body: JSON.stringify({ eventType, productId, quantity, unitPrice }),
      },
      cookie,
    );
    if (res.status !== 202) {
      throw new Error(`Event ${eventType} failed: ${JSON.stringify(res.body)}`);
    }
    return (res.body as { data?: { eventId?: string } }).data?.eventId;
  };

  console.log("Publishing PRD FIFO scenario...");
  await publish("PURCHASE", 50, 100);
  await publish("PURCHASE", 30, 120);
  await publish("SALE", 60, 150);

  const transactions = await waitForTransactions(3, cookie);
  const sale = (transactions as { eventType: string; fifoCost: string }[]).find(
    (t) => t.eventType === "SALE",
  );

  if (!sale || sale.fifoCost !== "6200.00") {
    console.error("FIFO cost mismatch. Expected 6200.00, got:", sale?.fifoCost);
    process.exit(1);
  }

  console.log("FIFO verification passed. Sale fifo_cost =", sale.fifoCost);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
