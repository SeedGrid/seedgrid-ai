import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

/** Contadores de uso declarados pelo produto: GET /admin/billing/meters do billing. */
export async function GET() {
  const response = await fetchWithAdminSession("/admin/billing/meters", { method: "GET" });
  return passthroughResponse(response);
}
