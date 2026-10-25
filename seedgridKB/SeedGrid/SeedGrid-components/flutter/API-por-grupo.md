---
description: "Mapa dos componentes Flutter SeedGrid por grupo (botões, commons, inputs, layout, overlay, feedback, menus, gadgets, dígitos, providers, formulário, i18n, tema): nome do widget, arquivo e extras do Dart; a API completa de props está nos contratos gerados."
tags: [seedgrid, front, component, flutter, dart, api]
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# API por grupo (Flutter)

> **Status: NÃO PUBLICADO.** Mapa de onde cada widget vive e o que o Dart acrescenta ou muda. **Não repete as props**: o contrato de cada componente é a interface gerada `lib/src/generated/<comp>.g.dart` (nome, tipo, default e enum iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) e a página do showcase tem a "Referência de Props". Origem de cada linha: `docs/PARIDADE.md` (coluna "Onde / motivo"). Caminhos relativos a `packages/seedgrid_components/lib/src/`. Visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]] · estado de cada um: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]].

## Onde fica cada grupo?

| Grupo | Pasta | Widgets (nome = React) |
|---|---|---|
| Botões | `buttons/` | `SgButton`, `SgSplitButton`, `SgFloatActionButton` |
| Commons | `commons/` | `SgBadge`, `SgBadgeOverlay`, `SgAvatar`, `SgAvatarGroup`, `SgSkeleton` |
| Formulário | `form/` | `SgForm`, `SgFormController`, `SgRules`/`SgRuleValue`, `SgFieldValidator` (sem equivalente 1:1: substitui o react-hook-form, ADR 49). `SgFormController.registerField(name, {rules, initialValue, validator})` e `unregisterValidator`; `SgForm` tem `controller`, `defaultValues`, `onValid`, `onInvalid` e `submitOnEnter` (envia no Enter de campo de uma linha; padrão `true`) |
| Inputs de texto | `inputs/` e `inputs/text/` | `SgInputText`, `SgInputTextArea`, `SgInputTextSearch`, `SgInputEmail`, `SgInputPassword` |
| Inputs com máscara | `inputs/masked/` | `SgInputCPF`, `SgInputCNPJ`, `SgInputCPFCNPJ`, `SgInputPhone`, `SgInputPostalCode`, `SgInputBirthDate`, `SgInputDate` |
| Inputs numéricos | `inputs/number/` | `SgInputNumber`, `SgInputCurrency`, `SgStepperInput` |
| Escolha simples | `inputs/choice/` | `SgCheckboxGroup`, `SgRadioGroup`, `SgToggleSwitch`, `SgSlider`, `SgRating` |
| Seleção | `inputs/select/`, `inputs/multi/` | `SgCombobox`, `SgAutocomplete`, `SgMultiSelect`, `SgMultiSelectChips` |
| Listas | `inputs/lists/` | `SgPickList`, `SgOrderList` |
| Datas e períodos | `inputs/period/`, `gadgets/calendar/` | `SgPeriodSelector`, `SgYearPartSelector`, `SgCalendar` |
| OTP | `inputs/otp/` | `SgInputOTP` |
| Tabela | `inputs/datatable/` | `SgDatatable` (+ `SgDatatableController`, `SgDatatableColumn`) |
| Editor | `inputs/editor/` | `SgTextEditor` |
| Layout básico | `layout/basic/` | `SgGrid`, `SgStack`, `SgPanel`, `SgGroupBox`, `SgScreen` |
| Contêineres | `layout/containers/` | `SgCard`, `SgAccordion`, `SgExpandablePanel`, `SgBreadcrumb`, `SgPageControl`, `SgPageControlPage`, `SgCarousel` |
| Dock | `layout/dock/` | `SgDockLayout`, `SgDockZone`, `SgDockScreen` |
| Árvore | `layout/tree/` | `SgTreeView` |
| Menu e barra | `layout/menu/` | `SgMenu`, `SgToolBar`, `SgToolbarIconButton` |
| Menus | `menus/dock_menu/` | `SgDockMenu` |
| Overlay | `overlay/` | `SgDialog`, `SgConfirmationDialog`, `SgPopup` |
| Feedback | `feedback/` | `SgToaster`, `SgToastHost`, `SgWhistler`, `SgWhistleHost`, `SgWizard`, `SgWizardPage` |
| Dígitos | `digits/simple/`, `digits/animated/` | `SgSevenSegmentDigit`, `SgSegmentDigit`, `SgMatrixDigit`, `SgNeonDigit`, `SgFadeDigit`, `SgFlipDigit`, `SgRoller3DDigit`, `SgDiscardDigit` |
| Gadgets | `gadgets/` | `SgStringAnimator`, `SgRadialGauge`, `SgLinearGauge`, `SgQRCode`, `SgClock`, `SgClockThemePicker`, `SgClockThemePreview`, `SgClockThemeProvider`, `SgTimeProvider` |
| Providers | `providers/`, `i18n/` | `SgEnvironmentProvider`, `SgRealtimeProvider`, `SgComponentsI18nProvider` |

Os pacotes `seedgrid_theme` (`SgTheme`, tokens com os mesmos nomes do React) e `seedgrid_commons` (máscaras, validadores, CEP, CNPJ, HTTP) são separados (ver [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]]).

## O que o Dart acrescenta ou muda por grupo?

Todos os itens abaixo estão na coluna "Onde / motivo" do `docs/PARIDADE.md`.

- **Texto como `String` ou `Widget`:** `SgButton.label`/`child`, `SgCard.title`/`description`, `SgDialog.title`/`subtitle`, `SgConfirmationDialog.title`/`message`/`subtitle` e `SgConfirmationDialogButtonConfig.label` são `Object?` e passam por `sgNode` (`props/sg_node.dart`); `SgDatatableColumn.header` aceita `String`, `num` ou `Widget`.
- **Formulário:** o `onChange` do usuário é chamado também dentro de formulário e os validadores do componente rodam em `handleSubmit`/`trigger` (campos que registram `validator` em `registerField`: `SgInputText` e derivados, máscaras, `SgInputEmail`, `SgInputPassword`, `SgInputTextArea`, datas, `SgInputNumber`/`SgInputCurrency`, `SgToggleSwitch`, `SgInputOTP`); detalhe em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]. `SgInputText` aceita `value` controlado.
- **`SgToaster`:** solto em `Column`/`ListView` desenha no `Overlay` da rota sem ocupar espaço; em área limitada preenche o pai; `SgToastHost` é a versão global (`feedback/sg_toaster.dart`).
- **Controllers no lugar de `ref`:** `SgDatatableController`, `SgDiscardDigitController`, `SgStringAnimatorController.startAnimation()`.
- **Clientes injetáveis (testáveis sem rede):** `SgInputPostalCode` e `SgInputCNPJ` (`SgViaCepResult`, `SgHttpClient`); `SgRealtimeProvider` recebe o cliente por `connectionFactory` (`SgPulseConnection`; sem ele o status fica `unavailable`; adaptador do SDK Pulse descrito em `providers/PULSE_ADAPTER.md`, não ligado por dependência).
- **Sem `Intl` no Dart:** `SgInputNumber`/`SgInputCurrency` usam tabela gerada (pt-BR, pt-PT, en-US, es, fr, de-DE; 162 moedas; locale fora da lista cai em en-US). `SgCalendar` tem dados para 9 locales (fora deles, en-US); `SgClock` embute 11 zonas com regra (`registerSgClockTimeZone` acrescenta).
- **Datas:** `SgInputDate`/`SgInputBirthDate` têm máscara por idioma e calendário próprio (o React usa `input type=date` nativo); datas em texto só ISO 8601.
- **Toque (< 600 px):** `SgCombobox`, `SgSplitButton`, `SgDatatable` (painel de colunas) e `SgMenu` usam painel de baixo (ADR 51). `SgDockMenu` não tem zoom nem rótulo ao passar sem mouse; `SgOrderList`/`SgPickList` arrastam por toque longo (cerca de 150 ms).
- **Motores próprios:** `SgMenu` (sem `MenuAnchor`), `SgDatatable` (sem dependência nova), `SgQRCode` (algoritmo qrcodegen portado; o `qr_flutter` foi descartado), `SgFlipDigit` (sem `@pqina/flip`).
- **Editor:** `SgTextEditor` (Onda 6, `inputs/editor/`) usa `flutter_quill` (`^11.5.0`); o conteúdo trafega como HTML por conversor próprio; tabelas e iframes são descartados (lista completa em [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]).
- **Relógio:** só temas embutidos (10) em formato JSON `sg-clock-theme/1`; tema por URL/SVG livre não é portado (`SgClockUrlThemeUnsupportedError`, ADR 51/D8).
- **Extras do Flutter:** `SgToolBar` aceita `children` e `overflow`; `SgCalendar` tem a prop `today`; `SgCarousel` desliza com o dedo; `SgTreeView` tem navegação por teclado (setas, Home/End, Enter, Espaço, `*`).

## Como acho o contrato completo de um componente?

1. `lib/src/generated/<comp>.g.dart` (por exemplo `sg_input_text.g.dart`): interface `<Comp>Props` com tipo, default e enum de cada prop. Arquivos gerados: não edite.
2. Página do showcase: `apps/seedgrid_showcase/lib/pages/<snake>_page.dart`, com exemplos (código = renderizado) e a "Referência de Props".
3. Teste do componente: `packages/seedgrid_components/test/widgets/<comp>_test.dart`.

## Não verificado

- Os nomes de widget e arquivos vêm do `docs/PARIDADE.md` (gerado pelo script `tools/parity_table/generate.mjs`); não abri cada `.dart`. Conferi no código só `form/sg_form.dart`, `props/sg_node.dart`, `feedback/sg_toaster.dart`, `buttons/sg_button.dart`, `overlay/sg_confirmation_dialog.dart` e a prop `value` de `inputs/sg_input_text.dart`.
- A lista de campos que registram validador vem da tabela "Quem registra o validador" do `docs/DIVERGENCIAS_DO_REACT.md`; não abri cada widget.
- Exemplos de uso completos de cada widget **não** estão aqui: estão no showcase do repositório. Os de `SgForm`, `SgDatatable`, `SgConfirmationDialog` e `toast` aparecem como pares React/Dart em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].
