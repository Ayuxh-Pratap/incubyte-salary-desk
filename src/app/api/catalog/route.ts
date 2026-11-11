import { database } from "@/server/db/connection";
import { catalog } from "@/server/employees/queries";
import { api } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(request, async () => catalog((await database()).db));
}
