import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { inventoryEvents, products } from "../../db/schema/index.js";
import type { InventoryEventType } from "../kafka/types.js";

export class EventsRepository {
  async findProductById(productId: string) {
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    return product ?? null;
  }

  async findByEventId(eventId: string) {
    const [event] = await db
      .select()
      .from(inventoryEvents)
      .where(eq(inventoryEvents.eventId, eventId))
      .limit(1);
    return event ?? null;
  }

  async createPending(input: {
    eventId: string;
    eventType: InventoryEventType;
    payload: Record<string, unknown>;
  }) {
    const [event] = await db
      .insert(inventoryEvents)
      .values({
        eventId: input.eventId,
        eventType: input.eventType,
        payload: input.payload,
        processingStatus: "pending",
      })
      .returning();
    return event;
  }

  async updateStatus(
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
}

export const eventsRepository = new EventsRepository();
