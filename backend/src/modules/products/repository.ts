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
        purchasePrice: products.purchasePrice,
        mrp: products.mrp,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.sku));
  }

  async findActiveById(productId: string) {
    const [product] = await db
      .select({
        id: products.id,
        sku: products.sku,
        status: products.status,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product || product.status !== "active") return null;
    return product;
  }
}

export const productsRepository = new ProductsRepository();
