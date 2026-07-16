import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { InventoryTransaction } from "@/types/inventory";

type TransactionLedgerProps = {
  transactions: InventoryTransaction[];
};

export function TransactionLedger({ transactions }: TransactionLedgerProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Transaction Ledger</h3>
          <p className="text-xs text-slate-500">
            Processed warehouse purchase and sale audit history
          </p>
        </div>
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center font-normal text-slate-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const total =
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
                    <td className="px-6 py-4 text-right text-slate-900">{formatMoney(total)}</td>
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
    </div>
  );
}
