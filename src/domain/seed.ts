import { CURRENCIES, type Currency } from "./money";
export const SEED_VERSION = "acme-v1";
export const COUNTRY_OPTIONS = [
  { code: "IN", name: "India", currency: "INR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "KW", name: "Kuwait", currency: "KWD" },
] as const;
export const DEPARTMENTS = [
  {
    id: "engineering",
    name: "Engineering",
    roles: [
      ["engineer", "Software Engineer"],
      ["qa", "Quality Engineer"],
      ["platform", "Platform Engineer"],
    ],
  },
  {
    id: "operations",
    name: "Operations",
    roles: [
      ["specialist", "Operations Specialist"],
      ["coordinator", "Coordinator"],
    ],
  },
  {
    id: "sales",
    name: "Sales",
    roles: [
      ["account-manager", "Account Manager"],
      ["sales-associate", "Sales Associate"],
    ],
  },
  {
    id: "finance",
    name: "Finance",
    roles: [
      ["analyst", "Financial Analyst"],
      ["accountant", "Accountant"],
    ],
  },
  {
    id: "people",
    name: "People",
    roles: [
      ["hr-partner", "HR Partner"],
      ["recruiter", "Recruiter"],
    ],
  },
  {
    id: "design",
    name: "Design",
    roles: [
      ["designer", "Product Designer"],
      ["researcher", "UX Researcher"],
    ],
  },
  { id: "leadership", name: "Leadership", roles: [["director", "Director"]] },
] as const;
export function syntheticEmployees() {
  let state = 0x51a7de5;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const given = [
    "Aarav",
    "Maya",
    "José",
    "Zoë",
    "Amina",
    "Kenji",
    "Priya",
    "Saoirse",
    "Omar",
    "Élodie",
    "Sung-min",
    "Chinwe",
    "Anastasia",
    "Li Wei",
    "Noor",
    "Sam",
  ];
  const family = [
    "Sharma",
    "Williams",
    "García",
    "Müller",
    "Al-Hassan",
    "Tanaka",
    "O’Connor",
    "Okafor",
    "Singh",
    "Dubois",
    "Kim",
    "Fernández-Rodríguez",
    "Das",
    "Wong",
    "Patel",
    "Lee",
  ];
  const ranges: Record<Currency, [number, number]> = {
    INR: [600000, 5400000],
    USD: [35000, 185000],
    GBP: [28000, 132000],
    EUR: [30000, 150000],
    JPY: [3500000, 12500000],
    KWD: [10000, 55000],
  };
  return Array.from({ length: 10000 }, (_, i) => {
    const slot = i % 100,
      country =
        COUNTRY_OPTIONS[
          slot < 45
            ? 0
            : slot < 70
              ? 1
              : slot < 80
                ? 2
                : slot < 90
                  ? 3
                  : slot < 98
                    ? 4
                    : 5
        ];
    const department = i < 3 ? DEPARTMENTS[6] : DEPARTMENTS[random() % 6],
      role = department.roles[random() % department.roles.length];
    const currency = i % 13 === 0 ? "USD" : country.currency;
    const [base, spread] = ranges[currency];
    const major =
      base +
      Math.floor((((random() % 1000) + (random() % 1000)) * spread) / 2000);
    const precision = CURRENCIES[currency],
      scale = 10n ** BigInt(precision);
    const fractional = precision ? BigInt(random() % Number(scale)) : 0n;
    return {
      id: i + 1,
      employeeNumber: "ACME-" + String(i + 1).padStart(5, "0"),
      name:
        given[random() % given.length] + " " + family[random() % family.length],
      country: country.code,
      department: department.id,
      role: role[0],
      currency,
      period: "annual" as const,
      salaryMinor:
        i % 40 === 0
          ? BigInt(base) * scale
          : BigInt(major) * scale + fractional,
      version: 1,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedBy: "Synthetic seed (" + SEED_VERSION + ")",
    };
  });
}
