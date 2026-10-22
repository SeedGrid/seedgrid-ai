import { cookies } from "next/headers";

import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  type AdminLoginResponse,
} from "./admin-auth";
import {
  ADMIN_CURRENT_COMPANY_COOKIE,
  parseCurrentCompany,
  serializeCurrentCompany,
} from "./company-access";

export async function applyAdminSessionCookies(data: Extract<AdminLoginResponse, { status: "OK" }>) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ADMIN_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
  });

  if ("refreshToken" in data && typeof data.refreshToken === "string") {
    cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, data.refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  // Empresa corrente da sessao (`AuthResponse.currentCompany`, T5.6): vira cookie para o
  // `/api/auth/me` devolver o estado de acesso a casca. Resposta sem o campo (backend antigo)
  // nao mexe no cookie; quem o apaga e' o `clearAdminAuthCookies` (logout, sessao morta).
  const currentCompany = parseCurrentCompany((data as Record<string, unknown>).currentCompany);
  if (currentCompany) {
    cookieStore.set(ADMIN_CURRENT_COMPANY_COOKIE, serializeCurrentCompany(currentCompany), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  // Escolha de empresa pendente: o proxy prende o usuario em /auth/select-company ate o
  // `select-company` (que devolve `companySelectionRequired=false`) apagar este cookie.
  if (data.companySelectionRequired === true) {
    cookieStore.set(ADMIN_COMPANY_SELECTION_PENDING_COOKIE, "1", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
    });
  } else {
    cookieStore.delete(ADMIN_COMPANY_SELECTION_PENDING_COOKIE);
  }

  if (data.changePasswordRequired) {
    cookieStore.set(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE, "1", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
    });
  } else {
    cookieStore.delete(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE);
  }
}
