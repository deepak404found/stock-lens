"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createInventorySocket } from "@/lib/socket";
import type { ProcessedEventPayload } from "@/types/inventory";
import { DASHBOARD_QUERY_KEY } from "@/hooks/use-dashboard";

export function useInventorySocket(onProcessed?: (payload: ProcessedEventPayload) => void) {
  const queryClient = useQueryClient();
  const onProcessedRef = useRef(onProcessed);
  onProcessedRef.current = onProcessed;

  useEffect(() => {
    const socket = createInventorySocket();

    socket.on("inventory.event.processed", (payload) => {
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      onProcessedRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
