export type InventoryEventType = "PURCHASE" | "SALE";

export type InventoryEventPayload = {
  eventId: string;
  eventType: InventoryEventType;
  productId: string;
  quantity: number;
  unitPrice: number;
  publishedAt: string;
};
