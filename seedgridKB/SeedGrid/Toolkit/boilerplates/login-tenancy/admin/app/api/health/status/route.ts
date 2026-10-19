import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET() {
  const response = await fetch(`${apiBaseUrl}/public/accounttenancy/status`, {
    cache: "no-store",
  });

  return passthroughResponse(response);
}
