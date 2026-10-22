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

export const navItems: NavItem[] = [
  // A home nao e' publica: o dashboard exige ADMIN_HEALTH_READ no backend, e sem o gate quem nao
  // tem a permissao via a tela desenhada com zeros/tracos (as chamadas voltam 403) — parecia uma
  // plataforma zerada em vez de "voce nao tem acesso".
  { href: "/", label: "Visao Geral", permission: "ADMIN_HEALTH_READ" },
  { href: "/accounts", label: "Contas", permission: "ACCOUNT_READ" },
  {
    href: "/comercial",
    label: "Comercial",
    children: [
      { href: "/plans/plan_list", label: "Planos", permission: "PLAN_READ" },
      { href: "/plans/plan_trial", label: "Trial", permission: "PLAN_TERM_READ" },
      { href: "/subscriptions", label: "Assinaturas", permission: "SUBSCRIPTION_READ" },
    ],
  },
  {
    href: "/configuracao/precos",
    label: "Precos",
    children: [
      { href: "/settings", label: "Robo de precos", permission: "AI_PRICE_APPROVE" },
      { href: "/ai/price-approvals", label: "Precos IA (aprovacao)", permission: "AI_PRICE_APPROVE" },
      // O robo aprova preco DE UM MODELO: sem a tela de catalogo, /ai/price-approvals aprova
      // algo que nao da' para cadastrar nem consultar.
      { href: "/ai/models/model_list", label: "Modelos de IA", permission: "AI_MODEL_READ" },
    ],
  },
  {
    href: "/configuracao/cambio-grupo",
    label: "Moedas",
    children: [
      { href: "/configuracao/moedas", label: "Moedas", permission: "CURRENCY_READ" },
      { href: "/configuracao/cambio", label: "Cotacao de moedas", permission: "CURRENCY_RATE_READ" },
    ],
  },
  {
    href: "/configuracao/notificacoes",
    label: "Notificacoes",
    permission: "NOTIFICATION_READ",
  },
  {
    href: "/plataforma",
    label: "Plataforma",
    children: [
      { href: "/exports/export_list", label: "Backup / Export", permission: "BACKUP_READ" },
    ],
  },
  {
    href: "/security",
    label: "Seguranca",
    children: [
      { href: "/security/users/user_list", label: "Usuarios", permission: "USER_READ" },
      { href: "/security/self-enter", label: "Convidar usuario externo", permission: "SELFENTER_INVITE" },
      { href: "/security/roles/role_list", label: "Perfis", permission: "ROLE_READ" },
      { href: "/apikeys/apikey_list", label: "API Keys", permission: "APIKEY_READ" },
      { href: "/security/audit", label: "Auditoria", permission: "LOG_READ" },
    ],
  },
];
