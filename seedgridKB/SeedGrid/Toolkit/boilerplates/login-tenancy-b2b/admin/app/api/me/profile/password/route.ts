import { NextRequest, NextResponse } from "next/server";

import { fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

// Troca da propria senha (/me/profile/password). Diferente de /api/auth/change-password,
// NAO desloga: o usuario continua na sessao atual. Passthrough do erro (problem+json).
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const response = await fetchWithAdminSession("/me/profile/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

  return NextResponse.json({ status: "OK" });
}
