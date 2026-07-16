import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);

export const inventoryEventTypeEnum = pgEnum("inventory_event_type", ["PURCHASE", "SALE"]);

export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  barcode: varchar("barcode", { length: 128 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  /** Suggested unit cost when publishing PURCHASE events */
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),
  /** Suggested MRP / list price when publishing SALE events */
  mrp: numeric("mrp", { precision: 12, scale: 2 }).notNull().default("0"),
  status: productStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryBatches = pgTable("inventory_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  batchNumber: varchar("batch_number", { length: 64 }).notNull(),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  purchasedQuantity: integer("purchased_quantity").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  eventType: inventoryEventTypeEnum("event_type").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  fifoCost: numeric("fifo_cost", { precision: 14, scale: 2 }),
  referenceNumber: varchar("reference_number", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fifoConsumptions = pgTable("fifo_consumptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => inventoryTransactions.id),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => inventoryBatches.id),
  quantityConsumed: integer("quantity_consumed").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryEvents = pgTable("inventory_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().unique(),
  eventType: inventoryEventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  processingStatus: processingStatusEnum("processing_status").notNull().default("pending"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
