import { parseFilters } from "@/domain/filters";
import { database } from "@/server/db/connection";
import { listEmployees } from "@/server/employees/queries";
import { api, HttpError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(request, async () => {
    let filters;
    try {
      filters = parseFilters(
        Object.fromEntries(new URL(request.url).searchParams),
      );
    } catch {
      throw new HttpError(
        400,
        "Check the filters; salary sorting requires one currency.",
      );
    }
    const { db } = await database();
    return db.transaction((tx) => listEmployees(tx, filters), {
      isolationLevel: "repeatable read",
      accessMode: "read only",
    });
  });
}
