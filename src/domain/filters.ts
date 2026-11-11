import { z } from "zod";
import { CURRENCIES } from "./money";
const optionalText = z
  .string()
  .max(64)
  .regex(/^[a-zA-Z0-9-]+$/)
  .optional();
export const filterSchema = z.object({
  q: z.string().trim().max(100).default(""),
  country: z.enum(["IN", "US", "GB", "DE", "JP", "KW"]).optional(),
  department: optionalText,
  role: optionalText,
  currency: z
    .enum(
      Object.keys(CURRENCIES) as [
        keyof typeof CURRENCIES,
        ...(keyof typeof CURRENCIES)[],
      ],
    )
    .optional(),
  sort: z
    .enum([
      "name-asc",
      "name-desc",
      "salary-asc",
      "salary-desc",
      "updated-desc",
    ])
    .default("name-asc"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce
    .number()
    .refine(
      (n) => [25, 50, 100].includes(n),
      "Use 25, 50 or 100 records per page.",
    )
    .default(25),
  groupBy: z.enum(["country", "department", "role"]).default("department"),
});
export type Filters = z.infer<typeof filterSchema>;
export function parseFilters(input: Record<string, unknown>): Filters {
  return filterSchema.parse(
    Object.fromEntries(
      Object.entries(input).filter(
        ([, value]) => value !== "" && value !== undefined,
      ),
    ),
  );
}
