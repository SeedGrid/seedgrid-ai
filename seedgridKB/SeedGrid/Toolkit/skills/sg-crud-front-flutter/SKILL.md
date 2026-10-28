---
name: sg-crud-front-flutter
description: "Cria ou padroniza o CRUD de uma entidade em app Flutter com `seedgrid_components`: lista com `SgInputTextSearch` + `SgDatatable`, telas separadas de lista e de formulário, validação com `SgForm`, exclusão com confirmação e dados lidos de JSON. Use ao montar cadastro (lista, novo, editar, excluir) em Flutter; para Next/React use a `sg-crud-front`."
---

# CRUD SeedGrid em Flutter

Irmã da `sg-crud-front` (React/Next): **mesma filosofia de comportamento**, componentes Flutter. Implementação de referência: `crud_clientes_page.dart` do showcase Flutter (3 classes: `ClientesLista`, `ClienteForm`, `ClientesCrud`; dados em `assets/data/clientes.json`; teste de fluxo em `test/crud_clientes_test.dart`). *Exemplo de referência ainda não publicado (commit local do `seedgrid-fe-flutter`).*

Antes de escrever, leia as notas de Flutter da KB: `SeedGrid-components/flutter/Traducao-React-para-Dart.md` (formulário e tabela), `Exemplos-datatable-e-editor.md`, `Exemplos-inputs-texto-e-mascara.md`, `Exemplos-overlay-e-feedback.md` e `Divergencias.md`.

## Estrutura

- `<entidade>_lista` e `<entidade>_form` em **telas separadas**, mais um orquestrador (`<Entidade>Crud`) que guarda a lista e alterna as telas.
- `publicId` como chave de linha (`dataKey: 'publicId'`) e de navegação. Nunca o id numérico.
- Dados: JSON por `DefaultAssetBundle.of(context).loadString` (**não** `rootBundle` direto, para o teste injetar um bundle síncrono), carregado uma vez em `didChangeDependencies`.

## Lista

- Barra: `SgStack` em linha, com `SgInputTextSearch` crescendo (`SgStack(grow: true)`) e `SgButton` "Novo" compacto. A busca com mínimo de 3 caracteres já vem do `SgInputTextSearch` (`minChars`, `debounceMs`).
- `SgDatatable`: `dataKey: 'publicId'`, `paginator`, `rows`, colunas `sortable`. Estado vazio com `emptyMessage`; carga com `loading: true`.
- Ações por linha: coluna **sem `field`**, com `body: (row, meta)` e `SgButton(iconOnly: true, leftIcon: Icon(...))`. Situação com `SgBadge` (verde/vermelho).
- Linhas são `Map<String, Object?>` (`SgDatatableRow`); o `SgDatatable` não é genérico e não aceita classes.

## Formulário

- `SgFormController(defaultValues)` + `SgForm(onValid)`; cada campo se liga por `name` e `control`. Faça `dispose` do controller.
- Input certo por tipo: `SgInputText`, `SgInputEmail`, `SgCombobox<String>`, `SgInputCurrency` (valor em string `"0.00"`, converta no submit), `SgToggleSwitch`. Nunca `SgInputText` para número ou dinheiro. Salvar com `SgButtonType.submit`.
- Obrigatórios validados por `SgRules`; mensagens pelo i18n.

## Exclusão e feedback

- `SgConfirmationDialog` com `SgDialogSeverity.danger`; guarde o alvo em estado separado do `open`. Nunca confirmação nativa.
- Ao salvar ou excluir: `toast.success(...)` e volta à lista.

## Armadilhas verificadas

- `SgGroupBox` renderiza o título em MAIÚSCULAS: os testes procuram `NOVO CLIENTE`.
- Colunas de badge e de ação precisam de `width` fixo, senão estouram em telas estreitas.
- A fonte do teste (Ahem) é larga: dê folga aos tamanhos.
- Leitura de asset por `rootBundle` não anda no relógio falso do `testWidgets`: use `DefaultAssetBundle`.

## Checklist

- [ ] Lista e edição em telas separadas; `publicId` na chave e na navegação.
- [ ] Busca (`SgInputTextSearch`), ordenação, paginação, estado vazio e de carga.
- [ ] Confirmação antes de excluir; aviso ao salvar.
- [ ] Validação dos obrigatórios; input certo por tipo.
- [ ] Textos pelo i18n.
- [ ] Teste de fluxo: carregar, buscar, editar, criar com validação, excluir com confirmação.
- [ ] Se for exemplo de showcase: regras do `AGENTS.md` (código 1:1 com o renderizado, `SgPlayground`, Referência de Props, cabeçalho fixo).
