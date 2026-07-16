"use client";

import { useEffect, useState } from "react";
import { Layers, MousePointerClick } from "lucide-react";
import { useProductBatches } from "@/hooks/use-product-batches";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types/inventory";

type StockRow = DashboardData["productStock"][number];

type FifoLayersPanelProps = {
  product: StockRow | null;
  flashKey?: string | null;
};

export function FifoLayersPanel({ product, flashKey }: FifoLayersPanelProps) {
  const batchesQuery = useProductBatches(product?.productId, Boolean(product?.productId));
  const layers = batchesQuery.data?.layers ?? [];
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (!flashKey) return;
    setHighlight(true);
    const timer = window.setTimeout(() => setHighlight(false), 900);
    return () => window.clearTimeout(timer);
  }, [flashKey]);

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 shrink-0">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Layers className="h-5 w-5 text-brand-900" />
          FIFO Layers
        </h3>
        <p className="text-xs text-slate-500">
          {product
            ? "Oldest batch on top — consumed first on sales"
            : "Select any product in the stock table to inspect its FIFO queue"}
        </p>
      </div>

      {!product ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 text-center">
          <MousePointerClick className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">No product selected</p>
          <p className="mt-1 max-w-[220px] text-xs text-slate-500">
            Click a row in Current Product Stock to see open inventory layers here.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="font-mono text-xs text-slate-500">{product.sku}</p>
            <p className="mt-1 text-xs text-slate-600">
              On hand:{" "}
              <span className="font-bold text-slate-900">
                {batchesQuery.data?.availableStock ?? product.quantity} units
              </span>
            </p>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 transition-shadow duration-500",
              highlight && "rounded-xl ring-2 ring-amber-300 ring-offset-2",
            )}
          >
            {batchesQuery.isLoading ? (
              <p className="text-xs text-slate-500">Loading layers…</p>
            ) : layers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                No open layers — product is out of stock.
              </p>
            ) : (
              layers.map((layer, index) => (
                <div
                  key={layer.batchId}
                  className={cn(
                    "rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 transition",
                    highlight && index === 0 && "border-amber-300 bg-amber-50",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {layer.remainingQuantity} Units
                    </span>
                    <span className="font-mono text-sm font-semibold text-brand-900">
                      ${formatMoney(layer.purchasePrice)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Layer {index + 1}
                    {index === 0 ? " · next to consume" : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
