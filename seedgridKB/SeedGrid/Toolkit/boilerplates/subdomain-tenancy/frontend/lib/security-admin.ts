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
import { parseMemberships, type MembershipDraft } from "@/lib/user-memberships";

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
  roles?: SecurityRole[] | null;
  emailConfirmedAt?: string | null;
  // Vinculos (empresa + perfis do vinculo) por publicId, lidos do `UserDTORes.memberships` (T5.12).
  // `undefined` = backend antigo (a tela edita sem enviar vinculos).
  // Leitura (`UserDTORes.memberships`): `roles` (publicId + nome) e `companyName`; o formato de escrita
  // (`rolePublicIds`) tambem e' aceito. O mapeamento fica em `parseMemberships` (lib/user-memberships).
  memberships?: {
    companyPublicId: string;
    companyName?: string;
    rolePublicIds?: string[];
    roles?: { publicId: string; name?: string }[];
  }[] | null;
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
  /** Perfis GLOBAIS do usuario (valem em toda empresa), por publicId. */
  rolePublicIds?: string[];
  /** Empresas e perfis do vinculo, por publicId (T5.7). Vazio = so' os perfis globais. */
  memberships?: MembershipDraft[];
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
  return {
    publicId: role.publicId,
    name: role.name,
    description: role.description,
    forIntegration: role.forIntegration ?? false,
  };
}

export function toPermissionOption(permission: SecurityPermission): PermissionOption {
  return {
    publicId: permission.publicId,
    name: permission.name,
    description: permission.description,
  };
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
    emailConfirmed: Boolean(user.emailConfirmedAt),
    companiesCount: user.companiesCount ?? 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Perfis que valem NA PLATAFORMA (membership da plataforma com perfis proprios, senao globais).
    roles: (user.roles ?? []).map(toRoleSummary),
    memberships: user.memberships ? parseMemberships(user.memberships) : undefined,
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

/** Campos aceitos pelo endpoint restrito de escrita de usuários do Security. */
export function toSecurityUserCreate(form: UserForm) {
  return {
    email: form.email,
    name: form.name,
    whatsApp: form.whatsApp ?? "",
    additionalAttributes: form.additionalAttributes,
    password: form.password,
    active: form.active ?? true,
    changePasswordRequired: form.changePasswordRequired ?? true,
    rolePublicIds: form.rolePublicIds ?? [],
    // Vinculos por publicId; as empresas do novo usuario ⊆ as do cadastrador (o backend valida).
    memberships: form.memberships ?? [],
  };
}

/** PATCH restrito. Campos de root e empresas são exclusivos das APIs administrativas do Security. */
export function toSecurityUserPatch(form: UserForm) {
  const patch: Record<string, unknown> = {
    email: form.email,
    name: form.name,
    whatsApp: form.whatsApp ?? "",
    additionalAttributes: form.additionalAttributes,
    active: form.active ?? true,
    changePasswordRequired: form.changePasswordRequired ?? false,
    rolePublicIds: form.rolePublicIds ?? [],
  };
  // O PATCH aplica os vinculos informados (adiciona/atualiza); sem a chave, nada muda nos vinculos.
  if (form.memberships !== undefined) patch.memberships = form.memberships;
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
