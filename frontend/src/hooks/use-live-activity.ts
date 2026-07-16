"use client";

import { useCallback, useState } from "react";
import type { EventType, FailedEventPayload, ProcessedEventPayload } from "@/types/inventory";

export type ActivityItem = {
  id: string;
  status: "processed" | "failed";
  eventType: EventType;
  productId: string;
  quantity: number;
  unitPrice?: number;
  fifoCost?: string | null;
  reason?: string;
  receivedAt: Date;
};

export function useLiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  const addProcessedEvent = useCallback((payload: ProcessedEventPayload) => {
    setItems((prev) =>
      [
        {
          id: payload.eventId,
          status: "processed" as const,
          eventType: payload.eventType,
          productId: payload.productId,
          quantity: payload.quantity,
          unitPrice: payload.unitPrice,
          fifoCost: payload.fifoCost,
          receivedAt: new Date(),
        },
        ...prev,
      ].slice(0, 25),
    );
  }, []);

  const addFailedEvent = useCallback((payload: FailedEventPayload) => {
    setItems((prev) =>
      [
        {
          id: payload.eventId,
          status: "failed" as const,
          eventType: payload.eventType,
          productId: payload.productId,
          quantity: payload.quantity,
          reason: payload.reason,
          receivedAt: new Date(),
        },
        ...prev,
      ].slice(0, 25),
    );
  }, []);

  return { items, addProcessedEvent, addFailedEvent };
}
