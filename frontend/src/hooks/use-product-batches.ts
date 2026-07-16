"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductBatches } from "@/services/products";

export function productBatchesQueryKey(productId: string) {
  return ["product-batches", productId] as const;
}

export function useProductBatches(productId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: productBatchesQueryKey(productId ?? ""),
    queryFn: () => getProductBatches(productId!),
    enabled: Boolean(enabled && productId),
  });
}
