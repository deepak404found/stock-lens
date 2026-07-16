import { db } from "../../config/db.js";
import { InsufficientStockError } from "../../shared/errors.js";
import type { InventoryEventPayload } from "../kafka/types.js";
import { inventoryRepository } from "./inventory.repository.js";

function toMoney(value: number): string {
  return value.toFixed(2);
}

export type FifoProcessResult = {
  eventId: string;
  eventType: InventoryEventPayload["eventType"];
  transactionId: string;
  fifoCost: string | null;
  batchId?: string;
};

export class FifoService {
  async processEvent(payload: InventoryEventPayload): Promise<FifoProcessResult> {
    return db.transaction(async (tx) => {
      if (payload.eventType === "PURCHASE") {
        const batchNumber = `BATCH-${payload.eventId.slice(0, 8).toUpperCase()}`;
        const batch = await inventoryRepository.createBatch(
          {
            productId: payload.productId,
            batchNumber,
            purchasePrice: toMoney(payload.unitPrice),
            purchasedQuantity: payload.quantity,
            remainingQuantity: payload.quantity,
          },
          tx,
        );

        const transaction = await inventoryRepository.createTransaction(
          {
            productId: payload.productId,
            eventType: "PURCHASE",
            quantity: payload.quantity,
            unitPrice: toMoney(payload.unitPrice),
            fifoCost: null,
            referenceNumber: payload.eventId,
          },
          tx,
        );

        return {
          eventId: payload.eventId,
          eventType: payload.eventType,
          transactionId: transaction.id,
          batchId: batch.id,
          fifoCost: null,
        };
      }

      const available = await inventoryRepository.getAvailableStock(payload.productId, tx);
      if (available < payload.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock: requested ${payload.quantity}, available ${available}`,
        );
      }

      const batches = await inventoryRepository.getBatchesFifo(payload.productId, tx);
      let remainingToSell = payload.quantity;
      let totalFifoCost = 0;

      const transaction = await inventoryRepository.createTransaction(
        {
          productId: payload.productId,
          eventType: "SALE",
          quantity: payload.quantity,
          unitPrice: toMoney(payload.unitPrice),
          fifoCost: null,
          referenceNumber: payload.eventId,
        },
        tx,
      );

      for (const batch of batches) {
        if (remainingToSell <= 0) break;

        const consumeQty = Math.min(remainingToSell, batch.remainingQuantity);
        const unitPrice = Number(batch.purchasePrice);
        const cost = consumeQty * unitPrice;
        totalFifoCost += cost;

        await inventoryRepository.createFifoConsumption(
          {
            transactionId: transaction.id,
            batchId: batch.id,
            quantityConsumed: consumeQty,
            unitPrice: toMoney(unitPrice),
            cost: toMoney(cost),
          },
          tx,
        );

        await inventoryRepository.updateBatchRemaining(
          batch.id,
          batch.remainingQuantity - consumeQty,
          tx,
        );
        remainingToSell -= consumeQty;
      }

      const fifoCost = toMoney(totalFifoCost);
      await inventoryRepository.updateTransactionFifoCost(transaction.id, fifoCost, tx);

      return {
        eventId: payload.eventId,
        eventType: payload.eventType,
        transactionId: transaction.id,
        fifoCost,
      };
    });
  }
}

export const fifoService = new FifoService();
