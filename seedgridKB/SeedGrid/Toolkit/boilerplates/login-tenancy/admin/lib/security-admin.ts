// Usuarios, perfis e permissoes do adminweb vem do seedgrid-security (/users, /roles,
// /permissions) - o app-api nao reimplementa essa gestao. Este modulo so' traduz entre o formato
// do security e o que as telas ja consomem (UserEntry, RoleEntry, PaginatedResult...).
import type {
  PaginatedResult,
  PermissionOption,
  RoleEntry,
  RoleSummary,
  UserEntry,
} from "@/lib/seedgrid-app-api";

type SecurityPermission = {
  publicId: string;
  name: string;
  description: string;
  audience?: string | null;
};

type SecurityRole = {
  publicId: string;
  name: string;
  description: string;
  active?: boolean;
  forIntegration?: boolean;
  system?: boolean;
  createdAt: string;
  updatedAt: string;
  permissionsCount?: number;
  permissions?: SecurityPermission[] | null;
};

type SecurityUser = {
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
  platformRoles?: SecurityRole[] | null;
};

export type SecurityPage<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

export type { SecurityPermission, SecurityRole, SecurityUser };

/** Corpo que as telas enviam para criar/editar usuario. */
type UserForm = {
  additionalAttributes?: Record<string, unknown> | null;
  email?: string;
  name?: string;
  whatsApp?: string;
  active?: boolean;
  root?: boolean;
  changePasswordRequired?: boolean;
  password?: string;
  rolePublicIds?: string[];
};

/** Corpo que as telas enviam para criar/editar perfil. */
type RoleForm = {
  name?: string;
  description?: string;
  active?: boolean;
  forIntegration?: boolean;
  permissionPublicIds?: string[];
};

export function toRoleSummary(role: SecurityRole): RoleSummary {
  return { publicId: role.publicId, name: role.name, description: role.description };
}

export function toPermissionOption(permission: SecurityPermission): PermissionOption {
  return {
    publicId: permission.publicId,
    name: permission.name,
    description: permission.description,
  };
}

/** Perfil que o usuario protegido nunca perde. */
export const PROTECTED_ROLE_NAME = "ADMIN";

/**
 * Usuario ESPECIAL da plataforma: o root (o admin criado no bootstrap). Nao pode ser excluido, desativado,
 * perder o acesso root nem o perfil ADMIN. Root NAO se atribui (o backend recusa com 422: so' nasce no
 * bootstrap e no cadastro da empresa), entao "root" identifica so' ele — a tela nem tem o toggle.
 */
export function isProtectedUser(user: Pick<UserEntry, "root">): boolean {
  return user.root === true;
}

export function toUserEntry(user: SecurityUser): UserEntry {
  return {
    publicId: user.publicId,
    email: user.email,
    name: user.name,
    whatsApp: user.whatsApp,
    additionalAttributes: user.additionalAttributes ?? {},
    active: user.active,
    root: user.root,
    changePasswordRequired: user.changePasswordRequired,
    passwordExpiresAt: user.passwordExpiresAt,
    twoFactorEnabled: user.twoFactorEnabled,
    emailConfirmed: user.emailConfirmed,
    companiesCount: user.companiesCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Perfis que valem NA PLATAFORMA (membership da plataforma com perfis proprios, senao globais).
    roles: (user.platformRoles ?? []).map(toRoleSummary),
  };
}

export function toRoleEntry(role: SecurityRole): RoleEntry {
  const permissions = (role.permissions ?? []).map(toPermissionOption);
  return {
    publicId: role.publicId,
    name: role.name,
    description: role.description,
    active: role.active ?? true,
    forIntegration: role.forIntegration ?? false,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissionsCount: role.permissionsCount ?? permissions.length,
    permissions,
  };
}

export function toPaginatedResult<S, T>(
  page: SecurityPage<S>,
  map: (item: S) => T,
  params: URLSearchParams,
): PaginatedResult<T> {
  return {
    items: page.items.map(map),
    totalRecords: page.total,
    page: page.page,
    size: page.size,
    sortField: params.get("sortField") ?? "name",
    sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
    query: params.get("q") ?? "",
  };
}

/** Querystring de busca/paginacao repassada ao security (so' os parametros que ele entende). */
export function searchParamsFor(params: URLSearchParams, extra: Record<string, string>): string {
  const out = new URLSearchParams();
  for (const key of ["q", "page", "size", "sortField", "sortOrder"]) {
    const value = params.get(key);
    if (value !== null && value !== "") out.set(key, value);
  }
  if (!out.has("page")) out.set("page", "0");
  if (!out.has("size")) out.set("size", "10");
  for (const [key, value] of Object.entries(extra)) out.set(key, value);
  return out.toString();
}

/**
 * Criacao pelo adminweb: operador da plataforma com a senha escolhida pelo admin, e-mail ja
 * confirmado e sem e-mail de boas-vindas (o admin repassa a senha).
 */
export function toSecurityUserCreate(form: UserForm) {
  return {
    email: form.email,
    name: form.name,
    whatsApp: form.whatsApp ?? "",
    additionalAttributes: form.additionalAttributes,
    password: form.password,
    active: form.active ?? true,
    // Root nao se atribui pela API (422): todo usuario criado pela tela nasce sem root.
    root: false,
    changePasswordRequired: form.changePasswordRequired ?? true,
    rolePublicIds: form.rolePublicIds ?? [],
    emailPreConfirmed: true,
    sendWelcomeEmail: false,
  };
}

/** Edicao: PATCH do security. Senha em branco = mantem; perfis = perfis na plataforma. */
export function toSecurityUserPatch(form: UserForm) {
  const patch: Record<string, unknown> = {
    email: form.email,
    name: form.name,
    whatsApp: form.whatsApp ?? "",
    additionalAttributes: form.additionalAttributes,
    active: form.active ?? true,
    isRoot: form.root ?? false,
    changePasswordRequired: form.changePasswordRequired ?? false,
    rolePublicIds: form.rolePublicIds ?? [],
  };
  const password = form.password?.trim();
  if (password) patch.password = password;
  return patch;
}

export function toSecurityRoleBody(form: RoleForm) {
  return {
    name: (form.name ?? "").trim().toUpperCase(),
    description: (form.description ?? "").trim(),
    active: form.active ?? true,
    forIntegration: form.forIntegration ?? false,
    permissionPublicIds: form.permissionPublicIds ?? [],
  };
}


export type { UserForm, RoleForm };
