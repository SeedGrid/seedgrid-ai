// COPIADO de:
//   seedgrid-platform/front/seedgrid-fe-components/packages/modules/seedgrid-fe-security/src/paths.ts
//   (pacote npm `@seedgrid/fe-security`, versao 2026.6.1)
//
// Por que a copia e nao a dependencia: o boilerplate usa, dos modulos `@seedgrid/fe-*`, apenas o
// `@seedgrid/fe-core` (decisao do dono, 2026-09-09 — ver PLAN.md §2.2). O `fe-security@2026.6.1`
// que o report-admin pina contem SO' `index.js` + `paths.js`; era literalmente este arquivo. Voltar
// a consumir o pacote depois e' trocar o caminho do import, nada mais.
//
// REGRA: este arquivo espelha o `RestControllerPath.java` do `seedgrid-quarkus-ext-security`.
// Mudou um path no backend? Atualize aqui tambem. Front e back falam o MESMO contrato.

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
    // Link publico de cadastro (sem convite): se esta ligado e a empresa que o link identifica.
    publicLink: "/self-enter/public-link",
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
