import { redirect } from "next/navigation";
import { session } from "@/server/auth";
import { Shell } from "@/components/shell";
export default async function Workspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await session();
  if (!current.evaluator) redirect("/login");
  return <Shell>{children}</Shell>;
}
