import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type RouteContext = { params: Promise<{ requestId: string }> };

export async function POST(_: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const result = await apiFetchSecurity<{ message: string }>(
      SecurityPaths.selfEnter.reject(requestId),
      { method: "POST" },
    );
    return NextResponse.json(result);
  } catch (error) {
    return problemResponse(error);
  }
}
