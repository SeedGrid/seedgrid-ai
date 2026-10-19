// Nomes DIFERENTES dos do admin (`sg_admin_*`), e isto NAO e' cosmetico.
//
// Cookie e' escopado por dominio, NAO por porta: front em localhost:3001 e admin em localhost:3000
// compartilham o mesmo jar. Com o mesmo nome, logar num apaga a sessao do outro — silenciosamente.
//
// Foi exatamente o que aconteceu em 2026-09-09: logar no front (usuario de empresa cliente,
// `audience=client`) sobrescreveu o `sg_admin_token` do admin. O admin seguiu "logado", mas com um
// token de cliente; ao criar um plano, o backend filtrou `PLAN_CREATE` (audience=platform) e
// devolveu **403 Acesso negado**. Nada apareceu no log do backend, porque 403 e' decisao de
// autorizacao, nao erro — e o sintoma parecia bug de permissao ou de refresh token.
//
// Em producao os dois vivem em dominios distintos e o problema nao existe; em dev, com os dois em
// localhost, existe sempre. Nome proprio resolve nos dois cenarios.
export const ADMIN_TOKEN_COOKIE = "sg_subdomain_client_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "sg_subdomain_client_refresh_token";
export const ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE =
  "sg_subdomain_client_password_change_required";

/**
 * DIVERGENCIA DELIBERADA do report-admin (unico ponto deste arquivo que nao e' copia literal).
 *
 * O admin-web declara `scope: "platform"` no login e recusa token com `audience` diferente disso
 * (`PLATFORM_SCOPE` + `isPlatformAudienceAllowed`). Este app e' o do CLIENTE: ele entra pelo lado
 * da EMPRESA, nao da plataforma. O que esta' provado em producao para este lado e' o
 * `seedgrid-report-client` (`src-tauri/src/comandos/auth.rs`, `sign_in`), que manda
 * `{login, password}` e NAO manda `scope` nenhum — a API resolve a company pelo vinculo do usuario.
 *
 * Por isso aqui nao ha' `PLATFORM_SCOPE` nem gate de audience: copiar o do admin faria todo
 * usuario de empresa tomar 403 no proprio app. `readTokenAudience` fica, porque e' util para
 * diagnostico (e para quem quiser, no produto derivado, barrar token de plataforma neste app).
 */
export const CLIENT_SCOPE_IS_IMPLICIT = true;

export type AdminLoginResponse =
  | {
      status: "OK";
      token: string;
      tokenType?: string;
      refreshToken?: string;
      publicId?: string;
      changePasswordRequired?: boolean;
      twoFactorEnabled?: boolean;
    }
  | {
      status: "2F_REQUIRED";
      tempToken: string;
      method?: string;
    }
  | {
      status: string;
      [key: string]: unknown;
    };

export type AdminResend2FAResponse = {
  status: string;
  method?: string;
  message?: string;
  tempToken?: string;
  metadata?: Record<string, unknown>;
  error?: string;
};

export function isAdminLoginSuccess(
  payload: AdminLoginResponse,
): payload is Extract<AdminLoginResponse, { status: "OK" }> {
  return (
    payload.status === "OK" &&
    "token" in payload &&
    typeof payload.token === "string"
  );
}

/**
 * Le o claim `audience` do payload de um JWT (sem validar assinatura).
 * Retorna `null` quando o token nao pode ser decodificado ou o claim nao existe.
 */
export function readTokenAudience(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as { audience?: unknown };
    return typeof payload.audience === "string" ? payload.audience : null;
  } catch {
    return null;
  }
}

/**
 * O app do cliente NAO filtra por audience (ver a nota em `CLIENT_SCOPE_IS_IMPLICIT`): quem entra
 * aqui e' usuario de empresa, e a API ja' resolve o escopo pelo vinculo dele. A funcao existe para
 * o caso oposto — barrar, num produto derivado, um token emitido para a plataforma.
 */
export function isPlatformAudience(token: string): boolean {
  return readTokenAudience(token) === "platform";
}
