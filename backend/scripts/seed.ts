import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { env } from "../src/config/env.js";
import { db } from "../src/config/db.js";
import { logger } from "../src/config/logger.js";
import { products, users } from "../src/db/schema/index.js";

const seedProducts = [
  {
    sku: "PRD001",
    name: "Industrial Sensor Kit",
    description: "Multi-sensor pack for warehouse monitoring",
    barcode: "8901001001001",
    status: "active" as const,
  },
  {
    sku: "PRD002",
    name: "Smart Label Roll",
    description: "RFID-ready labels, 1000 count",
    barcode: "8901001001002",
    status: "active" as const,
  },
  {
    sku: "PRD003",
    name: "Handheld Scanner",
    description: "Bluetooth barcode scanner",
    barcode: "8901001001003",
    status: "active" as const,
  },
];

async function seed() {
  const email = env.SEED_USER_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(env.SEED_USER_PASSWORD, 12);

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    await db
      .update(users)
      .set({
        fullName: env.SEED_USER_FULL_NAME,
        passwordHash,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));
    logger.info({ email }, "Updated seed user");
  } else {
    await db.insert(users).values({
      fullName: env.SEED_USER_FULL_NAME,
      email,
      phone: null,
      passwordHash,
      isActive: true,
    });
    logger.info({ email }, "Created seed user");
  }

  for (const product of seedProducts) {
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.sku, product.sku))
      .limit(1);

    if (existing) {
      await db
        .update(products)
        .set({
          name: product.name,
          description: product.description,
          barcode: product.barcode,
          status: product.status,
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id));
      logger.info({ sku: product.sku }, "Updated seed product");
    } else {
      await db.insert(products).values(product);
      logger.info({ sku: product.sku }, "Created seed product");
    }
  }

  logger.info("Seed completed");
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
