import { and, eq, sql } from "drizzle-orm";
import { employees } from "../db/schema";
import { getEmployee, type QueryDb } from "./queries";
import type { SalaryRepository } from "../../domain/salary-update";
export function salaryRepository(db: QueryDb): SalaryRepository {
  return {
    find: (id) => getEmployee(db, id),
    compareAndSwap: async (id, version, minor) => {
      const [updated] = await db
        .update(employees)
        .set({
          salaryMinor: minor,
          version: sql`${employees.version} + 1`,
          updatedAt: sql`clock_timestamp()`,
          updatedBy: "Evaluator",
        })
        .where(and(eq(employees.id, id), eq(employees.version, version)))
        .returning({
          salaryMinor: employees.salaryMinor,
          version: employees.version,
          updatedAt: employees.updatedAt,
          updatedBy: employees.updatedBy,
        });
      return updated
        ? {
            ...updated,
            salaryMinor: updated.salaryMinor.toString(),
            updatedAt: updated.updatedAt.toISOString(),
          }
        : null;
    },
  };
}
