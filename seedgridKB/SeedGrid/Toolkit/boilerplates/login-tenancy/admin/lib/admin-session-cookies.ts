import { cookies } from "next/headers";

import {
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  type AdminLoginResponse,
} from "./admin-auth";

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
