export type InventoryEventType = "PURCHASE" | "SALE";

export type InventoryEventPayload = {
  eventId: string;
  eventType: InventoryEventType;
  productId: string;
  quantity: number;
  /** Present only for PURCHASE events. Sales omit this — FIFO calculates cost. */
  unitPrice?: number;
  publishedAt: string;
};
