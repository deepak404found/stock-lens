import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/types/inventory";

type ProductStockTableProps = {
  rows: DashboardData["productStock"];
};

export function ProductStockTable({ rows }: ProductStockTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Product Stock</CardTitle>
        <CardDescription>Current on-hand quantity and value</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-y border-stone-100 bg-stone-50/80 text-stone-500">
            <tr>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium text-right">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-stone-500">
                  No stock data yet. Publish a purchase event to get started.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.productId} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3 font-mono text-stone-700">{row.sku}</td>
                  <td className="px-5 py-3 text-stone-900">{row.name}</td>
                  <td className="px-5 py-3 text-right text-stone-900">{row.quantity}</td>
                  <td className="px-5 py-3 text-right text-stone-900">{formatMoney(row.value)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
