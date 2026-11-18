---
tags: [seedgrid, front, pacote, fe-theme]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-theme
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# `@seedgrid/fe-theme`

Sistema de temas: gera paletas 50–900 a partir de uma cor *seed*, modos `light`/`dark`/`auto`, tokens CSS `--sg-*` (base + componentes), persistência da preferência e provider React. Inclui o provider/hook **legado** (`ThemeProvider`/`useTheme`) e um `AppShell` simples.

Relacionados: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]] · [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]] (persistência) · [[SeedGrid/SeedGrid-components/react/fundamentos/Visao-geral|Fundamentos do fe-components]] (o CSS compilado embute o tema padrão).

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
| `clamp`, `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hslToHex`, `relativeLuminance`, `contrastRatio`, `MIN_CONTRAST_RATIO`, `MAX_BG_ADJUST_STEPS`, `bestOnContrast`, `adjustBgForOnColor`, `pickOnColor`, `toRgbVarValue`, `shiftHue`, `buildScaleFromHex`, `darkenForWhiteText`, `MAX_WHITE_TEXT_STEPS`, `fillShades`, `FILL_HOVER_STEP`, `FILL_ACTIVE_STEP`, `ON_COLOR_CANDIDATES`, `FIELD_MIN_CONTRAST`, `lightContrastOf`, `isLowContrastOnLight` (os nove últimos: ver "Contraste do vermelho de erro, do `info` e da cor de destaque") | funções e constante | `src/theme/colorUtils.ts` | utilitários de cor; `contrastRatio(a, b)` devolve a razão WCAG (1 a 21); `MIN_CONTRAST_RATIO` é 4,5; `pickOnColor(bgHex)`: o texto sobre uma cor de fundo é escolhido por contraste calculado: tenta `#FFFFFF` e depois `#0B0B0C` e fica com o primeiro cuja razão de contraste WCAG com o fundo seja >= 4,5 (`MIN_CONTRAST_RATIO`, no Flutter `minContrastRatio`); se nenhum atingir, usa o de maior contraste. Antes da mudança (fe-components `45c413f`, fe-flutter `8572bc1`) o corte era a luminância 0,5. Cores médias (verdes claros, laranjas, vermelhos, azuis médios, cinzas) passam a ter texto preto onde antes tinham branco. Se nenhum dos dois alcança 4,5, `adjustBgForOnColor(bgHex)` clareia ou escurece o fundo em passos de 1% de luminosidade HSL, até `MAX_BG_ADJUST_STEPS` (15), na direção que atinge o mínimo com menos passos (empate: escurece), mantendo matiz e saturação; se nenhuma direção atinge, devolve o fundo original. `bestOnContrast(bgHex)` devolve o maior contraste entre os candidatos. `buildScaleFromHex(baseHex, mode, {boostS?, biasL?})` gera stops 50–900 |
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

### Contraste do vermelho de erro, do `info` e da cor de destaque (2026-11-17 e 2026-11-18)

**Confirmado** em `src/theme/colorUtils.ts` e `src/theme/themeGenerator.ts` (fe-components `49f639f` e `312db25`; fe-flutter `4057800`, `5efec92` e `1cd9eb2`). O tema passa a **garantir texto BRANCO com razão WCAG >= 4,5:1** sobre o vermelho de erro e sobre o `info`, nos dois modos, escurecendo o fundo só o necessário (em vez de cair no texto preto):

- **`darkenForWhiteText(bgHex)`** (novo, exportado, e `darkenForWhiteText` no `seedgrid_theme`): escurece a cor em passos de 1% de luminosidade HSL, até o branco (`#FFFFFF`) alcançar `MIN_CONTRAST_RATIO` (4,5). **`MAX_WHITE_TEXT_STEPS`** (`maxWhiteTextSteps` no Flutter) limita os passos e vale **45** (eram 25: azuis claros não chegavam a 4,5). Sem alcançar no limite, devolve a melhor cor obtida.
- **Vermelho de erro:** o degrau 500 de `error` passa por `darkenForWhiteText`; `--destructive`, `--sg-error-500` e `--sg-on-error`/`--destructive-foreground` (`onError` no Flutter) ficam **sempre `#FFFFFF`**. Com a semente padrão: claro `#E7200D` (4,56:1) e escuro `#E62514` (4,53:1). **Não depende da cor de destaque** (idêntico nas 8 cores testadas) e é o **mesmo valor no React e no Flutter**: antes o selo `danger` mostrava o número preto sobre `#F33C2B`, ilegível. O `SgBadge` e o `SgAvatar` `danger` do Flutter passaram a ler `--destructive` e `--destructive-foreground`, como no React.
- **Botão `danger` e `info`:** o preenchimento (`--sg-error-fill*`, `--sg-info-fill*`) e `--sg-info-500` escurecem pelo mesmo cálculo; `--sg-on-info` é `#FFFFFF`. Valores com a semente padrão: botão `danger` claro `#E22412` (4,67:1) e escuro `#E6210F` (4,58:1); botão `info` claro `#1175D9` (4,59:1) e escuro `#1175DA` (4,58:1); selo e avatar `info` (500) claro `#0F76DC` (4,52:1) e escuro `#1576D5` (4,58:1). Hover e active escurecem a partir do valor normal (`FILL_HOVER_STEP` 6 e `FILL_ACTIVE_STEP` 12, via `fillShades`). O alerta (tons 100, 700 e 300) e o link (600 e 700) **não mudaram**.
- **Cor de destaque (semente):** o tema escolhe o tom da semente que atinge 4,5:1 (no claro escurece, no escuro clareia só o que falha) para o texto sobre fundo, o texto do contorno (tom 600) e o anel de foco; o fundo cheio de botão usa a **cor pura da semente** (`--primary-fill` e `--destructive-fill`). Vale para qualquer cor de destaque escolhida, inclusive amarelo e verde. O editor de tema do showcase oferece 7 cores predefinidas e a cor livre (com aviso de contraste); a cor livre aceita hex com ou sem `#`.
- **Quebra de visual (sem mudança de API):** quem tinha fixado a cor do vermelho de erro por fora vê o novo tom, mais escuro. Quem usa `--destructive` e `--destructive-foreground` recebe os valores novos sozinho.
- **Limite conhecido, fora do escopo:** o texto do link no tema claro tem 4,03:1 sobre o fundo, abaixo de 4,5:1 (já era assim).
- **Testes:** grade por semente x modo x vermelho x info nos dois lados (React `pnpm test` 496/496; Flutter `seedgrid_theme` 225), e `severity_colors_test` no Flutter fixa os hex acima; vetores de paridade do tema regenerados (86 temas).

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
