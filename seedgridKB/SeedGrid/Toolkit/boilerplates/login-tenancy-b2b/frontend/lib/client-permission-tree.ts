/**
 * Catalogo das permissoes do APP DO CLIENTE, na MESMA hierarquia do menu dele (frontend/app/data.ts e o
 * menu do usuario no Shell). Cada permissao ganha o rotulo da acao como aparece na tela.
 *
 * Mesmo arquivo em `frontend/lib` e `admin/lib` (mantenha os dois iguais):
 *  - frontend: arvore do editor de perfis da conta e o "olhinho" da lista de perfis. Permissao que
 *    nao esta aqui NAO aparece (o cliente so' ve o que existe no menu dele).
 *  - admin: arvore de "features liberadas" do plano (condicoes comerciais), sem os grupos que nao se
 *    vendem por plano (`seguranca`, `menu-usuario`).
 *
 * Regras pra manter isso vivo:
 *  - a ordem dos grupos e telas segue o menu do cliente — se o menu mudar, mude aqui (nos dois apps);
 *  - a PRIMEIRA acao de cada tela e a de abrir a tela (a permissao do item de menu);
 *  - tela nova no app do cliente = permissao nova (audience 'client') + entrada aqui.
 */

export type PermissionAction = {
  /** Nome tecnico, como esta na tabela `permissions`. */
  permission: string;
  /** Rotulo da acao como aparece na tela do cliente. */
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

const OPEN_SCREEN = "Abrir a tela";

export const CLIENT_PERMISSION_MENU_TREE: PermissionMenuGroup[] = [
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
        id: "seguranca/convites",
        label: "Convidar usuario externo",
        actions: [
          { permission: "SELFENTER_INVITE", label: `${OPEN_SCREEN}, convidar e reenviar convite` },
          { permission: "SELFENTER_APPROVE", label: "Aprovar cadastro" },
          { permission: "SELFENTER_REJECT", label: "Reprovar cadastro" },
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
          { permission: "APIKEY_CREATE", label: "Criar chave" },
          { permission: "APIKEY_REVOKE", label: "Revogar chave" },
        ],
      },
      {
        id: "seguranca/auditoria",
        label: "Auditoria",
        actions: [{ permission: "LOG_READ", label: OPEN_SCREEN }],
      },
    ],
  },
  {
    id: "dias-uteis",
    label: "Dias uteis",
    screens: [
      {
        id: "dias-uteis/feriados",
        label: "Feriados",
        actions: [
          { permission: "BUSINESS_DAY_READ", label: `${OPEN_SCREEN}, ver a semana de trabalho e o calendario` },
          { permission: "BUSINESS_DAY_CREATE", label: "Criar feriado" },
          { permission: "BUSINESS_DAY_UPDATE", label: "Editar feriado e a semana de trabalho" },
          { permission: "BUSINESS_DAY_DELETE", label: "Excluir feriado" },
        ],
      },
      {
        id: "dias-uteis/lista-referencia",
        label: "Lista de referencia",
        actions: [
          { permission: "BUSINESS_DAY_READ", label: OPEN_SCREEN },
          { permission: "BUSINESS_DAY_UPDATE", label: "Marcar ou desmarcar feriado movel e voltar a herdar" },
        ],
      },
      {
        id: "dias-uteis/vai-trabalhar",
        label: "Vai trabalhar",
        actions: [
          { permission: "BUSINESS_DAY_READ", label: OPEN_SCREEN },
          { permission: "BUSINESS_DAY_CREATE", label: "Criar data de trabalho" },
          { permission: "BUSINESS_DAY_UPDATE", label: "Editar data de trabalho" },
          { permission: "BUSINESS_DAY_DELETE", label: "Excluir data de trabalho" },
        ],
      },
    ],
  },
  {
    id: "exemplo-consumo",
    label: "Exemplo de consumo",
    screens: [
      {
        id: "exemplo-consumo/exemplo-consumo",
        label: "Exemplo de consumo",
        actions: [{ permission: "USAGE_DEMO_READ", label: `${OPEN_SCREEN}, fazer requisicoes e enviar arquivos` }],
      },
    ],
  },
  {
    id: "menu-usuario",
    label: "Minha assinatura (menu do usuario)",
    screens: [
      {
        id: "menu-usuario/assinatura",
        label: "Minha assinatura",
        actions: [
          { permission: "BILLING_CHECKOUT_CREATE", label: "Assinar ou trocar de plano" },
          { permission: "BILLING_PORTAL_CREATE", label: "Abrir o portal de pagamento" },
        ],
      },
    ],
  },
];

/** Toda permissao que o catalogo conhece: o que ficar fora nao aparece no app do cliente. */
export const CLIENT_MAPPED_PERMISSION_NAMES = new Set(
  CLIENT_PERMISSION_MENU_TREE.flatMap((group) =>
    group.screens.flatMap((screen) => screen.actions.map((action) => action.permission)),
  ),
);

/** Rotulo "Tela: acao" de uma permissao do catalogo; `null` se ela nao esta no menu do cliente. */
export function clientPermissionLabel(permissionName: string): string | null {
  for (const group of CLIENT_PERMISSION_MENU_TREE) {
    for (const screen of group.screens) {
      const action = screen.actions.find((candidate) => candidate.permission === permissionName);
      if (action) {
        return `${screen.label}: ${action.label}`;
      }
    }
  }
  return null;
}
