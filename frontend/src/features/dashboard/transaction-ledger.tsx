import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryTransaction } from "@/types/inventory";

type TransactionLedgerProps = {
  transactions: InventoryTransaction[];
};

export function TransactionLedger({ transactions }: TransactionLedgerProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transaction Ledger</CardTitle>
        <CardDescription>Processed purchase and sale events</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-y border-stone-100 bg-stone-50/80 text-stone-500">
            <tr>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium text-right">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Unit</th>
              <th className="px-5 py-3 font-medium text-right">FIFO Cost</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-stone-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3 text-stone-600">{formatDateTime(tx.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={tx.eventType === "PURCHASE" ? "purchase" : "sale"}>
                      {tx.eventType}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-stone-900">{tx.productName}</div>
                    <div className="text-xs text-stone-500">{tx.productSku}</div>
                  </td>
                  <td className="px-5 py-3 text-right">{tx.quantity}</td>
                  <td className="px-5 py-3 text-right">{formatMoney(tx.unitPrice)}</td>
                  <td className="px-5 py-3 text-right">
                    {tx.fifoCost ? formatMoney(tx.fifoCost) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
