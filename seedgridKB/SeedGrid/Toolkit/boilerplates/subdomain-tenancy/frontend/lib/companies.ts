// Empresas da conta (T5.3, plano 4.14/4.18). CRU: a empresa NUNCA e' apagada, so' inativada
// (`active = false`) e reativada. Este modulo concentra tudo o que as telas e o BFF
// (`api/security/companies/**`) fazem sem rede: formato do contrato, filtros, ordenacao, paginacao,
// montagem do corpo e mensagem de erro. Assim o que importa e' coberto por teste unitario.
//
// Contrato (plano 4.14, "Empresa e sessao"): `CompanyDTORes` traz `publicId`, `personType` (PJ|PF),
// `cpfCnpj`, `accessMode` (ACTIVE|READ_ONLY|DISABLED), `active`, endereco `addr*`. O estado de
// acesso e' SO' EXIBIDO aqui: quem muda e' `PUT /companies/{publicId}/access-mode` (plataforma/billing).
import { extractProblemCode } from "./api-error";
import type { PaginatedResult } from "@/lib/seedgrid-app-api";

export type CompanyAccessMode = "ACTIVE" | "READ_ONLY" | "DISABLED";
export type CompanyPersonType = "PJ" | "PF";

/** Formato que o backend devolve (`CompanyDTORes`). Campos novos podem faltar num backend antigo. */
export type SecurityCompany = {
  publicId: string;
  personType?: string | null;
  cpfCnpj?: string | null;
  accessMode?: string | null;
  corporateName?: string | null;
  tradeName?: string | null;
  active?: boolean | null;
  addrStreet?: string | null;
  addrNumber?: string | null;
  addrComplement?: string | null;
  addrPostalCode?: string | null;
  addrCity?: string | null;
  addrState?: string | null;
  addrDistrict?: string | null;
  addrPhone?: string | null;
  repFirstName?: string | null;
  repLastName?: string | null;
  repCpf?: string | null;
  repPhone?: string | null;
  repWhatsapp?: string | null;
  repEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** Formato normalizado que as telas consomem. */
export type CompanyEntry = {
  publicId: string;
  personType: CompanyPersonType;
  cpfCnpj: string;
  accessMode: CompanyAccessMode;
  corporateName: string;
  tradeName: string;
  active: boolean;
  addrStreet: string;
  addrNumber: string;
  addrComplement: string;
  addrPostalCode: string;
  addrCity: string;
  addrState: string;
  addrDistrict: string;
  addrPhone: string;
  repFirstName: string;
  repLastName: string;
  repCpf: string;
  repPhone: string;
  repWhatsapp: string;
  repEmail: string;
  createdAt: string | null;
  updatedAt: string | null;
};

/** Corpo que a tela de edicao envia ao BFF (criar e editar). Sem `accessMode`: nao e' desta tela. */
export type CompanyForm = {
  personType: CompanyPersonType;
  cpfCnpj: string;
  corporateName: string;
  tradeName: string;
  active?: boolean;
  addrStreet: string;
  addrNumber: string;
  addrComplement: string;
  addrPostalCode: string;
  addrCity: string;
  addrState: string;
  addrDistrict: string;
  addrPhone: string;
  repFirstName: string;
  repLastName: string;
  repCpf: string;
  repPhone: string;
  repWhatsapp: string;
  repEmail: string;
};

export const EMPTY_COMPANY_FORM: CompanyForm = {
  personType: "PJ",
  cpfCnpj: "",
  corporateName: "",
  tradeName: "",
  active: true,
  addrStreet: "",
  addrNumber: "",
  addrComplement: "",
  addrPostalCode: "",
  addrCity: "",
  addrState: "",
  addrDistrict: "",
  addrPhone: "",
  repFirstName: "",
  repLastName: "",
  repCpf: "",
  repPhone: "",
  repWhatsapp: "",
  repEmail: "",
};

export const COMPANY_ACCESS_MODES: readonly CompanyAccessMode[] = ["ACTIVE", "READ_ONLY", "DISABLED"];

export const COMPANY_ACCESS_MODE_LABELS: Record<CompanyAccessMode, string> = {
  ACTIVE: "Ativa",
  READ_ONLY: "Somente leitura",
  DISABLED: "Desligada",
};

export const COMPANY_PERSON_TYPE_LABELS: Record<CompanyPersonType, string> = {
  PJ: "Pessoa juridica",
  PF: "Pessoa fisica",
};

export const BRAZIL_STATES: readonly string[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

/** Filtro "Situacao" da lista: `active` e' a decisao do administrador (inativar/reativar). */
export type CompanyActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type CompanyListQuery = {
  page: number;
  size: number;
  q: string;
  sortField: string;
  sortOrder: "asc" | "desc";
  accessMode: CompanyAccessMode | "ALL";
  active: CompanyActiveFilter;
};

const text = (value: string | null | undefined) => value ?? "";

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function normalizeAccessMode(value: string | null | undefined): CompanyAccessMode {
  const upper = (value ?? "").trim().toUpperCase();
  return (COMPANY_ACCESS_MODES as readonly string[]).includes(upper)
    ? (upper as CompanyAccessMode)
    : "ACTIVE";
}

export function normalizePersonType(value: string | null | undefined): CompanyPersonType {
  return (value ?? "").trim().toUpperCase() === "PF" ? "PF" : "PJ";
}

export function toCompanyEntry(company: SecurityCompany): CompanyEntry {
  return {
    publicId: company.publicId,
    personType: normalizePersonType(company.personType),
    cpfCnpj: digitsOnly(company.cpfCnpj),
    accessMode: normalizeAccessMode(company.accessMode),
    corporateName: text(company.corporateName),
    tradeName: text(company.tradeName),
    active: company.active ?? true,
    addrStreet: text(company.addrStreet),
    addrNumber: text(company.addrNumber),
    addrComplement: text(company.addrComplement),
    addrPostalCode: text(company.addrPostalCode),
    addrCity: text(company.addrCity),
    addrState: text(company.addrState).toUpperCase(),
    addrDistrict: text(company.addrDistrict),
    addrPhone: text(company.addrPhone),
    repFirstName: text(company.repFirstName),
    repLastName: text(company.repLastName),
    repCpf: text(company.repCpf),
    repPhone: text(company.repPhone),
    repWhatsapp: text(company.repWhatsapp),
    repEmail: text(company.repEmail),
    createdAt: company.createdAt ?? null,
    updatedAt: company.updatedAt ?? null,
  };
}

/** "12345678000195" -> "12.345.678/0001-95"; CPF -> "123.456.789-09"; fora do tamanho, devolve os digitos. */
export function formatCpfCnpj(value: string | null | undefined): string {
  const digits = digitsOnly(value);
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return digits;
}

/** Rotulo do documento conforme o tipo: PJ = CNPJ, PF = CPF. */
export function documentLabel(personType: CompanyPersonType): string {
  return personType === "PF" ? "CPF" : "CNPJ";
}

/** "Rua A, 10 - Centro - Sao Paulo/SP": junta so' o que existe. */
export function formatCompanyAddress(company: CompanyEntry): string {
  const street = [company.addrStreet, company.addrNumber].filter(Boolean).join(", ");
  const city = [company.addrCity, company.addrState].filter(Boolean).join("/");
  return [street, company.addrDistrict, city].filter(Boolean).join(" - ");
}

/** Texto de busca: razao social, fantasia e documento (so' digitos). */
function matchesQuery(company: CompanyEntry, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  const needleDigits = digitsOnly(needle);
  return (
    company.corporateName.toLowerCase().includes(needle) ||
    company.tradeName.toLowerCase().includes(needle) ||
    (needleDigits.length > 0 && company.cpfCnpj.includes(needleDigits))
  );
}

export function filterCompanies(
  items: CompanyEntry[],
  query: Pick<CompanyListQuery, "q" | "accessMode" | "active">,
): CompanyEntry[] {
  return items.filter((company) => {
    if (query.accessMode !== "ALL" && company.accessMode !== query.accessMode) {
      return false;
    }
    if (query.active === "ACTIVE" && !company.active) {
      return false;
    }
    if (query.active === "INACTIVE" && company.active) {
      return false;
    }
    return matchesQuery(company, query.q);
  });
}

const SORTABLE_FIELDS = [
  "corporateName",
  "tradeName",
  "cpfCnpj",
  "personType",
  "accessMode",
  "active",
  "addrState",
  "createdAt",
] as const;

export function sortCompanies(
  items: CompanyEntry[],
  sortField: string,
  sortOrder: "asc" | "desc",
): CompanyEntry[] {
  const field = (SORTABLE_FIELDS as readonly string[]).includes(sortField)
    ? (sortField as (typeof SORTABLE_FIELDS)[number])
    : "corporateName";
  const direction = sortOrder === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    const compared =
      typeof left === "boolean" || typeof right === "boolean"
        ? Number(left) - Number(right)
        : String(left ?? "").localeCompare(String(right ?? ""), "pt-BR", { sensitivity: "base" });
    return compared * direction;
  });
}

/** Le a querystring do BFF com valores seguros (pagina 0-based, tamanho 1..200). */
export function parseCompanyListQuery(params: URLSearchParams): CompanyListQuery {
  const page = Number.parseInt(params.get("page") ?? "0", 10);
  const size = Number.parseInt(params.get("size") ?? "10", 10);
  const accessMode = (params.get("accessMode") ?? "ALL").toUpperCase();
  const active = (params.get("active") ?? "ALL").toUpperCase();
  return {
    page: Number.isFinite(page) && page > 0 ? page : 0,
    size: Number.isFinite(size) && size > 0 ? Math.min(size, 200) : 10,
    q: params.get("q") ?? "",
    sortField: params.get("sortField") ?? "corporateName",
    sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
    accessMode: (COMPANY_ACCESS_MODES as readonly string[]).includes(accessMode)
      ? (accessMode as CompanyAccessMode)
      : "ALL",
    active: active === "ACTIVE" || active === "INACTIVE" ? active : "ALL",
  };
}

/**
 * O `GET /companies` do backend lista tudo ou pagina so' por page/size (sem filtro). Como os
 * filtros desta tela (estado, situacao, busca) nao existem la, o BFF busca a lista inteira (uma
 * conta tem poucas empresas) e filtra, ordena e pagina aqui.
 */
export function buildCompanyPage(
  all: SecurityCompany[],
  query: CompanyListQuery,
): PaginatedResult<CompanyEntry> {
  const filtered = sortCompanies(
    filterCompanies(all.map(toCompanyEntry), query),
    query.sortField,
    query.sortOrder,
  );
  const start = query.page * query.size;
  return {
    items: filtered.slice(start, start + query.size),
    totalRecords: filtered.length,
    page: query.page,
    size: query.size,
    sortField: query.sortField,
    sortOrder: query.sortOrder,
    query: query.q,
  };
}

/** Corpo do `POST /companies` / `PATCH /companies/{publicId}` (nunca leva `accessMode`). */
export function toCompanyBody(input: Partial<CompanyForm>): Record<string, unknown> {
  // O corpo vem do navegador: campo ausente vira texto vazio em vez de quebrar o BFF.
  const form: CompanyForm = { ...EMPTY_COMPANY_FORM, ...input, active: input.active };
  const isPf = form.personType === "PF";
  const body: Record<string, unknown> = {
    personType: form.personType,
    cpfCnpj: digitsOnly(form.cpfCnpj),
    corporateName: form.corporateName.trim(),
    tradeName: form.tradeName.trim(),
    addrStreet: form.addrStreet.trim(),
    addrNumber: form.addrNumber.trim(),
    addrComplement: form.addrComplement.trim(),
    addrPostalCode: digitsOnly(form.addrPostalCode),
    addrCity: form.addrCity.trim(),
    addrState: form.addrState.trim().toUpperCase(),
    addrDistrict: form.addrDistrict.trim(),
    addrPhone: form.addrPhone.trim(),
  };
  // Representante legal e' da pessoa juridica; PF nao o envia.
  if (!isPf) {
    body.repFirstName = form.repFirstName.trim();
    body.repLastName = form.repLastName.trim();
    body.repCpf = digitsOnly(form.repCpf);
    body.repPhone = form.repPhone.trim();
    body.repWhatsapp = form.repWhatsapp.trim();
    body.repEmail = form.repEmail.trim();
  }
  if (form.active !== undefined) {
    body.active = form.active;
  }
  return body;
}

/** Corpo do botao Inativar/Reativar: o PATCH existente, so' com `active`. */
export function toActivePatch(active: boolean): { active: boolean } {
  return { active };
}

/** Primeiro erro de validacao do formulario (ou null). Mensagens iguais as do backend em sentido. */
export function validateCompanyForm(form: CompanyForm): string | null {
  if (!form.corporateName.trim()) {
    return "Informe a razao social.";
  }
  if (!form.tradeName.trim()) {
    return "Informe o nome fantasia.";
  }
  const digits = digitsOnly(form.cpfCnpj);
  if (form.personType === "PJ" && digits.length !== 14) {
    return "Informe o CNPJ com 14 digitos.";
  }
  if (form.personType === "PF" && digits.length !== 0 && digits.length !== 11) {
    return "Informe o CPF com 11 digitos (ou deixe em branco).";
  }
  const state = form.addrState.trim();
  if (state && !BRAZIL_STATES.includes(state.toUpperCase())) {
    return "UF invalida.";
  }
  return null;
}

/** Preenche o formulario de edicao a partir da empresa carregada. */
export function formFromEntry(company: CompanyEntry): CompanyForm {
  return {
    personType: company.personType,
    cpfCnpj: company.cpfCnpj,
    corporateName: company.corporateName,
    tradeName: company.tradeName,
    active: company.active,
    addrStreet: company.addrStreet,
    addrNumber: company.addrNumber,
    addrComplement: company.addrComplement,
    addrPostalCode: company.addrPostalCode,
    addrCity: company.addrCity,
    addrState: company.addrState,
    addrDistrict: company.addrDistrict,
    addrPhone: company.addrPhone,
    repFirstName: company.repFirstName,
    repLastName: company.repLastName,
    repCpf: company.repCpf,
    repPhone: company.repPhone,
    repWhatsapp: company.repWhatsapp,
    repEmail: company.repEmail,
  };
}

// --- erros (plano 4.14: codigos estaveis em application/problem+json) -------------------------

export const COMPANY_ERROR_MESSAGES: Record<string, string> = {
  LAST_ADMIN_PROTECTED:
    "Nao e possivel inativar esta empresa: a conta precisa manter ao menos uma empresa ativa com um administrador.",
  COMPANY_QUOTA_EXCEEDED:
    "O limite de empresas do seu plano foi atingido. Faca upgrade do plano para cadastrar ou reativar mais empresas.",
  COMPANY_DOCUMENT_INVALID: "Documento invalido para o tipo de pessoa (CNPJ para PJ; CPF opcional para PF).",
  COMPANY_READ_ONLY: "Esta empresa esta em modo somente leitura e nao aceita alteracoes.",
  COMPANY_DISABLED: "Esta empresa esta desligada.",
};

/**
 * Mensagem para o usuario: se o corpo do erro (problem+json) trouxer um `code` conhecido, usa o
 * texto combinado; senao devolve `fallback` (normalmente a `detail` do backend).
 */
export function companyErrorMessage(body: unknown, fallback: string | null | undefined): string {
  const code = extractProblemCode(body);
  if (code && COMPANY_ERROR_MESSAGES[code]) {
    return COMPANY_ERROR_MESSAGES[code];
  }
  return fallback && fallback.trim() ? fallback : "Nao foi possivel concluir a operacao.";
}

/** Para o `catch` das telas: le o `responseBody` do ApiClientError (se houver) e escolhe a mensagem. */
export function companyErrorFromThrown(
  error: unknown,
  extractMessage: (error: unknown) => string | null | undefined,
  fallback: string,
): string {
  const body =
    typeof error === "object" && error !== null && "responseBody" in error
      ? (error as { responseBody?: unknown }).responseBody
      : null;
  return companyErrorMessage(body, extractMessage(error) ?? fallback);
}
