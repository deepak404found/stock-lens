import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../shared/errors.js";
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

    const eventId = randomUUID();
    const payload: InventoryEventPayload = {
      eventId,
      eventType: input.eventType,
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      publishedAt: new Date().toISOString(),
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
