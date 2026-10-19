import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{
    accountPublicId: string;
  }>;
};

/** Unidades extras (aqui, requisicoes) no ciclo vigente da conta: POST /admin/accounts/{id}/grant-units do billing. */
export async function POST(request: Request, context: RouteContext) {
  const { accountPublicId } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(
    `/admin/accounts/${encodeURIComponent(accountPublicId)}/grant-units`,
    {
      method: "POST",
      body,
    },
  );
  return passthroughResponse(response);
}
