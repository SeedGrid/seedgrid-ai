"use client";

import {
  SgComponentsI18nProvider,
  SgEnvironmentProvider,
  SgRealtimeProvider,
  SgToaster,
  createLocalStorageStrategy,
} from "@seedgrid/fe-components";
import { SeedThemeProvider } from "@seedgrid/fe-theme";
import { ReactNode } from "react";

import { AdminAccessProvider, useAdminAccess } from "./AdminAccessProvider";
import { ThemePersistenceBridge } from "../theme/themePersistence";

const persistenceStrategy = createLocalStorageStrategy({
  prefix: "seedgrid-app-admin",
});

type ProvidersProps = {
  children: ReactNode;
};

// Channels do SeedGrid Pulse que o admin ouve. O token vem de /api/realtime/connect (BFF ->
// POST /realtime/connect); com o realtime desligado no backend, o provider nem abre o WebSocket.
const REALTIME_CHANNELS = ["backup"];

// So' conecta com sessao valida: na tela de login o pedido de token daria 401 a toa.
function AdminRealtime({ children }: { children: ReactNode }) {
  const { me, sessionExpired } = useAdminAccess();
  return (
    <SgRealtimeProvider channels={REALTIME_CHANNELS} enabled={me !== null && !sessionExpired}>
      {children}
    </SgRealtimeProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SeedThemeProvider
      applyTo="html"
      initialTheme={{
        seed: "#c96a2d",
        mode: "light",
        radius: 20,
        persistMode: true,
        customVars: {
          "--sg-btn-filled-bg": "201 106 45",
          "--sg-btn-filled-hover-bg": "167 80 32",
          "--sg-btn-filled-active-bg": "146 68 27",
          "--sg-btn-filled-fg": "255 255 255",
          "--sg-btn-outline-fg": "23 24 28",
          "--sg-btn-outline-border": "201 106 45",
          "--sg-btn-outline-hover-bg": "248 244 240",
          "--sg-btn-ghost-fg": "23 24 28",
          "--sg-btn-ghost-hover-bg": "248 244 240",
        },
      }}
    >
      <AdminAccessProvider>
        <AdminRealtime>
          <SgComponentsI18nProvider locale="pt-BR">
            <SgEnvironmentProvider
              value={{
                namespaceProvider: {
                  getNamespace: () => "seedgrid-app",
                },
                persistence: {
                  scope: "admin-web",
                  mode: "fallback",
                  stateVersion: 1,
                },
                persistenceStrategy,
              }}
            >
              <ThemePersistenceBridge />
              {children}
              <SgToaster />
            </SgEnvironmentProvider>
          </SgComponentsI18nProvider>
        </AdminRealtime>
      </AdminAccessProvider>
    </SeedThemeProvider>
  );
}
