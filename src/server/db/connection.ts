import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import { assertEnvironment } from "../security";
import * as schema from "./schema";
const globals = globalThis as unknown as { salaryPool?: Pool };
export function connection() {
  if (!process.env.DATABASE_URL)
    throw new Error("Hosted database connection is not configured.");
  const pool =
    globals.salaryPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      application_name: "salary-desk",
    });
  if (!globals.salaryPool) {
    globals.salaryPool = pool;
    if (process.env.VERCEL) attachDatabasePool(pool);
  }
  return { pool, db: drizzle(pool, { schema }) };
}
export async function database() {
  const value = connection();
  const { rows } = await value.pool.query<{ purpose: string }>(
    "select purpose from salary_desk_environment where id=1",
  );
  assertEnvironment(
    {
      purpose: process.env.DATABASE_PURPOSE,
      vercelEnv: process.env.VERCEL_ENV,
    },
    rows[0]?.purpose,
  );
  return value;
}
