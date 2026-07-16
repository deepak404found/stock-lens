import type { InventoryEventType } from "../modules/kafka/types.js";
import { getSocketServer } from "./socket-server.js";

export type InventoryEventProcessedPayload = {
  eventId: string;
  eventType: InventoryEventType;
  transactionId: string;
  fifoCost: string | null;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export function emitInventoryEventProcessed(payload: InventoryEventProcessedPayload): void {
  const io = getSocketServer();
  if (!io) return;
  io.emit("inventory.event.processed", payload);
}
