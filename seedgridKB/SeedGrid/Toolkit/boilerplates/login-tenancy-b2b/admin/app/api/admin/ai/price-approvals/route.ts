import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET() {
  const response = await fetchWithAdminSession("/admin/ai/price-approvals", {
    method: "GET",
  });
  return passthroughResponse(response);
}
