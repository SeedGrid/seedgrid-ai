import { NextRequest, NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { clearAdminAuthCookies, fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetchWithAdminSession(SecurityPaths.users.changePassword, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  await clearAdminAuthCookies();
  return NextResponse.json({ status: "OK" });
}
