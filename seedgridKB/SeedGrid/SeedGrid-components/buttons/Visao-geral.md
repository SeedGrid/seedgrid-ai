---
tags: [seedgrid, front, component, buttons]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/buttons
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "Botões em React (@seedgrid/fe-components): quando usar e para que serve cada símbolo do grupo, composição, testes e limitações. Plataforma React; o equivalente Flutter está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Botões (`src/buttons`) — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Visão geral — Botões (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Componentes de ação do `@seedgrid/fe-components`: botão padrão, botão dividido (ação + menu) e botão de ação flutuante (FAB).

- API completa: [[SeedGrid/SeedGrid-components/buttons/API|API dos botões]]
- Exemplos: [[SeedGrid/SeedGrid-components/buttons/Exemplos|Exemplos de botões]]
- Fundamentos (instalação, CSS, i18n): [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]]

## Componentes

| Componente | Exportado | Para que serve | Showcase |
|---|---|---|---|
| `SgButton` | sim | Botão de ação com `severity`, `appearance` (`solid`/`outline`/`ghost`), `size`, `shape`, `elevation`, ícones, `loading` e cores customizadas | `/components/sg-button` |
| `SgSplitButton` | sim | Ação principal + menu dropdown de ações secundárias (`items`) | `/components/sg-split-button` |
| `SgFloatActionButton` | sim | FAB fixo/absoluto com ações secundárias (layouts `linear`, `circle`, `semi-circle`, `quarter-circle`), tooltip, animações, auto-ocultar ao rolar e arrastar com posição persistida | `/components/sg-float-action-button` |

Todos estão no barrel `src/index.ts` (Confirmado). Rotas do showcase em `front/seedgrid-fe-components/apps/showcase/src/app/components/<rota>/` (cada uma com `samples/` e `*.tsx.playground`).

## Funções e tipos exportados relacionados

- Tipos: `SgButtonProps`, `SgButtonCustomColors`, `SgSplitButtonProps`, `SgSplitButtonItem`, `SgFloatActionButtonProps`, `SgFABAction`, `FABPosition`, `FABSeverity`, `FABSize`, `FABShape`, `FABElevation`, `FABAnimation`, `FABAnimationTrigger`, `FABLayoutType`.
- Funções puras: `buildFabStorageKey`, `parseStoredFabDragPosition` (`src/buttons/fab-helpers.ts`) — montam/validam a posição persistida do FAB.
- Interno (não exportado): aliases `Severity`/`Appearance`/`Size`/`Shape`/`Elevation` de `SgButton.tsx` e `SgSplitButton.tsx`.

## Composição e dependências

- `SgSplitButton` renderiza dois `SgButton`. `SgFloatActionButton` usa `SgPopup` (grupo [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|navegação e overlay]]) para o menu "redefinir posição".
- O FAB persiste a posição arrastada via `useSgPersistence()` quando há um `SgEnvironmentProvider` na árvore; sem provider, usa `localStorage` diretamente (chave `sg-fab-pos:<dragId>`). Ver [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers]].
- Textos padrão (aria-labels, tooltip do FAB, menu de reset) vêm do i18n interno (`useComponentsI18n`).
- Estilo: classes Tailwind + variáveis CSS (`--sg-btn-*`) com fallback para os tokens HSL do tema (`--primary`, `--secondary`…). Nenhuma dependência externa além de `react` (Confirmado: só imports internos).

## Testes existentes (não executados)

| Arquivo | Cobre |
|---|---|
| `packages/seedgrid-fe-components/tests/buttons-menus.test.mjs` | `SgButton` (estado disabled e label), `aria-label` traduzido do `SgSplitButton` e do `SgFloatActionButton`, helpers `buildFabStorageKey`/`parseStoredFabDragPosition` |
| `packages/seedgrid-fe-components/tests/buttons-menus-dom.test.mjs` (jsdom) | `SgSplitButton` abre o menu, ativa item e fecha com `Escape`; `SgFloatActionButton` persiste arraste em `localStorage` e abre o popup de reset limpando a posição |

## Limitações e pontos de atenção

- `SgButton` somente-ícone não gera `aria-label` automaticamente; os `<button>` do FAB não declaram `type="button"`.
- `SgSplitButton` não tem navegação por setas no menu (somente clique e `Escape`).
- O FAB não aceita `ref`.
