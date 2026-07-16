"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createInventorySocket } from "@/lib/socket";
import type { FailedEventPayload, ProcessedEventPayload } from "@/types/inventory";
import { DASHBOARD_QUERY_KEY } from "@/hooks/use-dashboard";
import { TRANSACTIONS_QUERY_KEY } from "@/hooks/use-transactions";

type SocketHandlers = {
  onProcessed?: (payload: ProcessedEventPayload) => void;
  onFailed?: (payload: FailedEventPayload) => void;
};

export function useInventorySocket(
  handlers?: SocketHandlers | ((payload: ProcessedEventPayload) => void),
  enabled = true,
) {
  const queryClient = useQueryClient();
  const handlersRef = useRef<SocketHandlers>({});

  useEffect(() => {
    if (typeof handlers === "function") {
      handlersRef.current = { onProcessed: handlers };
    } else {
      handlersRef.current = handlers ?? {};
    }
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    const socket = createInventorySocket();

    socket.on("inventory.event.processed", (payload: ProcessedEventPayload) => {
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["product-batches"] });
      handlersRef.current.onProcessed?.(payload);
    });

    socket.on("inventory.event.failed", (payload: FailedEventPayload) => {
      handlersRef.current.onFailed?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, enabled]);
}
