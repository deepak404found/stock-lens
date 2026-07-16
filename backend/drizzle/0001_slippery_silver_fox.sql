ALTER TABLE "products" ADD COLUMN "purchase_price" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mrp" numeric(12, 2) DEFAULT '0' NOT NULL;