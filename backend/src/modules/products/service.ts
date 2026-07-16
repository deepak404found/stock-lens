import { NotFoundError } from "../../shared/errors.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";
import { productsRepository } from "./repository.js";

export class ProductsService {
  async listProducts() {
    return productsRepository.listActive();
  }

  async getFifoBatches(productId: string) {
    const product = await productsRepository.findActiveById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const layers = await inventoryRepository.getBatchesFifo(productId);
    const availableStock = layers.reduce((sum, layer) => sum + layer.remainingQuantity, 0);

    return {
      productId,
      availableStock,
      layers: layers.map((layer) => ({
        batchId: layer.id,
        remainingQuantity: layer.remainingQuantity,
        purchasePrice: layer.purchasePrice,
        purchaseDate: layer.purchaseDate,
      })),
    };
  }
}

export const productsService = new ProductsService();
