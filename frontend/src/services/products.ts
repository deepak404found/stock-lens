import { api, type ApiSuccess } from "@/lib/api";
import type { Product } from "@/types/inventory";

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<ApiSuccess<{ products: Product[] }>>("/api/v1/products");
  return data.data.products;
}
