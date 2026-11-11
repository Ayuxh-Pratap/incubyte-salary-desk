import { randomUUID } from "node:crypto";
import { z } from "zod";
import { session } from "@/server/auth";
import {
  assertOrigin,
  validCredential,
  trustedAppOrigins,
} from "@/server/security";
export const runtime = "nodejs";
function origin(request: Request) {
  assertOrigin(request.headers.get("origin"), trustedAppOrigins());
}
export async function POST(request: Request) {
  try {
    origin(request);
    const body = z
      .object({ password: z.string().min(1).max(256) })
      .parse(await request.json());
    const expected = process.env.EVALUATOR_PASSWORD;
    if (!expected || expected.length < 16)
      return Response.json(
        { error: "Evaluator access is not configured." },
        { status: 503 },
      );
    if (!validCredential(body.password, expected))
      return Response.json(
        { error: "That access code is not correct." },
        { status: 401 },
      );
    const current = await session();
    current.evaluator = true;
    current.cacheScope = randomUUID();
    await current.save();
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "Unable to start a session. Check the access code and application configuration.",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    origin(request);
    (await session()).destroy();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to end session." }, { status: 403 });
  }
}
