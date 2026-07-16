import { randomUUID } from "node:crypto";
import { InsufficientStockError, NotFoundError } from "../../shared/errors.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";
import { publishInventoryEvent } from "../kafka/producer.js";
import type { InventoryEventPayload } from "../kafka/types.js";
import { eventsRepository } from "./repository.js";
import type { CreateEventInput } from "./validation.js";

export class EventsService {
  async publish(input: CreateEventInput) {
    const product = await eventsRepository.findProductById(input.productId);
    if (!product || product.status !== "active") {
      throw new NotFoundError("Product not found");
    }

    if (input.eventType === "SALE") {
      const available = await inventoryRepository.getAvailableStock(input.productId);
      if (available < input.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock: requested ${input.quantity}, available ${available}`,
        );
      }
    }

    const eventId = randomUUID();
    const payload: InventoryEventPayload = {
      eventId,
      eventType: input.eventType,
      productId: input.productId,
      quantity: input.quantity,
      publishedAt: new Date().toISOString(),
      ...(input.eventType === "PURCHASE" ? { unitPrice: input.unitPrice } : {}),
    };

    await eventsRepository.createPending({
      eventId,
      eventType: input.eventType,
      payload,
    });

    try {
      await publishInventoryEvent(payload);
    } catch (error) {
      await eventsRepository.updateStatus(eventId, "failed", new Date());
      throw error;
    }

    return { eventId };
  }
}

export const eventsService = new EventsService();
