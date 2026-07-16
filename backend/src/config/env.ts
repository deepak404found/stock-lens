import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  COOKIE_NAME: z.string().default("stocklens_token"),
  SEED_USER_EMAIL: z.string().email().default("admin@stocklens.com"),
  SEED_USER_PASSWORD: z.string().min(8).default("StockLens@123"),
  SEED_USER_FULL_NAME: z.string().default("StockLens Admin"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(details)}`);
}

export const env = parsed.data;
export type Env = typeof env;
