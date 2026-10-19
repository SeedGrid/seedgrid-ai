export const ADMIN_ROLE = "ADMIN";

export const ADMIN_PERMISSIONS = {
  // Visao geral (dashboard): a MESMA que o AdminDashboardResource exige nos dois endpoints dele.
  dashboardView: "ADMIN_HEALTH_READ",
  plansView: "PLAN_READ",
  plansCreate: "PLAN_CREATE",
  plansEdit: "PLAN_UPDATE",
  plansDelete: "PLAN_DELETE",
  planTermsView: "PLAN_TERM_READ",
  planTermsCreate: "PLAN_TERM_CREATE",
  planTermsEdit: "PLAN_TERM_UPDATE",
  planTermsDelete: "PLAN_TERM_DELETE",
  planTermsPublish: "PLAN_TERM_PUBLISH",
  planTermsArchive: "PLAN_TERM_ARCHIVE",
  aiPriceApprove: "AI_PRICE_APPROVE",
  usersView: "USER_READ",
  usersCreate: "USER_CREATE",
  usersEdit: "USER_UPDATE",
  usersDelete: "USER_DELETE",
  rolesView: "ROLE_READ",
  rolesCreate: "ROLE_CREATE",
  rolesEdit: "ROLE_UPDATE",
  rolesDelete: "ROLE_DELETE",
  // Banco global de templates de relatorio (chips do chat) — audience=platform.
  reportTemplatesView: "ADMIN_REPORT_TEMPLATE_READ",
  reportTemplatesCreate: "ADMIN_REPORT_TEMPLATE_CREATE",
  reportTemplatesEdit: "ADMIN_REPORT_TEMPLATE_UPDATE",
  reportTemplatesPublish: "ADMIN_REPORT_TEMPLATE_PUBLISH",
  reportTemplatesDelete: "ADMIN_REPORT_TEMPLATE_DELETE",
  // Manutencao de relatorio pelo catalogo do admin (inclusive de outra conta) — audience=platform.
  // Uma permissao por acao porque os riscos sao diferentes: renomear e' cosmetico, trocar a spec
  // muda o que o cliente executa na proxima abertura, e excluir leva versoes/dialogo junto.
  reportsRename: "ADMIN_REPORT_RENAME",
  reportsSpecReplace: "ADMIN_REPORT_SPEC_REPLACE",
  reportsDelete: "ADMIN_REPORT_DELETE",
  // Cotacoes de moeda (robo diario) — audience=platform.
  // Cotacao do DIA (reprocessar, lancar manual) e cadastro da MOEDA (fonte, cron, retry) sao
  // riscos diferentes: errar a cotacao de um dia se conserta com um retry; apontar a URL da fonte
  // pra outro lugar, ou excluir a moeda, afeta toda conversao de custo em cobranca dali pra frente.
  currencyRatesView: "CURRENCY_RATE_READ",
  currencyRatesUpdate: "CURRENCY_RATE_UPDATE",
  currencyView: "CURRENCY_READ",
  currencyCreate: "CURRENCY_CREATE",
  currencyUpdate: "CURRENCY_UPDATE",
  currencyDelete: "CURRENCY_DELETE",
  // Configuracao de IA (prompts e blocos de contexto do pipeline) — audience=platform.
  // Uma permissao por BOTAO: os riscos nao se parecem. Ver e' inofensivo; baixar tira o prompt
  // inteiro da tela; salvar rascunho nao muda nada em runtime; descartar o rascunho de OUTRA
  // pessoa joga fora trabalho que ninguem consegue recuperar; publicar troca o que a IA usa agora;
  // e reverter desfaz de uma vez tudo que entrou depois daquela publicacao.
  aiConfigView: "AI_CONFIG_READ",
  aiConfigDiff: "AI_CONFIG_DIFF",
  aiConfigDownload: "AI_CONFIG_DOWNLOAD",
  aiConfigUpdate: "AI_CONFIG_UPDATE",
  aiConfigDiscard: "AI_CONFIG_DISCARD",
  aiConfigDiscardAll: "AI_CONFIG_DISCARD_ALL",
  aiConfigPublish: "AI_CONFIG_PUBLISH",
  aiConfigRollback: "AI_CONFIG_ROLLBACK",
  // Parceiros de indicacao (LCK, Token, ...) — audience=platform.
  partnersView: "PARTNER_READ",
  partnersCreate: "PARTNER_CREATE",
  partnersEdit: "PARTNER_UPDATE",
  partnersDelete: "PARTNER_DELETE",
  accountsEdit: "ACCOUNT_UPDATE",
  // Configuracao da MAQUINA do cliente: onde o agente le (banco) e como ele se identifica
  // (chave). Uma permissao so' para as duas porque e' a mesma maquina e o mesmo trabalho —
  // quem instala o agente faz as duas coisas na mesma visita.
  clientDbConfigView: "CLIENT_DB_CONFIG_READ",
  // Self-enter (auto-cadastro) — permissões vêm do ext-security (seedadas no report-api).
  selfEnterInvite: "SELFENTER_INVITE",
  selfEnterApprove: "SELFENTER_APPROVE",
  selfEnterReject: "SELFENTER_REJECT",
  // API Keys (ext seedgrid-apikeys) — audience=platform.
  apiKeysView: "APIKEY_READ",
  apiKeysCreate: "APIKEY_CREATE",
  apiKeysRevoke: "APIKEY_REVOKE",
  // Backup / Export (ext seedgrid-backup) — audience=platform.
  backupView: "BACKUP_READ",
  backupCreate: "BACKUP_CREATE",
  backupDownload: "BACKUP_DOWNLOAD",
  backupDelete: "BACKUP_DELETE",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
