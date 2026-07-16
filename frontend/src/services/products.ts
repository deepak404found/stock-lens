import { api, type ApiSuccess } from "@/lib/api";
import type { Product } from "@/types/inventory";

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<ApiSuccess<{ products: Product[] }>>("/api/v1/products");
  return data.data.products;
}

export type ProductFifoBatch = {
  batchId: string;
  remainingQuantity: number;
  purchasePrice: string;
  purchaseDate: string;
};

export type ProductFifoBatches = {
  productId: string;
  availableStock: number;
  layers: ProductFifoBatch[];
};

export async function getProductBatches(productId: string): Promise<ProductFifoBatches> {
  const { data } = await api.get<ApiSuccess<ProductFifoBatches>>(
    `/api/v1/products/${productId}/batches`,
  );
  return data.data;
}
