---
tags: [seedgrid, front, pacote, fe-playground]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-playground
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# `@seedgrid/fe-playground`

Exporta o componente `SgPlayground`: bloco de código somente leitura **ou** editor + preview interativo baseado em **Sandpack** (`@codesandbox/sandpack-react`), com runtime do `@seedgrid/fe-components`, shims para dependências pesadas e herança do tema da página hospedeira. É o `SgPlayground` exigido em toda página do [[SeedGrid/SeedGrid-components/showcase|Showcase]].

Relacionados: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos do fe-components]] (`dist/sandbox.cjs`).

## Pacote

| Campo | Valor (Confirmado em `package.json`) |
|---|---|
| Nome / versão | `@seedgrid/fe-playground` `0.1.0`, MIT, `sideEffects: false` |
| `exports` | só `.` |
| `dependencies` | `@codesandbox/sandpack-react ^2.20.0` |
| `peerDependencies` | `@seedgrid/fe-components ^0.2.10`, `react`/`react-dom ^18.2.0 \|\| ^19.0.0` |
| Build | `clean` + `tsc` + `scripts/build-ai-manifest.mjs`; `dev` = `tsc --watch` |
| Testes | nenhum no pacote (o showcase tem `tests/playground-app-file-imports.test.mjs`) |

**Atenção**: o peer `@seedgrid/fe-components ^0.2.10` não é satisfeito pela versão atual `2026.7.1` (semver `^0.2.x` só aceita `0.2.*`); espere aviso de peer ao instalar.

## Exports (`src/index.ts`)
`SgPlayground` (default de `src/SgPlayground.tsx`, `"use client"`), tipos `SgPlaygroundProps`, `SgPlaygroundPreset` (`"auto" | "basic" | "seedgrid" | "editor" | "full"`), `SgPlaygroundNpmRegistry`.

## Props de `SgPlayground` (Confirmado na desestruturação)

`SgPlaygroundProps` é uma união: **exatamente um** de `code` ou `playgroundFile`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `code` | `string` | — | código inline |
| `playgroundFile` | `string` | — | caminho do arquivo; carregado via `fetch("/api/showcase-code?path=…")` — **exige essa rota no app hospedeiro** (existe no showcase) |
| `interactive` | `boolean` | `false` | `false` = bloco somente leitura (`ReadonlyBlock`); `true` = Sandpack com editor + preview |
| `codeContract` | `"renderBody" \| "appFile"` | `"renderBody"` | `renderBody`: o código é o corpo JSX, embrulhado num `App.tsx` gerado com `defaultImports`; `appFile`: o código é o `App.tsx` completo |
| `preset` | `SgPlaygroundPreset` | `"auto"` | `auto` → `editor` se usar `SgTextEditor`, `seedgrid` se importar `@seedgrid/fe-components`, senão `basic` |
| `title` | `string` | — (card: `"Codigo"`) | título |
| `description` | `string` | — | descrição do card |
| `height` | `number \| string` | `360` | altura |
| `expandedHeight` | `number \| string` | `"70vh"` | altura expandida |
| `expandable` | `boolean` | `true` | botão expandir |
| `resizable` | `boolean` | `true` | redimensionável |
| `resizeAxis` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | eixo |
| `previewPadding` | `number \| string` | `12` se `appFile`, senão `0` | padding do preview |
| `className`, `style` | — | — | no card (ou no container sem card) |
| `dependencies` | `Record<string,string>` | `{}` | dependências npm extras do sandbox |
| `defaultImports` | `string` | import de `SgScreen, SgPanel, SgGrid, SgStack, SgButton, SgAutocomplete` | cabeçalho usado no modo `renderBody` |
| `previewWrapperClassName` | `string` | `"h-[420px] rounded-xl border border-border bg-muted/30 p-3"` | wrapper do preview em `renderBody` |
| `seedgridDependency` | `string` | env `NEXT_PUBLIC_SANDPACK_SEEDGRID_DEPENDENCY` ou `"latest"` | versão do `@seedgrid/fe-components` no sandbox |
| `bundlerURL` | `string` | env `NEXT_PUBLIC_SANDPACK_BUNDLER_URL` ou `https://sandpack.seedgrid.com.br` | bundler Sandpack self-hosted |
| `bundlerTimeoutMs` | `number` | env `NEXT_PUBLIC_SANDPACK_BUNDLER_TIMEOUT_MS` ou `60000` | timeout |
| `npmRegistries` | `SgPlaygroundNpmRegistry[]` | derivado das envs `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_*` (se `…_URL` definida) | registries privados |
| `withCard` | `boolean` | `true` | envolve em `SgCard` |
| `collapsible` | `boolean` | `true` | card recolhível |
| `defaultOpen` | `boolean` | `true` | card inicia aberto |
| `cardId` | `string` | — | `id` do `SgCard` (âncoras do showcase) |

`SgPlaygroundNpmRegistry`: `{ enabledScopes: string[]; limitToScopes: boolean; registryUrl: string; proxyEnabled: boolean; registryAuthToken?: string }`.

### Comportamentos relevantes (Confirmado)
- Com SeedGrid incluído, injeta arquivos virtuais: `/node_modules/@seedgrid/fe-components/dist/index.js` → `module.exports = require("./sandbox.cjs")` (exige `build:sandbox` no pacote publicado), shim de `qrcode`, `public/index.html` com Tailwind, shims de i18n JSON/JS.
- `lucide-react` é substituído por um SVG genérico em todos os presets exceto `full` (evita OOM); TipTap e Sandpack-React também podem ser *shimados*; polyfills Node só no preset `editor`/`full`.
- Lê variáveis CSS e CSS do Next da página hospedeira (`MutationObserver` em `style`/`class`/`data-theme` do `<html>`) e repassa ao preview; tema claro/escuro do editor segue a página.
- Dependências padrão do sandbox: `react`/`react-dom` `18.2.0`, `react-hook-form ^7.0.0`; editor: `@tiptap/* ^2.9.1`.

## Configuração (variáveis de ambiente)

Lidas via `process.env` em `src/SgPlayground.tsx`. Por serem `NEXT_PUBLIC_*`, o Next.js as **embute no bundle do cliente em build** (Inferência baseada na convenção do Next; o pacote em si só lê `process.env`). Props explícitas têm precedência.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SANDPACK_SEEDGRID_DEPENDENCY` | string | versão/range npm | `latest` | Não | versão do `@seedgrid/fe-components` no sandbox | `resolvedSeedgridDependency` | prop `seedgridDependency` vence | build (NEXT_PUBLIC inline) | `SgPlayground` |
| `NEXT_PUBLIC_SANDPACK_BUNDLER_URL` | string | URL válida (`new URL`) | `https://sandpack.seedgrid.com.br` | Não | URL do bundler; inválida → padrão; barra final removida | `normalizeUrl` | prop `bundlerURL` vence | build (NEXT_PUBLIC inline) | `SgPlayground` |
| `NEXT_PUBLIC_SANDPACK_BUNDLER_TIMEOUT_MS` | número | > 0 | `60000` | Não | timeout do bundler; inválido/≤0 → padrão | `normalizeTimeoutMs` | prop `bundlerTimeoutMs` vence | build (NEXT_PUBLIC inline) | `SgPlayground` |
| `NEXT_PUBLIC_SANDPACK_DEBUG` | boolean | `1/true/yes/on`, `0/false/no/off` | `false` | Não | loga a config do Sandpack (`console.info`) quando `interactive` | `useEffect` | — | build (NEXT_PUBLIC inline) | `SgPlayground` |
| `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_URL` | string | URL | — | Condicional (sem ela nenhum registry é criado) | registry npm privado; barras finais removidas | `resolveDefaultNpmRegistriesFromEnv` | habilita as 4 abaixo; prop `npmRegistries` vence | build (NEXT_PUBLIC inline) | `resolveDefaultNpmRegistriesFromEnv` |
| `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_SCOPES` | string CSV | ex. `@seedgrid,@outro` | `@seedgrid` | Não | `enabledScopes` | idem | requer `…_URL` | build (NEXT_PUBLIC inline) | idem |
| `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_LIMIT_TO_SCOPES` | boolean | idem DEBUG | `true` | Não | `limitToScopes` | idem | requer `…_URL` | build (NEXT_PUBLIC inline) | idem |
| `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_PROXY_ENABLED` | boolean | idem DEBUG | `false` | Não | `proxyEnabled` | idem | requer `…_URL` | build (NEXT_PUBLIC inline) | idem |
| 🔒 `NEXT_PUBLIC_SANDPACK_NPM_REGISTRY_AUTH_TOKEN` | string | token | — | Não | `registryAuthToken` do registry | idem | requer `…_URL` | build (NEXT_PUBLIC inline) | idem |

**Risco (Inferência)**: um token em variável `NEXT_PUBLIC_*` fica visível no JavaScript entregue ao navegador. Usar somente com token de leitura restrito.

Nenhum arquivo `.env*` com essas variáveis foi encontrado no showcase (lacuna: não houve busca em ambientes de deploy).

## Exemplo
Fonte: `packages/seedgrid-fe-playground/README.md`.

```tsx
import { SgPlayground } from "@seedgrid/fe-playground";

export function PlaygroundExample() {
  return (
    <SgPlayground
      code={`<>Olá SeedGrid!</>`}
      preset="seedgrid"
      interactive
      title="Experimentando componentes"
      description="Duplo clique para editar o código do componente."
      expandedHeight="500px"
      resizable
      previewPadding={24}
    />
  );
}
```

