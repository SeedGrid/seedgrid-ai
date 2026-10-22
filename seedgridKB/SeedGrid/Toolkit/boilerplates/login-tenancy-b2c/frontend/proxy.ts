import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "./lib/admin-auth";
import { QUERY_PROXY_PREFIX } from "./lib/query-paths";
import { proxyQuery } from "./lib/query-proxy";
import { COMPANY_SELECT_PATH } from "./lib/company-selection";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Consultas com corpo (metodo QUERY, ADR 28). TEM de vir antes de tudo: o caminho pode conter "."
  // (cairia em `isStatic`) e nunca pode virar redirect para /login (e' um fetch; sem sessao, 401 JSON).
  if (pathname.startsWith(QUERY_PROXY_PREFIX)) {
    return proxyQuery(request);
  }
  const hasSession =
    Boolean(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value) ||
    Boolean(request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value);
  const mustChangePassword = Boolean(
    request.cookies.get(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE)?.value,
  );
  // Login que pediu a escolha da empresa (T7.2): o token ainda nao esta escopado, entao nada do app
  // abre ate o `select-company`. /auth/** (a propria tela) e /api/** passam antes deste ponto.
  const mustSelectCompany = Boolean(
    request.cookies.get(ADMIN_COMPANY_SELECTION_PENDING_COOKIE)?.value,
  );
  const isLoginPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");
  // /api/signup entra aqui junto com /api/auth: sao as rotas de BFF que a pagina publica
  // /auth/signup usa (cadastro, confirm-email, resend-email, email-exists, cnpj-status e a
  // consulta a Receita). Sem sessao — senao cai no redirect pro /login abaixo e o POST vira 405
  // (login so aceita GET como pagina). Mesmo motivo que o report-admin tinha para /api/self-enter.
  const isAuthApi =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/signup");
  // Rotas publicas de confirmacao (links de e-mail do ext-security e do signup): /auth/welcome,
  // /auth/confirm-email, /auth/signup, /auth/forgot-password. Abrem sem sessao, pois o usuario
  // chega nelas pelo e-mail ou pelo proprio login.
  const isPublicAuthPage = pathname.startsWith("/auth/");
  // Landings publicas do checkout do Stripe (success_url/cancel_url). O provedor redireciona o
  // browser para ca e o cookie pode nem viajar (navegacao top-level vinda de outro site), entao
  // precisam abrir sem sessao.
  //
  // ATENCAO: SO' essas duas. No report-admin a regra era `startsWith("/assinatura/")`, o que aqui
  // deixaria a propria tela "Minha assinatura" (`/assinatura`) publica — ela mostra plano, faturas
  // e consumo. `/assinatura` sem barra ja' nao casava com o prefixo, mas a intencao fica explicita.
  const isPublicCheckoutPage =
    pathname === "/assinatura/sucesso" || pathname === "/assinatura/cancelada";

  if (isStatic || isAuthApi || isPublicAuthPage || isPublicCheckoutPage) {
    return NextResponse.next();
  }

  if (hasSession && mustSelectCompany) {
    return NextResponse.redirect(new URL(COMPANY_SELECT_PATH, request.url));
  }

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (mustChangePassword && !isChangePasswordPage && !isAuthApi) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (!mustChangePassword && isChangePasswordPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(
      new URL(mustChangePassword ? "/change-password" : "/", request.url),
    );
  }

  return NextResponse.next();
}

// As rotas de BFF autenticadas ficam FORA do middleware (elas mesmas cuidam da sessao e do
// refresh, em `lib/seedgrid-app-api-server.ts`); passar por aqui so' as faria virar redirect 307
// para o /login no meio de um fetch, e o `.json()` do lado client estouraria SyntaxError.
// No report-admin o negado era `api/admin`; aqui sao os dois prefixos autenticados deste app.
// `/api/q/**` (consultas QUERY) NAO pode ser excluido aqui: o rewrite com o Authorization acontece
// neste proxy. Coberto por `proxy.test.ts`.
export const config = {
  matcher: ["/((?!api/security|api/me).*)"],
};
