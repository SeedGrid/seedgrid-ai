import { NextResponse } from "next/server";

import { apiFetchServer, upstreamProblemResponse } from "@/lib/seedgrid-app-api-server";

type AuditLogUserRef = { userName: string | null };

export async function GET() {
  try {
    const users = await apiFetchServer<AuditLogUserRef[]>("/audit-logs/users");
    const names = users
      .map((item) => item.userName)
      .filter((value): value is string => Boolean(value));
    return NextResponse.json(names);
  } catch (error) {
    return upstreamProblemResponse(error);
  }
}
