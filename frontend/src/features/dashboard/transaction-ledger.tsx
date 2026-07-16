"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LEDGER_PAGE_SIZE, useTransactions } from "@/hooks/use-transactions";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type TransactionLedgerProps = {
  page: number;
  onPageChange: (page: number) => void;
};

export function TransactionLedger({ page, onPageChange }: TransactionLedgerProps) {
  const { data, isLoading, isFetching, isError } = useTransactions(page, LEDGER_PAGE_SIZE);
  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const pageCount = pagination?.pageCount ?? 1;
  const from = total === 0 ? 0 : (page - 1) * LEDGER_PAGE_SIZE + 1;
  const to = Math.min(page * LEDGER_PAGE_SIZE, total);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Transaction Ledger</h3>
          <p className="text-xs text-slate-500">
            Processed warehouse purchase and sale audit history
          </p>
        </div>
        {total > 0 ? (
          <p className="text-xs font-medium text-slate-500">
            Showing {from}–{to} of {total}
            {isFetching && !isLoading ? " · refreshing…" : ""}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Action Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                SKU &amp; Product
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Qty
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Unit Cost
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Total Amount
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                FIFO Cost Allocation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center font-normal text-slate-500">
                  Loading transactions…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center font-normal text-rose-600">
                  Failed to load transactions.
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center font-normal text-slate-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const lineTotal =
                  tx.eventType === "SALE" && tx.fifoCost
                    ? Number(tx.fifoCost)
                    : Number(tx.unitPrice) * tx.quantity;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.eventType === "PURCHASE" ? "purchase" : "sale"}>
                        {tx.eventType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{tx.productName}</div>
                      <div className="font-mono text-xs font-normal text-slate-500">
                        {tx.productSku}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900">{tx.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-900">
                      {formatMoney(tx.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900">
                      {formatMoney(lineTotal)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900">
                      {tx.fifoCost ? formatMoney(tx.fifoCost) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {total > 0 ? (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination?.hasPrev || isFetching}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50",
                (!pagination?.hasPrev || isFetching) && "cursor-not-allowed opacity-50",
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination?.hasNext || isFetching}
              onClick={() => onPageChange(page + 1)}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50",
                (!pagination?.hasNext || isFetching) && "cursor-not-allowed opacity-50",
              )}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
