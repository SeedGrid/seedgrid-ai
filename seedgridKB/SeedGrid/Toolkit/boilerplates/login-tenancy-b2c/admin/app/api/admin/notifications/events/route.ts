import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
} from "@/lib/seedgrid-app-api-server";

export async function GET() {
  try {
    return NextResponse.json(await apiFetchServer<unknown>("/admin/notifications/events"));
  } catch (error) {
    if (
      isApiConnectionError(error) ||
      (error instanceof ApiRequestError && isInvalidAdminSessionResponse(error.status, error.body))
    ) {
      return NextResponse.json(null);
    }
    throw error;
  }
}
