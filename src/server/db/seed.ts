import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { count } from "drizzle-orm";
import * as schema from "./schema";
import { CURRENCIES } from "../../domain/money";
import {
  COUNTRY_OPTIONS,
  DEPARTMENTS,
  syntheticEmployees,
} from "../../domain/seed";
export async function seedDatabase(
  db: Pick<NodePgDatabase<typeof schema>, "transaction">,
) {
  return db.transaction(async (tx) => {
    await tx
      .insert(schema.currencies)
      .values(
        Object.entries(CURRENCIES).map(([code, precision]) => ({
          code,
          precision,
        })),
      )
      .onConflictDoNothing();
    await tx
      .insert(schema.countries)
      .values(COUNTRY_OPTIONS.map(({ code, name }) => ({ code, name })))
      .onConflictDoNothing();
    await tx
      .insert(schema.departments)
      .values(DEPARTMENTS.map(({ id, name }) => ({ id, name })))
      .onConflictDoNothing();
    const roles = DEPARTMENTS.flatMap((d) =>
      d.roles.map(([id, name]) => ({ id, name })),
    );
    await tx.insert(schema.roles).values(roles).onConflictDoNothing();
    const values = syntheticEmployees();
    for (let offset = 0; offset < values.length; offset += 500)
      await tx
        .insert(schema.employees)
        .values(values.slice(offset, offset + 500))
        .onConflictDoNothing();
    const [result] = await tx.select({ count: count() }).from(schema.employees);
    if (result.count !== 10000)
      throw new Error(
        "Expected exactly 10000 employees; refusing an inconsistent seed.",
      );
    return result.count;
  });
}
