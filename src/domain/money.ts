export const CURRENCIES = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  INR: 2,
  JPY: 0,
  KWD: 3,
} as const;
export type Currency = keyof typeof CURRENCIES;
// Below PostgreSQL's signed BIGINT ceiling; checked at both boundaries.
export const MAX_MINOR = 9_000_000_000_000_000_000n;
export type RationalMinor = { numerator: string; denominator: 1 | 2 };
export type Summary = {
  count: number;
  total: string;
  min: string | null;
  max: string | null;
  median: RationalMinor | null;
};
export function currencyPrecision(currency: string): number {
  if (!Object.hasOwn(CURRENCIES, currency))
    throw new Error("Unsupported currency");
  return CURRENCIES[currency as Currency];
}
export function parseSalary(input: string, currency: string): bigint {
  const precision = currencyPrecision(currency);
  if (input.length > 24 || !/^\d+(?:\.\d+)?$/.test(input))
    throw new Error("Enter a positive decimal amount without separators.");
  const [whole, fraction = ""] = input.split(".");
  if (fraction.length > precision)
    throw new Error(currency + " allows " + precision + " decimal places.");
  const amount =
    BigInt(whole) * 10n ** BigInt(precision) +
    BigInt(fraction.padEnd(precision, "0") || "0");
  if (amount <= 0n || amount > MAX_MINOR)
    throw new Error("Salary must be positive and within the supported range.");
  return amount;
}
export function salaryInput(minor: string, currency: string): string {
  const precision = currencyPrecision(currency),
    amount = BigInt(minor),
    scale = 10n ** BigInt(precision);
  return (
    (amount / scale).toString() +
    (precision
      ? "." + (amount % scale).toString().padStart(precision, "0")
      : "")
  );
}
export function formatMoney(minor: string, currency: string): string {
  const precision = currencyPrecision(currency),
    raw = BigInt(minor),
    amount = raw < 0n ? -raw : raw,
    scale = 10n ** BigInt(precision);
  const whole = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount / scale);
  return (
    currency +
    " " +
    (raw < 0n ? "-" : "") +
    whole +
    (precision
      ? "." + (amount % scale).toString().padStart(precision, "0")
      : "")
  );
}
// Round a signed rational half away from zero, only at presentation boundaries.
function divideRounded(n: bigint, d: bigint): bigint {
  if (d <= 0n) throw new Error("Invalid denominator");
  const sign = n < 0n ? -1n : 1n,
    a = n < 0n ? -n : n;
  return sign * ((a + d / 2n) / d);
}
export function formatRational(value: RationalMinor, currency: string): string {
  return formatMoney(
    divideRounded(
      BigInt(value.numerator),
      BigInt(value.denominator),
    ).toString(),
    currency,
  );
}
export function assertCompatible(
  a: { currency: string; period: string },
  b: { currency: string; period: string },
): void {
  if (a.currency !== b.currency || a.period !== b.period)
    throw new Error("Salary units must match.");
}
export function summarize(amounts: readonly string[]): Summary {
  if (!amounts.length)
    return { count: 0, total: "0", min: null, max: null, median: null };
  const sorted = amounts
      .map(BigInt)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    n = sorted.length,
    mid = Math.floor(n / 2);
  return {
    count: n,
    total: sorted.reduce((a, b) => a + b, 0n).toString(),
    min: sorted[0].toString(),
    max: sorted[n - 1].toString(),
    median:
      n % 2
        ? { numerator: sorted[mid].toString(), denominator: 1 }
        : {
            numerator: (sorted[mid - 1] + sorted[mid]).toString(),
            denominator: 2,
          },
  };
}
export function changePreview(
  oldMinor: string,
  newMinor: string,
  currency: string,
): {
  absolute: string;
  percentage: string;
  direction: "increase" | "decrease" | "unchanged";
} {
  const old = BigInt(oldMinor),
    next = BigInt(newMinor);
  if (old <= 0n || next <= 0n) throw new Error("Salaries must be positive.");
  const delta = next - old,
    basis = divideRounded(delta * 10000n, old),
    magnitude = basis < 0n ? -basis : basis;
  const sign = delta > 0n ? "+" : delta < 0n ? "-" : "";
  return {
    absolute: formatMoney(delta.toString(), currency),
    percentage:
      sign +
      (magnitude / 100n).toString() +
      "." +
      (magnitude % 100n).toString().padStart(2, "0") +
      "%",
    direction: delta > 0n ? "increase" : delta < 0n ? "decrease" : "unchanged",
  };
}
