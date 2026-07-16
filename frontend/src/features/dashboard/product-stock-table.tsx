import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types/inventory";

type ProductStockTableProps = {
  rows: DashboardData["productStock"];
  selectedProductId?: string | null;
  onSelectProduct?: (productId: string) => void;
};

export function ProductStockTable({
  rows,
  selectedProductId,
  onSelectProduct,
}: ProductStockTableProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Current Product Stock</h3>
          <p className="text-xs text-slate-500">
            Click a row to inspect its FIFO inventory layers
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800 uppercase">
          Real-Time Sync
        </span>
      </div>

      <div className="flex-grow overflow-x-auto rounded-xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                SKU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Product Name
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Qty On Hand
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                FIFO Value
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  No stock data yet. Publish a purchase event to get started.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const inStock = row.quantity > 0;
                const selected = row.productId === selectedProductId;
                return (
                  <tr
                    key={row.productId}
                    onClick={() => onSelectProduct?.(row.productId)}
                    className={cn(
                      "cursor-pointer transition hover:bg-slate-50/80",
                      selected && "bg-brand-50/70 hover:bg-brand-50",
                    )}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                      {row.sku}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {row.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {formatMoney(row.value)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={
                          inStock
                            ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                        }
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
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
