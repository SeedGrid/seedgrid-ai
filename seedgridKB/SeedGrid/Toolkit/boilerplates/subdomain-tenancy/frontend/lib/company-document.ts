// "Empresa ja cadastrada." junto ao campo CNPJ (P180.F2.T16): consulta a rota do BFF no onExit do campo. E' so um aviso:
// nao bloqueia o digitar nem o Salvar (o 409 COMPANY_ALREADY_EXISTS do Salvar continua valendo). Qualquer falha
// (rota ausente/404, rede, sessao) e' silenciosa: o formulario segue como estava.
import { digitsOnly } from "./companies";

export const COMPANY_ALREADY_EXISTS_MESSAGE = "Empresa já cadastrada.";

export type DocumentExistsFetcher = (path: string) => Promise<{ exists?: boolean } | null | undefined>;

export function documentExistsPath(document: string, excludePublicId?: string | null): string {
  const query = new URLSearchParams({ document: digitsOnly(document) });
  if (excludePublicId) {
    query.set("excludePublicId", excludePublicId);
  }
  return `/api/security/companies/document-exists?${query.toString()}`;
}

/** true so quando o backend confirma que ja existe; documento incompleto, 404, erro de rede ou resposta estranha = false. */
export async function checkCompanyDocumentExists(
  fetcher: DocumentExistsFetcher,
  document: string,
  excludePublicId?: string | null,
): Promise<boolean> {
  const digits = digitsOnly(document);
  if (digits.length !== 14 && digits.length !== 11) {
    return false;
  }
  try {
    const result = await fetcher(documentExistsPath(digits, excludePublicId));
    return result?.exists === true;
  } catch {
    return false;
  }
}
