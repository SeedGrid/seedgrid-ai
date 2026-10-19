"use client";

import { useState } from "react";

import { SgButton } from "@seedgrid/fe-components";
import { useSgTheme } from "@seedgrid/fe-theme";
import { Moon, Pipette, Sun, X } from "lucide-react";

import { useThemePersistence } from "../theme/themePersistence";

// Swatches de cor primaria oferecidos como atalho. O ultimo item da linha e o
// seletor de cor personalizada (color picker nativo).
const PRESETS = [
  "#2563eb", // azul
  "#4f46e5", // indigo
  "#7c3aed", // violeta
  "#c026d3", // fucsia
  "#db2777", // rosa
  "#dc2626", // vermelho
  "#ea580c", // laranja
  "#d97706", // ambar
  "#16a34a", // verde
  "#059669", // esmeralda
  "#0d9488", // teal
  "#0891b2", // ciano
  "#475569", // grafite
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ThemeView({ onClose }: { readonly onClose?: () => void }) {
  const { currentTheme, currentMode, setTheme, setMode } = useSgTheme();
  const persistTheme = useThemePersistence();
  const [seed, setSeed] = useState(currentTheme.seed ?? "#0891b2");

  function applySeed(next: string) {
    setSeed(next);
    // Live preview: update the running theme immediately.
    setTheme({ seed: next });
  }

  // Alterna claro/escuro (Sun <-> Moon). Persiste na hora pelo SgEnvironment, junto
  // com o seed atual, para o modo "grudar" mesmo sem clicar em Salvar.
  function toggleMode() {
    const next = currentMode === "dark" ? "light" : "dark";
    setMode(next);
    persistTheme({ seed, mode: next });
  }

  function handleSave() {
    setTheme({ seed });
    persistTheme({ seed, mode: currentMode });
    onClose?.();
  }

  const isDark = currentMode === "dark";

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-md rounded-sg border border-sg-border bg-sg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-sg-text">Personalizar Tema</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMode}
              aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
              title={isDark ? "Modo escuro (clique para claro)" : "Modo claro (clique para escuro)"}
              className="flex h-8 w-8 items-center justify-center rounded-sg text-sg-muted transition-colors hover:bg-sg-muted-surface hover:text-sg-text"
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              aria-label="Fechar"
              title="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-sg text-sg-muted transition-colors hover:bg-sg-muted-surface hover:text-sg-text"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <Section label="Cores primárias">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Usar a cor ${color}`}
                title={color}
                onClick={() => applySeed(color)}
                className={[
                  "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                  seed.toLowerCase() === color.toLowerCase() ? "border-sg-text" : "border-transparent",
                ].join(" ")}
                style={{ backgroundColor: color }}
              />
            ))}

            {/* Cor personalizada: abre o color picker nativo e joga a cor escolhida no campo. */}
            <label
              title="Cor personalizada (abrir seletor)"
              aria-label="Escolher uma cor personalizada"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-sg-border text-sg-muted transition-transform hover:scale-110 hover:text-sg-text"
            >
              <Pipette size={14} />
              <input
                type="color"
                value={HEX_RE.test(seed) ? seed : "#0891b2"}
                onChange={(event) => applySeed(event.target.value)}
                className="sr-only"
              />
            </label>
          </div>
          <input
            className="w-full rounded-sg border border-sg-border bg-sg-bg px-3 py-2 text-sm"
            value={seed}
            onChange={(event) => applySeed(event.target.value)}
            placeholder="#0891b2"
            title="Código hex da cor primária (ex.: #0891b2)"
          />
        </Section>

        <div title="Aplicar e salvar o tema atual">
          <SgButton severity="primary" appearance="solid" onClick={handleSave} className="mt-2 w-full">
            Salvar tema
          </SgButton>
        </div>

        <div
          className="mt-3 flex items-center justify-center rounded-sg py-2 text-sm font-medium text-white"
          style={{ backgroundColor: seed }}
          title="Prévia da cor primária"
        >
          {seed}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sg-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
