---
description: "Componentes SeedGrid em Flutter (seedgrid_components, repositório seedgrid-fe-flutter), em perguntas e respostas: o que é o porte, como instalar, pacotes, grupos documentados, regras de escrita, o que muda em relação ao React e o que ainda falta. Plataforma Flutter; o equivalente React é o @seedgrid/fe-components."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, perguntas-e-respostas]
plataforma: flutter
fonte: front/seedgrid-fe-flutter
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Componentes SeedGrid em Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota e as da pasta `flutter/` descrevem o repositório `front/seedgrid-fe-flutter`. Os componentes **React** (`@seedgrid/fe-components`) estão nos grupos `SeedGrid/SeedGrid-components/<grupo>/` fora desta pasta. Como escolher entre as duas e o placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].
>
> **Status: NÃO PUBLICADO no pub.dev** (`publish_to: none` em todos os `pubspec.yaml`; o repositório não tem tag). A instalação é **direto do Git**: o `README.md` do repositório mostra a dependência `git: url: https://github.com/SeedGrid/seedgrid-fe-flutter.git` com `path: packages/seedgrid_components` e recomenda fixar `ref` (commit, tag ou branch). Publicar no pub.dev só com autorização do dono. Na data da análise (`analisado-em`) a árvore de trabalho estava limpa na branch `main`, commit `e9989b8` (2026-10-29); tudo abaixo vale para esse commit.

## Onde está cada grupo?

Os grupos Flutter têm os **mesmos nomes de pasta** dos grupos React. Cada um tem `Visao-geral` (quando usar, "Para que serve"), `API` (construtor, parâmetros com tipo e padrão, callbacks, controllers, acessibilidade) e `Exemplos` (Dart copiado do showcase).

| Grupo (Flutter) | Componentes | Notas |
|---|---|---|
| Inputs de texto e documentos | 15 | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos\|Exemplos]] |
| Inputs de seleção e valores | 14 | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos\|Exemplos]] |
| Tabela de dados | 1 | [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos\|Exemplos]] |
| Editor de texto rico | 1 | [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos\|Exemplos]] |
| Botões | 3 | [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/buttons/Exemplos\|Exemplos]] |
| Feedback e exibição | 9 | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos\|Exemplos]] |
| Layout e containers | 19 | [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos\|Exemplos]] |
| Navegação, overlay e wizard | 6 | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos\|Exemplos]] |
| Gadgets (relógio, calendário, gauges, QR) | 10 | [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos\|Exemplos]] |
| Dígitos animados | 8 | [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos\|Exemplos]] |
| Providers (ambiente/persistência e realtime) | 2 | [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos\|Exemplos]] |
| Fundamentos (formulário, i18n, tema, commons) | 1 (+ `SgForm` e pacotes de apoio) | [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos\|Exemplos]] |

Soma: **89 componentes**, os mesmos 89 da tabela de paridade (`docs/paridade.json`). Notas transversais: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] · [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo (índice)]]. Os exemplos antigos por tema (`Exemplos-*.md`, commit `314cb5a`) continuam na pasta, mas os atuais e completos ficam em `<grupo>/Exemplos`.

## O que é?

Um **porte familiar** dos componentes React de `@seedgrid/fe-components`: mesmos nomes de widget (`SgButton`, `SgInputCPF`, `SgDatatable`...), de props e de valores, para quem já usa o React usar o Flutter com facilidade. **Não** é pixel a pixel e **não** reaproveita código React. Fonte: `README.md` do repositório e ADR 48 a 52 da KB de plataforma (`SeedGrid/Dev/ADR/`, lidas só pelas citações dos `docs/`).

## Que pacotes existem?

Monorepo Dart (pub workspaces). Versão dos três pacotes e do app = `2026.7.1`, a mesma do `@seedgrid/fe-components` (`pubspec.yaml` de cada um). Requer Flutter `>=3.38.0` e Dart `^3.10.4`; o workflow do showcase fixa o Flutter 3.38.5 porque o stable mais novo quebrava o `flutter_quill` 11.5 (commit `f836108`).

| Pacote | O que é | Origem no React |
|---|---|---|
| `packages/seedgrid_theme` | tokens, escala de cor por hex, claro/escuro, `SgTheme`, `SeedThemeProvider` | `@seedgrid/fe-theme` |
| `packages/seedgrid_commons` | máscaras, validadores, CEP, CNPJ, cliente HTTP | `masks.ts`, `validators.ts`, `@seedgrid/fe-commons` |
| `packages/seedgrid_components` | contratos de props gerados, i18n (5 idiomas), widgets; **reexporta o `seedgrid_theme`** (`SeedThemeProvider`, `SgTheme`) e traz o `seedgrid_commons` por dependência `path`, mas **não reexporta** o `seedgrid_commons`: para chamar `maskCpf`, `isValidCpf` etc. direto no app é preciso importar `package:seedgrid_commons/seedgrid_commons.dart` (ver [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API dos fundamentos]]) | `@seedgrid/fe-components` |
| `apps/seedgrid_showcase` | showcase: cabeçalho fixo, âncoras, exemplos, playground, referência de props, i18n em 5 idiomas, CRUD de clientes de exemplo | `apps/showcase` |

Dependências externas de `seedgrid_components` (`pubspec.yaml`): `intl`, `shared_preferences`, `flutter_quill` (editor), `html`, `file_picker`.

## Como rodo e valido?

```bash
flutter pub get
bash tools/ci.sh        # formato, análise, testes e arquivos gerados em dia
cd apps/seedgrid_showcase && flutter run -d chrome
```

`tools/` tem os geradores (Node 22; leem o repositório React, que não é alterado): vetores de paridade de máscara, validação e tema; exportação do i18n; extração e emissão das props (`gen_props`); extração do código dos exemplos do showcase (`showcase_snippets`); i18n do showcase; tabela de paridade (`parity_table`); README; manifesto Flutter do MCP (`mcp_manifest`); medição de tokens (`token_cost`). A lista com os comandos está no `README.md`. O showcase ao vivo fica em `components-flutter.seedgrid.com.br` (workflow `.github/workflows/showcase-pages.yml`, GitHub Pages).

## Quais regras valem para escrever um componente?

Do `README.md` ("Regras"):
- Widget escrito à mão declara `implements <Comp>Props` (interface gerada): o analisador acusa prop faltando.
- **Não edite** `*.g.dart`, `props-spec.json`, `excecoes.json`, `snippets.g.dart` nem `docs/PARIDADE.md` (são gerados).
- No showcase, o código exibido é o trecho entre `// #region` e `// #endregion` da própria página (1:1 com o renderizado).
- Sem `className`/`style`; `enabled` vira `disabled`; eventos mantêm o nome do React (`onChange`, não `onChanged`); valores string do React viram enum.
- Props de **texto** (`SgButton.label`/`child`, `SgCard.title`/`description`, `SgDialog.title`/`subtitle`, `SgConfirmationDialog.title`/`message`/`subtitle` e `confirmButton.label`) são `Object?`: aceitam `String` ou `Widget`, convertidos por `sgNode` (`lib/src/props/sg_node.dart`).
- Sem referência a PrimeFaces/PrimeReact em exemplos; arquivos em UTF-8.

Para portar um componente novo: ler o componente React e o contrato gerado `lib/src/generated/<comp>.g.dart`, escrever o widget em `lib/src/<grupo>/`, exportar no **barril do grupo** (nunca no arquivo raiz), testar cada prop pública e criar a página de showcase (passos no `README.md`, "Como portar um componente").

## Em que o Flutter se comporta diferente do React?

Detalhe em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]; por componente, na seção "Diferenças do React" de cada `<grupo>/API`.

- **`SgDialog` e severidade:** `severity` tinge o **fundo** do diálogo (12% da cor da severidade sobre `--background`, só sem `customColor`) e a **faixa do topo**, com a cor do fundo do `SgButton` da mesma severidade; `plain` não tinge. O `SgConfirmationDialog` herda isso (commit `6d37734`).
- **Decisões do dono (2026-10-25 e 2026-10-26):** em formulário o `onChange` do usuário **sempre** é chamado (o React o engole em Combobox, Autocomplete, MultiSelect, Slider e outros); os validadores dos componentes rodam também em `handleSubmit`/`trigger` (no React só no blur), via `SgFormController.registerField(validator:)`; a barra de força do `SgInputPassword` fica neutra com o campo vazio (alterado também no React). Campo com valor inicial mostra sempre o valor mascarado; breakpoints do `SgGrid` medem a janela, como o `@media` do React.
- **Outros:** `SgForm` envia no Enter de campo de uma linha (`submitOnEnter`); `SgToaster` pode ficar solto numa `Column`/`ListView` (desenha no `Overlay`); texto como `String` ou `Widget`; controllers no lugar de `ref`.
- **Alvo mobile-first:** abaixo de 600 px a lista de opções (combobox, split button, colunas do datatable, menu) vira painel de baixo (ADR 51).
- **Sem `Intl` em tempo de execução para números, datas e fusos:** tabelas geradas do Node (30 locales de número e moeda, 162 moedas; calendário com 33 locales; relógio com 464 nomes IANA em tabela própria). Fora das tabelas o locale cai no idioma e depois em `en-US`.

## O que ainda falta?

- **Publicação no pub.dev:** só com autorização do dono (hoje instala-se do Git).
- **Placar:** segundo `docs/PARIDADE.md` e `docs/paridade.json` (commit `e9989b8`), dos 89 componentes do React **89 estão `portado`, 0 `parcial`, 0 pendentes, 0 não aplicáveis**: desde o commit `b1dfe4e` o `parcial` só vale para funcionalidade que falta, e as diferenças de propósito ficam registradas na coluna "Onde / motivo" ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]).
- **Não portado, de propósito ou por decisão pendente** (todos registrados na tabela): tema de relógio por URL/SVG livre (`SgClockUrlThemeUnsupportedError`, ADR 51/D8); `href` real no `SgBreadcrumb` e no `SgMenu` (falta `url_launcher`: só dispara `onClick`/`onNavigate`); a ligação do SDK Pulse como dependência do `SgRealtimeProvider` (o cliente entra por `connectionFactory`; decisão do dono, commit `c10a137`); perdas do conversor HTML do `SgTextEditor` (tabelas e iframes, entre outras).
- **Limitações recorrentes:** goldens com a fonte de teste do Flutter (sem comparação visual de texto com o React); não testado em IME nem em dispositivo, segundo a tabela.
- O `README.md` do repositório foi atualizado depois da análise anterior (agora fala em "89 de 89" e traz instalação via Git, primeiros passos e a lista de componentes gerada); a divergência antiga entre o README e a tabela de paridade deixou de existir.

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase para esta nota; os números de paridade vêm de `docs/PARIDADE.md` e `docs/paridade.json`, e o que foi lido no código Dart está citado em cada nota de grupo.
- Não acessei `components-flutter.seedgrid.com.br`: o endereço vem do `README.md` e do workflow.
- Conteúdo das ADR 48 a 52 foi lido só pelas citações dos `docs/` e do `README.md`.
