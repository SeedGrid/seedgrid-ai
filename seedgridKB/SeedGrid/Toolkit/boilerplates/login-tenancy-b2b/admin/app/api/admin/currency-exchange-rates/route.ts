import { NextResponse } from "next/server";

import { apiFetchServer } from "@/lib/seedgrid-app-api-server";
import type { CurrencyExchangeRateSearchResponse } from "@/lib/seedgrid-app-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const suffix = url.search;
  try {
    const result = await apiFetchServer<CurrencyExchangeRateSearchResponse>(
      `/admin/currency-exchange-rates${suffix}`,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      items: [],
      totalRecords: 0,
      page: 0,
      size: 30,
    } satisfies CurrencyExchangeRateSearchResponse);
  }
}
