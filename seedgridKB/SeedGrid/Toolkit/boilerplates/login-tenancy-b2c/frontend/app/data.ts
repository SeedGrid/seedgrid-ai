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
// lateral tem só os itens de seguranca (na MESMA ordem do grupo Seguranca do admin) e o exemplo de
// consumo; o resto (Meu perfil, Minha assinatura, Temas, Sair) vive no `sgUserMenu` do Shell.tsx.
//
// Nada de Visao Geral, Contas, Comercial, Precos, Moedas nem Plataforma: tudo isso e' backoffice e
// fica no admin. Convidar usuario externo e API Keys existem nos dois lados: aqui o convite traz a
// pessoa para a empresa corrente, e a chave age só dentro dela.
//
// As permissoes sao as do catalogo das extensions (`USER_READ`, `ROLE_READ`, `LOG_READ`,
// `SELFENTER_INVITE`, `APIKEY_READ`) — as mesmas que os controllers cobram no `@PermissionsAllowed`.
// Rota de menu que nao bate com a rota real e' 404 garantido (PLAN.md §8.7): cada `href` aqui tem
// um `app/<href>/page.tsx` correspondente.
// B2C: uma conta = uma pessoa. Sem Usuarios, Convite de usuario externo e Perfis (só fazem sentido com empresa/equipe).
export const navItems: NavItem[] = [
  // FE-40: o menu tem sempre o grupo "Segurança" (igual ao admin); item de segurança solto na raiz é erro.
  {
    href: "/security",
    label: "Segurança",
    children: [
      { href: "/security/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
      { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
    ],
  },
  // Backup self-service (extension seedgrid-backup): o ADMIN de cada filial exporta só os dados das suas empresas.
  { href: "/backup/export_list", label: "Backup", permission: "BACKUP_READ" },
  { href: "/dias-uteis", label: "Calendário da empresa", permission: "BUSINESS_DAY_READ" }, // só com a extension opcional business-days (FE-38)
];
