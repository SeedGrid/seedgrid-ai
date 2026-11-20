"use client";

// Barra superior fixa do app (FE-43, P180): igual à do showcase. À esquerda o título da página (e, no celular, o
// botão que abre o menu); à direita o sino de notificações, o tema (popover) e o modo escuro. Tema e modo escuro
// vivem só aqui: o menu do usuário não os repete.
//
// Sem seletor de idioma por enquanto (P180.F2.T12): as telas ainda não estão internacionalizadas, então trocar o
// idioma não traduziria os textos. As bandeiras voltam no P183 (o desenho está no histórico do git). O sino
// entra pelo slot `notifications`.
import { useSgTheme } from "@seedgrid/fe-theme";
import { Menu, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useThemePersistence } from "../theme/themePersistence";
import { ThemeView } from "./ThemeView";

type TopBarProps = {
  title: string;
  /** Só no celular (<= 800 px): abre o menu como gaveta. */
  onOpenMenu?: () => void;
  /** Sino de notificações (SgNotificationBell), só se o produto tem a extension. */
  notifications?: ReactNode;
};

export function TopBar({ title, onOpenMenu, notifications }: Readonly<TopBarProps>) {
  const { currentTheme, currentMode, setMode } = useSgTheme();
  const persistTheme = useThemePersistence();
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement | null>(null);
  const isDark = currentMode === "dark";

  // Popover do tema: fecha ao clicar fora e no Esc.
  useEffect(() => {
    if (!themeOpen) {
      return;
    }
    function onPointer(event: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [themeOpen]);

  function toggleMode() {
    const next = isDark ? "light" : "dark";
    setMode(next);
    persistTheme({ seed: currentTheme.seed, mode: next });
  }

  return (
    <header className="topbar" data-testid="app-topbar">
      <div className="topbar-left">
        {onOpenMenu ? (
          <button type="button" className="topbar-icon-btn topbar-menu-btn" aria-label="Abrir o menu" onClick={onOpenMenu}>
            <Menu size={18} />
          </button>
        ) : null}
        <span className="topbar-title" data-testid="app-topbar-title">
          {title}
        </span>
      </div>

      <div className="topbar-right">
        {notifications}

        <div className="topbar-theme" ref={themeRef}>
          <button
            type="button"
            className={`topbar-icon-btn${themeOpen ? " is-active" : ""}`}
            aria-label="Tema"
            aria-expanded={themeOpen}
            title="Tema"
            onClick={() => setThemeOpen((open) => !open)}
          >
            <Palette size={18} />
          </button>
          {themeOpen ? (
            <div className="topbar-popover" role="dialog" aria-label="Tema">
              <ThemeView showModeToggle={false} onClose={() => setThemeOpen(false)} />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="topbar-icon-btn"
          aria-label={isDark ? "Modo claro" : "Modo escuro"}
          title={isDark ? "Modo claro" : "Modo escuro"}
          onClick={toggleMode}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
