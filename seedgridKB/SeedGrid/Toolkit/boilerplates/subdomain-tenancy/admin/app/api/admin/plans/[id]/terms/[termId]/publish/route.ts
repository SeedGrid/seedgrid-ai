import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string; termId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { id, termId } = await context.params;
  const response = await fetchWithAdminSession(
    `/admin/plans/${id}/terms/${termId}/publish`,
    { method: "POST" },
  );
  return passthroughResponse(response);
}
