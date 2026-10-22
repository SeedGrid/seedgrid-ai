"use client";

import {
  SgBreadcrumb,
  SgButton,
  SgMenu,
  SgPanel,
  SgScreen,
  SgStack,
} from "@seedgrid/fe-components";
import {
  Bell,
  Bot,
  CreditCard,
  DollarSign,
  LayoutGrid,
  Layers3,
  Palette,
  Settings,
  Lock,
  LogOut,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, type CSSProperties } from "react";

import { SeedGridLogo } from "./SeedGridLogo";
import { useAdminAccess } from "./AdminAccessProvider";
import { navItems, type NavItem } from "../data";
import { ADMIN_ROLE } from "@/lib/admin-permissions";

type ShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

// Largura do SgMenu (px) somada ao contentPadding do SgPanel (20px de cada lado)
// que o envolve, para a coluna do grid acompanhar exatamente o menu colapsado/expandido.
const SIDEBAR_MENU_COLLAPSED_WIDTH = 72;
const SIDEBAR_MENU_EXPANDED_WIDTH = 280;
const SIDEBAR_PANEL_PADDING = 20;

const iconByHref = {
  "/": <LayoutGrid size={16} />,
  "/comercial": <Layers3 size={16} />,
  "/configuracao/precos": <DollarSign size={16} />,
  "/configuracao/cambio-grupo": <DollarSign size={16} />,
  "/configuracao/moedas": <DollarSign size={16} />,
  "/configuracao/cambio": <DollarSign size={16} />,
  "/configuracao/notificacoes": <Bell size={16} />,
  "/plataforma": <Wrench size={16} />,
  "/security": <Lock size={16} />,
  "/security/users/user_list": <Users size={16} />,
  "/security/self-enter": <UserPlus size={16} />,
  "/security/roles/role_list": <ShieldCheck size={16} />,
  "/security/audit": <ShieldCheck size={16} />,
  "/accounts": <Users size={16} />,
  "/plans/plan_list": <CreditCard size={16} />,
  "/plans/plan_trial": <CreditCard size={16} />,
  "/subscriptions": <ShieldCheck size={16} />,
  "/ai/models/model_list": <Bot size={16} />,
  "/settings": <Settings size={16} />,
} as const;

function normalizeMenuPath(pathname: string): string {
  // Trial tem item proprio no menu; nao colapsa em Planos.
  if (pathname.startsWith("/plans/plan_trial")) {
    return "/plans/plan_trial";
  }

  if (pathname.startsWith("/plans/")) {
    return "/plans/plan_list";
  }

  if (pathname.startsWith("/ai/models/")) {
    return "/ai/models/model_list";
  }

  if (pathname.startsWith("/security/users/")) {
    return "/security/users/user_list";
  }

  if (pathname.startsWith("/security/roles/")) {
    return "/security/roles/role_list";
  }

  return pathname;
}

// Constroi os nos do SgMenu a partir do navItems, preservando a hierarquia (children).
// Itens-pai sem rota propria de conteudo navegam para o primeiro filho.
function toMenuNodes(items: NavItem[]): {
  id: string;
  label: string;
  url: string;
  icon?: ReactNode;
  children?: ReturnType<typeof toMenuNodes>;
}[] {
  return items.map((item) => ({
    id: item.href,
    label: item.label,
    url: resolveNavHref(item),
    icon: iconByHref[item.href as keyof typeof iconByHref],
    children: item.children ? toMenuNodes(item.children) : undefined,
  }));
}

// Rota de destino de um item: se for grupo, desce ate a primeira folha real
// (suporta grupos aninhados, cujo primeiro filho tambem pode ser um grupo).
function resolveNavHref(item: NavItem): string {
  if (item.children?.length) {
    return resolveNavHref(item.children[0]);
  }
  return item.href;
}

function canShowItem(
  item: NavItem,
  hasPermission: (permission: string) => boolean,
  hasRole: (role: string) => boolean,
): boolean {
  // Grupo (com filhos): aparece se tiver >=1 filho visivel — quem decide sao os
  // filhos (o filterNavItems dropa o grupo se sobrar 0). NAO gateie o grupo pelo seu
  // proprio href, senao some um grupo cujo filho o usuario PODE ver.
  if (item.children?.length) {
    return true;
  }
  // Leaf com permissao declarada: exige a permissao de read. Vale tambem para a home: o
  // dashboard tem permissao propria no backend (ADMIN_HEALTH_READ) e nao e' tela publica.
  if (item.permission) {
    return hasPermission(item.permission);
  }
  // Leaf de plataforma sem permissao dedicada no backend: so ADMIN.
  return hasRole(ADMIN_ROLE);
}

function filterNavItems(
  items: NavItem[],
  hasPermission: (permission: string) => boolean,
  hasRole: (role: string) => boolean,
): NavItem[] {
  return items.flatMap((item) => {
    if (!canShowItem(item, hasPermission, hasRole)) {
      return [];
    }

    if (!item.children?.length) {
      return [item];
    }

    const children = filterNavItems(item.children, hasPermission, hasRole);
    if (children.length === 0) {
      return [];
    }

    return [{ ...item, children }];
  });
}

/**
 * Primeira rota que esta pessoa PODE abrir — destino de quem cai numa tela sem acesso (a home,
 * tipicamente). Null quando nao sobra nada visivel: ai o certo e' dizer isso, nao redirecionar em
 * circulo.
 */
export function firstVisibleHref(
  hasPermission: (permission: string) => boolean,
  hasRole: (role: string) => boolean,
): string | null {
  const visible = filterNavItems(navItems, hasPermission, hasRole);
  return visible.length ? resolveNavHref(visible[0]) : null;
}

// Resolve a trilha ativa (do topo ate a folha) a partir do pathname, considerando
// sub-rotas e qualquer profundidade de aninhamento. Alimenta breadcrumb e expansao.
function resolveActiveTrail(items: NavItem[], pathname: string): NavItem[] | null {
  for (const item of items) {
    if (item.href === pathname) {
      return [item];
    }
    if (item.children?.length) {
      const childTrail = resolveActiveTrail(item.children, pathname);
      if (childTrail) {
        return [item, ...childTrail];
      }
    }
  }
  return null;
}

export function Shell({ title, eyebrow, description, children }: Readonly<ShellProps>) {
  const pathname = usePathname();
  const normalizedPathname = normalizeMenuPath(pathname);
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasPermission, hasRole, me, sessionExpired } = useAdminAccess();
  const visibleNavItems = filterNavItems(navItems, hasPermission, hasRole);
  const activeTrail = resolveActiveTrail(visibleNavItems, normalizedPathname);
  const breadcrumbItems = (activeTrail ?? []).map((item) => ({
    id: item.href,
    label: item.label,
    href: resolveNavHref(item),
  }));
  // Expande todos os grupos ancestrais da folha ativa (o item ativo em si nao tem filhos).
  const expandedIds = (activeTrail ?? [])
    .filter((item) => item.children?.length)
    .map((item) => item.href);

  function logout() {
    void fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/login");
      router.refresh();
    });
  }

  // Sessao vencida: o provider ja disparou o redirect para o login. Sem isso, o intervalo ate a
  // navegacao acontecer desenhava a Shell com o menu ZERADO (so' sobravam "Meu perfil", "Temas" e
  // "Sair", que sao itens fixos) — o usuario lia como perda de acesso, nao como sessao expirada.
  if (sessionExpired) {
    return <SgScreen className="shell-screen" fullscreen={false} padding={0} />;
  }

  return (
    <SgScreen className="shell-screen" fullscreen={false} padding={0}>
      <div
        className="shell-grid"
        style={{
          "--shell-sidebar-width": `${
            (sidebarCollapsed ? SIDEBAR_MENU_COLLAPSED_WIDTH : SIDEBAR_MENU_EXPANDED_WIDTH) +
            SIDEBAR_PANEL_PADDING * 2
          }px`,
        } as CSSProperties}
      >
        <SgPanel className="shell-sidebar" contentGap={20} contentPadding={SIDEBAR_PANEL_PADDING}>
          <SgMenu
            border={false}
            brand={{
              title: "SeedGrid App",
              image: <SeedGridLogo />,
              onClick: () => router.push("/"),
            }}
            className="shell-menu"
            collapsed={sidebarCollapsed}
            collapsedWidth={SIDEBAR_MENU_COLLAPSED_WIDTH}
            defaultExpandedIds={expandedIds.length ? expandedIds : undefined}
            expandedWidth={SIDEBAR_MENU_EXPANDED_WIDTH}
            menu={toMenuNodes(visibleNavItems)}
            menuStyle="sidebar"
            menuVariantStyle="panel"
            onCollapsedChange={setSidebarCollapsed}
            onNavigate={(node) => node.url && router.push(node.url)}
            search={{ enabled: true, placeholder: "Buscar area" }}
            showCollapseButton
            selection={{ activeUrl: normalizedPathname }}
            user={{
              name: me?.name ?? "Backoffice interno",
              subtitle: "Admin SeedGrid App",
              // So' pede a foto de quem TEM foto: o GET do avatar responde 404 para quem esta
              // sem avatarStorageKey, e o <img> quebrado sujava o console em toda tela — para,
              // no fim, cair no mesmo fallback de iniciais.
              avatarSrc:
                me?.userPublicId && me.hasAvatar
                  ? `/api/admin/security/users/${me.userPublicId}/avatar`
                  : undefined,
              onClick: () => router.push("/perfil"),
            }}
            userMenu={[
              {
                id: "profile",
                label: "Meu perfil",
                icon: <UserCog size={16} />,
                url: "/perfil",
              },
              {
                id: "themes",
                label: "Temas",
                hint: "Escolha e personalize o tema visual",
                icon: <Palette size={16} />,
                url: "/temas",
              },
              {
                id: "logout",
                label: "Sair",
                icon: <LogOut size={16} />,
                onClick: logout,
              },
            ]}
          />

          {!sidebarCollapsed && (
            <div className="sidebar-note">
              Operacao administrativa da plataforma.
            </div>
          )}
        </SgPanel>

        <SgStack className="shell-content" gap={20}>
          <SgPanel className="hero-panel" contentGap={18} contentPadding={28}>
            <SgStack align="center" direction="row" justify="between" wrap>
              <SgStack gap={12}>
                <SgBreadcrumb
                  homeHref="/"
                  homeLabel="Admin"
                  items={breadcrumbItems}
                  onNavigate={(item) => {
                    if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  showHomeIcon
                  size="sm"
                  variant="subtle"
                />

                <div>
                  <p className="eyebrow">{eyebrow}</p>
                  <h1 className="hero-title">{title}</h1>
                  <p className="lede">{description}</p>
                </div>
              </SgStack>
            </SgStack>
          </SgPanel>

          {children}
        </SgStack>
      </div>
    </SgScreen>
  );
}
