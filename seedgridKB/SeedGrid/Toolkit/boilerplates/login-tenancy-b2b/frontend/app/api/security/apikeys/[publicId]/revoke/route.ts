import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ApiKeyRevokeResponse } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

// Revoga uma API key por publicId (POST /apikeys/{publicId}/revoke).
export async function POST(_request: Request, context: RouteContext) {
  const { publicId } = await context.params;
  try {
    const result = await apiFetchSecurity<ApiKeyRevokeResponse>(
      `/apikeys/${encodeURIComponent(publicId)}/revoke`,
      { method: "POST" },
    );
    return NextResponse.json(result);
  } catch (error) {
    return problemResponse(error);
  }
}
