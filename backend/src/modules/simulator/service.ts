import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors.js";
import { logger } from "../../config/logger.js";
import { emitSimulatorStatus, type SimulatorStatusPayload } from "../../websocket/events.js";
import { eventsService } from "../events/service.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";
import { productsRepository } from "../products/repository.js";
import type { StartSimulatorInput } from "./validation.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)];
}

function varyUnitPrice(base: number): number {
  const factor = 0.8 + Math.random() * 0.4;
  return Number(Math.max(1, base * factor).toFixed(2));
}

type ProductRow = Awaited<ReturnType<typeof productsRepository.listActive>>[number];

type RunnerState = {
  status: SimulatorStatusPayload["status"];
  mode: "burst";
  published: number;
  total: number;
  startedAt: string;
  finishedAt?: string;
  stopped: boolean;
  running: boolean;
};

class SimulatorService {
  private state: RunnerState = {
    status: "stopped",
    mode: "burst",
    published: 0,
    total: 0,
    startedAt: new Date(0).toISOString(),
    stopped: true,
    running: false,
  };

  private loopPromise: Promise<void> | null = null;

  getStatus(): SimulatorStatusPayload {
    return {
      status: this.state.status,
      mode: this.state.mode,
      published: this.state.published,
      total: this.state.total,
      startedAt: this.state.startedAt,
      finishedAt: this.state.finishedAt,
    };
  }

  private emit() {
    emitSimulatorStatus(this.getStatus());
  }

  async start(input: StartSimulatorInput) {
    if (this.state.running) {
      throw new ConflictError("Simulation is already running");
    }

    const allProducts = await productsRepository.listActive();
    if (allProducts.length === 0) {
      throw new NotFoundError("No active products available for simulation");
    }

    let selected: ProductRow[];
    if (input.productIds?.length) {
      const idSet = new Set(input.productIds);
      selected = allProducts.filter((p) => idSet.has(p.id));
      if (selected.length === 0) {
        throw new ValidationError("None of the selected products were found");
      }
    } else {
      selected = allProducts;
    }

    const total = input.eventCount;
    const delayMs = input.delayMs;
    const autoSeed = input.autoSeed;

    this.state = {
      status: "running",
      mode: "burst",
      published: 0,
      total,
      startedAt: new Date().toISOString(),
      finishedAt: undefined,
      stopped: false,
      running: true,
    };
    this.emit();

    this.loopPromise = this.runLoop(selected, total, delayMs, autoSeed).finally(() => {
      this.state.running = false;
      this.loopPromise = null;
    });

    return this.getStatus();
  }

  async stop() {
    if (!this.state.running) {
      return this.getStatus();
    }
    this.state.stopped = true;
    if (this.loopPromise) {
      await this.loopPromise;
    }
    return this.getStatus();
  }

  private async runLoop(products: ProductRow[], total: number, delayMs: number, autoSeed: boolean) {
    try {
      if (autoSeed) {
        await this.autoSeedProducts(products);
        this.state.published = 0;
        this.emit();
      }

      while (!this.state.stopped && this.state.published < total) {
        await this.publishSmartEvent(products);
        if (this.state.stopped) break;

        this.state.published += 1;
        this.emit();

        if (this.state.published >= total) break;

        if (delayMs > 0 && !this.state.stopped) {
          await sleep(delayMs);
        }
      }

      this.state.status = this.state.stopped ? "stopped" : "completed";
      this.state.finishedAt = new Date().toISOString();
      this.emit();
    } catch (error) {
      logger.error({ err: error }, "Simulator loop failed");
      this.state.status = "stopped";
      this.state.finishedAt = new Date().toISOString();
      this.state.stopped = true;
      this.emit();
    }
  }

  private async autoSeedProducts(products: ProductRow[]) {
    for (const product of products) {
      if (this.state.stopped) return;
      const stock = await inventoryRepository.getAvailableStock(product.id);
      if (stock > 0) continue;

      const base = Number(product.purchasePrice) || 100;
      const seedPurchases = [
        { quantity: randInt(20, 50), unitPrice: varyUnitPrice(base) },
        { quantity: randInt(15, 35), unitPrice: varyUnitPrice(base) },
        { quantity: randInt(10, 30), unitPrice: varyUnitPrice(base * 1.1) },
      ];

      for (const purchase of seedPurchases) {
        if (this.state.stopped) return;
        await eventsService.publish({
          eventType: "PURCHASE",
          productId: product.id,
          quantity: purchase.quantity,
          unitPrice: purchase.unitPrice,
        });
        await sleep(250);
      }
    }
  }

  private async publishSmartEvent(products: ProductRow[]) {
    const product = pickOne(products);
    const stock = await inventoryRepository.getAvailableStock(product.id);
    const base = Number(product.purchasePrice) || 100;
    const preferSale = stock >= 10 && Math.random() < 0.55;

    if (preferSale) {
      const quantity = randInt(1, Math.min(20, stock));
      await eventsService.publish({
        eventType: "SALE",
        productId: product.id,
        quantity,
      });
      return;
    }

    await eventsService.publish({
      eventType: "PURCHASE",
      productId: product.id,
      quantity: randInt(10, 40),
      unitPrice: varyUnitPrice(base),
    });
  }
}

export const simulatorService = new SimulatorService();
