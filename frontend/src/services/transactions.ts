import { api, type ApiSuccess } from "@/lib/api";
import type { InventoryTransaction } from "@/types/inventory";

export type TransactionsPagination = {
  limit: number;
  offset: number;
  total: number;
  page: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TransactionsPage = {
  transactions: InventoryTransaction[];
  pagination: TransactionsPagination;
};

export async function getTransactions(params: {
  limit: number;
  offset: number;
}): Promise<TransactionsPage> {
  const { data } = await api.get<ApiSuccess<TransactionsPage>>("/api/v1/transactions", {
    params,
  });
  return data.data;
}
