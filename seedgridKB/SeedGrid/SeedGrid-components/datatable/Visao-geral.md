---
tags: [seedgrid, component, frontend, react, datatable]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgDatatable.tsx
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "Tabela de dados em React (@seedgrid/fe-components): quando usar e para que serve cada símbolo do grupo, composição, testes e limitações. Plataforma React; o equivalente Flutter está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# SgDatatable — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral|Visão geral — Tabela de dados (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

O `SgDatatable` é a tabela de dados do pacote `@seedgrid/fe-components` (v`2026.7.1`). O arquivo fica em `src/inputs/` e é exportado pela raiz do pacote. Referência completa: [[SeedGrid/SeedGrid-components/datatable/API|API do SgDatatable]]. Código: [[SeedGrid/SeedGrid-components/datatable/Exemplos|Exemplos do SgDatatable]].

## Objetivo e funcionalidades

Mostra coleções tabulares com as funções abaixo, todas **Confirmado** em `SgDatatable.tsx`:
- **Paginação** com seletor de linhas por página e relatório "x–y de n". O número de botões de página se adapta à largura, via `ResizeObserver`.
- **Ordenação** por coluna, com ciclo asc → desc → sem ordem e comparador customizável.
- **Filtros:** um global (`contains`) e um por coluna (`contains`, `startsWith`, `endsWith`, `equals`), com botão "limpar filtros".
- **Seleção** de linha `single` ou `multiple` por clique. Botões e links dentro da célula não selecionam.
- **Templates** de célula (`body`) e de rodapé (`footer`), além de classes por linha e por célula.
- **Gerenciador de colunas** (padrão ligado): ocultar e reordenar por arrastar.
  - Com `SgEnvironmentProvider` e `id`, persiste a ordem e a visibilidade.
- **Modo `lazy`** para paginação, ordenação e filtro no servidor.
- **Estados** `loading` e vazio.
- **Ref imperativo:** `getProcessedRows`, `getPagedRows`, `clearFilters`, `clearSelection`, `resetSort`, `resetPage` e `goToPage`.

## Quando usar

- **Use para:** listagens de cadastros (CRUD), consultas e relatórios em tela, com até algumas centenas de linhas em memória. Para volume maior, use `lazy` e faça o trabalho no backend.
- **Não use para:**
  - edição inline: não há edição de célula no componente;
  - árvores: veja `SgTreeView` (outro grupo);
  - escolher itens para um formulário: prefira [[SeedGrid/SeedGrid-components/inputs-selecao/Visao-geral|inputs de seleção]] como `SgPickList`/`SgMultiSelect`.

  Essas recomendações são **Inferência**, a partir das props existentes.
- **Formulário:** não há integração com react-hook-form. A seleção é controlada por `selection`/`onSelectionChange`. **Confirmado**.

## Composição e dependências

- **Componentes internos:**
  - `SgGroupBox`: moldura e título (`groupBoxProps`);
  - `SgButton`: paginação e ações;
  - `createPortal` do `react-dom`: painel do gerenciador de colunas.
- **Ícones** do `lucide-react`: setas, chevrons, `GripVertical`, `SlidersHorizontal` e outros.
- **Persistência:** `useHasSgEnvironmentProvider` e `useSgPersistence` (`src/environment/SgEnvironmentProvider.tsx`). Sem provider, nada é persistido.
- **Peers:** `react`, `lucide-react`. Diferente dos inputs, o arquivo do SgDatatable não importa `react-hook-form`; mesmo assim, ele continua peer obrigatório do pacote.

**Confirmado**.

## Tema e estilos

- **Variáveis CSS do tema:**
  - linha selecionada/hover: `--sg-primary-100`;
  - zebra: `--sg-primary-50`;
  - texto secundário: `--sg-muted`.
- **Customização:** `className`, `style`, `tableClassName`, `rowClassName` (string ou função), além de `className`/`headerClassName`/`bodyClassName` por coluna. Flags visuais: `stripedRows`, `showGridlines`, `hoverableRows`.
- O CSS é injetado na importação do pacote (ver [[SeedGrid/SeedGrid-components/inputs-texto/Visao-geral#Tema e estilos|Tema e estilos]]).

**Confirmado**.

## Internacionalização

Os textos usam as chaves `components.datatable.*` (ver [[SeedGrid/SeedGrid-components/datatable/API#Internacionalização|API]]), resolvidas pelo `SgComponentsI18nProvider`. Sem provider, o locale padrão é `en-US`. **Confirmado**.

## Testes (lidos, **não executados**)

`tests/datatable-dom.test.mjs` cobre:
- no modo `lazy`, não ordena nem pagina localmente;
- com `columns` instável (nova identidade a cada render), um render do pai causa um render do corpo e não toca na persistência de colunas.

## Limitações e pontos de atenção

- Não há `aria-sort`, nem navegação de linhas por teclado. **Confirmado**.
- `rows` só define o valor inicial de linhas por página; não existe prop controlada para isso. **Confirmado**.
- O `id` serve também de chave de persistência: duas tabelas com o mesmo `id` dentro do mesmo `SgEnvironmentProvider` compartilham o layout de colunas. **Inferência**, pela chave `datatable:<id>:columns`.
- Para o gerenciador de colunas e a persistência, dê `columnId` ou `field` estáveis. Colunas sem nenhum dos dois usam o índice como chave. **Confirmado**.
