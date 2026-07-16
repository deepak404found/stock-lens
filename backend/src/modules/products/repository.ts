import { asc, eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { products } from "../../db/schema/index.js";

export class ProductsRepository {
  async listActive() {
    return db
      .select({
        id: products.id,
        sku: products.sku,
        barcode: products.barcode,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.sku));
  }
}

export const productsRepository = new ProductsRepository();
