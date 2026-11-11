import { z } from "zod";
import { assertCompatible, parseSalary } from "./money";
import type { Employee } from "./employee";
export class SalaryError extends Error {
  constructor(
    public code: "invalid" | "conflict" | "not-found",
    message: string,
    public current?: Employee,
  ) {
    super(message);
  }
}
export type SalaryMutation = Pick<
  Employee,
  "salaryMinor" | "version" | "updatedAt" | "updatedBy"
>;
export type SalaryRepository = {
  find: (id: number) => Promise<Employee | null>;
  compareAndSwap: (
    id: number,
    version: number,
    minor: bigint,
  ) => Promise<SalaryMutation | null>;
};
const updateSchema = z
  .object({
    amount: z.string().min(1).max(24),
    currency: z.string().length(3),
    period: z.literal("annual"),
    version: z.number().int().positive().max(2147483646),
  })
  .strict();
export async function saveSalary(
  repository: SalaryRepository,
  id: number,
  input: unknown,
): Promise<Employee> {
  const body = updateSchema.parse(input);
  const current = await repository.find(id);
  if (!current) throw new SalaryError("not-found", "Employee not found.");
  let minor: bigint;
  try {
    assertCompatible(current, body);
    minor = parseSalary(body.amount, current.currency);
  } catch (error) {
    throw new SalaryError(
      "invalid",
      error instanceof Error ? error.message : "Invalid salary.",
    );
  }
  if (current.version !== body.version)
    throw new SalaryError(
      "conflict",
      "This salary changed after you opened it. Review the latest value before saving.",
      current,
    );
  const changed = await repository.compareAndSwap(id, body.version, minor);
  if (!changed) {
    const latest = await repository.find(id);
    throw new SalaryError(
      "conflict",
      "Another update won the race. Your proposed amount has been preserved.",
      latest || undefined,
    );
  }
  return { ...current, ...changed };
}
