import { env } from "../../config/env.js";
import { isConsumerRunning } from "../kafka/consumer.js";
import { isProducerConnected } from "../kafka/producer.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";

export class DashboardService {
  async getDashboard() {
    const [activeProducts, totals, productStock, recentTransactions] = await Promise.all([
      inventoryRepository.countActiveProducts(),
      inventoryRepository.getInventoryTotals(),
      inventoryRepository.getProductStockOverview(),
      inventoryRepository.listTransactions(10, 0),
    ]);

    return {
      kpis: {
        activeProducts,
        totalUnitsOnHand: totals.totalUnits,
        totalInventoryValue: totals.totalValue,
      },
      productStock: productStock.map((row) => ({
        productId: row.productId,
        sku: row.sku,
        name: row.name,
        quantity: Number(row.totalQuantity),
        value: row.totalValue,
      })),
      recentTransactions,
      streamingStatus: {
        connected: isProducerConnected() && isConsumerRunning(),
        topic: env.KAFKA_TOPIC_INVENTORY_EVENTS,
      },
    };
  }
}

export const dashboardService = new DashboardService();
