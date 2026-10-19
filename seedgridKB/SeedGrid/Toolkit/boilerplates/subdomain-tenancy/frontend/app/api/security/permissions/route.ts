import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { toPermissionOption, type SecurityPermission } from "@/lib/security-admin";

export async function GET(request: Request) {
  try {
    // Catalogo do adminweb: por padrao as permissoes 'platform' e as sem audience; ?audience=client
    // serve as telas que precisam do catalogo do CLIENTE (ex.: permissoes liberadas por um plano).
    const audience = new URL(request.url).searchParams.get("audience") || "client";
    const permissions = await apiFetchSecurity<SecurityPermission[]>(
      `/permissions?audience=${encodeURIComponent(audience)}`,
    );
    return NextResponse.json(permissions.map(toPermissionOption));
  } catch (error) {
    return problemResponse(error);
  }
}
