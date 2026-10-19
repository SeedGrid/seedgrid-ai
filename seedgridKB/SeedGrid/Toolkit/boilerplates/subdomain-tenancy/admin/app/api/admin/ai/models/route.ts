import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  fetchWithAdminSession,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { AiModelEntry } from "@/lib/seedgrid-app-api";

export async function GET() {
  try {
    const result = await apiFetchServer<{ models: AiModelEntry[] }>(
      "/admin/ai/models",
    );
    return NextResponse.json(result);
  } catch (error) {
    if (
      isApiConnectionError(error) ||
      (error instanceof ApiRequestError &&
        isInvalidAdminSessionResponse(error.status, error.body))
    ) {
      return NextResponse.json({ models: [] });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/ai/models", {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
