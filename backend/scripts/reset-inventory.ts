/**
 * Wipe inventory test data while keeping users and product catalog.
 *
 * Usage:
 *   pnpm db:reset-inventory --confirm
 *   CONFIRM=1 pnpm db:reset-inventory
 */
import { config } from "dotenv";
import { count } from "drizzle-orm";
import { db } from "../src/config/db.js";
import { logger } from "../src/config/logger.js";
import {
  fifoConsumptions,
  inventoryBatches,
  inventoryEvents,
  inventoryTransactions,
} from "../src/db/schema/index.js";

config({ path: ".env" });

async function main() {
  const confirmed = process.argv.includes("--confirm") || process.env.CONFIRM === "1";

  if (!confirmed) {
    console.error("Refusing to wipe inventory without confirmation.");
    console.error("Re-run with: pnpm db:reset-inventory --confirm");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const [fc, txCount, batches, events] = await Promise.all([
    db.select({ value: count() }).from(fifoConsumptions),
    db.select({ value: count() }).from(inventoryTransactions),
    db.select({ value: count() }).from(inventoryBatches),
    db.select({ value: count() }).from(inventoryEvents),
  ]);

  const before = {
    fifo_consumptions: Number(fc[0]?.value ?? 0),
    inventory_transactions: Number(txCount[0]?.value ?? 0),
    inventory_batches: Number(batches[0]?.value ?? 0),
    inventory_events: Number(events[0]?.value ?? 0),
  };

  logger.info({ before }, "Resetting inventory tables");

  await db.transaction(async (trx) => {
    await trx.delete(fifoConsumptions);
    await trx.delete(inventoryTransactions);
    await trx.delete(inventoryBatches);
    await trx.delete(inventoryEvents);
  });

  console.log("Inventory reset complete.");
  console.log("Deleted:", before);
  console.log("Kept: users, products");
  console.log(
    "Tip: run `pnpm db:seed` if you need to refresh catalog/user, then use Run Demo with auto-seed.",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
