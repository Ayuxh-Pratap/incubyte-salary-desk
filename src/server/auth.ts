import "server-only";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
export async function session() {
  const cookieStore = await cookies();
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32)
    throw new Error(
      "Configure a random session secret of at least 32 characters.",
    );
  return getIronSession<{ evaluator: boolean }>(cookieStore, {
    password,
    cookieName: "salary-desk-session",
    ttl: 8 * 60 * 60,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
  });
}
