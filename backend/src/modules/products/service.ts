import { productsRepository } from "./repository.js";

export class ProductsService {
  async listProducts() {
    return productsRepository.listActive();
  }
}

export const productsService = new ProductsService();
