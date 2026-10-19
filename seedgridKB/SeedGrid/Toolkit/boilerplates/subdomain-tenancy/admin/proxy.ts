import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "./lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    Boolean(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value) ||
    Boolean(request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value);
  const mustChangePassword = Boolean(
    request.cookies.get(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE)?.value,
  );
  const isLoginPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");
  // /api/self-enter entra aqui tambem: e o proxy que a pagina publica /auth/self-enter usa
  // (GET do convite + POST de conclusao), sem sessao — senao cai no redirect pro /login abaixo
  // e o POST vira 405 (login so aceita GET como pagina).
  const isAuthApi = pathname.startsWith("/api/auth") || pathname.startsWith("/api/self-enter");
  // Rotas publicas de confirmacao (links de e-mail do ext-security): /auth/welcome,
  // /auth/confirm-email. Devem abrir sem sessao, pois o usuario chega delas pelo e-mail.
  const isPublicAuthPage = pathname.startsWith("/auth/");
  // Landings publicas do checkout do Stripe (success_url/cancel_url): /assinatura/sucesso e
  // /assinatura/cancelada. Quem assina e usuario de empresa (vindo do client), nao admin —
  // o Stripe redireciona o browser para ca sem sessao admin, entao devem abrir sem login.
  const isPublicCheckoutPage = pathname.startsWith("/assinatura/");

  if (isStatic || isAuthApi || isPublicAuthPage || isPublicCheckoutPage) {
    return NextResponse.next();
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

export const config = {
  matcher: ["/((?!api/admin).*)"],
};
