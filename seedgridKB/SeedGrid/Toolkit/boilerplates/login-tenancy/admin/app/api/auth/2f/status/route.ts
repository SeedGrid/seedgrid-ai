import { SecurityPaths } from "@/lib/security-paths";

import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET() {
  const response = await fetchWithAdminSession(SecurityPaths.twoFactor.status, { method: "GET" });
  return passthroughResponse(response);
}
