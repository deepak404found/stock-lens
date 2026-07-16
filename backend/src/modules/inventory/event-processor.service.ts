import type { EachMessagePayload } from "kafkajs";
import { logger } from "../../config/logger.js";
import { InsufficientStockError } from "../../shared/errors.js";
import { emitInventoryEventFailed, emitInventoryEventProcessed } from "../../websocket/events.js";
import type { InventoryEventPayload } from "../kafka/types.js";
import { fifoService } from "./fifo.service.js";
import { inventoryRepository } from "./inventory.repository.js";

function parsePayload(message: EachMessagePayload): InventoryEventPayload | null {
  const raw = message.message.value?.toString();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as InventoryEventPayload;
    if (
      !parsed.eventId ||
      !parsed.eventType ||
      !parsed.productId ||
      typeof parsed.quantity !== "number"
    ) {
      return null;
    }

    if (parsed.eventType === "PURCHASE" && typeof parsed.unitPrice !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export class EventProcessorService {
  async handleMessage(payload: EachMessagePayload): Promise<void> {
    const event = parsePayload(payload);
    if (!event) {
      logger.warn({ offset: payload.message.offset }, "Skipping invalid inventory event message");
      return;
    }

    const existing = await inventoryRepository.findEventByEventId(event.eventId);
    if (!existing) {
      logger.warn({ eventId: event.eventId }, "Inventory event record not found; skipping");
      return;
    }

    if (existing.processingStatus === "completed") {
      logger.info({ eventId: event.eventId }, "Event already processed; skipping");
      return;
    }

    await inventoryRepository.updateEventStatus(event.eventId, "processing");

    try {
      const result = await fifoService.processEvent(event);
      await inventoryRepository.updateEventStatus(event.eventId, "completed", new Date());

      emitInventoryEventProcessed({
        eventId: result.eventId,
        eventType: result.eventType,
        transactionId: result.transactionId,
        fifoCost: result.fifoCost,
        productId: event.productId,
        quantity: event.quantity,
        unitPrice: result.unitPrice,
      });

      logger.info(
        { eventId: event.eventId, transactionId: result.transactionId },
        "Event processed",
      );
    } catch (error) {
      await inventoryRepository.updateEventStatus(event.eventId, "failed", new Date());

      if (error instanceof InsufficientStockError) {
        emitInventoryEventFailed({
          eventId: event.eventId,
          eventType: event.eventType,
          productId: event.productId,
          quantity: event.quantity,
          reason: error.message,
        });
        logger.warn(
          { eventId: event.eventId, err: error.message },
          "Event failed: insufficient stock",
        );
        return;
      }

      logger.error({ eventId: event.eventId, err: error }, "Event processing failed");
      throw error;
    }
  }
}

export const eventProcessorService = new EventProcessorService();
