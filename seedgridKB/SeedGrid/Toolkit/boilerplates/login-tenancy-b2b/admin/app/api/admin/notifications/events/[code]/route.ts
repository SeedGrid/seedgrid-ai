import {
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";

type RouteContext = { params: Promise<{ code: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { code } = await context.params;
  const response = await fetchWithAdminSession(`/admin/notifications/events/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: await request.text(),
  });
  return passthroughResponse(response);
}
