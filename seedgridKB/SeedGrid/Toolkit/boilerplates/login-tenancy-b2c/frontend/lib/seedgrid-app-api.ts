import type { CurrentCompany } from "@/lib/company-access";
import { createApiClient } from "@/lib/core";

import { apiBaseUrl } from "./api-base-url";

// URL da API: ver `lib/api-base-url.ts` (env `SEEDGRID_APP_API_BASE_URL`, default a API local).
export { apiBaseUrl };
const apiToken = process.env.SEEDGRID_APP_API_TOKEN;
const apiCompanyId = process.env.SEEDGRID_APP_API_COMPANY_ID;

export function buildApiHeaders(headers?: HeadersInit): HeadersInit {
  return {
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
    ...(apiCompanyId ? { "X-Company-Id": apiCompanyId } : {}),
    ...headers,
  };
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

// Cliente HTTP canônico (server-side) apontando para o report-api. Em erro, lança um
// `ApiClientError` (subclasse de Error, com `responseBody`+`status`) e roteia a
// captura por `runGuarded`/`captureException`. Os route handlers de segurança usam o
// `responseBody` para repassar o problem+json íntegro; os demais chamadores continuam
// recebendo um Error com `.message` legível (retrocompat).
const reportApiClient = createApiClient({
  baseUrl: apiBaseUrl,
  defaultCache: "no-store",
  defaultHeaders: buildApiHeaders({ "Content-Type": "application/json" }),
  // Auth e X-Company-Id já vão nos defaultHeaders; o client não gerencia token.
  getAccessToken: async () => null,
});

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method, body, headers, ...rest } = options;

  return reportApiClient.request<T>(path, {
    ...rest,
    method: method ?? "GET",
    headers: buildApiHeaders(headers),
    body: body as BodyInit | null | undefined,
    requireAuth: false,
  });
}

// ---------------------------------------------------------------------------
// PODA DE DOMINIO (boilerplate login-tenancy)
//
// Este arquivo e' o `lib/seedgrid-report-api.ts` do report-admin com os tipos de DOMINIO do
// report removidos: contas, planos, assinaturas, consumo, parceiros, api keys, backup/export,
// moedas, relatorios, templates, IA (modelos/precos/config/uso/lucro) e os `getAdmin*` que
// batiam em `/admin/**`. Ficou o que este app usa: seguranca, perfil, 2FA e audit-log.
//
// O que sobrou nao foi reescrito — e' recorte literal, linha a linha, do original.
//
// Excecao: os tipos de API keys voltaram (copia literal dos do admin), porque o cliente agora
// gerencia as proprias chaves de integracao — escopadas na empresa corrente pelo backend.
// ---------------------------------------------------------------------------

export type RoleSummary = {
  publicId: string;
  name: string;
  description: string;
};

export type ApiKeyListItem = {
  publicId: string;
  name: string;
  prefix: string;
  masked: string;
  roleName: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

// Retornado apenas na criacao: `apiKey` e o segredo em claro, exibido UMA unica vez.
export type ApiKeyCreateResponse = {
  publicId: string;
  name: string;
  prefix: string;
  masked: string;
  apiKey: string;
  expiresAt: string | null;
  createdAt: string;
};

export type ApiKeyRevokeResponse = {
  publicId: string;
  revokedAt: string;
};

/**
 * Perfil de integracao com que o usuario pode gerar chave na empresa corrente (GET /apikeys/roles):
 * os perfis de integracao da propria empresa + os globais de integracao sem permissao de plataforma.
 * `global` = perfil de sistema (sem empresa), compartilhado por todas as contas.
 */
export type ApiKeyRoleOption = {
  publicId: string;
  name: string;
  description: string;
  global: boolean;
};

export type PermissionOption = {
  publicId: string;
  name: string;
  description: string;
};

/**
 * Usuario protegido da conta: o root efetivo (responsavel pelo cadastro da empresa). Nao pode ser excluido,
 * desativado, perder o root nem ter os perfis alterados — o backend tambem recusa. A API de usuarios da conta
 * manda `isRoot`; o `id` numerico nao vem mais (so' publicId), entao nao serve para identificar ninguem.
 */
export function isProtectedAccountUser(user: Pick<UserEntry, "isRoot" | "root">): boolean {
  return user.isRoot === true || user.root === true;
}

export type UserEntry = {
  /** Root efetivo NESTA conta (o responsavel pelo cadastro), como vem de /me/security/users. */
  isRoot?: boolean;
  additionalAttributes?: Record<string, unknown> | null;
  id: number;
  publicId: string;
  email: string;
  name: string;
  whatsApp: string;
  active: boolean;
  root: boolean;
  changePasswordRequired: boolean;
  passwordExpiresAt: string | null;
  twoFactorEnabled: boolean;
  emailConfirmed: boolean;
  companiesCount: number;
  createdAt: string;
  updatedAt: string;
  roles: RoleSummary[];
  /** Vinculos com empresas (publicId + perfis do vinculo), quando o backend os devolve. */
  memberships?: { companyPublicId: string; rolePublicIds: string[] }[];
  // (Poda de dominio: `partner` saiu — parceiros ficaram de fora do boilerplate, decisao D4 do
  // PLAN.md, e o AdminUserService/LoginTenancyUserController nao devolvem mais esse campo.)
};

export type RoleEntry = {
  id: number;
  publicId: string;
  name: string;
  description: string;
  active: boolean;
  forIntegration: boolean;
  createdAt: string;
  updatedAt: string;
  permissionsCount: number;
  permissions: PermissionOption[];
};

export type PaginatedResult<T> = {
  items: T[];
  totalRecords: number;
  page: number;
  size: number;
  sortField: string;
  sortOrder: "asc" | "desc";
  query: string;
  // (Poda de dominio: `scopedToPartner` e `planSummary` saiam daqui — o primeiro e' do escopo por
  // parceiro, fora do boilerplate por D4; o segundo, do resumo por plano da tela de Assinaturas do
  // admin. O CONTRATO que importa e' o de cima: `items` + `totalRecords`. Backend que devolve array
  // cru aqui deixa TODA tela vazia sem erro nenhum — ver PLAN.md §8.2.)
};

export const AUDIT_LOG_OPERATIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "OTHER",
] as const;

export type AuditLogOperation = (typeof AUDIT_LOG_OPERATIONS)[number];

/**
 * Registro de auditoria vindo de GET /audit-logs. Inclui o estado anterior
 * (`beforeState`) e posterior (`afterState`) da entidade, JSON serializado,
 * exibidos no detalhe.
 */
export type AuditLogEntry = {
  id: number;
  entity: string;
  operation: string;
  description: string | null;
  techOperation: string | null;
  origin: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  operationDateTime: string;
  userName: string | null;
  beforeState: string | null;
  afterState: string | null;
};

export type AuditLogFilters = {
  idFrom: string;
  idTo: string;
  entity: string;
  operation: string;
  description: string;
  operationDateFrom: string;
  operationDateTo: string;
  userName: string;
};



// Dados do proprio usuario autenticado (tela "Meu perfil"). GET/PUT /me/profile,
// PUT /me/profile/password, POST/DELETE /me/profile/avatar. Vale para admin ou cliente.
export type MyProfile = {
  publicId: string;
  name: string;
  email: string;
  whatsApp: string;
  // Avatar embutido como data URL (data:<mime>;base64,...) ou null se nao houver.
  avatarDataUrl: string | null;
};

export type AdminMePermissions = {
  userPublicId: string;
  name: string;
  /** Root na empresa-plataforma: acesso total, sem checar permissao a permissao. */
  isRoot?: boolean;
  /** Tem foto de perfil? So' com isso o menu pede o avatar — senao o GET responde 404. */
  hasAvatar?: boolean;
  roles: string[];
  permissions: string[];
  /** Empresa corrente da sessao e seu estado de acesso (`AuthResponse.currentCompany`); null = backend antigo. */
  currentCompany?: CurrentCompany | null;
};

export type TwoFactorMethod = "TOTP" | "EMAIL" | "WHATSAPP";

export type TwoFactorStatus = {
  enabled: boolean;
  primaryMethod: TwoFactorMethod | null;
  availableMethods: TwoFactorMethod[];
  hasBackupCodes: boolean;
  unusedBackupCodesCount: number;
};

/**
 * Resposta de /2f/enable, /2f/totp/confirm e /2f/setup/confirm. Os campos
 * presentes variam por etapa: enable TOTP traz qrCode/secret; confirm traz
 * backupCodes; EMAIL/WHATSAPP enable traz apenas metadata de confirmacao.
 */
export type TwoFactorEnableResponse = {
  status: string;
  method?: TwoFactorMethod;
  primaryMethod?: TwoFactorMethod;
  secret?: string;
  otpauthUrl?: string;
  qrCode?: {
    format: string;
    width: number;
    height: number;
    base64: string;
  } | null;
  backupCodes?: string[];
  metadata?: {
    email?: string;
    whatsApp?: string;
    expiresIn?: number;
  } | null;
};

