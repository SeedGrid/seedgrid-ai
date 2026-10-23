// Catalogo de permissoes que ESTE app consulta. Copia podada do `lib/admin-permissions.ts` do
// report-admin: sairam as de dominio (planos, moedas, parceiros, IA, relatorios, api keys, backup,
// self-enter, banco do cliente) — todas de `audience=platform`, e nenhuma delas aparece no
// catalogo que o `/me/security/roles/permissions` devolve para o cliente.
//
// Ficou o que as telas deste front cobram: usuarios, perfis, auditoria, convite de usuario externo
// (self-enter) e API keys — estes dois voltaram porque o cliente tambem convida gente e integra
// sistemas na propria conta. Os codigos sao os mesmos
// que o `LoginTenancyUserController`/`LoginTenancyRoleController` exigem no `@PermissionsAllowed`
// — se divergirem, o menu esconde uma tela que o usuario PODE abrir (ou o contrario).
export const ADMIN_ROLE = "ADMIN";

export const ADMIN_PERMISSIONS = {
  usersView: "USER_READ",
  usersCreate: "USER_CREATE",
  usersEdit: "USER_UPDATE",
  usersDelete: "USER_DELETE",
  rolesView: "ROLE_READ",
  rolesCreate: "ROLE_CREATE",
  rolesEdit: "ROLE_UPDATE",
  rolesDelete: "ROLE_DELETE",
  // Empresas da conta (T5.3). CRU: nao existe COMPANY_DELETE (plano 4.18, a empresa so e inativada).
  companiesView: "COMPANY_READ",
  companiesCreate: "COMPANY_CREATE",
  companiesEdit: "COMPANY_UPDATE",
  // Auditoria: a leitura de `/audit-logs` do ext-audit.
  auditView: "LOG_READ",
  // Convite de usuario externo (self-enter) — os mesmos codigos do `@PermissionsAllowed` do
  // SelfEnterController do ext-security.
  selfEnterInvite: "SELFENTER_INVITE",
  selfEnterApprove: "SELFENTER_APPROVE",
  selfEnterReject: "SELFENTER_REJECT",
  // API Keys (ext seedgrid-apikeys): chaves de integracao da propria conta.
  apiKeysView: "APIKEY_READ",
  apiKeysCreate: "APIKEY_CREATE",
  apiKeysRevoke: "APIKEY_REVOKE",
  // Calendario de dias uteis (ext business-days, V1101): sem audience, valem para plataforma e cliente.
  businessDaysView: "BUSINESS_DAY_READ",
  businessDaysCreate: "BUSINESS_DAY_CREATE",
  businessDaysEdit: "BUSINESS_DAY_UPDATE",
  businessDaysDelete: "BUSINESS_DAY_DELETE",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
