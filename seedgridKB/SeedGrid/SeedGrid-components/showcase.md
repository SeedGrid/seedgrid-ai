---
tags: [seedgrid, front, showcase]
fonte: front/seedgrid-fe-components/apps/showcase
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Showcase (`apps/showcase`)

App Next.js que demonstra todos os componentes do `@seedgrid/fe-components` (páginas com exemplos numerados, `SgPlayground` e "Referência de Props"), além de hooks, providers, tema e créditos.

Relacionados: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos do fe-components]] · [[SeedGrid/SeedGrid-components/pacotes/fe-playground|@seedgrid/fe-playground]] · [[SeedGrid/SeedGrid-components/pacotes/fe-theme|@seedgrid/fe-theme]] · [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]].

## Stack (Confirmado em `apps/showcase/package.json`)
- `name: "showcase"`, privado, ESM.
- `next 15.0.7`, `react`/`react-dom 19.0.0`, `lucide-react ^1.18.0`, TipTap `^2.9.1`.
- Workspace: `@seedgrid/fe-components`, `@seedgrid/fe-theme`, `@seedgrid/fe-playground`.
- Dev: Tailwind 3 (`tailwindcss-animate`, PostCSS, autoprefixer), TypeScript 5.5.
- **Não** usa os módulos `packages/modules/*` nem `fe-core`/`fe-commons` diretamente (nenhuma dependência declarada).

## Organização de `src/`

| Caminho | Conteúdo |
|---|---|
| `src/app/layout.tsx` | Layout raiz: `SeedThemeProvider` (seed `#16803D`, `mode: "auto"`, `radius: 8`, `persistMode: true`, `applyTo: "html"`), `ShowcaseShell` com `initialLocale="pt-BR"`, e Google Analytics via `next/script` (`afterInteractive`). |
| `src/app/ShowcaseShell.tsx` | Shell client: `SgDockScreen`, `SgMenu`, `SgToolBar`, `SgToaster`, troca de idioma (`SgComponentsI18nProvider`/`setComponentsI18n` + i18n do showcase), editor de tema (`ThemeEditor.tsx`, usa `useSgTheme`). |
| `src/app/page.tsx` | Página inicial. |
| `src/app/components/sg-*/page.tsx` | 67 pastas de componentes `sg-*`, a maioria com subpasta `samples/` (arquivos `.sample`/`.playground` exibidos 1:1). |
| `src/app/components/{digits,gadgets,hooks,providers}/…` | Páginas agrupadas: 8 digits, 8 gadgets, 7 hooks (`use-components-i18n`, `use-sg-environment`, `use-sg-persistence`, `use-sg-persistent-state`, `use-sg-realtime-event`, `use-sg-realtime-status`, `use-sg-time`), 5 providers. |
| `src/app/components/layout.tsx` | Layout das páginas de componente; dispara evento GA por componente (slug do pathname). |
| `src/app/components/ShowcaseStickyHeader.tsx`, `useShowcaseAnchors.ts`, `ShowcasePropsReference.tsx`, `I18NReady.tsx`, `sgCodeBlockBase.tsx` | Infraestrutura do padrão de página (cabeçalho sticky com âncoras `#exemplo-N`/`#props-reference`, tabela de props, i18n). |
| `src/app/components/ai/` | `ComponentAiSummary`, `ComponentAiPropsTable`, `useAiManifestComponent` — consomem o manifesto de IA. |
| `src/app/api/showcase-code/route.ts` | `GET /api/showcase-code?path=<arquivo>` → `{ code }` lido do disco (raiz = `../..` do cwd; caminhos fora do repositório rejeitados). Usado por `SgPlayground playgroundFile`. |
| `src/app/api/ai-manifest/route.ts` | `GET /api/ai-manifest` → `packages/seedgrid-fe-components/dist/ai/seedgrid-components.manifest.json`. |
| `src/app/theme/`, `src/app/credits/`, `src/app/teste/` | Página de tema (com `samples/`), créditos de terceiros, página de testes avulsa. |
| `src/app/samples/` | Snippets gerais (`i18n-provider-root-layout`, `react-hook-form-basico`, `set-components-i18n`). |
| `src/i18n/` | i18n do showcase: `index.ts` (`ShowcaseI18nProvider`, `setShowcaseI18n`, `t`), JSON `pt-BR`, `pt-PT`, `en-US`, `es`, `fr`, e `showcase-props-descriptions.json`. |

Total: 97 `page.tsx` em `src/app` (contagem `find`). O padrão obrigatório de página (cabeçalho fixo, exemplos numerados, `SgPlayground`, Referência de Props) é definido pelo `AGENTS.md` do workspace de desenvolvimento (`AGENTS.md` da raiz do workspace, fora deste repositório).

## Como rodar (scripts — **não executados**)

`apps/showcase/package.json`:

| Script | Comando | Observação |
|---|---|---|
| `predev` | `node scripts/ensure-workspace-deps-built.mjs` | Constrói `seedgrid-fe-components` e `seedgrid-fe-playground` **só se** `dist/` não existir ou estiver vazio (evita apagar `dist` em paralelo com o `turbo dev`). |
| `dev` | `next dev --port 3100` | http://localhost:3100 |
| `build` | `node scripts/validate-showcase-snippets.mjs && next build` | valida que todo `sampleFile`/`playgroundFile` referenciado existe/compila antes do build. |
| `start` | `next start` | — |
| `typecheck` | `tsc --noEmit` | — |
| `test:playground-snippets` | `node --test tests/playground-app-file-imports.test.mjs tests/showcase-contracts.test.mjs tests/i18n-parity.test.mjs` | contratos de snippets, paridade de i18n. |

Pela raiz do monorepo:
- `pnpm dev:showcase` (só o showcase) ou `pnpm dev` (`turbo dev`, que antes faz `^build` das dependências).
- `pnpm dev:showcase:with-components` — `pnpm -r --parallel dev:components dev:showcase`.
- `./showcase.sh` — faz `build` do fe-components, sobe `dev` do fe-components em background (watch) e `dev` do showcase; mata o watcher ao sair.

Docker (`apps/showcase/dockerfile`): build em `node:20-alpine` com `pnpm@9.12.0` (`pnpm install --frozen-lockfile` + `pnpm build` na raiz), runtime com `NODE_ENV=production`, `PORT=3100`, `HOSTNAME=0.0.0.0`, `CMD pnpm -C apps/showcase start --hostname 0.0.0.0 --port 3100`. O contexto de build é a raiz do monorepo (`COPY . .`) — **Inferência** pelo `pnpm -C apps/showcase`.

`next.config.ts`: `reactStrictMode`, `transpilePackages: ["@seedgrid/fe-components", "@seedgrid/fe-theme"]`, remove `EvalSourceMapDevToolPlugin` em dev, rewrite `/favicon.ico → /favicon.svg`.

## Configuração
- Nenhum `process.env` é lido no código do showcase/scripts (grep em `src`, `scripts`, `next.config.ts`). As variáveis `NEXT_PUBLIC_SANDPACK_*` do `SgPlayground` se aplicam ao showcase porque ele usa o pacote — ver [[SeedGrid/SeedGrid-components/pacotes/fe-playground|fe-playground › Configuração]].
- ID do Google Analytics fixo no `layout.tsx` (não configurável).

## Pontos de atenção
- `TODO.md` do app lista pendências (i18n ainda em `.json`, refatoração de senha, correção do `SgDiscardDigit`, separar Digits).
- `scripts/move-ai-summary-to-bottom.mjs` é um *codemod* pontual (move `<ComponentAiSummary>` para depois de `<ComponentAiPropsTable>`), não faz parte do build.
