export function GET() {
  return Response.json(
    { application: "Salary Desk", status: "running" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
