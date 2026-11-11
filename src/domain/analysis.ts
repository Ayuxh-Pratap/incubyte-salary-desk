import { parseFilters, type Filters } from "./filters";
import {
  currencyPrecision,
  formatMoney,
  type Summary,
  type RationalMinor,
} from "./money";
export type Analysis = {
  currency: string;
  period: "annual";
  summary: Summary;
  groups: { key: string; summary: Summary }[];
  filters: Filters;
};
export const METRICS = {
  count: {
    label: "Employees",
    definition:
      "Number of employees matching every active filter. Each employee counts once.",
  },
  total: {
    label: "Annual base total",
    definition:
      "Sum of current annual base salaries for every matching employee, in the selected currency only. This excludes bonuses, benefits and payroll costs.",
  },
  median: {
    label: "Median annual base",
    definition:
      "The middle salary after sorting the entire matching population. For an even count, use the midpoint of the two middle salaries; display rounds half up to currency precision.",
  },
  min: {
    label: "Lowest annual base",
    definition:
      "Smallest current annual base salary in the full matching population. Ties are permitted.",
  },
  max: {
    label: "Highest annual base",
    definition:
      "Largest current annual base salary in the full matching population. Ties are permitted.",
  },
} as const;
export type Metric = keyof typeof METRICS;
export function analysisFilters(input: Record<string, unknown>): Filters {
  const filters = parseFilters(input);
  if (!filters.currency) throw new Error("Select exactly one pay currency.");
  return filters;
}
export function drilldownFilters(
  filters: Filters,
  group: Filters["groupBy"],
  key: string,
): Filters {
  return parseFilters({ ...filters, [group]: key, page: 1 });
}
export function filterQuery(filters: Filters): string {
  return new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
}
export function exactMedian(value: RationalMinor, currency: string): string {
  const n = BigInt(value.numerator),
    d = BigInt(value.denominator);
  return (
    formatMoney((n / d).toString(), currency) +
    (n % d ? (currencyPrecision(currency) ? "5" : ".5") : "")
  );
}
