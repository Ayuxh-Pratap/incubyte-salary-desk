import "server-only";
import { SalaryError } from "../domain/salary-update";
import { ZodError } from "zod";
import { session } from "./auth";
import { randomUUID } from "node:crypto";
import { assertOrigin, trustedAppOrigins } from "./security";
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
      let origins: string[];
      try {
        origins = trustedAppOrigins();
      } catch {
        throw new HttpError(503, "Application origin is not configured.");
      }
      try {
        assertOrigin(request.headers.get("origin"), origins);
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
    const reference = status === 503 ? randomUUID() : undefined;
    if (reference)
      console.error("[salary-desk] request failed", {
        reference,
        method: request.method,
        path: new URL(request.url).pathname,
        type: error instanceof Error ? error.name : "unknown",
        code:
          typeof error === "object" &&
          error &&
          "code" in error &&
          typeof error.code === "string" &&
          /^[A-Z0-9]{5}$/.test(error.code)
            ? error.code
            : undefined,
      });
    return Response.json(
      {
        ...(reference ? { reference } : {}),
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
