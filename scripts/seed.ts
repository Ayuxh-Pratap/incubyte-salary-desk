import { config } from "dotenv";
import { database } from "../src/server/db/connection";
import { seedDatabase } from "../src/server/db/seed";
config({ path: ".env.local", quiet: true });
const { pool, db } = await database();
try {
  console.log(
    "Verified " +
      (await seedDatabase(db)) +
      " synthetic employees. Existing rows and edits preserved.",
  );
} finally {
  await pool.end();
}
