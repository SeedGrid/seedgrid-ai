import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/admin/ai/models/${id}/prices`, {
    method: "GET",
  });
  return passthroughResponse(response);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/ai/models/${id}/prices`, {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
