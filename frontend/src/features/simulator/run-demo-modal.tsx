"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { useProducts } from "@/hooks/use-products";
import type { StartSimulatorInput } from "@/services/simulator";
import { cn } from "@/lib/utils";

type RunDemoModalProps = {
  open: boolean;
  onClose: () => void;
  onStart: (input: StartSimulatorInput) => Promise<unknown>;
  isStarting: boolean;
  error: string | null;
  isRunning: boolean;
  published: number;
  total: number;
};

export function RunDemoModal({
  open,
  onClose,
  onStart,
  isStarting,
  error,
  isRunning,
  published,
  total,
}: RunDemoModalProps) {
  const { data: products, isLoading: productsLoading } = useProducts();
  const [eventCount, setEventCount] = useState<5 | 10>(10);
  const [delayMs, setDelayMs] = useState<500 | 1000 | 2000>(1000);
  const [autoSeed, setAutoSeed] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !products?.length) return;
    setSelectedIds(products.map((p) => p.id));
  }, [open, products]);

  if (!open) return null;

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const progressPct = total > 0 ? Math.min(100, Math.round((published / total) * 100)) : 0;

  const handleStart = async () => {
    await onStart({
      mode: "burst",
      eventCount,
      delayMs,
      productIds: selectedIds.length ? selectedIds : undefined,
      autoSeed,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-demo-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-brand-900 p-6 text-white">
          <div>
            <h3 id="run-demo-title" className="text-xl font-bold">
              Run Inventory Simulation
            </h3>
            <p className="mt-1 text-xs text-emerald-100">
              Push demo Kafka events through the live FIFO pipeline
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-100 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {isRunning ? (
            <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">Simulation Running</p>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-brand-900 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs font-medium text-emerald-800">
                {published} / {total} Events
              </p>
              <p className="text-xs text-emerald-800/80">
                You can close this modal — the dashboard will keep updating live.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Transactions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { label: "5 Events", value: 5 as const },
                      { label: "10 Events", value: 10 as const },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEventCount(opt.value)}
                      className={cn(
                        "rounded-xl border-2 py-2.5 text-sm font-semibold transition",
                        eventCount === opt.value
                          ? "border-brand-900 bg-brand-50 text-brand-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Speed
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { label: "Fast (500ms)", value: 500 as const },
                      { label: "Normal (1s)", value: 1000 as const },
                      { label: "Slow (2s)", value: 2000 as const },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDelayMs(opt.value)}
                      className={cn(
                        "rounded-xl border-2 py-2.5 text-xs font-semibold transition sm:text-sm",
                        delayMs === opt.value
                          ? "border-brand-900 bg-brand-50 text-brand-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Products
                </p>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {productsLoading ? (
                    <p className="text-xs text-slate-500">Loading products…</p>
                  ) : (
                    products?.map((product) => (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="rounded border-slate-300 text-brand-900 focus:ring-brand-900"
                        />
                        <span className="font-medium">
                          {product.sku} — {product.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={autoSeed}
                  onChange={(e) => setAutoSeed(e.target.checked)}
                  className="rounded border-slate-300 text-brand-900 focus:ring-brand-900"
                />
                <span>
                  Auto-seed empty products with purchase layers before simulation
                </span>
              </label>
            </>
          )}

          {error ? <FormAlert message={error} /> : null}

          <div className="-mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isRunning ? "Close" : "Cancel"}
            </button>
            {!isRunning ? (
              <button
                type="button"
                disabled={isStarting || selectedIds.length === 0 || productsLoading}
                onClick={() => void handleStart()}
                className="flex items-center gap-1.5 rounded-xl bg-brand-900 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition hover:bg-brand-800 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {isStarting ? "Starting…" : "Start Simulation"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
