import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
config({ path: ".env.local", quiet: true });
const purpose = process.env.DATABASE_PURPOSE,
  url = process.env.DATABASE_DIRECT_URL;
if (
  !url ||
  !purpose ||
  !["development", "test", "demo", "preview"].includes(purpose)
)
  throw new Error(
    "Configure a direct URL and an explicit environment purpose.",
  );
const pool = new Pool({ connectionString: url, max: 1 });
try {
  // An existing environment marker must agree BEFORE applying any migrations.
  const exists = await pool.query(
    "select to_regclass('public.salary_desk_environment') as marker",
  );
  if (exists.rows[0].marker) {
    const marker = await pool.query(
      "select purpose from salary_desk_environment where id=1",
    );
    if (marker.rows[0]?.purpose !== purpose)
      throw new Error("Refusing to migrate a different database environment.");
  }
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.query(
    "insert into salary_desk_environment (id,purpose) values (1,$1) on conflict (id) do nothing",
    [purpose],
  );
  console.log("Migrations applied to " + purpose + " environment.");
} finally {
  await pool.end();
}
