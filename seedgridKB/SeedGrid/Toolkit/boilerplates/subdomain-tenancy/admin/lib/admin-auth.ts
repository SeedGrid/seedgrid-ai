export const ADMIN_TOKEN_COOKIE = "sg_subdomain_admin_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "sg_subdomain_admin_refresh_token";
export const ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE =
  "sg_subdomain_admin_password_change_required";

/**
 * Lado que o admin-web declara no login (campo `scope` da API). Quem decide se o usuario pode e a
 * API, pelo vinculo dele com a empresa-plataforma; aqui so declaramos a intencao para que a sessao
 * nasca escopada na plataforma quando o usuario tambem for membro de empresas-cliente.
 */
export const PLATFORM_SCOPE = "platform";

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
 * O webadmin so aceita usuarios de PLATAFORMA. Bloqueia quando o token traz
 * `audience` diferente de "platform". Tokens legados (sem o claim) passam.
 */
export function isPlatformAudienceAllowed(token: string): boolean {
  const audience = readTokenAudience(token);
  return audience === null || audience === PLATFORM_SCOPE;
}
