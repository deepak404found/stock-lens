import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });

const required = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  KAFKA_BROKERS: z.string().min(1),
  KAFKA_USERNAME: z.string().min(1),
  KAFKA_PASSWORD: z.string().min(1),
});

const result = required.safeParse(process.env);

if (!result.success) {
  const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  console.error(`Environment check failed. Missing or invalid: ${missing}`);
  console.error("See backend/.env.example and configure Redpanda Cloud + Neon.");
  process.exit(1);
}

console.log("Environment check passed.");
console.log(`  DATABASE_URL: set`);
console.log(`  JWT_SECRET: set`);
console.log(`  KAFKA_BROKERS: ${result.data.KAFKA_BROKERS}`);
console.log(`  KAFKA_USERNAME: set`);
console.log(`  KAFKA_TOPIC: ${process.env.KAFKA_TOPIC_INVENTORY_EVENTS ?? "inventory-events"}`);
