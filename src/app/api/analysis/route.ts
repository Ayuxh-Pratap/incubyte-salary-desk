import { analysisFilters } from "@/domain/analysis";
import { database } from "@/server/db/connection";
import { salaryAnalysis } from "@/server/analysis/queries";
import { api, HttpError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(request, async () => {
    let filters;
    try {
      filters = analysisFilters(
        Object.fromEntries(new URL(request.url).searchParams),
      );
    } catch {
      throw new HttpError(
        400,
        "Select one currency and valid filters for analysis.",
      );
    }
    const { db } = await database();
    return salaryAnalysis(db, filters);
  });
}
