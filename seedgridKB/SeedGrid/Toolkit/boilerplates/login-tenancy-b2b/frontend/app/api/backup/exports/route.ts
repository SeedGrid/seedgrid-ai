import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { backupCompanyHeader, parseBackupCompanies } from "@/lib/backup-companies";
import { ADMIN_CURRENT_COMPANY_COOKIE, parseCurrentCompany } from "@/lib/company-access";
import { cookies } from "next/headers";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ExportCreateRequest, ExportJob } from "@/lib/seedgrid-app-api";

// Lista os jobs de export do tenant (ext seedgrid-backup: GET /exports?page=&size=). O backend
// devolve um array simples (sem total), entao pedimos um lote grande e paginamos no cliente.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = params.get("page") ?? "0";
    const size = params.get("size") ?? "100";
    const jobs = await apiFetchSecurity<ExportJob[]>(
      `/exports?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    );
    return NextResponse.json(jobs);
  } catch (error) {
    return problemResponse(error);
  }
}

// Cria um job de export assincrono (POST /exports).
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportCreateRequest;
    // Quem tem várias empresas precisa mandar X-Company-Id (a security responde 400 sem ele). Vale a
    // corrente da sessão; sem ela, uma das escolhidas ou das empresas do usuário. O header não define o
    // que sai: quem define é companyPublicIds (omitido = todas as empresas do usuário, nunca a base inteira).
    const mine = body.companyPublicIds?.length
      ? []
      : parseBackupCompanies(await apiFetchSecurity<unknown>(SecurityPaths.me.companies));
    const current = parseCurrentCompany((await cookies()).get(ADMIN_CURRENT_COMPANY_COOKIE)?.value);
    const companyId = backupCompanyHeader(current?.publicId, body.companyPublicIds, mine);
    const created = await apiFetchSecurity<ExportJob>("/exports", {
      method: "POST",
      body: JSON.stringify(body),
      ...(companyId ? { headers: { "X-Company-Id": companyId } } : {}),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return problemResponse(error);
  }
}
