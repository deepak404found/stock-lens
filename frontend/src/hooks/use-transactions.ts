"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/services/transactions";

export const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;

export const LEDGER_PAGE_SIZE = 10;

export function useTransactions(page: number, pageSize = LEDGER_PAGE_SIZE) {
  const offset = Math.max(0, (page - 1) * pageSize);

  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, page, pageSize],
    queryFn: () => getTransactions({ limit: pageSize, offset }),
    placeholderData: keepPreviousData,
  });
}
