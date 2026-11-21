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
// lateral tem os itens abaixo, e o resto (Meu perfil, Minha assinatura, Temas, Sair) vive no
// `sgUserMenu` do Shell.tsx, nao aqui.
//
// Nada de Visao Geral, Contas, Comercial, Precos, Moedas nem Plataforma: tudo isso e' backoffice e
// fica no admin. Convidar usuario externo e API Keys ficam nos dois: aqui valem para a propria conta.
//
// Mesma ordem do grupo Segurança do admin (e do `lib/client-permission-tree.ts`).
//
// As permissoes sao as do catalogo da propria extension (`USER_READ`, `ROLE_READ`, `LOG_READ`,
// `SELFENTER_INVITE` do ext-security e `APIKEY_READ` do ext-apikeys) —
// as mesmas que o `LoginTenancyUserController`/`LoginTenancyRoleController` cobram. Rota de menu
// que nao bate com a rota real e' 404 garantido (PLAN.md §8.7): cada `href` aqui tem um
// `app/<href>/page.tsx` correspondente.
// Ordem (FE-44, P180.F2.T18): Empresas e Segurança são sempre as ÚLTIMAS opções, nessa ordem, logo acima do sgUserMenu.
export const navItems: NavItem[] = [
  // Backup self-service (extension seedgrid-backup): o ADMIN de cada filial exporta só os dados das suas empresas.
  { href: "/backup/export_list", label: "Backup", permission: "BACKUP_READ" },
  { href: "/dias-uteis", label: "Calendário da empresa", permission: "BUSINESS_DAY_READ" }, // só com a extension opcional business-days (FE-38)
  // Empresas: cadastro de negócio, item próprio logo acima do grupo Segurança (FE-40, P180.F0.D2).
  { href: "/security/companies/company_list", label: "Empresas", permission: "COMPANY_READ" },
  // FE-40: o menu tem sempre o grupo "Segurança" (igual ao admin); item de segurança solto na raiz é erro.
  {
    href: "/security",
    label: "Segurança",
    children: [
      { href: "/security/users/user_list", label: "Usuários", permission: "USER_READ" },
      // Convite: SELFENTER_INVITE é a permissão de abrir a tela (as de aprovar/reprovar só liberam a
      // seção de aprovações dentro dela), igual ao admin.
      { href: "/security/self-enter", label: "Convidar usuário externo", permission: "SELFENTER_INVITE" },
      { href: "/security/roles/role_list", label: "Perfis", permission: "ROLE_READ" },
      { href: "/security/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
      { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
    ],
  },
];
