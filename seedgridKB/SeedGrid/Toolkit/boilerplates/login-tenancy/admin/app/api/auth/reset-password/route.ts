import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  let response: Response;
  try {
    response = await fetch(
      `${apiBaseUrl}${SecurityPaths.auth.resetPassword}?token=${encodeURIComponent(token)}`,
      { method: "GET", headers: { Accept: "application/json" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  return passthroughResponse(response);
}
