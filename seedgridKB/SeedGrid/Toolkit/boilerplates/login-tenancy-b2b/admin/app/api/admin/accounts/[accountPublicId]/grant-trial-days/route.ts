import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{
    accountPublicId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { accountPublicId } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(
    `/admin/accounts/${encodeURIComponent(accountPublicId)}/grant-trial-days`,
    {
      method: "POST",
      body,
    },
  );
  return passthroughResponse(response);
}
