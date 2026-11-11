import type { Analysis } from "./analysis";
import type { RationalMinor } from "./money";
export type HeadcountGroup = { key: string; count: number };
export type Dashboard = {
  population: {
    headcount: number;
    countries: HeadcountGroup[];
    departments: HeadcountGroup[];
    currencies: HeadcountGroup[];
  };
  compensation: Analysis;
  distribution: {lower:string;upper:string;count:number}[];
};
// Only this bounded, dimensionless display ratio crosses into Number arithmetic.
export function barPercent(value: bigint, maximum: bigint): number {
  if (value < 0n || maximum < 0n)
    throw new Error("Chart values must be non-negative.");
  if (maximum === 0n) return 0;
  const scaled = (value * 10_000n) / maximum;
  return Number(scaled > 10_000n ? 10_000n : scaled) / 100;
}
export function medianMinorTwice(value: RationalMinor | null): bigint {
  return value
    ? BigInt(value.numerator) * (value.denominator === 1 ? 2n : 1n)
    : 0n;
}
