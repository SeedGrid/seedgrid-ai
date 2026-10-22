import { NextResponse } from "next/server";

import { apiFetchServer, upstreamProblemResponse } from "@/lib/seedgrid-app-api-server";

type AuditLogEntityRef = { entity: string | null };

export async function GET() {
  try {
    const entities = await apiFetchServer<AuditLogEntityRef[]>(
      "/audit-logs/entities",
    );
    const names = entities
      .map((item) => item.entity)
      .filter((value): value is string => Boolean(value));
    return NextResponse.json(names);
  } catch (error) {
    return upstreamProblemResponse(error);
  }
}
