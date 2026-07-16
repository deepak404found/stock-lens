"use client";

import { useCallback, useState } from "react";
import type { ProcessedEventPayload } from "@/types/inventory";

export type ActivityItem = {
  id: string;
  eventType: ProcessedEventPayload["eventType"];
  productId: string;
  quantity: number;
  unitPrice: number;
  fifoCost: string | null;
  receivedAt: Date;
};

export function useLiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  const addProcessedEvent = useCallback((payload: ProcessedEventPayload) => {
    setItems((prev) =>
      [
        {
          id: payload.eventId,
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

  return { items, addProcessedEvent };
}
