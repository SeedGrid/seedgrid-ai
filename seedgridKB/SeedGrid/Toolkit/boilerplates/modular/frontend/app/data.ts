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

// Menu lateral do produto (modelo "modular"). Comeca vazio: cada tela de negocio entra aqui com o
// `href` e a permissao de READ que o backend cobra (`@PermissionsAllowed`). Rota de menu que nao
// bate com uma pagina real e' 404 garantido: cada `href` tem um `app/<href>/page.tsx`.
export const navItems: NavItem[] = [];
