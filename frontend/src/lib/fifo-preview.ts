export type FifoLayer = {
  remainingQuantity: number;
  purchasePrice: string | number;
};

export type FifoPreviewLine = {
  quantity: number;
  unitPrice: number;
  lineCost: number;
};

export type FifoPreviewResult = {
  lines: FifoPreviewLine[];
  estimatedCost: number;
  shortfall: number;
  canFulfill: boolean;
};

/** Mirrors backend FIFO consumption: oldest layers first. */
export function previewFifoConsumption(
  layers: FifoLayer[],
  quantity: number,
): FifoPreviewResult {
  let remaining = Math.max(0, Math.floor(quantity));
  const lines: FifoPreviewLine[] = [];
  let estimatedCost = 0;

  for (const layer of layers) {
    if (remaining <= 0) break;
    const available = Math.max(0, Math.floor(Number(layer.remainingQuantity)));
    if (available <= 0) continue;

    const take = Math.min(remaining, available);
    const unitPrice = Number(layer.purchasePrice);
    if (!Number.isFinite(unitPrice)) continue;

    const lineCost = Number((take * unitPrice).toFixed(2));
    lines.push({ quantity: take, unitPrice, lineCost });
    estimatedCost += lineCost;
    remaining -= take;
  }

  estimatedCost = Number(estimatedCost.toFixed(2));
  return {
    lines,
    estimatedCost,
    shortfall: remaining,
    canFulfill: remaining === 0 && quantity > 0,
  };
}
