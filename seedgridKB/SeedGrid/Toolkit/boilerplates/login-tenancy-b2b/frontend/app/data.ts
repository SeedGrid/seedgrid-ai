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
// lateral tem so' os itens de seguranca (na MESMA ordem do grupo Seguranca do admin) e o exemplo de
// consumo; o resto (Meu perfil, Minha assinatura, Temas, Sair) vive no `sgUserMenu` do Shell.tsx.
//
// Nada de Visao Geral, Contas, Comercial, Precos, Moedas nem Plataforma: tudo isso e' backoffice e
// fica no admin. Convidar usuario externo e API Keys existem nos dois lados: aqui o convite traz a
// pessoa para a empresa corrente, e a chave age so' dentro dela.
//
// As permissoes sao as do catalogo das extensions (`USER_READ`, `ROLE_READ`, `LOG_READ`,
// `SELFENTER_INVITE`, `APIKEY_READ`) — as mesmas que os controllers cobram no `@PermissionsAllowed`.
// Rota de menu que nao bate com a rota real e' 404 garantido (PLAN.md §8.7): cada `href` aqui tem
// um `app/<href>/page.tsx` correspondente.
export const navItems: NavItem[] = [
  { href: "/security/users/user_list", label: "Usuarios", permission: "USER_READ" },
  { href: "/security/self-enter", label: "Convidar usuario externo", permission: "SELFENTER_INVITE" },
  { href: "/security/roles/role_list", label: "Perfis", permission: "ROLE_READ" },
  { href: "/security/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
  { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
  // Calendario de dias uteis (extension seedgrid-business-days: /business-days/*). O grupo desce ate o
  // primeiro filho visivel; as telas de leitura pedem a mesma permissao.
  {
    href: "/dias-uteis",
    label: "Dias uteis",
    children: [
      { href: "/dias-uteis/holiday_list", label: "Feriados", permission: "BUSINESS_DAY_READ" },
      { href: "/dias-uteis/week_profile", label: "Semana de trabalho", permission: "BUSINESS_DAY_READ" },
      { href: "/dias-uteis/holiday_reference", label: "Lista de referencia", permission: "BUSINESS_DAY_READ" },
      { href: "/dias-uteis/work_override_list", label: "Vai trabalhar", permission: "BUSINESS_DAY_READ" },
      { href: "/dias-uteis/calendar", label: "Calendario", permission: "BUSINESS_DAY_READ" },
    ],
  },
  // Demonstracao dos contadores de uso (backend: demo/UsageDemoResource.java). Remova junto com o dominio
  // de exemplo (e a permissao USAGE_DEMO_READ, migration V3002) ao comecar o seu produto.
  { href: "/exemplo-consumo", label: "Exemplo de consumo", permission: "USAGE_DEMO_READ" },
];
