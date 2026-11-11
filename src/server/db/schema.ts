import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  bigint,
  timestamp,
  check,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
export const environment = pgTable(
  "salary_desk_environment",
  { id: integer("id").primaryKey(), purpose: text("purpose").notNull() },
  (t) => [
    check("singleton_environment", sql`${t.id} = 1`),
    check(
      "valid_purpose",
      sql`${t.purpose} in ('development','test','demo','preview')`,
    ),
  ],
);
export const currencies = pgTable(
  "currencies",
  {
    code: text("code").primaryKey(),
    precision: integer("precision").notNull(),
  },
  (t) => [check("currency_precision", sql`${t.precision} between 0 and 3`)],
);
export const countries = pgTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});
export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
export const departmentRoles = pgTable(
  "department_roles",
  {
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (t) => [primaryKey({ columns: [t.departmentId, t.roleId] })],
);
export const employees = pgTable(
  "employees",
  {
    id: integer("id").primaryKey(),
    employeeNumber: text("employee_number").notNull().unique(),
    name: text("name").notNull(),
    country: text("country")
      .notNull()
      .references(() => countries.code),
    department: text("department")
      .notNull()
      .references(() => departments.id),
    role: text("role")
      .notNull()
      .references(() => roles.id),
    currency: text("currency")
      .notNull()
      .references(() => currencies.code),
    period: text("period").notNull().default("annual"),
    salaryMinor: bigint("salary_minor", { mode: "bigint" }).notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: text("updated_by").notNull().default("Synthetic seed"),
  },
  (t) => [
    check(
      "positive_bounded_salary",
      sql`${t.salaryMinor} > 0 and ${t.salaryMinor} <= 9000000000000000000`,
    ),
    check("annual_salary_only", sql`${t.period} = 'annual'`),
    check("positive_version", sql`${t.version} > 0`),
    index("employee_name_id_idx").on(t.name, t.id),
    index("employee_currency_salary_id_idx").on(
      t.currency,
      t.salaryMinor,
      t.id,
    ),
    index("employee_country_department_idx").on(t.country, t.department),
    index("employee_department_role_idx").on(t.department, t.role),
  ],
);
