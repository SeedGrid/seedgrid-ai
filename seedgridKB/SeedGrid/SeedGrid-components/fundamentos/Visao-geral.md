---
tags: [seedgrid, front, component, fundamentos]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Fundamentos do `@seedgrid/fe-components`

Esta nota cobre **o que não é componente `Sg*`** dentro do pacote `@seedgrid/fe-components`: instalação, montagem (peers, CSS, tema), `exports` do `package.json`, build, e os utilitários transversais (`masks`, `validators`, `rhf`, `i18n`, `injectStyles`, `blocked-email-domains`, `ai-meta`, `generated`).

- API detalhada: [[SeedGrid/SeedGrid-components/fundamentos/API|API dos utilitários]]
- Exemplos: [[SeedGrid/SeedGrid-components/fundamentos/Exemplos|Exemplos dos utilitários]]
- Pacotes irmãos: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes do monorepo front]] · tema em [[SeedGrid/SeedGrid-components/pacotes/fe-theme|@seedgrid/fe-theme]]
- App de demonstração: [[SeedGrid/SeedGrid-components/showcase|Showcase]]

## Identificação do pacote

| Campo | Valor | Certeza |
|---|---|---|
| Nome | `@seedgrid/fe-components` | Confirmado (`package.json`) |
| Versão | `2026.7.1` | Confirmado |
| Licença | MIT | Confirmado |
| Módulo | ESM (`"type": "module"`), `main: dist/index.js`, `types: dist/index.d.ts` | Confirmado |
| `sideEffects` | `true` (o import do barrel injeta CSS) | Confirmado |
| `files` | `dist` | Confirmado |

### `exports` do `package.json`

| Subpath | Destino | Observação |
|---|---|---|
| `.` | `./dist/index.js` (+ `./dist/index.d.ts`) | Barrel único com todos os componentes e utilitários. |
| `./style.css` | `./dist/style.css` | CSS estático pré-compilado (alternativa à injeção automática). |

**Confirmado**: não há subpaths por grupo (`/inputs`, `/i18n` etc.). `dist/sandbox.cjs` (gerado pelo `build:sandbox`) **não** está no mapa de `exports`; ele é usado pelo `SgPlayground` via arquivo virtual `/node_modules/@seedgrid/fe-components/dist/index.js` → `require("./sandbox.cjs")` (ver [[SeedGrid/SeedGrid-components/pacotes/fe-playground|@seedgrid/fe-playground]]).

## Dependências

| Tipo | Pacotes | Observação |
|---|---|---|
| `dependencies` | `@pqina/flip ^1.8.4`, `qrcode.react ^4.2.0`, `@seedgrid/pulse-subscriber-react ^3.0.0` | flip → `SgFlipDigit`; QR → `SgQRCode`; Pulse → `SgRealtimeProvider` (Confirmado pelos comentários do `tsup.sandbox.config.ts`). |
| `peerDependencies` obrigatórios na prática | `react ^18.2.0 \|\| ^19.0.0`, `react-hook-form ^7.0.0`, `lucide-react ^0.468.0 \|\| ^1.0.0` | Todos declarados como peer (sem `peerDependenciesMeta`, portanto nenhum marcado como opcional). |
| `peerDependencies` TipTap | `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*` (underline, link, image, text-align, text-style, color, highlight, subscript, superscript, font-family), todos `^2.9.1` | O README diz que só são necessários para `SgTextEditor`; o `package.json` não os marca como opcionais (**Inferência**: o gerenciador avisará peer ausente se não instalados). |
| `devDependencies` relevantes | `@seedgrid/fe-theme` (workspace), `tailwindcss ^3.4.10`, `tailwindcss-animate`, `postcss`, `autoprefixer`, `tsup ^8.4.0`, `jsdom` | Tailwind só é usado no build; consumidor não precisa de Tailwind. |


## Instalação e montagem

Fonte: `packages/seedgrid-fe-components/README.md` (seções "Instalacao" e "Uso rapido") e código citado.

1. Instalação recomendada (README): `pnpm add @seedgrid/fe-components @seedgrid/fe-theme react-hook-form lucide-react`. Para `SgTextEditor`, adicionar os peers TipTap. Para playground, `@seedgrid/fe-playground`.
2. **Estilos — três camadas** (Confirmado):
   - **Injeção automática**: `src/index.ts` chama `ensureSeedgridStylesInjected()` no topo do barrel. A função cria `<style id="seedgrid-fe-components-styles">` em `document.head` com `SEEDGRID_COMPILED_CSS` (string gerada). É protegida contra SSR (`typeof document === "undefined"`) e contra dupla injeção (verifica o `id`). O comentário explica que é uma **chamada real** (não `import "./x"`) para não ser eliminada por bundlers.
   - **CSS estático**: `import "@seedgrid/fe-components/style.css"` — mesmo CSS, útil para evitar *flash* antes da hidratação (README).
   - **Tema em runtime (opcional)**: `SeedThemeProvider` de `@seedgrid/fe-theme` regrava as variáveis `--sg-*`. O CSS compilado já contém um bloco `:root{...}` com as variáveis do `defaultSeedTheme` (modo light), então os componentes ficam estilizados **sem provider** (Confirmado em `scripts/build-style.mjs` e no início de `src/generated/compiledStyles.ts`).
3. **i18n**: por padrão as mensagens dos componentes estão em `en-US` (`DEFAULT_I18N`). Para trocar: `SgComponentsI18nProvider` (contexto React) ou `setComponentsI18n` (global em `globalThis.__seedgridComponentsI18n`). Ver [[SeedGrid/SeedGrid-components/fundamentos/API|API › i18n]].
4. **React Hook Form**: inputs aceitam `register`/`control`/`rules`/`error` (tipo interno `RhfFieldProps`, em `src/rhf.ts`).
5. Next.js: o showcase usa `transpilePackages: ["@seedgrid/fe-components", "@seedgrid/fe-theme"]` em `apps/showcase/next.config.ts` (Confirmado). **Inferência**: não é obrigatório para consumidores do pacote publicado (o `dist` já é JS compilado), mas é o padrão usado no monorepo.

## Build (`scripts.build`)

Ordem exata (Confirmado em `package.json`):

| Passo | Comando | Saída |
|---|---|---|
| 1 | `pnpm run clean` | remove `dist/` |
| 2 | `node scripts/build-style.mjs` | roda Tailwind sobre `styles/tailwind.css` (content `./src/**/*.{ts,tsx}`) + bloco `:root` gerado com `generateThemeVars`/`generateComponentTokens` do `@seedgrid/fe-theme` (importa os `.js` do `dist` do tema por *deep import*); escreve `dist/style.css` **e** `src/generated/compiledStyles.ts` |
| 3 | `tsc -p tsconfig.json` | `dist/**` (JS + `.d.ts` + `declarationMap`) |
| 4 | `node scripts/extract-props.mjs` | `src/ai-meta/generated-props.json` — props extraídas dos tipos `<Export>Props` via TypeScript compiler API (ignora `control`, `register`, `rules`, `inputProps`, `className`, `labelClassName`, `style`, `ref`, `key`, `elevation`, `borderRadius`, `aria-*`, `data-*`) |
| 5 | `node scripts/build-ai-manifest.mjs` | `dist/ai/seedgrid-components.manifest.json` — une os `*.meta.ts` (curadoria) com `generated-props.json` |
| 6 | `node scripts/validate-example-refs.mjs` | falha o build se algum `examples[].file` do manifesto não existir (baseline em `scripts/example-refs-baseline.json`, declarado vazio no comentário) |
| 7 | `pnpm run build:sandbox` | `tsup` → `dist/sandbox.cjs` (CJS minificado, para Sandpack) |

**Atenção**: o passo 2 depende de `@seedgrid/fe-theme` já ter `dist/` (deep import de `node_modules/@seedgrid/fe-theme/dist/theme/*.js`). **Inferência**: no `turbo build` isso é garantido pelo `dependsOn: ["^build"]`.

Outros scripts: `dev` (build-style + `tsc --watch`), `typecheck`, `test` (faz `build` e roda 27 arquivos `node --test tests/*.test.mjs`, incluindo `i18n.test.mjs`, `rhf.test.mjs`, `rhf-components-contract.test.mjs`, `i18n-components-contract.test.mjs`, `utils.test.mjs`, `ai-manifest-props-contract.test.mjs`). Testes **não executados** nesta análise.

`tsup.sandbox.config.ts` (Confirmado): entry `src/index.ts`; externos `react`, `react-dom`, `lucide-react`, `qrcode`, todos os `@tiptap/*`, `@codesandbox/sandpack-react`; embutidos (`noExternal`) `react-hook-form`, `qrcode.react`, `@pqina/flip`, `@seedgrid/pulse-subscriber-react`; define `process.env.NODE_ENV="production"`.

## Mapa dos utilitários

| Arquivo | Exportado no barrel? | Papel |
|---|---|---|
| `src/masks.ts` | sim | Máscaras de CPF, CNPJ (inclusive alfanumérico), CPF/CNPJ, CEP e códigos postais BR/PT/US/ES/UY/AR/PY, telefone BR. |
| `src/validators.ts` | sim | Validação CPF, CNPJ (alfanumérico), e-mail, domínios de e-mail descartáveis, senha (política), datas e data de nascimento (idade). |
| `src/blocked-email-domains.ts` | indireto (via `DEFAULT_BLOCKED_EMAIL_DOMAINS`) | Lista padrão de 37 domínios descartáveis. |
| `src/rhf.ts` | **não** | Tipo `RhfFieldProps` e helpers `resolveFieldError`, `mergeRequiredRule`, usados internamente pelos inputs. |
| `src/i18n/` | sim | Provider, hooks, `t`, catálogos `pt-BR`, `pt-PT`, `en-US`, `es`, `fr` (214 chaves `components.*` cada). |
| `src/injectStyles.ts` | **não** (executado no import) | Injeção do CSS compilado no `<head>`. |
| `src/generated/compiledStyles.ts` | **não** | Constante `SEEDGRID_COMPILED_CSS` (auto-gerada, ~67 KB). |
| `src/ai-meta/` | **não** | Tipos `SgMetaV0`/`SgAiHintsV0` dos `*.meta.ts` e `generated-props.json`; alimentam o manifesto de IA. |
