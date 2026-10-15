---
tags: [seedgrid, front, pacote]
fonte: front/seedgrid-fe-components/packages; front/seedgrid-fe-components/package.json; front/seedgrid-fe-components/pnpm-workspace.yaml; front/seedgrid-fe-components/turbo.json
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Pacotes do monorepo `seedgrid-fe-components`

Monorepo pnpm (`packageManager: pnpm@9.12.0`) + Turborepo. Workspaces (`pnpm-workspace.yaml`): `apps/*`, `packages/*`, `packages/modules/*`. Repositório declarado nos `package.json`: `github.com/SeedGrid/seedgrid-fe-components`.

## Pacotes de base (`packages/*`)

| Pacote | Versão | Papel | Nota |
|---|---|---|---|
| `@seedgrid/fe-components` | 2026.7.1 | Biblioteca de componentes `Sg*` + utilitários (máscaras, validadores, i18n) | [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral\|Fundamentos]] |
| `@seedgrid/fe-theme` | 0.3.0 | Tema por cor *seed*, tokens `--sg-*`, `SeedThemeProvider` | [[SeedGrid/SeedGrid-components/pacotes/fe-theme\|fe-theme]] |
| `@seedgrid/fe-core` | 2026.7.1 | Manifesto de módulo da CLI, registry, persistência, `createApiClient`, erros | [[SeedGrid/SeedGrid-components/pacotes/fe-core\|fe-core]] |
| `@seedgrid/fe-commons` | 0.2.0 | `createHttpClient`, `buscarCep`, `buscarCnpj` | [[SeedGrid/SeedGrid-components/pacotes/fe-commons\|fe-commons]] |
| `@seedgrid/fe-playground` | 0.1.0 | `SgPlayground` (Sandpack) | [[SeedGrid/SeedGrid-components/pacotes/fe-playground\|fe-playground]] |

Módulos de domínio (`packages/modules/*`, todos `@seedgrid/fe-<nome>`): ver [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]]. App de demonstração: [[SeedGrid/SeedGrid-components/showcase|Showcase]].

## Dependências entre pacotes (Confirmado nos `package.json`)

```mermaid
graph LR
  theme["fe-theme"] -->|dependency| core["fe-core"]
  commons["fe-commons"] -->|dependency (sem uso no src)| core
  components["fe-components"] -.->|devDependency (build-style)| theme
  playground["fe-playground"] -->|peer ^0.2.10| components
  modules["fe-<módulo>"] -->|peer| core
  modules -->|peer| security["fe-security"]
  security -->|peer| components
  security -->|peer| core
  showcase["apps/showcase"] --> components
  showcase --> theme
  showcase --> playground
```

- `fe-components` **não** depende de `fe-core`.
- `fe-components` usa `fe-theme` só no build (`scripts/build-style.mjs` importa `generateThemeVars`/`generateComponentTokens` do `dist` do tema) para embutir o tema padrão no CSS.

## Padrões comuns
- Todos ESM (`"type": "module"`), compilados com `tsc` para `dist/` (fe-components também gera `dist/sandbox.cjs` com `tsup`).
- Cada pacote de base tem `scripts/build-ai-manifest.mjs` que gera `dist/ai/<pacote>.manifest.json` a partir dos `*.meta.ts` (metadados `SgMetaV0`/`SgAiHintsV0`).
- Versões: componentes e core seguem calendário (`2026.7.x`); theme/commons/playground ainda em `0.x`.
- `peerDependencies` de React: `^18.2.0 || ^19.0.0` em todos.

## Scripts da raiz (`package.json`, Confirmado; não executados)

| Script | Comando |
|---|---|
| `dev` | `turbo dev` |
| `dev:components` | `pnpm -C packages/seedgrid-fe-components dev` |
| `dev:showcase` | `pnpm -C apps/showcase dev` |
| `dev:showcase:with-components` | `pnpm -r --parallel dev:components dev:showcase` |
| `build` / `typecheck` | `turbo build` / `turbo typecheck` |

`turbo.json`: `build` depende de `^build` (saídas `dist/**`, `.next/**`); `dev` sem cache, persistente, depende de `^build`.

## Publicação
Scripts na raiz: `publish-package.sh <dir> [patch|minor|major|prerelease|none]` (aceita `PUBLISH_VERSION`, voltado a npm Trusted Publishing/OIDC no GitHub Actions — texto de ajuda do script) e atalhos `publish-<pacote>.sh` para components, core, theme, commons, playground e cada módulo. Não executados.

## Compatibilidade

- O peer de `fe-playground` (`@seedgrid/fe-components ^0.2.10`) não aceita a versão atual 2026.7.1.
