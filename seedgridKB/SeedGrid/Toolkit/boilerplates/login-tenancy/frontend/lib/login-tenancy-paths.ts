// Espelho do `RestControllerPath.java` do `seedgrid-quarkus-ext-login-tenancy`
// (runtime/src/main/java/br/com/seedgrid/logintenancy/controllers/RestControllerPath.java).
//
// Mesma convencao do `security-paths.ts` ao lado: contrato unico dos paths REST, front e back
// falam o MESMO. Mudou um path no backend? Atualize aqui tambem.
//
// Os paths `/me/**` sao os que o app do CLIENTE usa — eles ja' chegam escopados na company
// corrente do token. O admin-web e' que fala `/admin/**`; aqui nao ha nada de `/admin`.

const seg = (value: string): string => encodeURIComponent(value);

export const LoginTenancyPaths = {
  /** SIGNUP (/public/signup) — nao-autenticado, com rate limit por IP. */
  signup: {
    base: "/public/signup",
    emailExists: "/public/signup/email-exists",
    cnpjStatus: "/public/signup/cnpj-status",
    confirmEmail: "/public/signup/confirm-email",
    resendEmail: "/public/signup/resend-email",
  },

  /** STATUS (/public/login-tenancy/status) — modulos ativos da instalacao. */
  status: "/public/login-tenancy/status",

  /** Usuarios DA EMPRESA CORRENTE (LoginTenancyUserController). */
  users: {
    base: "/me/security/users",
    byPublicId: (publicId: string) => `/me/security/users/${seg(publicId)}`,
    resendActivation: (publicId: string) =>
      `/me/security/users/${seg(publicId)}/resend-activation`,
  },

  /** Perfis DA EMPRESA CORRENTE (LoginTenancyRoleController). */
  roles: {
    base: "/me/security/roles",
    // Catalogo de permissoes atribuiveis pelo cliente (audience do cliente, sem as de plataforma).
    permissions: "/me/security/roles/permissions",
    byPublicId: (publicId: string) => `/me/security/roles/${seg(publicId)}`,
  },

  /** Autoatendimento do proprio usuario (LoginTenancyProfileController). */
  profile: {
    base: "/me/profile",
    password: "/me/profile/password",
    avatar: "/me/profile/avatar",
  },
} as const;

export type LoginTenancyPaths = typeof LoginTenancyPaths;
