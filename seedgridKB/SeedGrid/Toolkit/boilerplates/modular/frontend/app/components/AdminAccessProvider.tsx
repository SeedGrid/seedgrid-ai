"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ADMIN_ROLE, type AdminPermission } from "@/lib/admin-permissions";
import { isCompanyDisabledSessionResponse, isSessionRevokedResponse } from "@/lib/api-error";
import {
  isReadOnlyMode,
  isWritePermission,
  normalizeAccessMode,
  type CompanyAccessMode,
  type CurrentCompany,
} from "@/lib/company-access";
import { installCompanyAccessFetchGuard } from "@/lib/company-access-guard";
import type { AdminMePermissions } from "@/lib/seedgrid-app-api";

type AdminAccessContextValue = {
  loading: boolean;
  me: AdminMePermissions | null;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: AdminPermission | string) => boolean;
  /**
   * Sessao vencida: o redirect para o login ja foi disparado e a tela atual esta de saida. A Shell
   * usa isso para NAO desenhar o menu enquanto isso — sem permissoes, ele sairia vazio, e era esse
   * "menu com so' Meu perfil/Temas/Sair" que o usuario via em vez do aviso de sessao expirada.
   */
  sessionExpired: boolean;
  /** Rebusca o `me` sem navegar — quem muda o proprio perfil (foto, nome) chama isso. */
  refresh: () => void;
  /** Empresa corrente da sessao (`AuthResponse.currentCompany`); null = ainda nao carregou/backend antigo. */
  currentCompany: CurrentCompany | null;
  /** Estado de acesso da empresa corrente (ACTIVE quando desconhecido). */
  companyAccessMode: CompanyAccessMode;
  /** Empresa em somente leitura: faixa visivel e permissoes de escrita negadas por `hasPermission`. */
  readOnly: boolean;
  /** Atalho: `!readOnly`. Use em botoes de escrita que nao dependem de uma permissao especifica. */
  canWrite: boolean;
};

const AdminAccessContext = createContext<AdminAccessContextValue>({
  loading: true,
  me: null,
  hasRole: () => false,
  hasPermission: () => false,
  sessionExpired: false,
  refresh: () => {},
  currentCompany: null,
  companyAccessMode: "ACTIVE",
  readOnly: false,
  canWrite: true,
});

type AdminAccessProviderProps = {
  children: ReactNode;
};

/**
 * Espera entre as tentativas do /auth/me quando a API esta indisponivel. Cobre ~5s, que e' a
 * ordem de grandeza de um restart de container — passou disso, a tela segue com o que ja tinha em
 * vez de fingir que a pessoa foi deslogada.
 */
const RETRY_DELAYS_MS = [800, 1600, 2400];

/**
 * Telas que abrem SEM sessao (mesma lista do `proxy.ts`). Nelas nao ha `me` para buscar, e o 401
 * e' o estado esperado — perguntar por permissoes so' renderia um "sessao expirada" no login.
 */
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth/")
  );
}

export function AdminAccessProvider({ children }: AdminAccessProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AdminMePermissions | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Um 401 costuma chegar por varias chamadas ao mesmo tempo; sem o guard, cada uma empurraria
  // seu proprio replace para o login (e o toast sairia repetido).
  const expiredRef = useRef(false);
  // Um 403 COMPANY_READ_ONLY prova que a empresa virou somente leitura mesmo que o `me` ainda diga
  // ACTIVE (o estado mudou depois do login). Vale para a empresa em que foi observado.
  const [forcedReadOnlyFor, setForcedReadOnlyFor] = useState<string | null>(null);

  const loadPermissions = useCallback(async (signal?: AbortSignal) => {
    // API fora do ar (deploy, restart) devolve 5xx/502 por alguns segundos. Antes, QUALQUER
    // resposta nao-ok zerava as permissoes: o menu inteiro sumia e as telas diziam "sem
    // permissao", como se a pessoa tivesse sido deslogada — bastava clicar em qualquer lugar pra
    // "voltar", porque a sessao nunca tinha caido. 401 = sessao invalida e 403 = sem permissao; o
    // resto e' indisponibilidade, e nesse caso o certo e' MANTER o que ja se sabe e tentar de novo.
    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt += 1) {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store", signal });
        if (response.ok) {
          setMe((await response.json()) as AdminMePermissions);
          setLoading(false);
          return;
        }
        // 401 = sessao expirada de verdade (o BFF ja tentou o refresh e ele falhou). O certo e'
        // mandar pro login com o aviso, nao renderizar a Shell degradada: o menu de navegacao
        // sumia inteiro e sobrava so' o menu do usuario ("Meu perfil", "Temas", "Sair"), o que
        // parecia perda de permissao em vez de sessao vencida.
        if (response.status === 401) {
          // SESSION_REVOKED: o BFF ja limpou a sessao sem tentar refresh; o login mostra a
          // mensagem "sessao encerrada" (e nao a de sessao vencida).
          const revoked = await isSessionRevokedResponse(response);
          const disabled = !revoked && (await isCompanyDisabledSessionResponse(response));
          setMe(null);
          setLoading(false);
          setSessionExpired(true);
          if (!expiredRef.current) {
            expiredRef.current = true;
            router.replace(
              revoked
                ? "/login?expired=revoked"
                : disabled
                  ? "/login?expired=disabled"
                  : "/login?expired=1",
            );
          }
          return;
        }
        // 403 = autenticado SEM permissao. A sessao esta viva; nao desloga.
        if (response.status === 403) {
          setMe(null);
          setLoading(false);
          return;
        }
        console.warn(`[admin-access] /api/auth/me devolveu HTTP ${response.status}; mantendo a sessao.`);
      } catch (err) {
        if (signal?.aborted) {
          return; // navegou pra outra pagina no meio da chamada — nao e' erro
        }
        console.warn("[admin-access] /api/auth/me falhou; mantendo a sessao.", err);
      }
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (signal?.aborted) {
        return;
      }
    }
    // Esgotou as tentativas: o `me` que ja existia continua valendo (a sessao nao caiu). Sai do
    // loading pra tela nao ficar em esqueleto eterno enquanto a API nao volta.
    setLoading(false);
  }, [router]);

  // Rebusca o `me` a CADA navegacao — a sessao pode ter trocado de usuario (logout +
  // login com outra conta). O cookie de sessao e httpOnly (nao observavel no client),
  // entao a navegacao e o sinal de "sessao pode ter mudado". Antes havia um guard
  // `me === null` que fazia o `me` do PRIMEIRO usuario grudar: apos logout + login com
  // outro, a tela seguia mostrando o usuario antigo. Refetch em background (nao mexe
  // em `loading` apos a 1a carga), entao nao pisca a UI a cada navegacao.
  useEffect(() => {
    // Nas telas publicas nao ha sessao a consultar; o 401 seria o estado normal e acabaria
    // disparando o aviso de "sessao expirada" em quem nunca esteve logado.
    if (isPublicPath(pathname)) {
      setMe(null);
      setLoading(false);
      // Chegou no login: o proximo 401 (depois de logar de novo) volta a poder avisar.
      expiredRef.current = false;
      setSessionExpired(false);
      return;
    }

    const controller = new AbortController();
    void loadPermissions(controller.signal);
    return () => controller.abort();
  }, [pathname, loadPermissions]);

  // Guarda de fetch (T5.6): reconhece COMPANY_READ_ONLY / COMPANY_DISABLED em qualquer chamada ao BFF.
  const currentCompanyId = me?.currentCompany?.publicId ?? "";
  useEffect(() => {
    return installCompanyAccessFetchGuard(window, {
      onReadOnly: () => setForcedReadOnlyFor(currentCompanyId),
      onDisabled: () => {
        // O BFF ja limpou a sessao; segue para o login com a mensagem de empresa desativada.
        setMe(null);
        setSessionExpired(true);
        if (!expiredRef.current) {
          expiredRef.current = true;
          router.replace("/login?expired=disabled");
        }
      },
    });
  }, [currentCompanyId, router]);

  const value = useMemo<AdminAccessContextValue>(() => {
    const roles = new Set(me?.roles ?? []);
    const permissions = new Set(me?.permissions ?? []);
    // Root na empresa-plataforma tem acesso total no backend; sem espelhar isso aqui, um root sem
    // a role ADMIN veria o menu vazio.
    const unrestricted = me?.isRoot === true || roles.has(ADMIN_ROLE);

    const currentCompany = me?.currentCompany ?? null;
    const companyAccessMode: CompanyAccessMode =
      forcedReadOnlyFor !== null && forcedReadOnlyFor === currentCompanyId
        ? "READ_ONLY"
        : normalizeAccessMode(currentCompany?.accessMode);
    const readOnly = isReadOnlyMode(companyAccessMode);

    return {
      loading,
      me,
      hasRole: (role) => roles.has(role),
      // Somente leitura: as permissoes que ALTERAM dados somem para as telas (botoes de escrita
      // ficam ocultos). O servidor continua sendo a garantia (403 COMPANY_READ_ONLY).
      hasPermission: (permission) =>
        !(readOnly && isWritePermission(permission)) &&
        (unrestricted || permissions.has(permission)),
      sessionExpired,
      refresh: () => void loadPermissions(),
      currentCompany,
      companyAccessMode,
      readOnly,
      canWrite: !readOnly,
    };
  }, [loading, me, sessionExpired, loadPermissions, forcedReadOnlyFor, currentCompanyId]);

  return (
    <AdminAccessContext.Provider value={value}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
