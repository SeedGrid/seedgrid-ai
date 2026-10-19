import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(
    `/admin/ai/price-approvals/${id}/approve`,
    { method: "POST" },
  );
  return passthroughResponse(response);
}
