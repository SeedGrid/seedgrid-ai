// COPIA LITERAL de:
//   seedgrid-platform/front/seedgrid-fe-components/packages/modules/
//     seedgrid-fe-security/src/paths.ts
//
// Por que uma copia e nao o pacote `@seedgrid/fe-security`: decisao do dono em 2026-09-09
// (PLAN.md secao 2.2) — dos modulos `@seedgrid/fe-*` o boilerplate usa por ora apenas o
// `@seedgrid/fe-core`. A versao que o report-admin pinava (2026.6.1) continha, no dist,
// exatamente `index.js` + `paths.js`: era este arquivo e mais nada. O motor
// (`createSecurityServer`) saiu na 2026.7.3 e nunca teve consumidor.
//
// Regra que este arquivo carrega (a mesma do original): ele ESPELHA o
// `RestControllerPath.java` do backend (seedgrid-quarkus-ext-security). Path que muda no
// backend muda aqui na mesma passada — front e back falam o MESMO contrato.
//
// Voltar a consumir o pacote depois e' trocar o caminho do import nos arquivos que usam
// `SecurityPaths`; o conteudo abaixo e' identico ao do modulo.
// ---------------------------------------------------------------------------------------

// Espelho do RestControllerPath.java (seedgrid-quarkus-ext-security): contrato único
// dos paths REST do SeedGrid Security — front e back falam o MESMO. Mudou um path no
// backend? Atualize aqui também. Paths sob `/public/*` são não-autenticados.
//
// Convenção: endpoints estáticos são strings; endpoints com parâmetro são funções
// builder (já aplicam encodeURIComponent no segmento).

const seg = (value: string): string => encodeURIComponent(value);

export const SecurityPaths = {
  /** AUTH (/public/auth) — não-autenticado. */
  auth: {
    login: "/public/auth/login",
    refresh: "/public/auth/refresh",
    confirmEmail: "/public/auth/confirm-email",
    forgotPassword: "/public/auth/forgot-password",
    resetPassword: "/public/auth/reset-password",
  },

  /** TWO-FACTOR (/2f autenticado, /public/2f não-autenticado). */
  twoFactor: {
    verify: "/public/2f/verify",
    resend: "/public/2f/resend",
    enable: "/2f/enable",
    status: "/2f/status",
    totpConfirm: "/2f/totp/confirm",
    setupConfirm: "/2f/setup/confirm",
    disable: "/2f/disable",
  },

  /** USERS (/users). */
  users: {
    base: "/users",
    changePassword: "/users/change-password",
    defaultAvatars: "/users/avatars/defaults",
    byPublicId: (publicId: string) => `/users/${seg(publicId)}`,
    avatar: (publicId: string) => `/users/${seg(publicId)}/avatar`,
    // Membership por conta (root + roles do usuário NAQUELA company).
    membership: (publicId: string, companyPublicId: string) =>
      `/users/${seg(publicId)}/memberships/${seg(companyPublicId)}`,
  },

  /** ROLES (/roles). */
  roles: {
    base: "/roles",
    integration: "/roles/integration",
    byPublicId: (publicId: string) => `/roles/${seg(publicId)}`,
  },

  /** PERMISSIONS (/permissions). */
  permissions: {
    base: "/permissions",
    byPublicId: (publicId: string) => `/permissions/${seg(publicId)}`,
  },

  /** ME (/me) — escopo do usuário corrente pelo token. */
  me: {
    permissions: "/me/permissions",
    // Empresas (memberships) do usuário, para o seletor de empresa (login-tenancy).
    companies: "/me/companies",
    // Troca a empresa corrente e re-emite o par de tokens escopado (login-tenancy).
    selectCompany: "/me/select-company",
  },

  /** COMPANIES (/companies, /public/companies). */
  companies: {
    base: "/companies",
    public: "/public/companies",
    byPublicId: (publicId: string) => `/companies/${seg(publicId)}`,
  },

  /** SELF-ENTER (/self-enter autenticado, /public/self-enter não-autenticado). */
  selfEnter: {
    requests: "/public/self-enter/requests",
    requestsToApprove: "/self-enter/requests/to-approve",
    invitations: "/self-enter/invitations",
    requestById: (id: string) => `/public/self-enter/requests/${seg(id)}`,
    confirmEmail: (id: string) => `/public/self-enter/requests/${seg(id)}/confirm-email`,
    resendEmail: (id: string) => `/public/self-enter/requests/${seg(id)}/resend-email`,
    approve: (id: string) => `/self-enter/requests/${seg(id)}/approve`,
    reject: (id: string) => `/self-enter/requests/${seg(id)}/reject`,
    invitationByToken: (token: string) => `/public/self-enter/invitations/${seg(token)}`,
    invitationComplete: (token: string) =>
      `/public/self-enter/invitations/${seg(token)}/complete`,
    invitationResend: (id: string) => `/self-enter/invitations/${seg(id)}/resend`,
  },
} as const;

export type SecurityPaths = typeof SecurityPaths;
