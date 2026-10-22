import { NextResponse } from "next/server";

import { clearAdminAuthCookies } from "@/lib/seedgrid-app-api-server";

export async function POST() {
  await clearAdminAuthCookies();
  return NextResponse.json({ status: "OK" });
}
