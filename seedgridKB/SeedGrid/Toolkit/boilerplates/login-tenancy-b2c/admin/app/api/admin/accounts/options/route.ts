import { NextResponse } from "next/server";

import { apiFetchServer, upstreamProblemResponse } from "@/lib/seedgrid-app-api-server";
import type { AdminAccountOption } from "@/lib/seedgrid-app-api";

/** Lookup de contas pro combobox — nao exige ACCOUNT_READ (ver AdminAccountsResource). */
export async function GET() {
  try {
    const options = await apiFetchServer<AdminAccountOption[]>("/admin/accounts/options");
    return NextResponse.json(options);
  } catch (error) {
    return upstreamProblemResponse(error);
  }
}
