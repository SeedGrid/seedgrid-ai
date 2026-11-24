import { backendUnavailableResponse } from "@/lib/backend-unavailable";
import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  let response: Response;
  try {
    response = await backendFetch(
      `${apiBaseUrl}${SecurityPaths.auth.resetPassword}?token=${encodeURIComponent(token)}`,
      { method: "GET", headers: { Accept: "application/json" } },
    );
  } catch (error) {
    return backendUnavailableResponse(error);
  }

  return passthroughResponse(response);
}
