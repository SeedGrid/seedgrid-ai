import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  isAdminLoginSuccess,
  type AdminLoginResponse,
} from "@/lib/admin-auth";
import { isCompanyDisabledResponse } from "@/lib/api-error";
import { applyAdminSessionCookies } from "@/lib/admin-session-cookies";
import { ADMIN_CURRENT_COMPANY_COOKIE } from "@/lib/company-access";
import { buildSessionResponseBody } from "@/lib/company-selection";
import { SecurityPaths } from "@/lib/security-paths";
import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

const SESSION_COOKIES = [
  ADMIN_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_CURRENT_COMPANY_COOKIE,
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
];

async function snapshotSessionCookies(): Promise<Record<string, string>> {
  const store = await cookies();
  const out: Record<string, string> = {};
  for (const name of SESSION_COOKIES) {
    const value = store.get(name)?.value;
    if (value) out[name] = value;
  }
  return out;
}

// `fetchWithAdminSession` trata 403 COMPANY_DISABLED como "a empresa DA SESSAO foi desligada" e
// limpa a sessao. Aqui o 403 e' sobre a empresa ESCOLHIDA (o alvo): a sessao continua valida e o
// usuario so' escolheu errado (lista velha). Devolve os cookies que a limpeza levou.
async function restoreSessionCookies(snapshot: Record<string, string>) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  for (const [name, value] of Object.entries(snapshot)) {
    if (!store.get(name)?.value) {
      store.set(name, value, { httpOnly: true, path: "/", sameSite: "lax", secure });
    }
  }
}

// POST /me/select-company { companyPublicId }: troca a empresa corrente e re-emite o par de tokens
// escopado nela. O BFF regrava os cookies (token, refresh e a empresa corrente com o estado de
// acesso, e apaga o "escolha pendente" do login); o navegador nunca ve o token. A resposta traz
// `changePasswordRequired` para o login saber se ainda precisa trocar a senha.
export async function POST(request: Request) {
  const body = await request.text();
  const before = await snapshotSessionCookies();
  const response = await fetchWithAdminSession(SecurityPaths.me.selectCompany, {
    method: "POST",
    body: body || "{}",
  });
  if (!response.ok) {
    if (await isCompanyDisabledResponse(response)) {
      await restoreSessionCookies(before);
    }
    return passthroughResponse(response);
  }
  const data = (await response.json().catch(() => null)) as AdminLoginResponse | null;
  if (!data || !isAdminLoginSuccess(data)) {
    return NextResponse.json(
      { status: 502, title: "Bad Gateway", detail: "Resposta invalida ao trocar de empresa." },
      { status: 502, headers: { "Content-Type": "application/problem+json" } },
    );
  }
  await applyAdminSessionCookies(data);
  return NextResponse.json(buildSessionResponseBody(data));
}
