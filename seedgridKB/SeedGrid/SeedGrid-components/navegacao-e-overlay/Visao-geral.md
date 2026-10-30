---
tags: [seedgrid, front, component, navegacao-e-overlay]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/menus, front/seedgrid-fe-components/packages/seedgrid-fe-components/src/overlay, front/seedgrid-fe-components/packages/seedgrid-fe-components/src/wizard
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "Navegação, overlay e wizard em React (@seedgrid/fe-components): quando usar e para que serve cada símbolo do grupo, composição, testes e limitações. Plataforma React; o equivalente Flutter está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Navegação e overlay — visão geral — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Visão geral — Navegação, overlay e wizard (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Grupo de componentes do pacote `@seedgrid/fe-components` que reúne **três pastas pequenas** de `src/` numa só nota, por terem pouco conteúdo cada uma:

| Pasta de origem | Conteúdo |
|---|---|
| `src/menus/` | `SgDockMenu` (dock flutuante estilo macOS) e os helpers puros de `dock-menu-logic.ts` |
| `src/overlay/` | `SgPopup` (overlay ancorado, não modal), `SgDialog` (modal), `SgConfirmationDialog` (modal de confirmação construído sobre `SgDialog`) |
| `src/wizard/` | `SgWizard` + `SgWizardPage` (fluxo multi-etapas) e os helpers puros de `logic.ts` |

> O menu de navegação lateral/horizontal (`SgMenu`), breadcrumb, toolbar e page control ficam em `src/layout/` — ver [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout]].

- API completa: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|API de navegação e overlay]]
- Exemplos: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Exemplos|Exemplos de navegação e overlay]]
- Fundamentos do pacote (instalação, CSS, i18n): [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]]

## Componentes

| Componente | Exportado | Para que serve | Showcase |
|---|---|---|---|
| `SgDockMenu` | sim | Dock flutuante de ações com ícones, badges, efeito *magnify*, 8 posições ancoradas e arraste com posição persistida | `/components/sg-dock-menu` |
| `SgPopup` | sim | Overlay contextual ancorado a um elemento (`anchorRef`), com título, lista de ações e/ou conteúdo livre; fecha por clique fora/Esc | `/components/sg-popup` |
| `SgDialog` | sim | Modal com cabeçalho/corpo/rodapé, severidade, animação, auto-fechamento, foco inicial, *focus trap* e bloqueio de scroll | `/components/sg-dialog` |
| `SgConfirmationDialog` | sim | `SgDialog` especializado em confirmar/cancelar, com ícone por severidade e botões configuráveis | `/components/sg-confirmation-dialog` |
| `SgWizard` | sim | Fluxo em etapas com stepper opcional, validação automática dos inputs da etapa, guardas síncronas/assíncronas e conclusão assíncrona | `/components/sg-wizard` |
| `SgWizardPage` | sim | Etapa de um `SgWizard` (título/ícone usados no stepper) | `/components/sg-wizard` |

Exportação confirmada em `src/index.ts` (barrel; o `package.json` expõe apenas `"."` e `"./style.css"`).

### Funções e tipos públicos relacionados

| Símbolo | Origem | Exportado |
|---|---|---|
| `resolveDockMenuOrientation`, `resolveDockMenuLiftDirection`, `buildDockMenuLayout`, `buildDockMenuItemMotion`, `buildDockMenuLabelStyle`, `buildDockMenuContainerStyle`, `buildDockMenuContextMenuState` | `src/menus/dock-menu-logic.ts` | sim |
| `buildDockMenuStorageKey` (e `parseStoredPanelDragPosition`, compartilhado com a toolbar) | `src/layout/drag-position.ts` | sim |
| `clampWizardStep`, `canNavigateToWizardStep`, `canProceedWizardAction` | `src/wizard/logic.ts` | sim |
| Tipos `SgDockMenuProps`, `SgDockMenuItem`, `SgDockMenuPosition`, `SgDockMenuOrientation` | `SgDockMenu.tsx` | sim |
| Tipos `SgPopupProps`, `SgPopupAction`, `SgPopupPlacement`, `SgPopupPreferPlacement`, `SgPopupAlign`, `SgPopupSeverity` | `SgPopup.tsx` | sim |
| Tipos `SgDialogProps`, `SgDialogSize`, `SgDialogSeverity`, `SgDialogAnimation` | `SgDialog.tsx` | sim |
| Tipos `SgConfirmationDialogProps`, `SgConfirmationDialogButtonConfig` | `SgConfirmationDialog.tsx` | sim |
| Tipos `SgWizardProps`, `SgWizardPageProps`, `SgWizardLabels`, `SgWizardStepper`, `WizardStepNavigation`, `WizardGuardRunner` | `SgWizard.tsx`, `logic.ts` | sim |

Os helpers do dock e do wizard são funções puras usadas internamente pelos componentes e cobertas por testes; o export público permite reuso/teste, mas o uso normal é só via componente. Detalhes em [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|API]].

## Como se compõem

- Nenhum componente do grupo exige provider. Todos chamam `useComponentsI18n()` para textos padrão (ex.: `components.dialog.close`, `components.wizard.next`) — opcionalmente envolva a app em `SgComponentsI18nProvider` (ver [[SeedGrid/SeedGrid-components/fundamentos/API|API › i18n]]). **Confirmado**.
- `SgDockMenu` persiste a posição arrastada: com `SgEnvironmentProvider` presente usa `useSgPersistence()` (estratégia/namespace do ambiente); sem ele usa `localStorage` direto, chave `sg-dockmenu-pos:<dragId>:<viewport|parent>`. Ver [[SeedGrid/SeedGrid-components/providers/API|Providers]]. **Confirmado** (`SgDockMenu.tsx` → `loadStoredPosition`/`saveStoredPosition`).
- `SgPopup` e `SgDialog` renderizam via `createPortal(..., document.body)`. `SgConfirmationDialog` compõe `SgDialog` + `SgButton` (rodapé).
- `SgWizard` só considera filhos diretos cujo `type === SgWizardPage`; outros filhos são descartados. A validação automática procura elementos com atributo `data-sg-error` dentro da etapa — atributo emitido pelos inputs SeedGrid (ex.: `SgInputText`, `SgInputNumber`), ver [[SeedGrid/SeedGrid-components/inputs-texto/Visao-geral|Inputs de texto]]. **Confirmado** (`SgWizard.tsx` → `validateCurrentPage`).

## Dependências

- Peer: `react`, `react-dom` (portais). Nenhuma lib externa específica deste grupo. Os exemplos do showcase usam `lucide-react` (peer opcional do pacote) para ícones.

## Testes (não executados)

| Arquivo | Cobertura |
|---|---|
| `tests/overlay.test.mjs` | Contratos estáticos: textos padrão de `SgConfirmationDialog`/`SgDialog`/`SgPopup` vindos de chaves i18n; padrões `closeOnCancel/closeOnConfirm = true`; dismiss do dialog roteado para o fluxo de cancelamento; `closeOnEsc`/`closeOnOverlayClick`/`closeOnOutsideClick`/`closeOnEscape` ligados por padrão; popup usa `title` antes do aria-label i18n |
| `tests/wizard.test.mjs` | Render SSR: labels traduzidos, clamp de `initialStep`, override de labels, stepper `none`, navegação desabilitada, `nextDisabled` |
| `tests/wizard-logic.test.mjs` | `clampWizardStep`, `canNavigateToWizardStep` (modos), `canProceedWizardAction` (ordem e interrupção das guardas) |
| `tests/buttons-menus.test.mjs` | `SgDockMenu` com botões acessíveis/disabled; helpers `buildDockMenu*`/`resolveDockMenu*`, `buildDockMenuStorageKey` determinísticos |
| `tests/buttons-menus-dom.test.mjs` (jsdom) | Dock: menu de contexto de reset e persistência de arraste em `localStorage`; Wizard: avançar/voltar, clique no stepper, guardas, validação de inputs; Popup: fecha por clique fora e Esc |

## Limitações e observações

- `SgPopup` não abre sozinho ao clicar na âncora: o consumidor controla `open`/`onOpenChange` (o clique na âncora é ignorado pelo "clique fora"). **Confirmado**.
- No `SgDialog`, o *focus trap* de `Tab` vive no mesmo efeito do `Esc`: com `closeOnEsc={false}` o foco **não** fica preso no modal. **Confirmado** (`SgDialog.tsx`, efeito `onKeyDown`).
- `SgDialog.onClose` só dispara pelos fechamentos internos (botão X, overlay, Esc, `autoCloseMs`); mudar `open` para `false` de fora não chama `onClose`. **Confirmado**.
- `SgWizard` chama `onStepChange` num efeito com dependências `[props, step]`: além das trocas de etapa, ele dispara de novo sempre que o wizard re-renderiza com um novo objeto `props`. **Confirmado** (código); impacto prático = **Inferência**.
- `SgWizard` não expõe etapa controlada (não há `step`/`activeStep` como prop) nem `ref`.
- `SgDockMenu`: `item.badge && (...)` — badge `0` não renderiza a bolha e o React imprime `0` como texto. **Inferência** (semântica de JSX com `&&`).
- O grupo não tem menu de contexto genérico; o menu de contexto do dock é apenas o diálogo "resetar posição".
