---
tags: [seedgrid, front, pacote, fe-theme]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-theme
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# `@seedgrid/fe-theme`

Sistema de temas: gera paletas 50–900 a partir de uma cor *seed*, modos `light`/`dark`/`auto`, tokens CSS `--sg-*` (base + componentes), persistência da preferência e provider React. Inclui o provider/hook **legado** (`ThemeProvider`/`useTheme`) e um `AppShell` simples.

Relacionados: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]] · [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]] (persistência) · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos do fe-components]] (o CSS compilado embute o tema padrão).

## Pacote

| Campo | Valor (Confirmado em `package.json`) |
|---|---|
| Nome / versão | `@seedgrid/fe-theme` `0.3.0` |
| `exports` | só `.` → `./dist/index.js` / `./dist/index.d.ts` |
| `dependencies` | `@seedgrid/fe-core` (`workspace:*`) — usa `createLocalStorageStrategy` e o tipo `PersistenceStrategy` |
| `peerDependencies` | `react ^18.2.0 \|\| ^19.0.0` |
| Build | `tsc -p tsconfig.json && node ./scripts/copy-i18n.mjs && node ./scripts/build-ai-manifest.mjs` → `dist/`, `dist/i18n/pt-BR.json`, `dist/ai/seedgrid-theme.manifest.json` |
| Testes | nenhum diretório `tests/` |

## API exportada (`src/index.ts`)

| Export | Tipo | Fonte | Descrição |
|---|---|---|---|
| `SeedThemeProvider` | componente | `src/theme/ThemeProvider.tsx` | provider principal (ver abaixo) |
| `useSgTheme` | hook | idem | retorna `ThemeContextValue`; lança erro fora do provider |
| `ThemeProvider` | componente **@deprecated** | idem | provider legado baseado em HSL (`SeedGridThemeConfig`) |
| `useTheme` | hook **@deprecated** | idem | retorna `SeedGridThemeConfig` do provider legado |
| `Mode` | tipo | `src/theme/ThemeConfig.ts` | `"light" \| "dark" \| "auto"` |
| `SeedThemeInput` | tipo | idem | entrada do tema (tabela abaixo) |
| `ThemeVars` | tipo | idem | `Record<string,string>` |
| `ThemeContextValue` | tipo | idem | `{ vars, setTheme, setMode, currentMode, currentTheme }` |
| `SeedGridThemeConfig` | tipo (legado) | idem | `brand{name,logoUrl?}`, `colors{primary,onPrimary,…,foreground}`, `layout{sidebarWidth,radius}` |
| `defaultTheme` | const (legado) | idem | marca "SeedGrid", cores HSL, `sidebarWidth 260`, `radius 12` |
| `defaultSeedTheme` | const | idem | `{ seed: "#16803D", mode: "light", radius: 12, persistMode: true }` |
| `clamp`, `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hslToHex`, `relativeLuminance`, `contrastRatio`, `MIN_CONTRAST_RATIO`, `MAX_BG_ADJUST_STEPS`, `bestOnContrast`, `adjustBgForOnColor`, `pickOnColor`, `toRgbVarValue`, `shiftHue`, `buildScaleFromHex` | funções e constante | `src/theme/colorUtils.ts` | utilitários de cor; `contrastRatio(a, b)` devolve a razão WCAG (1 a 21); `MIN_CONTRAST_RATIO` é 4,5; `pickOnColor(bgHex)`: o texto sobre uma cor de fundo é escolhido por contraste calculado: tenta `#FFFFFF` e depois `#0B0B0C` e fica com o primeiro cuja razão de contraste WCAG com o fundo seja >= 4,5 (`MIN_CONTRAST_RATIO`, no Flutter `minContrastRatio`); se nenhum atingir, usa o de maior contraste. Antes da mudança (fe-components `45c413f`, fe-flutter `8572bc1`) o corte era a luminância 0,5. Cores médias (verdes claros, laranjas, vermelhos, azuis médios, cinzas) passam a ter texto preto onde antes tinham branco. Se nenhum dos dois alcança 4,5, `adjustBgForOnColor(bgHex)` clareia ou escurece o fundo em passos de 1% de luminosidade HSL, até `MAX_BG_ADJUST_STEPS` (15), na direção que atinge o mínimo com menos passos (empate: escurece), mantendo matiz e saturação; se nenhuma direção atinge, devolve o fundo original. `bestOnContrast(bgHex)` devolve o maior contraste entre os candidatos. `buildScaleFromHex(baseHex, mode, {boostS?, biasL?})` gera stops 50–900 |
| `getSystemMode` | função | `src/theme/themeGenerator.ts` | `prefers-color-scheme`; `"light"` em SSR |
| `generateThemeVars` | função | idem | `(input, resolvedMode) => ThemeVars` |
| `generateComponentTokens` | função | `src/theme/componentTokens.ts` | `(baseVars) => ThemeVars` aliases `--sg-btn-*`, `--sg-input-*`, `--sg-card-*`, `--sg-alert-*`, `--sg-table-*`, `--sg-menu-*`, `--sg-modal-*`… |
| `AppShell` | componente | `src/ui/AppShell.tsx` | layout sidebar + header + main; usa `useTheme()` **legado** |

### `SeedThemeInput`

| Campo | Tipo | Padrão | Comportamento |
|---|---|---|---|
| `seed` | `string` (`#RRGGBB`) | obrigatório | base da paleta primária; secundária = `shiftHue(seed,+35)`, terciária = `shiftHue(seed,+210)`; neutros "puxados" para o matiz da seed |
| `mode` | `Mode` | `"light"` (em `generateThemeVars`/provider) | `auto` segue o sistema e escuta `matchMedia` |
| `radius` | `number` (px) | `12` | gera `--radius` e `--sg-radius` |
| `warning`, `error`, `info`, `success` | `string` hex | gerado com matiz fixo (45°, 5°, 210°, 145°) | sobrescreve a base semântica |
| `customVars` | `Record<string,string>` | — | aplicado por último em `generateThemeVars` (sobrescreve variáveis) |
| `persistMode` | `boolean` | `undefined` (`true` no `defaultSeedTheme`) | se `true`, salva modo e `{seed,mode,radius}` |
| `persistenceStrategy` | `PersistenceStrategy` (fe-core) | `createLocalStorageStrategy()` | permite persistir via API (estratégia assíncrona) |

### `SeedThemeProvider` — props e comportamento (Confirmado)

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `initialTheme` | `SeedThemeInput` | `defaultSeedTheme` | tema inicial |
| `applyTo` | `"html" \| "wrapper"` | `"html"` | `html`: `style.setProperty` em `document.documentElement`; `wrapper`: variáveis inline em um `<div>` |
| `children` | `ReactNode` | — | — |

- Chaves de persistência: `sg:theme:mode` e `sg:theme:config` (na estratégia; o localStorage padrão não usa prefixo).
- Tema persistido **tem precedência** sobre `initialTheme` (exceto `persistMode` e `persistenceStrategy`, que vêm do inicial).
- Estratégias assíncronas: hidratação em `useEffect` após o primeiro render.
- `setTheme(partial)` mescla; `mode: "auto"` resolve via `getSystemMode()`. `setMode("light"|"dark")` salva se `persistMode`.

### Tokens CSS gerados
`generateThemeVars` produz, entre outros: `--sg-mode`, `--sg-bg`, `--sg-surface`, `--sg-muted-surface`, `--sg-border`, `--sg-ring`, `--sg-text`, `--sg-muted`, `--sg-disabled`, `--sg-on-disabled`, `--sg-link`, `--sg-link-hover`, `--sg-badge`, `--sg-on-badge`, `--sg-tooltip`, `--sg-on-tooltip`, escalas `--sg-{primary,secondary,tertiary,warning,error,info,success}-{50..900}`, `-hover` (= stop 600, todas as escalas) e `-active` (= stop 700, só primary/secondary/tertiary), `--sg-on-{primary,…}`, `--radius`, `--sg-radius`. O texto sobre fundo (`--sg-on-*`, `--primary-foreground`, `--destructive-foreground`, `--sg-badge-fg`) vem de `pickOnColor` sobre o tom 500. Cada botão de severidade (`primary`, `secondary`, `success`, `info`, `warning`, `danger` sobre o tom `error`, `help` sobre o `tertiary`) tem seis tokens: `--sg-btn-<papel>-bg`, `-fg`, `-hover-bg`, `-hover-fg`, `-active-bg`, `-active-fg`. Fundo normal = tom 600, hover = 700, active = 800; o fundo passa por `adjustBgForOnColor` e o texto de cada estado é calculado por `pickOnColor` sobre o próprio fundo daquele estado (contraste mínimo 4,5:1). Resultado relatado pela `front` (fe-components 0287d2f, fe-flutter 438e19a): dos 420 pares testados, 0 ficaram abaixo de 4,5; 71 trocaram a cor do texto; 13 fundos foram ajustados, no máximo 1,18 ponto percentual de luminosidade. Sem fundo válido, o texto cai no `--sg-on-*` (normal) ou no texto do estado normal (hover e active).

## Contrato real

- `useSgTheme()` retorna `{ vars, setTheme, setMode, currentMode, currentTheme }` (não há `seed` direto nem `reset`).
- `SeedThemeProvider` aceita `initialTheme`, `applyTo` e `children`; `seed`, `radius`, `customVars` etc. vão dentro de `initialTheme`.
- `AppShell` depende do `ThemeProvider` legado (`useTheme()` lança erro se ausente).

## Exemplo
Fonte: `packages/seedgrid-fe-theme/README.md` (uso básico) e `apps/showcase/src/app/layout.tsx`:

```tsx
import { SeedThemeProvider, useSgTheme } from "@seedgrid/fe-theme";

<SeedThemeProvider initialTheme={{ seed: "#16803D", mode: "auto", radius: 12, persistMode: true }}>
  {children}
</SeedThemeProvider>

function ThemeToggle() {
  const { currentMode, setMode } = useSgTheme();
  return <button onClick={() => setMode(currentMode === "light" ? "dark" : "light")}>Tema</button>;
}
```

Outros: `examples/ThemeDemo.tsx`, `tailwind.config.example.js` no pacote (não detalhados).
