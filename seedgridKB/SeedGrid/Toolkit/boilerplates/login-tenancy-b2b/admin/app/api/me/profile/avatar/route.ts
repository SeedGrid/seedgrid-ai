import { NextRequest, NextResponse } from "next/server";

import { fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

// Avatar do proprio usuario (/me/profile/avatar): envia (POST) ou remove (DELETE).
// Ambos devolvem o perfil atualizado; passthrough do status/corpo.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await fetchWithAdminSession("/me/profile/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return passthrough(response);
}

export async function DELETE() {
  const response = await fetchWithAdminSession("/me/profile/avatar", {
    method: "DELETE",
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
