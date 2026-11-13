---
name: sg-crud-front-flutter
description: "Cria ou padroniza o CRUD de uma entidade em app Flutter com `seedgrid_components`: lista com `SgInputTextSearch` + `SgDatatable`, telas separadas de lista e de formulário, validação com `SgForm`, exclusão com confirmação e dados lidos de JSON. Use ao montar cadastro (lista, novo, editar, excluir) em Flutter; para Next/React use a `sg-crud-front`."
---

# CRUD SeedGrid em Flutter

Papel que usa esta skill: `frontend-flutter` (`.ai/agents/frontend-flutter.md`). O `frontend-react` usa a `sg-crud-front`.

Irmã da `sg-crud-front` (React/Next): **mesma filosofia de comportamento**, componentes Flutter. Implementação de referência: `crud_clientes_page.dart` do showcase Flutter (3 classes: `ClientesLista`, `ClienteForm`, `ClientesCrud`; dados em `assets/data/clientes.json`; teste de fluxo em `test/crud_clientes_test.dart`). *Exemplo de referência ainda não publicado (commit local do `seedgrid-fe-flutter`).*

Antes de escrever, leia as notas de Flutter da KB: `SeedGrid-components/flutter/Traducao-React-para-Dart.md` (formulário e tabela), `datatable/Exemplos.md`, `editor/Exemplos.md`, `inputs-texto/Exemplos.md`, `navegacao-e-overlay/Exemplos.md`, `feedback-e-exibicao/Exemplos.md` (todas dentro de `flutter/`) e `Divergencias.md`.

## Estrutura

- `<entidade>_lista` e `<entidade>_form` em **telas separadas**, mais um orquestrador (`<Entidade>Crud`) que guarda a lista e alterna as telas.
- `publicId` como chave de linha (`dataKey: 'publicId'`) e de navegação. Nunca o id numérico.
- Dados: JSON por `DefaultAssetBundle.of(context).loadString` (**não** `rootBundle` direto, para o teste injetar um bundle síncrono), carregado uma vez em `didChangeDependencies`.

## Lista

- Barra: `SgStack` em linha, com `SgInputTextSearch` crescendo (`SgStack(grow: true)`) e `SgButton` "Novo" compacto. A busca com mínimo de 3 caracteres já vem do `SgInputTextSearch` (`minChars`, `debounceMs`).
- `SgDatatable`: `dataKey: 'publicId'`, `paginator`, `rows`, colunas `sortable`. Estado vazio com `emptyMessage`; carga com `loading: true`.
- Ações por linha: coluna **sem `field`**, com `body: (row, meta)` e `SgButton(iconOnly: true, leftIcon: Icon(...))`. Situação com `SgBadge` (verde/vermelho).
- Linhas são `Map<String, Object?>` (`SgDatatableRow`); o `SgDatatable` não é genérico e não aceita classes.
- Lista para celular: `cardTitle: true` na coluna principal (`cardHidden: true` nas que não cabem no cartão). Depois da próxima publicação do `seedgrid_components` (P127 + P137, ainda não publicada), omitir `mobileMode` é o automático: abaixo de 600 px de largura do contêiner cada linha vira cartão com rolagem infinita (exige `paginator`; o paginador some nessa largura, `infiniteScroll: false` o mantém); acima, a tabela. `SgDatatableMobileMode.cards` força cartões e `.scroll` força a tabela. Até lá use `mobileMode: SgDatatableMobileMode.cards` explícito. Não crie tabela responsiva local.

## Formulário

- `SgFormController(defaultValues)` + `SgForm(onValid)`; cada campo se liga por `name` e `control`. Faça `dispose` do controller.
- **Sem `setState` de página (ADR 63):** o campo ligado por `name` e `control` guarda o próprio valor; leia no envio (`handleSubmit`) ou com `form.watch('nome')`, e para reagir a uma mudança escute o controller com `ListenableBuilder(listenable: form, builder: ...)`, que reconstrói só aquele trecho. Valor solto fora do formulário (alvo da exclusão, aba, filtro): `ValueNotifier` com `ValueListenableBuilder`. Não use `setState` na tela inteira para isso: ele reconstrói a página. Se um componente só funcionar com valor controlado pela página, avise a `front` em vez de contornar com `setState`.
- Input certo por tipo: `SgInputText`, `SgInputEmail`, `SgCombobox<String>`, `SgInputCurrency` (valor em string `"0.00"`, converta no submit), `SgToggleSwitch`. Nunca `SgInputText` para número ou dinheiro. Salvar com `SgButtonType.submit`.
- Obrigatórios por `required: true` e `requiredMessage` no próprio campo; validação própria por `validation` (o `SgRules` e a prop `rules` não existem mais no Flutter); mensagens pelo i18n.

## Exclusão e feedback

- `SgConfirmationDialog` com `SgDialogSeverity.danger`; guarde o alvo em estado separado do `open`. Nunca confirmação nativa.
- Ao salvar ou excluir: `toast.success(...)` e volta à lista.
- Aviso persistente ao usuário logado (relatório pronto, backup concluído, importação, convite): `SgNotificationBell` no cabeçalho do layout autenticado, nunca `toast` nem sino feito à mão. Exige a extension `user-notifications` no backend; use `types` para mapear cada tipo a um ícone e a uma ação. `apiUrl` e `tokenEndpoint` são URLs absolutas; o tempo real entra por `connectionFactory` (sem ele, polling de reserva). Veja a nota `SgNotificationBell` na KB de componentes.

## Armadilhas verificadas

- `SgGroupBox` renderiza o título em MAIÚSCULAS: os testes procuram `NOVO CLIENTE`.
- Colunas de badge e de ação precisam de `width` fixo, senão estouram em telas estreitas.
- A fonte do teste (Ahem) é larga: dê folga aos tamanhos.
- Leitura de asset por `rootBundle` não anda no relógio falso do `testWidgets`: use `DefaultAssetBundle`.

## Checklist

- [ ] Lista e edição em telas separadas; `publicId` na chave e na navegação.
- [ ] Busca (`SgInputTextSearch`), ordenação, paginação, estado vazio e de carga.
- [ ] Lista usável em celular (cartões automáticos ou `mobileMode: cards`, com `cardTitle`).
- [ ] Confirmação antes de excluir; aviso ao salvar.
- [ ] Validação dos obrigatórios; input certo por tipo.
- [ ] Textos pelo i18n.
- [ ] Teste de fluxo: carregar, buscar, editar, criar com validação, excluir com confirmação.
- [ ] Se for exemplo de showcase: regras do `AGENTS.md` (código 1:1 com o renderizado, `SgPlayground`, Referência de Props, cabeçalho fixo).
