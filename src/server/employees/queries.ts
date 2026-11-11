import { and, or, eq, ilike, asc, desc, count, type SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { employees as e, countries, departments, roles } from "../db/schema";
import type { Filters } from "../../domain/filters";
import type { Employee, EmployeePage, Catalog } from "../../domain/employee";
export type QueryDb = Pick<
  NodePgDatabase<typeof schema>,
  "select" | "update" | "execute"
>;
export function employeeWhere(f: Filters): SQL | undefined {
  const conditions: SQL[] = [];
  if (f.q) {
    const literal = f.q.replace(/[\\%_]/g, "\\$&");
    conditions.push(
      or(
        ilike(e.name, "%" + literal + "%"),
        ilike(e.employeeNumber, "%" + literal + "%"),
      )!,
    );
  }
  if (f.country) conditions.push(eq(e.country, f.country));
  if (f.department) conditions.push(eq(e.department, f.department));
  if (f.role) conditions.push(eq(e.role, f.role));
  if (f.currency) conditions.push(eq(e.currency, f.currency));
  return and(...conditions);
}
const fields = {
  id: e.id,
  employeeNumber: e.employeeNumber,
  name: e.name,
  country: e.country,
  countryName: countries.name,
  department: e.department,
  departmentName: departments.name,
  role: e.role,
  roleName: roles.name,
  currency: e.currency,
  period: e.period,
  salaryMinor: e.salaryMinor,
  version: e.version,
  updatedAt: e.updatedAt,
  updatedBy: e.updatedBy,
};
function selection(db: QueryDb) {
  return db
    .select(fields)
    .from(e)
    .innerJoin(countries, eq(e.country, countries.code))
    .innerJoin(departments, eq(e.department, departments.id))
    .innerJoin(roles, eq(e.role, roles.id));
}
function serialize(
  row: Omit<Employee, "salaryMinor" | "updatedAt"> & {
    salaryMinor: bigint;
    updatedAt: Date;
  },
): Employee {
  return {
    ...row,
    salaryMinor: row.salaryMinor.toString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
export async function listEmployees(
  db: QueryDb,
  f: Filters,
): Promise<EmployeePage> {
  const where = employeeWhere(f);
  const [population] = await db.select({ total: count() }).from(e).where(where);
  const pages = Math.max(1, Math.ceil(population.total / f.pageSize)),
    page = Math.min(f.page, pages);
  const orders = {
    "name-asc": asc(e.name),
    "name-desc": desc(e.name),
    "salary-asc": asc(e.salaryMinor),
    "salary-desc": desc(e.salaryMinor),
    "updated-desc": desc(e.updatedAt),
  };
  const rows = await selection(db)
    .where(where)
    .orderBy(orders[f.sort], asc(e.id))
    .limit(f.pageSize)
    .offset((page - 1) * f.pageSize);
  return {
    employees: rows.map(serialize),
    total: population.total,
    page,
    pageSize: f.pageSize,
    pages,
  };
}
export async function getEmployee(
  db: QueryDb,
  id: number,
): Promise<Employee | null> {
  const [row] = await selection(db).where(eq(e.id, id)).limit(1);
  return row ? serialize(row) : null;
}
export async function catalog(db: QueryDb): Promise<Catalog> {
  const [countryRows, departmentRows, roleRows, currencyRows] =
    await Promise.all([
      db.select().from(countries).orderBy(asc(countries.name)),
      db.select().from(departments).orderBy(asc(departments.name)),
      db.select().from(roles).orderBy(asc(roles.name)),
      db.select().from(schema.currencies).orderBy(asc(schema.currencies.code)),
    ]);
  return {
    countries: countryRows,
    departments: departmentRows,
    roles: roleRows,
    currencies: currencyRows,
  };
}
