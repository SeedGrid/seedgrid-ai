import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/currency-exchange-rates/${id}`, {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}
