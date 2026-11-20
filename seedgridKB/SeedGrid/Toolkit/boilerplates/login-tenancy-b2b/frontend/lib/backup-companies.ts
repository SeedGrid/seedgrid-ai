// Seletor de filiais da tela de backup (P178.F3.T1). So' regra pura: ler a lista de empresas do
// usuario (`GET /me/companies`), decidir se o seletor aparece (FE-38: so' com mais de uma empresa) e
// montar o que vai no `POST /exports` e no header `X-Company-Id`. Mesmo arquivo no admin e no frontend.

export type BackupCompany = {
  publicId: string;
  name: string;
};

/** "Todas" (padrao) manda o pedido sem `companyPublicIds`; "Algumas" manda so' as marcadas. */
export type BackupCompanyMode = "ALL" | "SOME";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normaliza `GET /me/companies`; item sem `publicId` e' descartado e empresa desativada nao e' oferecida. */
export function parseBackupCompanies(raw: unknown): BackupCompany[] {
  if (!Array.isArray(raw)) return [];
  const out: BackupCompany[] = [];
  for (const item of raw as Array<Record<string, unknown> | null>) {
    const publicId = text(item?.publicId);
    if (!publicId || text(item?.accessMode).toUpperCase() === "DISABLED") continue;
    out.push({ publicId, name: text(item?.tradeName) || text(item?.corporateName) || publicId });
  }
  return out;
}

/** FE-38: o seletor so' existe com mais de uma empresa. */
export function shouldShowBackupCompanySelector(companies: readonly BackupCompany[]): boolean {
  return companies.length > 1;
}

/**
 * Corpo do pedido: "Todas" omite `companyPublicIds` (o backend exporta todas as empresas do usuario,
 * nunca a base inteira); "Algumas" exige ao menos uma e descarta o que nao e' da lista do usuario.
 */
export function backupCompanyPayload(
  mode: BackupCompanyMode,
  selected: readonly string[],
  companies: readonly BackupCompany[],
): { companyPublicIds?: string[] } | { error: string } {
  if (mode === "ALL" || !shouldShowBackupCompanySelector(companies)) return {};
  const known = new Set(companies.map((company) => company.publicId));
  const ids = Array.from(new Set(selected)).filter((id) => known.has(id));
  if (ids.length === 0) return { error: "Escolha ao menos uma filial ou volte para Todas." };
  return { companyPublicIds: ids };
}

/**
 * Empresa do header `X-Company-Id` (a security responde 400 sem ele para quem tem varias empresas):
 * a corrente da sessao; sem ela, a primeira escolhida; sem escolha, a primeira da lista do usuario.
 */
export function backupCompanyHeader(
  currentPublicId: string | null | undefined,
  requested: readonly string[] | undefined,
  mine: readonly BackupCompany[],
): string | null {
  return text(currentPublicId) || requested?.find((id) => text(id)) || mine[0]?.publicId || null;
}
