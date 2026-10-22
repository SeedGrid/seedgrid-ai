export type NavItem = {
  href: string;
  label: string;
  children?: NavItem[];
  // Permissao de READ exigida para ver o item no menu. Regras (ver Shell.canShowItem):
  //  - grupo (com children): aparece se tiver >=1 filho visivel;
  //  - leaf com `permission`: exige hasPermission(permission);
  //  - leaf SEM `permission` (feature de plataforma sem perm dedicada no backend): so ADMIN.
  permission?: string;
};

// Menu lateral do produto (modelo "modular"). Traz as telas da base (security e audit): usuarios, perfis e
// auditoria; as das extensions opcionais entram conforme a escolha (API Keys sai se apikeys nao foi escolhida).
// Meu perfil, Temas e Sair vivem no menu do usuario (Shell.tsx). As permissoes sao as do catalogo das
// extensions (as mesmas que os controllers cobram no @PermissionsAllowed). Rota de menu que nao bate com uma
// pagina real e' 404 garantido: cada href tem um app/<href>/page.tsx.
export const navItems: NavItem[] = [
  { href: "/security/users/user_list", label: "Usuarios", permission: "USER_READ" },
  { href: "/security/self-enter", label: "Convidar usuario externo", permission: "SELFENTER_INVITE" },
  { href: "/security/roles/role_list", label: "Perfis", permission: "ROLE_READ" },
  { href: "/security/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
  { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
];
