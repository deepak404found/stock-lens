import { io, type Socket } from "socket.io-client";
import type { FailedEventPayload, ProcessedEventPayload } from "@/types/inventory";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type InventorySocket = Socket<{
  "inventory.event.processed": (payload: ProcessedEventPayload) => void;
  "inventory.event.failed": (payload: FailedEventPayload) => void;
}>;

export function createInventorySocket(): InventorySocket {
  return io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  }) as InventorySocket;
}
