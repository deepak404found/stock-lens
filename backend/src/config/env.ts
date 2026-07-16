import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((value) => value.replace(/\/$/, "")),
  COOKIE_NAME: z.string().default("stocklens_token"),
  SEED_USER_EMAIL: z.string().email().default("admin@stocklens.com"),
  SEED_USER_PASSWORD: z.string().min(8).default("StockLens@123"),
  SEED_USER_FULL_NAME: z.string().default("StockLens Admin"),
  KAFKA_BROKERS: z
    .string()
    .min(1, "KAFKA_BROKERS is required")
    .transform((value) =>
      value
        .split(",")
        .map((broker) => broker.trim())
        .filter(Boolean),
    )
    .refine((brokers) => brokers.length > 0, "KAFKA_BROKERS must list at least one broker"),
  KAFKA_USERNAME: z.string().min(1, "KAFKA_USERNAME is required"),
  KAFKA_PASSWORD: z.string().min(1, "KAFKA_PASSWORD is required"),
  KAFKA_TOPIC_INVENTORY_EVENTS: z.string().min(1).default("inventory-events"),
  KAFKA_CONSUMER_GROUP: z.string().min(1).default("stocklens-inventory-consumer"),
  KAFKA_SSL: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

function formatEnvErrors(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.join(".") || "env";
    return `  - ${path}: ${issue.message}`;
  });

  return [
    "Invalid environment variables. Update backend/.env (see backend/.env.example).",
    "",
    "Required for Phase 2:",
    "  DATABASE_URL, JWT_SECRET,",
    "  KAFKA_BROKERS, KAFKA_USERNAME, KAFKA_PASSWORD",
    "",
    "Issues:",
    ...lines,
    "",
    "Redpanda Cloud: copy broker URL + SASL credentials, create topic inventory-events,",
    "then run: pnpm check:env",
  ].join("\n");
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable checklist (no stack dump for config issues)
  console.error(formatEnvErrors(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
