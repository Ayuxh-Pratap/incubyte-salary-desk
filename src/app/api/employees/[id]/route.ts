import { z } from "zod";
import { database } from "@/server/db/connection";
import { getEmployee } from "@/server/employees/queries";
import { salaryRepository } from "@/server/employees/salary-repository";
import { saveSalary } from "@/domain/salary-update";
import { api, HttpError } from "@/server/http";
export const runtime = "nodejs";
const idSchema = z.coerce.number().int().positive().max(2147483647);
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  return api(request, async () => {
    const id = idSchema.parse((await params).id);
    const employee = await getEmployee((await database()).db, id);
    if (!employee) throw new HttpError(404, "Employee not found.");
    return employee;
  });
}
export async function PATCH(request: Request, { params }: Context) {
  return api(
    request,
    async () => {
      const id = idSchema.parse((await params).id);
      let body;
      try {
        body = await request.json();
      } catch {
        throw new HttpError(400, "Expected a JSON salary update.");
      }
      const { db } = await database();
      return saveSalary(salaryRepository(db), id, body);
    },
    true,
  );
}
