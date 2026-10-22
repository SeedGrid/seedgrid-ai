/**
 * Mapa "permissao -> onde ela e usada", na MESMA hierarquia do menu (ver app/data.ts).
 *
 * Existe porque a lista de permissoes que vem do backend e chapada: 70+ linhas ordenadas por
 * nome, sem dizer de qual tela cada uma e. Montar um perfil virava caca-palavras. Aqui cada
 * permissao ganha o rotulo do BOTAO como ele aparece na tela ("Reverter publicacao", nao
 * "AI_CONFIG_ROLLBACK"), pendurado no item de menu correspondente.
 *
 * Regras pra manter isso vivo:
 *  - a ordem dos grupos e telas segue `navItems` (app/data.ts) — se o menu mudar, mude aqui;
 *  - a PRIMEIRA acao de cada tela e sempre a de abrir a tela (a permission do menu);
 *  - permissao que existe no banco e nao esta aqui NAO some da tela: cai em "Outras permissoes"
 *    (ver buildPermissionTree). Extensions novas (apikeys, backup...) chegam por ai.
 */

import type { SgTreeNode } from "@seedgrid/fe-components";

export type PermissionAction = {
  /** Nome tecnico, como esta na tabela `permissions`. */
  permission: string;
  /** Rotulo do botao/acao como aparece na tela. */
  label: string;
};

export type PermissionScreen = {
  id: string;
  label: string;
  actions: PermissionAction[];
};

export type PermissionMenuGroup = {
  id: string;
  label: string;
  screens: PermissionScreen[];
};

/**
 * Extraidas de `app/security/roles/role_edit/page.tsx` pra serem reutilizadas por qualquer tela
 * que monte uma arvore de permissoes marcavel (hoje: edicao de role e edicao de PlanTerm/Planos).
 */

/** Ids dos galhos (grupo de menu e tela). Folha = permissao, e o id dela e o publicId. */
export function branchIds(nodes: SgTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children?.length ? [node.id, ...branchIds(node.children)] : [],
  );
}

/**
 * Filtro da arvore. Diferente do `searchable` embutido do SgTreeView num ponto que importa aqui:
 * quando o GALHO casa (ex.: "Config de IA"), o filtro embutido mostra o galho VAZIO — e o fluxo
 * mais comum desta tela e justamente "quero ver o que essa tela tem". Aqui galho que casa vem com
 * a subarvore inteira.
 */
export function filterTree(nodes: SgTreeNode[], query: string): SgTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return nodes;
  }
  const result: SgTreeNode[] = [];
  for (const node of nodes) {
    if (node.label.toLowerCase().includes(q)) {
      result.push(node);
      continue;
    }
    const children = node.children?.length ? filterTree(node.children, q) : [];
    if (children.length) {
      result.push({ ...node, children });
    }
  }
  return result;
}

const OPEN_SCREEN = "Abrir a tela";

export const PERMISSION_MENU_TREE: PermissionMenuGroup[] = [
  {
    id: "visao-geral",
    label: "Visao Geral",
    screens: [
      {
        id: "visao-geral/home",
        label: "Visao Geral",
        actions: [
          { permission: "ADMIN_HEALTH_READ", label: OPEN_SCREEN },
          { permission: "FINANCE_READ", label: "Ver o painel financeiro (receita/compras)" },
        ],
      },
    ],
  },
  {
    id: "operacao",
    label: "Operacao",
    screens: [
      {
        id: "operacao/contas",
        label: "Contas",
        actions: [
          { permission: "ACCOUNT_READ", label: OPEN_SCREEN },
          { permission: "ACCOUNT_OPTIONS_READ", label: "Listar contas em combobox de outras telas" },
          { permission: "PARTNER_OPTIONS_READ", label: "Usar o filtro por parceiro" },
          { permission: "ACCOUNT_UPDATE", label: "Editar conta (parceiro de indicacao)" },
          { permission: "ACCOUNT_GRANT_USAGE", label: "Conceder cota de requisicoes" },
        ],
      },
      {
        id: "operacao/relatorios",
        label: "Relatorios",
        actions: [
          { permission: "ADMIN_REPORT_READ", label: OPEN_SCREEN },
          { permission: "PARTNER_OPTIONS_READ", label: "Usar o filtro por parceiro" },
          { permission: "ADMIN_REPORT_RENAME", label: "Renomear relatorio" },
          { permission: "ADMIN_REPORT_SPEC_REPLACE", label: "Substituir a spec (cria nova versao)" },
          { permission: "ADMIN_REPORT_DELETE", label: "Excluir relatorio" },
        ],
      },
      {
        id: "operacao/templates",
        label: "Templates de relatorio",
        actions: [
          { permission: "ADMIN_REPORT_TEMPLATE_READ", label: OPEN_SCREEN },
          { permission: "ADMIN_REPORT_TEMPLATE_CREATE", label: "Promover relatorio a template" },
          { permission: "ADMIN_REPORT_TEMPLATE_UPDATE", label: "Editar titulo/descricao" },
          { permission: "ADMIN_REPORT_TEMPLATE_PUBLISH", label: "Publicar / arquivar template" },
          { permission: "ADMIN_REPORT_TEMPLATE_DELETE", label: "Excluir template nunca copiado" },
        ],
      },
      {
        id: "operacao/ai-requests",
        label: "AI Requests",
        actions: [
          { permission: "AI_REQUEST_READ", label: OPEN_SCREEN },
          { permission: "AI_REQUEST_RETRY", label: "Reprocessar requisicao" },
          { permission: "AI_DIAGNOSTICS_READ", label: "Ver diagnostico do pipeline (so API, sem tela)" },
        ],
      },
      {
        id: "operacao/consumo-ia",
        label: "Consumo IA",
        actions: [{ permission: "AI_MODEL_USAGE_READ", label: OPEN_SCREEN }],
      },
      {
        id: "operacao/lucro",
        label: "Lucro por cliente",
        actions: [{ permission: "AI_PROFIT_READ", label: OPEN_SCREEN }],
      },
      {
        id: "operacao/assinaturas",
        label: "Assinaturas",
        actions: [
          { permission: "SUBSCRIPTION_READ", label: OPEN_SCREEN },
          { permission: "SUBSCRIPTION_CREATE", label: "Criar assinatura" },
        ],
      },
      {
        id: "operacao/consumo",
        label: "Consumo / Extrato IA",
        actions: [{ permission: "ADMIN_USAGE_READ", label: "Abrir as telas de consumo e extrato" }],
      },
    ],
  },
  {
    id: "comercial",
    label: "Comercial",
    screens: [
      {
        id: "comercial/planos",
        label: "Planos",
        actions: [
          { permission: "PLAN_READ", label: OPEN_SCREEN },
          { permission: "PLAN_CREATE", label: "Criar plano" },
          { permission: "PLAN_UPDATE", label: "Editar plano" },
          { permission: "PLAN_DELETE", label: "Excluir plano" },
        ],
      },
      {
        id: "comercial/trial",
        label: "Trial / Condicoes comerciais",
        actions: [
          { permission: "PLAN_TERM_READ", label: OPEN_SCREEN },
          { permission: "PLAN_TERM_CREATE", label: "Criar condicao comercial" },
          { permission: "PLAN_TERM_UPDATE", label: "Editar condicao comercial" },
          { permission: "PLAN_TERM_PUBLISH", label: "Publicar no provedor (Stripe)" },
          { permission: "PLAN_TERM_ARCHIVE", label: "Aposentar condicao comercial" },
          { permission: "PLAN_TERM_DELETE", label: "Excluir condicao comercial" },
        ],
      },
      {
        id: "comercial/parceiros",
        label: "Parceiros",
        actions: [
          { permission: "PARTNER_READ", label: OPEN_SCREEN },
          { permission: "PARTNER_CREATE", label: "Criar parceiro" },
          { permission: "PARTNER_UPDATE", label: "Editar parceiro" },
          { permission: "PARTNER_DELETE", label: "Excluir parceiro" },
        ],
      },
    ],
  },
  {
    id: "configuracao-ia",
    label: "Configuracao > IA",
    screens: [
      {
        id: "configuracao-ia/modelos",
        label: "Modelos de IA",
        actions: [
          { permission: "AI_MODEL_READ", label: OPEN_SCREEN },
          { permission: "AI_MODEL_CREATE", label: "Criar modelo" },
          { permission: "AI_MODEL_UPDATE", label: "Editar modelo" },
          { permission: "AI_MODEL_DELETE", label: "Excluir modelo" },
          { permission: "AI_MODEL_PRICE_CREATE", label: "Lancar preco do modelo" },
        ],
      },
      {
        id: "configuracao-ia/config",
        label: "Config de IA",
        actions: [
          { permission: "AI_CONFIG_READ", label: "Abrir a tela (assets, versoes, publicacoes)" },
          { permission: "AI_CONFIG_DIFF", label: "Ver diff / Comparar versoes" },
          { permission: "AI_CONFIG_DOWNLOAD", label: "Baixar asset/catalogo" },
          { permission: "AI_CONFIG_UPDATE", label: "Salvar rascunho" },
          { permission: "AI_CONFIG_DISCARD", label: "Descartar as minhas alteracoes" },
          { permission: "AI_CONFIG_DISCARD_ALL", label: "Descartar tudo (de todo mundo)" },
          { permission: "AI_CONFIG_PUBLISH", label: "Publicar" },
          { permission: "AI_CONFIG_ROLLBACK", label: "Reverter publicacao" },
        ],
      },
      {
        id: "configuracao-ia/fases",
        label: "Fases de IA",
        actions: [
          { permission: "AI_STEP_MODEL_READ", label: OPEN_SCREEN },
          { permission: "AI_STEP_MODEL_UPDATE", label: "Definir modelo de uma etapa" },
          { permission: "AI_STEP_MODEL_DELETE", label: "Remover override de etapa" },
        ],
      },
      {
        id: "configuracao-ia/precos-modelo",
        label: "IA de precos",
        actions: [
          { permission: "AI_PRICING_MODEL_READ", label: OPEN_SCREEN },
          { permission: "AI_PRICING_MODEL_UPDATE", label: "Definir modelo do interpretador de precos" },
        ],
      },
      {
        id: "configuracao-ia/griddy",
        label: "IA do Griddy",
        actions: [
          { permission: "AI_ASSISTANT_MODEL_READ", label: OPEN_SCREEN },
          { permission: "AI_ASSISTANT_MODEL_UPDATE", label: "Definir modelo do assistente" },
        ],
      },
      {
        id: "configuracao-ia/griddy-analise",
        label: "IA do Griddy (Analise)",
        actions: [
          { permission: "AI_ASSISTANT_ANALYZE_READ", label: OPEN_SCREEN },
          { permission: "AI_ASSISTANT_ANALYZE_UPDATE", label: "Definir modelo do diagnostico" },
        ],
      },
    ],
  },
  {
    id: "configuracao-precos",
    label: "Configuracao > Precos",
    screens: [
      {
        id: "configuracao-precos/robo",
        label: "Robo de precos / Precos IA (aprovacao)",
        actions: [{ permission: "AI_PRICE_APPROVE", label: "Abrir as telas e aprovar preco" }],
      },
    ],
  },
  {
    id: "configuracao-banco",
    label: "Configuracao > Banco do cliente",
    screens: [
      {
        id: "configuracao-banco/config",
        label: "Banco do cliente",
        actions: [
          { permission: "CLIENT_DB_CONFIG_READ", label: OPEN_SCREEN },
          { permission: "ACCOUNT_OPTIONS_READ", label: "Escolher a conta no seletor" },
          { permission: "CLIENT_DB_CONFIG_UPDATE", label: "Definir a config do banco local" },
        ],
      },
    ],
  },
  {
    id: "configuracao-moedas",
    label: "Configuracao > Moedas",
    screens: [
      {
        id: "configuracao-moedas/moedas",
        label: "Moedas",
        actions: [
          { permission: "CURRENCY_READ", label: OPEN_SCREEN },
          { permission: "CURRENCY_CREATE", label: "Cadastrar moeda" },
          { permission: "CURRENCY_UPDATE", label: "Editar moeda (fonte, cron, retry)" },
          { permission: "CURRENCY_DELETE", label: "Excluir moeda" },
        ],
      },
      {
        id: "configuracao-moedas/cotacao",
        label: "Cotacao de moedas",
        actions: [
          { permission: "CURRENCY_RATE_READ", label: OPEN_SCREEN },
          { permission: "CURRENCY_RATE_UPDATE", label: "Reprocessar / lancar cotacao do dia" },
        ],
      },
    ],
  },
  {
    id: "configuracao-notificacoes",
    label: "Configuracao > Notificacoes",
    screens: [
      {
        id: "configuracao-notificacoes/events",
        label: "Notificacoes",
        actions: [
          { permission: "NOTIFICATION_READ", label: OPEN_SCREEN },
          { permission: "NOTIFICATION_UPDATE", label: "Configurar eventos e destinatarios" },
        ],
      },
    ],
  },
  {
    id: "plataforma",
    label: "Plataforma",
    screens: [
      {
        id: "plataforma/backup",
        label: "Backup / Export",
        actions: [
          { permission: "BACKUP_READ", label: OPEN_SCREEN },
          { permission: "BACKUP_CREATE", label: "Criar job de exportacao" },
          { permission: "BACKUP_DOWNLOAD", label: "Baixar backup" },
          { permission: "BACKUP_DELETE", label: "Apagar job de backup" },
        ],
      },
    ],
  },
  {
    id: "seguranca",
    label: "Seguranca",
    screens: [
      {
        id: "seguranca/usuarios",
        label: "Usuarios",
        actions: [
          { permission: "USER_READ", label: OPEN_SCREEN },
          { permission: "USER_CREATE", label: "Criar usuario" },
          { permission: "USER_UPDATE", label: "Editar usuario" },
          { permission: "USER_DELETE", label: "Excluir usuario" },
          { permission: "USER_CHANGE_PASSWORD", label: "Alterar senha de usuario" },
        ],
      },
      {
        id: "seguranca/self-enter",
        label: "Convidar usuario externo",
        actions: [
          { permission: "SELFENTER_INVITE", label: "Abrir a tela e convidar" },
          { permission: "SELFENTER_APPROVE", label: "Aprovar solicitacao" },
          { permission: "SELFENTER_REJECT", label: "Rejeitar solicitacao" },
        ],
      },
      {
        id: "seguranca/perfis",
        label: "Perfis",
        actions: [
          { permission: "ROLE_READ", label: OPEN_SCREEN },
          { permission: "ROLE_CREATE", label: "Criar perfil" },
          { permission: "ROLE_UPDATE", label: "Editar perfil" },
          { permission: "ROLE_DELETE", label: "Excluir perfil" },
        ],
      },
      {
        id: "seguranca/apikeys",
        label: "API Keys",
        actions: [
          { permission: "APIKEY_READ", label: OPEN_SCREEN },
          { permission: "APIKEY_CREATE", label: "Criar API Key" },
          { permission: "APIKEY_REVOKE", label: "Revogar API Key" },
        ],
      },
      {
        id: "seguranca/auditoria",
        label: "Auditoria",
        actions: [{ permission: "LOG_READ", label: OPEN_SCREEN }],
      },
    ],
  },
];

/** Toda permissao que o mapa conhece, pra separar o que cai em "Outras permissoes". */
export const MAPPED_PERMISSION_NAMES: ReadonlySet<string> = new Set(
  PERMISSION_MENU_TREE.flatMap((group) =>
    group.screens.flatMap((screen) => screen.actions.map((action) => action.permission)),
  ),
);
