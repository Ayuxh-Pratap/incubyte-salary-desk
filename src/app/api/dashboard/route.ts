import { database } from "@/server/db/connection";
import { dashboardData } from "@/server/dashboard/queries";
import { analysisFilters } from "@/domain/analysis";
import { api, HttpError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(request, async () => {
    let currency: string;
    try {
      currency = analysisFilters({
        currency: new URL(request.url).searchParams.get("currency") ?? "INR",
      }).currency!;
    } catch {
      throw new HttpError(400, "Choose one supported pay currency.");
    }
    const { db } = await database();
    return dashboardData(db, currency);
  });
}
