import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env.js";
import * as schema from "../db/schema/index.js";

const needsSsl =
  env.DATABASE_URL.includes("sslmode=require") || env.DATABASE_URL.includes("neon.tech");

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
