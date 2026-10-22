import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { EntryRequestResponse } from "@/lib/self-enter";

export async function GET() {
  try {
    const requests = await apiFetchSecurity<EntryRequestResponse[]>(
      "/self-enter/requests/to-approve",
    );
    return NextResponse.json(requests);
  } catch (error) {
    return problemResponse(error);
  }
}
