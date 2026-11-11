import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { database } from "../src/server/db/connection";
import { seedDatabase } from "../src/server/db/seed";
config({ path: ".env.local", quiet: true });
const purpose = process.env.DATABASE_PURPOSE;
if (
  process.env.ALLOW_DEMO_RESET !== "true" ||
  !purpose ||
  !process.argv.includes("--confirm=RESET-SYNTHETIC-" + purpose)
)
  throw new Error(
    "Reset disabled. Explicitly enable ALLOW_DEMO_RESET and pass --confirm=RESET-SYNTHETIC-<environment>.",
  );
const { db, pool } = await database();
try {
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`truncate employees,department_roles,roles,departments,countries,currencies`,
    );
    await seedDatabase(tx as unknown as typeof db);
  });
  console.log(
    "Synthetic " + purpose + " environment reset to 10000 employees.",
  );
} finally {
  await pool.end();
}
