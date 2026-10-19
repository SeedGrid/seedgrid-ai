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

// Menu do APP DO CLIENTE. E' o mesmo `data.ts` do report-admin com a lista recortada: aqui o menu
// lateral tem tres itens, e o resto (Meu perfil, Minha assinatura, Temas, Sair) vive no
// `sgUserMenu` do Shell.tsx, nao aqui.
//
// Nada de Visao Geral, Contas, Comercial, Precos, Moedas nem Plataforma: tudo isso e' backoffice e
// fica no admin. Convidar usuario externo e API Keys ficam nos dois: aqui valem para a propria conta.
//
// Mesma ordem do grupo Seguranca do admin (e do `lib/client-permission-tree.ts`).
//
// As permissoes sao as do catalogo da propria extension (`USER_READ`, `ROLE_READ`, `LOG_READ`,
// `SELFENTER_INVITE` do ext-security e `APIKEY_READ` do ext-apikeys) —
// as mesmas que o `LoginTenancyUserController`/`LoginTenancyRoleController` cobram. Rota de menu
// que nao bate com a rota real e' 404 garantido (PLAN.md §8.7): cada `href` aqui tem um
// `app/<href>/page.tsx` correspondente.
export const navItems: NavItem[] = [
  { href: "/security/users/user_list", label: "Usuarios", permission: "USER_READ" },
  // Convite: SELFENTER_INVITE e' a permissao de abrir a tela (as de aprovar/reprovar so' liberam a
  // secao de aprovacoes dentro dela), igual ao admin.
  { href: "/security/self-enter", label: "Convidar usuario externo", permission: "SELFENTER_INVITE" },
  { href: "/security/roles/role_list", label: "Perfis", permission: "ROLE_READ" },
  { href: "/security/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
  { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
  // Demonstracao dos contadores de uso (backend: demo/UsageDemoResource.java). Remova junto com o dominio
  // de exemplo (e a permissao USAGE_DEMO_READ, migration V3002) ao comecar o seu produto.
  { href: "/exemplo-consumo", label: "Exemplo de consumo", permission: "USAGE_DEMO_READ" },
];
