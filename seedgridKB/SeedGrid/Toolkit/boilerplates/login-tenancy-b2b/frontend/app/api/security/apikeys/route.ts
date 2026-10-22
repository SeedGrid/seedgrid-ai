import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type {
  ApiKeyCreateResponse,
  ApiKeyListItem,
  PaginatedResult,
} from "@/lib/seedgrid-app-api";

// Lista paginada das API keys do usuario logado (ext seedgrid-apikeys: GET /apikeys?page=&size=).
// O backend ja' devolve so' as chaves da empresa corrente do token: quem tem acesso a mais de uma
// empresa ve, aqui, apenas as chaves da empresa em que esta logado.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = params.get("page") ?? "0";
    const size = params.get("size") ?? "8";
    const result = await apiFetchSecurity<PaginatedResult<ApiKeyListItem>>(
      `/apikeys?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    );
    return NextResponse.json(result);
  } catch (error) {
    return problemResponse(error);
  }
}

// Cria uma API key para um perfil de integracao (POST /apikeys/role/{roleName}). A resposta traz o
// segredo em claro (`apiKey`) uma unica vez. A chave fica presa a empresa corrente de quem cria.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      roleName: string;
      name: string;
      expiresDays?: number | null;
    };
    const created = await apiFetchSecurity<ApiKeyCreateResponse>(
      `/apikeys/role/${encodeURIComponent(body.roleName)}`,
      {
        method: "POST",
        body: JSON.stringify({ name: body.name, expiresDays: body.expiresDays ?? null }),
      },
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return problemResponse(error);
  }
}
