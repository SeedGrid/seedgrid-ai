import { NextRequest, NextResponse } from "next/server";

import { fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

// Autoatendimento do proprio usuario admin: ver/editar os proprios dados (/me/profile).
// Passthrough do status/corpo para preservar o problem+json de erro do report-api.
export async function GET() {
  const response = await fetchWithAdminSession("/me/profile");
  return passthrough(response);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const response = await fetchWithAdminSession("/me/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return passthrough(response);
}

async function passthrough(response: Response) {
  const payload = await response.text();
  if (!response.ok) {
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  }
  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
