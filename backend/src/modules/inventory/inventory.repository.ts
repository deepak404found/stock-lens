import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "../../config/db.js";
import * as schema from "../../db/schema/index.js";
import {
  fifoConsumptions,
  inventoryBatches,
  inventoryEvents,
  inventoryTransactions,
  products,
} from "../../db/schema/index.js";
import type { InventoryEventType } from "../kafka/types.js";

type DbClient = NodePgDatabase<typeof schema>;

export class InventoryRepository {
  async getBatchesFifo(productId: string, tx: DbClient = db) {
    return tx
      .select()
      .from(inventoryBatches)
      .where(
        and(eq(inventoryBatches.productId, productId), gt(inventoryBatches.remainingQuantity, 0)),
      )
      .orderBy(asc(inventoryBatches.purchaseDate), asc(inventoryBatches.createdAt));
  }

  async getAvailableStock(productId: string, tx: DbClient = db) {
    const [row] = await tx
      .select({
        total: sql<number>`coalesce(sum(${inventoryBatches.remainingQuantity}), 0)`,
      })
      .from(inventoryBatches)
      .where(eq(inventoryBatches.productId, productId));
    return Number(row?.total ?? 0);
  }

  async createBatch(
    input: {
      productId: string;
      batchNumber: string;
      purchasePrice: string;
      purchasedQuantity: number;
      remainingQuantity: number;
    },
    tx: DbClient = db,
  ) {
    const [batch] = await tx.insert(inventoryBatches).values(input).returning();
    return batch;
  }

  async updateBatchRemaining(batchId: string, remainingQuantity: number, tx: DbClient = db) {
    const [batch] = await tx
      .update(inventoryBatches)
      .set({ remainingQuantity, updatedAt: new Date() })
      .where(eq(inventoryBatches.id, batchId))
      .returning();
    return batch;
  }

  async createTransaction(
    input: {
      productId: string;
      eventType: InventoryEventType;
      quantity: number;
      unitPrice: string;
      fifoCost?: string | null;
      referenceNumber: string;
    },
    tx: DbClient = db,
  ) {
    const [transaction] = await tx.insert(inventoryTransactions).values(input).returning();
    return transaction;
  }

  async updateTransactionFifoCost(transactionId: string, fifoCost: string, tx: DbClient = db) {
    const [transaction] = await tx
      .update(inventoryTransactions)
      .set({ fifoCost })
      .where(eq(inventoryTransactions.id, transactionId))
      .returning();
    return transaction;
  }

  async createFifoConsumption(
    input: {
      transactionId: string;
      batchId: string;
      quantityConsumed: number;
      unitPrice: string;
      cost: string;
    },
    tx: DbClient = db,
  ) {
    const [consumption] = await tx.insert(fifoConsumptions).values(input).returning();
    return consumption;
  }

  async findEventByEventId(eventId: string) {
    const [event] = await db
      .select()
      .from(inventoryEvents)
      .where(eq(inventoryEvents.eventId, eventId))
      .limit(1);
    return event ?? null;
  }

  async updateEventStatus(
    eventId: string,
    status: "pending" | "processing" | "completed" | "failed",
    processedAt?: Date | null,
  ) {
    const [event] = await db
      .update(inventoryEvents)
      .set({
        processingStatus: status,
        processedAt: processedAt === undefined ? undefined : processedAt,
      })
      .where(eq(inventoryEvents.eventId, eventId))
      .returning();
    return event ?? null;
  }

  async listTransactions(limit: number, offset: number) {
    return db
      .select({
        id: inventoryTransactions.id,
        productId: inventoryTransactions.productId,
        productSku: products.sku,
        productName: products.name,
        eventType: inventoryTransactions.eventType,
        quantity: inventoryTransactions.quantity,
        unitPrice: inventoryTransactions.unitPrice,
        fifoCost: inventoryTransactions.fifoCost,
        referenceNumber: inventoryTransactions.referenceNumber,
        createdAt: inventoryTransactions.createdAt,
      })
      .from(inventoryTransactions)
      .innerJoin(products, eq(inventoryTransactions.productId, products.id))
      .orderBy(desc(inventoryTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countTransactions() {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryTransactions);
    return Number(row?.count ?? 0);
  }

  async getProductStockOverview() {
    return db
      .select({
        productId: products.id,
        sku: products.sku,
        name: products.name,
        totalQuantity: sql<number>`coalesce(sum(${inventoryBatches.remainingQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${inventoryBatches.remainingQuantity} * ${inventoryBatches.purchasePrice}), 0)`,
      })
      .from(products)
      .leftJoin(inventoryBatches, eq(products.id, inventoryBatches.productId))
      .where(eq(products.status, "active"))
      .groupBy(products.id, products.sku, products.name)
      .orderBy(asc(products.sku));
  }

  async getInventoryTotals() {
    const [row] = await db
      .select({
        totalUnits: sql<number>`coalesce(sum(${inventoryBatches.remainingQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${inventoryBatches.remainingQuantity} * ${inventoryBatches.purchasePrice}), 0)`,
      })
      .from(inventoryBatches);
    return {
      totalUnits: Number(row?.totalUnits ?? 0),
      totalValue: row?.totalValue ?? "0",
    };
  }

  async countActiveProducts() {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.status, "active"));
    return Number(row?.count ?? 0);
  }
}

export const inventoryRepository = new InventoryRepository();
