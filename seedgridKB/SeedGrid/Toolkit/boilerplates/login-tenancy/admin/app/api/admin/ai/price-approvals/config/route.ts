import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET() {
  const response = await fetchWithAdminSession("/admin/ai/price-approvals/config", {
    method: "GET",
  });
  return passthroughResponse(response);
}

export async function PUT(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/ai/price-approvals/config", {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}
