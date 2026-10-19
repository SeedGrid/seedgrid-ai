import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { PlatformAccessLookup } from "@/lib/seedgrid-app-api";

/** O e-mail ja tem conta no produto? A tela de convite consulta antes de enviar o convite. */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? "";

  try {
    const lookup = await apiFetchSecurity<PlatformAccessLookup>(
      `/admin/platform-access?email=${encodeURIComponent(email)}`,
    );
    return NextResponse.json(lookup);
  } catch (error) {
    return problemResponse(error);
  }
}

/**
 * Concede acesso a plataforma a um usuario que JA existe (cria a membership na empresa-plataforma
 * com os perfis escolhidos). Perfil obrigatorio, mesmo enforcement do convite: sem perfil proprio
 * na plataforma o usuario entraria com os perfis da conta-cliente dele.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      rolePublicIds?: string[];
    };

    if (!Array.isArray(body.rolePublicIds) || body.rolePublicIds.length === 0) {
      return NextResponse.json(
        {
          title: "Perfil obrigatorio",
          status: 422,
          detail: "Escolha ao menos um perfil para conceder o acesso.",
        },
        { status: 422, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    const granted = await apiFetchSecurity<PlatformAccessLookup>(
      "/admin/platform-access",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      },
    );
    return NextResponse.json(granted);
  } catch (error) {
    return problemResponse(error);
  }
}
