import { NextResponse } from "next/server";

import { isAdminLoginSuccess, type AdminLoginResponse } from "@/lib/admin-auth";
import { buildSessionResponseBody } from "@/lib/company-selection";
import { applyAdminSessionCookies } from "@/lib/admin-session-cookies";

/**
 * Transforma o AuthResponse do backend (o MESMO do login por senha) em resposta do BFF: grava os cookies de
 * sessao e devolve ao navegador so' o que ele precisa (nunca o token). `2F_REQUIRED` devolve o `tempToken` para a
 * pagina de verificacao, igual ao `/api/auth/login`. Usado pelo `exchange` e pela confirmacao do e-mail social.
 */
export async function sessionResponseFor(data: AdminLoginResponse): Promise<NextResponse> {
  if (data.status === "2F_REQUIRED") {
    return NextResponse.json(data, { status: 200 });
  }
  if (!isAdminLoginSuccess(data)) {
    return NextResponse.json(
      { status: data.status, message: "Resposta de autenticacao nao suportada." },
      { status: 400 },
    );
  }

  await applyAdminSessionCookies(data);

  return NextResponse.json(buildSessionResponseBody(data));
}
