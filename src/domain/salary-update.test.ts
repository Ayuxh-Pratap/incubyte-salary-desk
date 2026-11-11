import { it, expect, vi } from "vitest";
import { saveSalary, type SalaryRepository } from "./salary-update";
import type { Employee } from "./employee";
const employee: Employee = {
  id: 1,
  employeeNumber: "ACME-00001",
  name: "Fictional Person",
  country: "IN",
  countryName: "India",
  department: "engineering",
  departmentName: "Engineering",
  role: "engineer",
  roleName: "Software Engineer",
  currency: "INR",
  period: "annual",
  salaryMinor: "120000000",
  version: 3,
  updatedAt: "2026-01-01T00:00:00.000Z",
  updatedBy: "Synthetic seed",
};
const request = {
  amount: "1300000.01",
  currency: "INR",
  period: "annual",
  version: 3,
};
function repository(): SalaryRepository {
  return {
    find: vi.fn(async () => employee),
    compareAndSwap: vi.fn(async (_id, version, minor) => ({
      ...employee,
      salaryMinor: minor.toString(),
      version: version + 1,
    })),
  };
}
it("persists exact minor units only with the expected version", async () => {
  const repo = repository();
  const result = await saveSalary(repo, 1, request);
  expect(repo.compareAndSwap).toHaveBeenCalledWith(1, 3, 130000001n);
  expect(result.salaryMinor).toBe("130000001");
  expect(result.version).toBe(4);
});
it("rejects invalid precision, non-positive amounts and forged units before any write", async () => {
  for (const input of [
    { ...request, amount: "0" },
    { ...request, amount: "12.345" },
    { ...request, currency: "USD" },
    { ...request, period: "monthly" },
    { ...request, version: 0 },
    { ...request, unexpected: "field" },
  ]) {
    const repo = repository();
    await expect(saveSalary(repo, 1, input)).rejects.toThrow();
    expect(repo.compareAndSwap).not.toHaveBeenCalled();
  }
});
it("rejects a stale read and an atomic race without overwriting", async () => {
  const stale = repository();
  await expect(
    saveSalary(stale, 1, { ...request, version: 2 }),
  ).rejects.toMatchObject({ code: "conflict", current: employee });
  expect(stale.compareAndSwap).not.toHaveBeenCalled();
  const race = repository();
  race.compareAndSwap = vi.fn(async () => null);
  await expect(saveSalary(race, 1, request)).rejects.toMatchObject({
    code: "conflict",
  });
});
it("propagates persistence failure and distinguishes a missing employee", async () => {
  const repo = repository();
  repo.compareAndSwap = vi.fn(async () => {
    throw new Error("connection lost");
  });
  await expect(saveSalary(repo, 1, request)).rejects.toThrow("connection lost");
  repo.find = vi.fn(async () => null);
  await expect(saveSalary(repo, 1, request)).rejects.toMatchObject({
    code: "not-found",
  });
});
