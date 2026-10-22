import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function POST() {
  const response = await fetchWithAdminSession("/admin/ai/price-approvals/check", {
    method: "POST",
  });
  return passthroughResponse(response);
}
