import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { EntryRequestResponse } from "@/lib/self-enter";

export async function GET() {
  try {
    const requests = await apiFetchSecurity<EntryRequestResponse[]>(
      SecurityPaths.selfEnter.requestsToApprove,
    );
    return NextResponse.json(requests);
  } catch (error) {
    return problemResponse(error);
  }
}
