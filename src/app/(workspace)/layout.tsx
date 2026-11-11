import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { session } from "@/server/auth";
import { RemoteProvider } from "@/components/remote-provider";
import { Shell } from "@/components/shell";
export default async function Workspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await session();
  if (current.evaluator !== true) redirect("/login");
  return (
    <RemoteProvider scope={current.cacheScope ?? "legacy-evaluator-session"}>
      <Shell initialCollapsed={(await cookies()).get("salary-desk-sidebar")?.value==="true"}>{children}</Shell>
    </RemoteProvider>
  );
}
