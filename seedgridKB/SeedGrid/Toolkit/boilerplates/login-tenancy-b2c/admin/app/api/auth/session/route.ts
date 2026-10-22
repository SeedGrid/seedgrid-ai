import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();

  return NextResponse.json({
    hasToken: Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value),
    hasRefreshToken: Boolean(cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value),
    mustChangePassword: Boolean(
      cookieStore.get(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE)?.value,
    ),
  });
}
