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

export type InventoryEventFailedPayload = {
  eventId: string;
  eventType: InventoryEventType;
  productId: string;
  quantity: number;
  reason: string;
};

export function emitInventoryEventProcessed(payload: InventoryEventProcessedPayload): void {
  const io = getSocketServer();
  if (!io) return;
  io.emit("inventory.event.processed", payload);
}

export function emitInventoryEventFailed(payload: InventoryEventFailedPayload): void {
  const io = getSocketServer();
  if (!io) return;
  io.emit("inventory.event.failed", payload);
}
