import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/ai/models/${id}`, {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/admin/ai/models/${id}`, {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
