"use client";

import { useCallback, useEffect, useRef } from "react";

import { useSgPersistence } from "@seedgrid/fe-components";
import { useSgTheme, type Mode } from "@seedgrid/fe-theme";

// Chave do tema na persistencia do SgEnvironment (scope/namespace definidos no Providers).
export const THEME_STORAGE_KEY = "app-theme";

export type PersistedTheme = {
  seed?: string;
  mode?: Exclude<Mode, "auto">;
};

/**
 * Aplica, uma unica vez ao iniciar, o tema (seed + modo claro/escuro) salvo no
 * SgEnvironment. Deve ficar dentro de SeedThemeProvider E SgEnvironmentProvider.
 */
export function ThemePersistenceBridge() {
  const { setTheme } = useSgTheme();
  const { load } = useSgPersistence();
  const applied = useRef(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const loaded = (await load(THEME_STORAGE_KEY)) as PersistedTheme | null;
        if (!alive || applied.current || !loaded) return;
        applied.current = true;
        const next: PersistedTheme = {};
        if (loaded.seed) next.seed = loaded.seed;
        if (loaded.mode) next.mode = loaded.mode;
        if (next.seed || next.mode) setTheme(next);
      } catch {
        // persistencia indisponivel: segue com o tema inicial.
      }
    })();
    return () => {
      alive = false;
    };
  }, [load, setTheme]);

  return null;
}

/** Salva o tema (seed + modo) pelo SgEnvironment. */
export function useThemePersistence() {
  const { save } = useSgPersistence();
  return useCallback(
    (theme: PersistedTheme) => {
      void save(THEME_STORAGE_KEY, theme);
    },
    [save],
  );
}
