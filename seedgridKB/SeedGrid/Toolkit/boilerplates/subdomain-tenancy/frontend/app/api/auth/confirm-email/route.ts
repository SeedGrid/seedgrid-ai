import { backendFetch } from "@/lib/backend-fetch";
import { NextRequest, NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { tenancyDomain } from "@/lib/tenant-host";

// Proxy para a confirmacao de e-mail (publica) da API. O link dos e-mails de
// boas-vindas/confirmacao do ext-security aponta para o frontend (/auth/welcome,
// /auth/confirm-email); a pagina chama esta rota, que repassa para
// GET {api}/public/auth/confirm-email?token=...
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Token nao informado." }, { status: 400 });
  }

  // O link do e-mail do administrador da plataforma cai no dominio raiz (sem tenant), que este cliente nao atende:
  // o proxy.ts normalmente o leva ao admin; se chegar aqui mesmo assim, diga o que fazer em vez de um 503 enganoso.
  const host = request.headers.get("host")?.toLowerCase().replace(/:\d+$/, "");
  if (host === tenancyDomain()) {
    return NextResponse.json(
      {
        message:
          "Este link deve ser aberto no endereco do administrador da plataforma (admin.<dominio>), nao no dominio principal.",
      },
      { status: 409 },
    );
  }

  let response: Response;
  try {
    response = await backendFetch(
      `${apiBaseUrl}${SecurityPaths.auth.confirmEmail}?token=${encodeURIComponent(token)}`,
      { method: "GET" },
    );
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => null)) as
    | { message?: string; detail?: string; title?: string }
    | null;

  return NextResponse.json(data ?? {}, { status: response.status });
}
