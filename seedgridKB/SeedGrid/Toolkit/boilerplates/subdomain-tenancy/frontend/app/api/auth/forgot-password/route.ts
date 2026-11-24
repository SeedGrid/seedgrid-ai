import { backendUnavailableResponse } from "@/lib/backend-unavailable";
import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function POST(request: Request) {
  const body = await request.text();

  let response: Response;
  try {
    response = await backendFetch(`${apiBaseUrl}${SecurityPaths.auth.forgotPassword}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (error) {
    return backendUnavailableResponse(error);
  }

  return passthroughResponse(response);
}
