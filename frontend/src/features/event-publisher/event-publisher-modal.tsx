"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  MinusCircle,
  PlusCircle,
  Send,
  X,
} from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { useEventPublisherForm } from "@/hooks/use-event-publisher-form";
import { useProductBatches } from "@/hooks/use-product-batches";
import { useProducts } from "@/hooks/use-products";
import { createInventorySocket } from "@/lib/socket";
import { formatMoney } from "@/lib/format";
import { previewFifoConsumption } from "@/lib/fifo-preview";
import type { EventType, FailedEventPayload, ProcessedEventPayload, Product } from "@/types/inventory";
import { cn } from "@/lib/utils";

type EventPublisherModalProps = {
  open: boolean;
  onClose: () => void;
};

type SuccessState = {
  eventType: EventType;
  quantity: number;
  unitPrice?: number;
  fifoCost: string | null;
  remainingStock: number | null;
};

function purchaseUnitPrice(product: Product | undefined): number {
  if (!product) return 0;
  const value = Number(product.purchasePrice);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function EventPublisherModal({ open, onClose }: EventPublisherModalProps) {
  const { data: products, isLoading: productsLoading } = useProducts();
  const {
    register,
    watch,
    setValue,
    onSubmit,
    serverError,
    setServerError,
    pendingEventId,
    lastPublished,
    clearPending,
    errors,
    isSubmitting,
    clearFeedback,
    resetForm,
  } = useEventPublisherForm();

  const [success, setSuccess] = useState<SuccessState | null>(null);

  const eventType = watch("eventType");
  const productId = watch("productId");
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  const selectedProduct = products?.find((p) => p.id === productId);
  const qtyValue = Math.max(1, Number(quantity) || 1);
  const purchasePrice = purchaseUnitPrice(selectedProduct);

  const batchesQuery = useProductBatches(productId, open && Boolean(productId));
  const layers = batchesQuery.data?.layers ?? [];
  const availableStock = batchesQuery.data?.availableStock ?? 0;
  const fifoPreview = previewFifoConsumption(layers, qtyValue);
  const saleBlocked =
    eventType === "SALE" &&
    (availableStock <= 0 || qtyValue > availableStock || !fifoPreview.canFulfill);

  // Fresh form every time the modal opens; preselect first product when available.
  useEffect(() => {
    if (!open) {
      clearFeedback();
      setSuccess(null);
      return;
    }

    const first = products?.[0];
    resetForm({
      eventType: "PURCHASE",
      productId: first?.id ?? "",
      quantity: 1,
      unitPrice: purchaseUnitPrice(first),
    });
    setSuccess(null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pendingEventId) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !products?.length || productId) return;
    const first = products[0];
    setValue("productId", first.id, { shouldValidate: true });
    if (eventType === "PURCHASE") {
      setValue("unitPrice", purchaseUnitPrice(first), { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, products, productId]);

  // Wait for processed / failed socket matching the pending event.
  useEffect(() => {
    if (!open || !pendingEventId) return;

    const socket = createInventorySocket();

    const onProcessed = (payload: ProcessedEventPayload) => {
      if (payload.eventId !== pendingEventId) return;
      const qty = lastPublished?.quantity ?? payload.quantity;
      const remaining =
        payload.eventType === "SALE"
          ? Math.max(0, availableStock - qty)
          : availableStock + qty;

      setSuccess({
        eventType: payload.eventType,
        quantity: payload.quantity,
        unitPrice: lastPublished?.unitPrice ?? payload.unitPrice,
        fifoCost: payload.fifoCost,
        remainingStock: Number.isFinite(remaining) ? remaining : null,
      });
      clearPending();
      window.setTimeout(() => onClose(), 1600);
    };

    const onFailed = (payload: FailedEventPayload) => {
      if (payload.eventId !== pendingEventId) return;
      setServerError(payload.reason || "Event processing failed");
      clearPending();
    };

    socket.on("inventory.event.processed", onProcessed);
    socket.on("inventory.event.failed", onFailed);

    return () => {
      socket.off("inventory.event.processed", onProcessed);
      socket.off("inventory.event.failed", onFailed);
      socket.disconnect();
    };
  }, [
    open,
    pendingEventId,
    lastPublished,
    eventType,
    availableStock,
    clearPending,
    setServerError,
    onClose,
  ]);

  if (!open) return null;

  const adjustQty = (delta: number) => {
    const next = Math.max(1, qtyValue + delta);
    setValue("quantity", next, { shouldValidate: true });
  };

  const setEventType = (type: EventType) => {
    if (type === "PURCHASE") {
      setValue("eventType", "PURCHASE", { shouldValidate: true });
      setValue("unitPrice", purchasePrice || 0, { shouldValidate: true });
    } else {
      setValue("eventType", "SALE", { shouldValidate: true });
    }
  };

  const productRegister = register("productId");
  const isProcessing = Boolean(pendingEventId) && !success;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-event-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-brand-900 p-6 text-white">
          <div>
            <h3 id="publish-event-title" className="text-xl font-bold">
              Simulate Event
            </h3>
            <p className="mt-1 text-xs text-emerald-100">
              Publish messages directly to the Redpanda pipeline
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-1 text-emerald-100 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">
                  {success.eventType === "SALE" ? "Sale Event Published" : "Purchase Event Published"}
                </p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-emerald-800/80">Quantity</dt>
                    <dd className="font-semibold">{success.quantity}</dd>
                  </div>
                  {success.eventType === "PURCHASE" && success.unitPrice != null ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-emerald-800/80">Unit price</dt>
                      <dd className="font-semibold">${formatMoney(success.unitPrice)}</dd>
                    </div>
                  ) : null}
                  {success.eventType === "SALE" && success.fifoCost ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-emerald-800/80">FIFO Cost</dt>
                      <dd className="font-semibold">${formatMoney(success.fifoCost)}</dd>
                    </div>
                  ) : null}
                  {success.remainingStock != null ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-emerald-800/80">Remaining Stock</dt>
                      <dd className="font-semibold">{success.remainingStock} Units</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 p-6" noValidate>
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                Event Action
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEventType("PURCHASE")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition",
                    eventType === "PURCHASE"
                      ? "border-brand-900 bg-brand-50 text-brand-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Purchase
                </button>
                <button
                  type="button"
                  onClick={() => setEventType("SALE")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition",
                    eventType === "SALE"
                      ? "border-brand-900 bg-brand-50 text-brand-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Sale
                </button>
              </div>
              <input type="hidden" {...register("eventType")} />
              {errors.eventType ? (
                <p className="mt-1 text-xs text-rose-600">{errors.eventType.message}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="productId"
                className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase"
              >
                Target Product
              </label>
              <div className="relative">
                <select
                  id="productId"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-brand-900 focus:outline-none"
                  disabled={productsLoading || !products?.length || isProcessing}
                  name={productRegister.name}
                  ref={productRegister.ref}
                  onBlur={productRegister.onBlur}
                  value={productId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    void productRegister.onChange(e);
                    setValue("productId", nextId, { shouldValidate: true });
                    const product = products?.find((p) => p.id === nextId);
                    if (eventType === "PURCHASE") {
                      setValue("unitPrice", purchaseUnitPrice(product), { shouldValidate: true });
                    }
                  }}
                >
                  <option value="">Select a product</option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              {errors.productId ? (
                <p className="mt-1 text-xs text-rose-600">{errors.productId.message}</p>
              ) : null}
            </div>

            {eventType === "SALE" && productId ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Current Stock</span>
                  <span className="font-bold text-slate-900">
                    {batchesQuery.isLoading ? "…" : `${availableStock} Units`}
                  </span>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-600 uppercase">
                    <Layers className="h-3.5 w-3.5" />
                    Available FIFO Layers
                  </p>
                  {batchesQuery.isLoading ? (
                    <p className="text-xs text-slate-500">Loading layers…</p>
                  ) : layers.length === 0 ? (
                    <p className="text-xs text-rose-600">No inventory layers — product is out of stock.</p>
                  ) : (
                    <ul className="space-y-1 font-mono text-xs text-slate-700">
                      {layers.map((layer) => (
                        <li key={layer.batchId}>
                          {layer.remainingQuantity} @ ${formatMoney(layer.purchasePrice)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}

            <div className={cn("grid gap-4", eventType === "PURCHASE" ? "grid-cols-2" : "grid-cols-1")}>
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase"
                >
                  Quantity
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-brand-900">
                  <button
                    type="button"
                    onClick={() => adjustQty(-1)}
                    disabled={isProcessing}
                    className="px-3 py-3 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    aria-label="Decrease quantity by 1"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    disabled={isProcessing}
                    className="w-full border-0 bg-transparent p-0 text-center text-sm font-bold text-slate-900 focus:ring-0 focus:outline-none"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  <button
                    type="button"
                    onClick={() => adjustQty(1)}
                    disabled={isProcessing}
                    className="px-3 py-3 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    aria-label="Increase quantity by 1"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </div>
                {errors.quantity ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.quantity.message}</p>
                ) : null}
                {eventType === "SALE" && qtyValue > availableStock && availableStock >= 0 && !batchesQuery.isLoading ? (
                  <p className="mt-1 text-xs text-rose-600">
                    Only {availableStock} units available
                  </p>
                ) : null}
              </div>

              {eventType === "PURCHASE" ? (
                <div>
                  <label
                    htmlFor="unitPrice"
                    className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase"
                  >
                    Unit Price
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-brand-900">
                    <span className="font-medium text-slate-400">$</span>
                    <input
                      id="unitPrice"
                      type="number"
                      min={0.01}
                      step={0.01}
                      disabled={isProcessing}
                      className="w-full border-0 bg-transparent py-3 pl-1 text-sm font-bold text-slate-900 focus:ring-0 focus:outline-none"
                      {...register("unitPrice", { valueAsNumber: true })}
                    />
                  </div>
                  {"unitPrice" in errors && errors.unitPrice ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.unitPrice.message}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {eventType === "PURCHASE" ? (
              <div className="space-y-1 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-900">
                <span className="mb-1 flex items-center font-bold">
                  <AlertCircle className="mr-1 h-4 w-4 text-emerald-600" />
                  This will create a new FIFO layer
                </span>
                <p>
                  {qtyValue} Units @ ${formatMoney(Number(unitPrice) || 0)} each
                </p>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-900">
                <span className="flex items-center font-bold">
                  <AlertCircle className="mr-1 h-4 w-4 text-amber-600" />
                  FIFO Cost Preview
                </span>
                {fifoPreview.lines.length > 0 ? (
                  <ul className="space-y-1 font-mono">
                    {fifoPreview.lines.map((line, idx) => (
                      <li key={`${line.unitPrice}-${idx}`}>
                        ✓ {line.quantity} × ${formatMoney(line.unitPrice)} = $
                        {formatMoney(line.lineCost)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Enter a quantity within available stock to preview FIFO consumption.</p>
                )}
                <div className="border-t border-amber-200/80 pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Estimated FIFO Cost</span>
                    <span>${formatMoney(fifoPreview.estimatedCost)}</span>
                  </div>
                </div>
                <p className="text-amber-800/80">
                  Unit price is calculated automatically using FIFO — not required on the sale
                  payload.
                </p>
              </div>
            )}

            {serverError ? <FormAlert message={serverError} /> : null}
            {isProcessing ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                Processing… waiting for Redpanda consumer confirmation.
              </p>
            ) : null}

            <div className="-mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isProcessing ||
                  productsLoading ||
                  (eventType === "SALE" && (saleBlocked || batchesQuery.isLoading))
                }
                className="flex items-center gap-1.5 rounded-xl bg-brand-900 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition hover:bg-brand-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting || isProcessing
                  ? "Publishing…"
                  : eventType === "SALE"
                    ? "Publish Sale"
                    : "Publish Purchase"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
