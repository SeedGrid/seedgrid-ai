import type { CycleMeter, PlanTermMeter } from "./usage-meters";
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
    "X-Forwarded-Host": (process.env.SEEDGRID_TENANCY_DOMAIN?.trim() || "localhost"),
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

/**
 * Campos DESTE produto no term que NAO sao contador de uso (plan_terms.additional_attributes). O billing
 * guarda qualquer JSON; o exemplo do boilerplate e' `supportLevel` (ver AppPlanTermValidator). Franquia e
 * excedente sao de cada contador, em `meters` (ver lib/usage-meters.ts).
 */
export type PlanTermAttributes = {
  supportLevel?: "standard" | "priority";
  [key: string]: unknown;
};

/** Conta na visao da plataforma (GET /admin/accounts, do seedgrid-billing): consumo por contador. */
export type AdminAccount = {
  publicId: string;
  personType: string;
  cpfCnpj: string | null;
  legalName: string;
  tradeName: string;
  status: string;
  createdAt: string;
  subscriptionStatus: string;
  trial: boolean;
  planName: string | null;
  planCode: string | null;
  planValue: number | null;
  /** Saldo de cada contador no ciclo vigente. */
  usage: CycleMeter[];
  /** Vencimento da assinatura vigente. `null` = nao expira por data (trial_days = 0). */
  endsAt: string | null;
};

/**
 * Conta no combobox das telas que operam SOBRE uma conta sem administrar o cadastro dela.
 * So identificacao: vem do /admin/accounts/options, guardado por ACCOUNT_OPTIONS_READ em vez de
 * ACCOUNT_READ (que e a permissao do menu "Contas e clientes").
 */
export type AdminAccountOption = {
  publicId: string;
  personType: string;
  cpfCnpj: string | null;
  legalName: string | null;
  tradeName: string | null;
};

export type AdminAccountsResponse = {
  items: AdminAccount[];
  totalRecords?: number;
};

export type PlanCurrentTerm = {
  publicId: string;
  monthlyPrice: number | string;
  maxUsers: number | null;
  meters: PlanTermMeter[];
  featuresJson: string | null;
  published: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  additionalAttributes: PlanTermAttributes;
};

export type PlanEntry = {
  publicId: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  upgradePromptThresholdPercent: number;
  quotaWarningRemainingPercent: number;
  quotaCriticalRemainingPercent: number;
  /** Dias sem cobranca ao assinar (so' tem efeito no plano TRIAL). */
  trialDays: number;
  createdAt: string;
  currentTerm: PlanCurrentTerm | null;
};

// Configuracao do trial: a cota de cada contador (sem excedente) e os dias. O plano TRIAL nao aparece
// na lista de planos e tem tela propria.
export type TrialConfig = {
  planPublicId: string;
  termPublicId: string;
  meters: PlanTermMeter[];
  additionalAttributes: PlanTermAttributes;
  /** Dias sem cobranca ao assinar. 0 = nao expira por data. Vem do plano, nao da vigencia. */
  trialDays: number;
};

export type RoleSummary = {
  publicId: string;
  name: string;
  description: string;
  // Perfil de integracao (so' para API key): nao se atribui a usuario, entao as telas de
  // convite/aprovacao tiram esses perfis da lista de selecao.
  forIntegration?: boolean;
};

/**
 * Situacao de um e-mail perante a plataforma (GET /admin/platform-access?email=).
 * `exists: false` = ninguem usa esse e-mail ainda, o caminho e o convite normal.
 */
export type PlatformAccessLookup =
  | { exists: false }
  | {
      exists: true;
      publicId: string;
      name: string;
      email: string;
      hasPlatformAccess: boolean;
      platformRoles: string[];
      invitationClosed?: boolean;
    };

// ── API Keys (ext seedgrid-apikeys, endpoints /apikeys) ──
// LocalDateTime do backend serializa como string ISO no JSON.
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

// Perfil de integracao que o usuario pode usar para criar chave na empresa corrente
// (GET /apikeys/roles). `global` = perfil sem conta dona (ex.: os de exemplo semeados).
export type ApiKeyRoleOption = {
  publicId: string;
  name: string;
  description: string | null;
  global: boolean;
  // Permissoes liberadas do perfil (GET /apikeys/roles); ausente em backends antigos.
  permissions?: { publicId: string; name: string; description: string | null }[];
};

// ── Backup / Data Export (ext seedgrid-backup, endpoints /exports) ──
// Enums serializam pelo NOME (sem @JsonValue no backend).
export type BackupFormat = "CSV_ZIP" | "SQL_DUMP_ZIP";
export type ExportScope = "DOMAIN" | "RAW" | "CUSTOM";
export type ExportStatus =
  | "REQUESTED"
  | "QUEUED"
  | "RUNNING"
  | "DONE"
  | "DONE_NOTIFIED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export type ExportArtifactInfo = {
  id: number;
  type: string;
  filename: string;
  sizeBytes: number | null;
  sha256?: string;
  mimeType?: string;
};

export type ExportJob = {
  jobId: string;
  status: ExportStatus;
  progress: number | null;
  currentStep: string | null;
  format: BackupFormat;
  scope: ExportScope;
  databaseSchema: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  expiresAt: string | null;
  errorMessage: string | null;
  totalSizeBytes: number | null;
  downloadable: boolean | null;
  artifacts: ExportArtifactInfo[] | null;
};

export type ExportCreateRequest = {
  format: BackupFormat;
  scope: ExportScope;
  includeAttachments: boolean;
};

export type PermissionOption = {
  publicId: string;
  name: string;
  description: string;
  // Liberada pela software house para perfis de integracao (permissions.for_integration).
  forIntegration?: boolean;
};

export type UserEntry = {
  additionalAttributes?: Record<string, unknown> | null;
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
};

export type RoleEntry = {
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
  // So preenchido pelas listas que suportam o resumo por plano (hoje: Assinaturas). Calculado
  // sobre o conjunto FILTRADO INTEIRO no backend, nao so a pagina atual.
  planSummary?: SubscriptionPlanSummaryEntry[];
};

export type SubscriptionPlanSummaryEntry = {
  planCode: string | null;
  planName: string;
  count: number;
  totalValue: number;
};

export type PlanTermStatus = "SCHEDULED" | "CURRENT" | "ENDED";

export type PlanTermEntry = {
  publicId: string;
  planPublicId: string;
  monthlyPrice: number | string;
  maxUsers: number | null;
  meters: PlanTermMeter[];
  featuresJson: string | null;
  providerPriceId: string | null;
  published: boolean;
  publishError?: string;
  additionalAttributes: PlanTermAttributes;
  effectiveFrom: string;
  effectiveTo: string | null;
  // publicIds de Permission que este term libera (gate de features por plano).
  permissionPublicIds: string[];
  status: PlanTermStatus;
  createdAt: string;
};

export type SubscriptionCycleEntry = {
  id: string;
  periodStart: string;
  periodEnd: string;
  meters: CycleMeter[];
};

export type SubscriptionEntry = {
  id: string;
  tenantId: string;
  tenantName: string | null;
  planTermId: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  billingDay: number | null;
  createdAt: string;
  plan: {
    id: string;
    code: string;
    name: string;
  } | null;
  planTerm: {
    publicId: string;
    monthlyPrice: number | string;
    additionalAttributes: PlanTermAttributes;
    maxUsers: number | null;
    meters: PlanTermMeter[];
    effectiveFrom: string;
    effectiveTo: string | null;
  } | null;
  billingCycle?: SubscriptionCycleEntry | null;
};

;

export type UsageStatementEntry = {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  userId?: string | null;
  /** Nome do usuario que gerou o consumo (resolvido no backend). */
  userName?: string | null;
  billingCycleId: string;
  aiRequestId: string | null;
  occurredAt: string;
  operationType: string;
  description: string | null;
  balanceBefore: number;
  consumedRequests: number;
  balanceAfter: number;
  isOverage: boolean;
  overageUnitPrice: number | string | null;
  planTermId: string | null;
  /** Nome do plano DA EPOCA da solicitacao (rastreabilidade no detalhe/olhinho). */
  planName?: string | null;
  /** Frase exata que o usuario digitou e que gerou este consumo. */
  userPrompt?: string | null;
  /** Status da request de IA associada (SUCCESS, REJECTED, FAILED). */
  requestStatus?: string | null;
  chatId: string | null;
  reportId: string | null;
  metadataJson: string | null;
};

/** Totais calculados no backend sobre TODO o conjunto filtrado (nao so a pagina). */
export type UsageStatementTotals = {
  totalConsumed: number;
  overageCount: number;
  totalOverageValue: number | string;
};

/** Resposta paginada do extrato administrativo: pagina + totais agregados. */
export type UsageStatementPage = {
  items: UsageStatementEntry[];
  totalRecords: number;
  page: number;
  size: number;
  sortField: string;
  sortOrder: "asc" | "desc";
  totals: UsageStatementTotals;
};

// Banco global de templates de relatorio (chips do chat) — /admin/reports/templates.
export type ReportTemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ReportTemplateEntry = {
  id: string;
  title: string;
  // Tabela cuja presenca de dados condiciona a relevancia do template (checada so' no client,
  // unico lugar com acesso ao banco do cliente); null = sempre relevante, sem checagem.
  domainTable: string | null;
  status: ReportTemplateStatus;
  totalCopies: number;
  totalExecutions: number;
  updatedAt: string;
  // Origem: relatorio/conta/usuario que gerou a versao promovida/copiada a template.
  sourceAccountName: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  tokensUsedTotal: number;
  // Snapshot de preco por linha de uso (mesma logica de app/ai/profit), null se nunca precificado.
  costUsd: number | null;
  // true quando ha um snapshot de HTML (ver ReportTemplateDetail.previewHtml) de alguma execucao
  // real do report de origem/copia — habilita a acao de preview sem buscar o detalhe inteiro.
  hasPreview: boolean;
};

export type ReportTemplateDetail = ReportTemplateEntry & {
  description: string;
  specJson: string;
  sourceReportId: number | null;
  createdAt: string;
  previewHtml: string | null;
};

// Robo de cotacao (br.com.seedgrid.report.api.exchange.*) — currencies + currency_exchange_rates.
export type CurrencyOption = {
  code: string;
  name: string;
  active: boolean;
};

export type CurrencyDetail = {
  id: string;
  code: string;
  name: string;
  sourceUrl: string;
  fetchCron: string;
  timeZone: string;
  /** Intervalos entre tentativas depois de falhar, em horas ("4,5,3"). Vazio = sem retry. */
  retryOffsetsHours: string;
  /** Caminho do valor na resposta ("value[0].cotacaoVenda"). Null = formato AwesomeAPI. */
  rateJsonPath: string | null;
  /** Caminho da data/hora na resposta ("value[0].dataHoraCotacao"). */
  quotedAtJsonPath: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CurrencyExchangeRateStatus = "SUCCESS" | "FAILED" | "MANUAL";

export type CurrencyExchangeRateEntry = {
  id: string;
  currencyCode: string | null;
  currencyName: string | null;
  referenceDate: string;
  rate: number | null;
  status: CurrencyExchangeRateStatus;
  source: string | null;
  quotedAt: string | null;
  errorMessage: string | null;
  fetchedAt: string;
};

export type CurrencyExchangeRateSearchResponse = {
  items: CurrencyExchangeRateEntry[];
  totalRecords: number;
  page: number;
  size: number;
};

;

;

;

;

;

;

/** Operacoes auditadas (fixas na API de audit-logs). */
export const AUDIT_LOG_OPERATIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "OTHER",
] as const;

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

;

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

// Dashboard "Visao geral": montado pelo proxy /api/admin/dashboard/overview juntando AI Pricing,
// auditoria da extensao e seedgrid-billing
// (GET /admin/billing/overview: contas, assinaturas, movimento e receita do mes, inadimplentes).
export type AdminDashboardOverview = {
  year: number;
  month: number;
  counters: {
    accounts: number;
    // Assinaturas PAGAS ativas (exclui TRIAL). Trials vem em trialSubscriptions.
    activeSubscriptions: number;
    trialSubscriptions: number;
    auditEntries: number | null;
  };
  // Movimento do mes sobre assinaturas PAGAS (nao conta trial nem supersede interno).
  commercial: {
    newSubscriptions: number;
    canceled: number;
    upgrades: number;
    downgrades: number;
  };
  // Financeiro do mes: receita em BRL. O report tinha aqui tokens e custo de IA em USD; isso
  // saiu com as tabelas de consumo (ai_request_usages / ai_model_usages, §3.6 do PLAN.md).
  finance: {
    revenueBrl: number | string;
  };
  // Catalogo de modelos com preco vigente por 1M. Sem consumo do mes, pelo mesmo motivo acima.
  models: Array<{
    model: string;
    provider: string | null;
    active: boolean;
    inputPricePerMillion: number | string | null;
    outputPricePerMillion: number | string | null;
    currency: string | null;
    priced: boolean;
  }>;
  // Assinaturas com cobranca falhada (PAST_DUE): consumo bloqueado ate regularizar.
  dunning: {
    count: number;
    items: Array<{ accountPublicId?: string; client: string; plan: string; since: string | null }>;
  };
  readiness: {
    status: "READY" | "ATTENTION";
    plansConfigured: boolean;
    subscriptionsConfigured: boolean;
    billingReady: boolean;
  };
  lastAiPriceUpdateAt: string | null;
};

// ---------------------------------------------------------------------------
// IA: catalogo de modelos (com precificacao) e configuracao de fases do pipeline.
// O backend identifica os modelos sempre por publicId (campo "id" nas respostas).
// ---------------------------------------------------------------------------

// Modelo de LLM cadastrado, com preco por 1 MILHAO de tokens (input/output separados).
export type AiModelEntry = {
  id: string;
  provider: string | null;
  model: string;
  label: string | null;
  // Preco VIGENTE (denormalizado). Historico/lancamentos em AiModelPrice.
  inputPricePerMillion: number | null;
  cachedInputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  currentPriceValidFrom: string | null;
  currency: string;
  active: boolean;
};

// Um lancamento de preco do modelo (historico versionado; o vigente e o de maior validFrom).
export type AiModelPrice = {
  id: string;
  inputPricePerMillion: number | null;
  cachedInputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  currency: string;
  validFrom: string;
  sourceUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
};

// Referencia enxuta a um modelo, usada na configuracao de fases.
export type AiModelRef = {
  id: string;
  provider: string | null;
  model: string;
  label: string | null;
  active: boolean;
};

export type ExchangeRate = {
  rate: number | null;
  updatedAt?: string | null;
  source?: string;
};

// Um "slot"/fase do pipeline e o(s) modelo(s) que ele usa. Sem override, vale o default
// (do application.properties), exposto em primaryDefault/fallbackDefault.
export type AiStepModelSlot = {
  slot: string;
  label: string;
  description: string;
  steps: string[];
  hasFallback: boolean;
  primaryModel: AiModelRef | null;
  fallbackModel: AiModelRef | null;
  primaryDefault: string | null;
  fallbackDefault: string | null;
  source: "db" | "default";
};
