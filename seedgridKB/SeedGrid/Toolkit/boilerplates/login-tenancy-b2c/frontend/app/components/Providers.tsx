"use client";

import {
  SgEnvironmentProvider,
  SgToaster,
  createLocalStorageStrategy,
} from "@seedgrid/fe-components";
import { SeedThemeProvider } from "@seedgrid/fe-theme";
import { ReactNode } from "react";

import { AdminAccessProvider } from "./AdminAccessProvider";
import { CompanyAccessBar } from "./CompanyAccessBar";
import { ThemePersistenceBridge } from "../theme/themePersistence";

// O `SgComponentsI18nProvider` com `locale="pt-BR"` fixo saiu daqui: quem o monta agora e' o
// `LocaleProvider` copiado do pulse-ui, registrado em `app/layout.tsx` por fora deste arquivo.
// Deixar os dois deixaria dois providers de i18n aninhados, e o de dentro (este) venceria — o
// seletor de idioma nao teria efeito nenhum.
const persistenceStrategy = createLocalStorageStrategy({
  prefix: "seedgrid-app-client",
});

type ProvidersProps = {
  children: ReactNode;
};

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
        <SgEnvironmentProvider
          value={{
            namespaceProvider: {
              getNamespace: () => "seedgrid-app",
            },
            persistence: {
              scope: "client-web",
              mode: "fallback",
              stateVersion: 1,
            },
            persistenceStrategy,
          }}
        >
          <ThemePersistenceBridge />
          <CompanyAccessBar />
          {children}
          <SgToaster />
        </SgEnvironmentProvider>
      </AdminAccessProvider>
    </SeedThemeProvider>
  );
}
