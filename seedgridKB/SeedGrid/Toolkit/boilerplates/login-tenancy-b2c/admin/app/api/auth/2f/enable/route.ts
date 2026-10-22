import { SecurityPaths } from "@/lib/security-paths";

import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession(SecurityPaths.twoFactor.enable, {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
