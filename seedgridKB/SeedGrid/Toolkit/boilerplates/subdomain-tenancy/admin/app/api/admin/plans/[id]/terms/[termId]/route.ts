import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string; termId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id, termId } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(
    `/admin/plans/${id}/terms/${termId}`,
    { method: "PATCH", body },
  );
  return passthroughResponse(response);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id, termId } = await context.params;
  const response = await fetchWithAdminSession(
    `/admin/plans/${id}/terms/${termId}`,
    { method: "DELETE" },
  );
  return passthroughResponse(response);
}
