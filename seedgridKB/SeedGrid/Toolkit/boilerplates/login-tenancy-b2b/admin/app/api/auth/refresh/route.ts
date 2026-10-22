import { NextResponse } from "next/server";

import { isApiConnectionError, refreshAdminSessionOnce } from "@/lib/seedgrid-app-api-server";

// Renova a sessao a partir do cookie de refresh: rotaciona o refresh token no backend e regrava os
// cookies (access + refresh). Quem chama e' o `query()` (`lib/query.ts`) ao receber 401 de uma
// consulta QUERY — o `proxy.ts` nao consegue renovar nem gravar cookie. A deduplicacao de
// renovacoes concorrentes e' a do `refreshAdminSessionOnce`.
//
//   204  sessao renovada
//   401  sem refresh token ou refresh recusado (cookies limpos pelo BFF) -> o front vai ao login
//   503  API fora do ar (cookies mantidos; pode tentar de novo)
export async function POST() {
  try {
    if (await refreshAdminSessionOnce()) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ message: "Sessao invalida" }, { status: 401 });
  } catch (error) {
    if (isApiConnectionError(error)) {
      return NextResponse.json({ message: "API administrativa indisponivel" }, { status: 503 });
    }
    throw error;
  }
}
