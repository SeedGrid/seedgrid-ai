import { NextResponse } from "next/server";

import { apiFetchServer } from "@/lib/seedgrid-app-api-server";
import type { AdminAccount, AdminAccountsResponse } from "@/lib/seedgrid-app-api";

// O /admin/accounts do seedgrid-billing e' paginado (maximo 100 por pagina); a tela de Contas filtra e
// ordena no cliente, entao aqui se juntam todas as paginas.
const PAGE_SIZE = 100;

export async function GET() {
  const items: AdminAccount[] = [];
  for (let page = 0; ; page++) {
    const result = await apiFetchServer<AdminAccountsResponse>(`/admin/accounts?page=${page}&size=${PAGE_SIZE}`);
    items.push(...result.items);
    if (result.items.length < PAGE_SIZE || items.length >= (result.totalRecords ?? items.length)) {
      break;
    }
  }
  return NextResponse.json({ items, totalRecords: items.length } satisfies AdminAccountsResponse);
}
