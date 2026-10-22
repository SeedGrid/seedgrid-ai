import { NextRequest, NextResponse } from "next/server";

import type { AdminLoginResponse } from "@/lib/admin-auth";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { SocialPaths } from "@/lib/social-paths";
import { sessionResponseFor } from "@/lib/social-session";

// POST /api/auth/social/email/confirm {pendingToken, code}: o usuario digita o codigo de 6 digitos que o backend
// enviou ao e-mail informado (o pendingToken fica no estado da pagina). O backend responde `SocialLoginResponseDTO`:
// AUTHENTICATED + `auth` (mesmo AuthResponse do login por senha: o BFF grava a sessao e a pagina entra direto),
// ou REJECTED com `code` (200). Rota publica.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { pendingToken?: unknown; code?: unknown } | null;
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SocialPaths.emailConfirm}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken: body?.pendingToken ?? null, code: body?.code ?? null }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => null)) as
    | { status?: string; code?: string | null; auth?: AdminLoginResponse | null }
    | null;
  if (!data) {
    return NextResponse.json({ message: "Resposta invalida do servidor de autenticacao." }, { status: 502 });
  }
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  if (data.status === "AUTHENTICATED" && data.auth) {
    return sessionResponseFor(data.auth);
  }
  // REJECTED e demais: sem token algum; a pagina interpreta o `status`/`code`.
  return NextResponse.json({ status: data.status ?? "UNKNOWN", code: data.code ?? null }, { status: 200 });
}
