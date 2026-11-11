import "server-only";
import { SalaryError } from "../domain/salary-update";
import { ZodError } from "zod";
import { session } from "./auth";
import { assertOrigin } from "./security";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}
export async function api(
  request: Request,
  work: () => Promise<unknown>,
  mutation = false,
): Promise<Response> {
  try {
    const current = await session();
    if (current.evaluator !== true)
      throw new HttpError(401, "Evaluator session required.");
    if (mutation) {
      const origin = process.env.APP_ORIGIN;
      if (!origin)
        throw new HttpError(503, "Application origin is not configured.");
      try {
        assertOrigin(request.headers.get("origin"), origin);
      } catch {
        throw new HttpError(403, "Request origin is not allowed.");
      }
    }
    const result = await work();
    return Response.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Salary-Desk-Environment":
          process.env.DATABASE_PURPOSE || "unconfigured",
      },
    });
  } catch (error) {
    if (error instanceof SalaryError)
      error = new HttpError(
        error.code === "conflict"
          ? 409
          : error.code === "not-found"
            ? 404
            : 400,
        error.message,
        error.current ? { current: error.current } : undefined,
      );
    const status =
      error instanceof HttpError
        ? error.status
        : error instanceof ZodError
          ? 400
          : 503;
    return Response.json(
      {
        error:
          error instanceof HttpError
            ? error.message
            : error instanceof ZodError
              ? error.issues.map((i) => i.message).join(" ")
              : "The request could not be completed. Please try again.",
        ...(error instanceof HttpError && error.details
          ? { details: error.details }
          : {}),
      },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
