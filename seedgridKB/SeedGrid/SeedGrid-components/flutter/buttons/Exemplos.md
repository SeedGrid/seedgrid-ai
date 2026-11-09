---
description: "Exemplos Dart de Botões em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, buttons, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Botões (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/buttons/Exemplos|Exemplos — Botões (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/buttons/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'` e `context.tx(nome)` (com variável) virou `nome`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgButton

Página: `apps/seedgrid_showcase/lib/pages/sg_button_page.dart` (17 exemplo(s) na página; abaixo 6).

### Severities

severity: primary, secondary, success, info, warning, help ou danger.

Região `sgButtonSeverities` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    for (final (nome, severity) in const [
      ('Primary', SgSeverity.primary),
      ('Secondary', SgSeverity.secondary),
      ('Success', SgSeverity.success),
      ('Info', SgSeverity.info),
      ('Warning', SgSeverity.warning),
      ('Help', SgSeverity.help),
      ('Danger', SgSeverity.danger),
    ])
      SgButton(
        label: Text(nome),
        severity: severity,
        onClick: () {},
      ),
  ],
)
```

### Outlined Buttons

appearance: outline - apenas bordas coloridas.

Região `sgButtonOutlined` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    for (final (nome, severity) in const [
      ('Primary', SgSeverity.primary),
      ('Secondary', SgSeverity.secondary),
      ('Success', SgSeverity.success),
      ('Info', SgSeverity.info),
      ('Warning', SgSeverity.warning),
      ('Help', SgSeverity.help),
      ('Danger', SgSeverity.danger),
    ])
      SgButton(
        label: Text(nome),
        severity: severity,
        appearance: SgAppearance.outline,
        onClick: () {},
      ),
  ],
)
```

### Sizes

size: sm, md ou lg.

Região `sgButtonSizes` em `sg_button_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        SgButton(
          label: Text('Small'),
          size: SgSize.sm,
          onClick: () {},
        ),
        SgButton(
          label: Text('Medium'),
          size: SgSize.md,
          onClick: () {},
        ),
        SgButton(
          label: Text('Large'),
          size: SgSize.lg,
          onClick: () {},
        ),
      ],
    ),
    const SizedBox(height: 12),
    Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        SgButton(
          size: SgSize.sm,
          shape: SgButtonShape.rounded,
          leftIcon: const Icon(Icons.check),
          onClick: () {},
        ),
        SgButton(
          size: SgSize.md,
          shape: SgButtonShape.rounded,
          leftIcon: const Icon(Icons.check),
          onClick: () {},
        ),
        SgButton(
          size: SgSize.lg,
          shape: SgButtonShape.rounded,
          leftIcon: const Icon(Icons.check),
          onClick: () {},
        ),
      ],
    ),
  ],
)
```

### Loading automático com Future

Se o onClick devolve uma operação assíncrona (Promise no React, Future no Flutter), o botão entra em loading sozinho: mostra o spinner, fica desabilitado e ignora cliques, inclusive cliques seguidos antes de a tela atualizar, até a operação terminar. Ao terminar ou falhar, volta ao normal. Isso evita duplo clique e reenvio e ajuda na idempotência da ação na tela, mas não substitui a chave de idempotência no servidor. A prop loading manual continua valendo e vence: o loading efetivo é loading ou operação pendente.

Região `sgButtonLoadingAutomatico` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      label: Text('Submit'),
      onClick: () async {
        final saving = 'Saving...';
        final done = 'Done';
        _status.value = saving;
        await Future.delayed(const Duration(milliseconds: 1500));
        _status.value = done;
      },
    ),
    ValueListenableBuilder<String?>(
      valueListenable: _status,
      builder: (context, status, _) =>
          Text(status ?? 'Idle'),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_status`: `ValueNotifier<String?>`, valor inicial `null`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### onClick síncrono x assíncrono

O onClick pode ou não ser assíncrono. Função síncrona (abrir um modal, alternar um painel) funciona como sempre e nada muda. Para o botão proteger a ação, o onClick precisa DEVOLVER a operação assíncrona: no React, async () => { await salvar(); } ou () => salvar(); no Flutter, async () { ... } sempre devolve um Future. Chamar salvar() sem devolver o resultado (no React, chaves sem return; no Flutter, função que não é async) não protege. Use async só quando a ação puder demorar ou falhar (salvar, enviar, pagar); ações instantâneas ficam síncronas.

Região `sgButtonOnclickSincronoXAssincrono` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      label: Text('Toggle panel'),
      appearance: SgAppearance.outline,
      onClick: () {
        _panel.value = !_panel.value;
      },
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _panel,
      builder: (context, open, _) =>
          Text(open ? 'Open' : 'Closed'),
    ),
    SgButton(
      label: Text('Save'),
      onClick: () async {
        final saving = 'Saving...';
        final saved = 'Saved';
        _saved.value = saving;
        await Future.delayed(const Duration(milliseconds: 1500));
        _saved.value = saved;
      },
    ),
    ValueListenableBuilder<String?>(
      valueListenable: _saved,
      builder: (context, status, _) =>
          Text(status ?? 'Idle'),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_panel`: `ValueNotifier<bool>`, valor inicial `false`; `_saved`: `ValueNotifier<String?>`, valor inicial `null`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Tratando erro no onClick assíncrono

O botão não engole o erro: se a operação falhar, ele sai do loading e relança o erro como rejeição não tratada. Por isso, trate a falha com try/catch dentro do onClick e avise o usuário (por exemplo, com sgWhistle.error). Neste exemplo a operação sempre falha e o aviso aparece na caixa abaixo.

Região `sgButtonTratandoErroNoOnclickAssincrono` em `sg_button_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  children: [
    SgButton(
      label: Text('Save (fails)'),
      severity: SgSeverity.danger,
      onClick: () async {
        final title = 'Could not save';
        final message = 'Check your connection and try again.';
        try {
          await Future.delayed(const Duration(milliseconds: 1200));
          throw Exception('Network error');
        } catch (_) {
          sgWhistle.error(
            SgWhistleOptions(title: title, message: message),
          );
        }
      },
    ),
    const SgWhistler(),
  ],
)
```

## SgSplitButton

Página: `apps/seedgrid_showcase/lib/pages/sg_split_button_page.dart` (11 exemplo(s) na página; abaixo 3).

### Com ícones

leftIcon na ação principal e icon nos itens do menu.

Região `sgSplitButtonComIcones` em `sg_split_button_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final itens = [
      SgSplitButtonItem(
        label: 'Update',
        icon: const Icon(Icons.refresh),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Delete',
        icon: const Icon(Icons.delete),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Home',
        icon: const Icon(Icons.home),
        onClick: () {},
      ),
    ];
    final itensArquivo = [
      SgSplitButtonItem(
        label: 'Copiar',
        icon: const Icon(Icons.copy),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Imprimir',
        icon: const Icon(Icons.print),
        onClick: () {},
      ),
      SgSplitButtonItem(
        separator: true,
        label: 'Exportar PDF',
        icon: const Icon(Icons.picture_as_pdf),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Compartilhar por e-mail',
        icon: const Icon(Icons.mail),
        onClick: () {},
      ),
    ];
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        SgSplitButton(
          label: 'Save',
          leftIcon: const Icon(Icons.save),
          severity: SgSeverity.primary,
          onClick: () {},
          items: itens,
        ),
        SgSplitButton(
          label: 'Novo',
          leftIcon: const Icon(Icons.add),
          severity: SgSeverity.success,
          onClick: () {},
          items: [
            SgSplitButtonItem(
              label: 'Importar',
              icon: const Icon(Icons.upload),
              onClick: () {},
            ),
            SgSplitButtonItem(
              label: 'Baixar modelo',
              icon: const Icon(Icons.download),
              onClick: () {},
            ),
          ],
        ),
        SgSplitButton(
          label: 'Compartilhar',
          leftIcon: const Icon(Icons.share),
          severity: SgSeverity.info,
          onClick: () {},
          items: itensArquivo,
        ),
      ],
    );
  },
)
```

### Severidades

severity: primary, secondary, success, info, warning, help ou danger.

Região `sgSplitButtonSeveridades` em `sg_split_button_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final itens = [
      SgSplitButtonItem(
        label: 'Update',
        icon: const Icon(Icons.refresh),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Delete',
        icon: const Icon(Icons.delete),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Home',
        icon: const Icon(Icons.home),
        onClick: () {},
      ),
    ];
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        for (final (nome, severity) in const [
          ('Primary', SgSeverity.primary),
          ('Secondary', SgSeverity.secondary),
          ('Success', SgSeverity.success),
          ('Info', SgSeverity.info),
          ('Warning', SgSeverity.warning),
          ('Help', SgSeverity.help),
          ('Danger', SgSeverity.danger),
        ])
          SgSplitButton(
            label: nome,
            severity: severity,
            onClick: () {},
            items: itens,
          ),
      ],
    );
  },
)
```

### Tamanhos

size: sm, md ou lg.

Região `sgSplitButtonTamanhos` em `sg_split_button_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final itens = [
      SgSplitButtonItem(
        label: 'Update',
        icon: const Icon(Icons.refresh),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Delete',
        icon: const Icon(Icons.delete),
        onClick: () {},
      ),
      SgSplitButtonItem(
        label: 'Home',
        icon: const Icon(Icons.home),
        onClick: () {},
      ),
    ];
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        SgSplitButton(
          label: 'Small',
          size: SgSize.sm,
          leftIcon: const Icon(Icons.save),
          onClick: () {},
          items: itens,
        ),
        SgSplitButton(
          label: 'Medium',
          size: SgSize.md,
          leftIcon: const Icon(Icons.save),
          onClick: () {},
          items: itens,
        ),
        SgSplitButton(
          label: 'Large',
          size: SgSize.lg,
          leftIcon: const Icon(Icons.save),
          onClick: () {},
          items: itens,
        ),
      ],
    );
  },
)
```

## SgFloatActionButton

Página: `apps/seedgrid_showcase/lib/pages/sg_float_action_button_page.dart` (14 exemplo(s) na página; abaixo 3).

### Cor Customizada

Use a prop color para definir uma cor personalizada (hex, rgb, hsl ou variável CSS).

Região `sgFabCor` em `sg_float_action_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 24,
  children: [
    for (final (cor, icone) in const [
      ('#8b5cf6', Icons.star),
      ('#ec4899', Icons.favorite),
      ('#f97316', Icons.settings),
    ])
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox.square(
            dimension: 104,
            child: SgFloatActionButton(
              absolute: true,
              color: cor,
              icon: Icon(icone),
              onClick: () {},
            ),
          ),
          Text(cor, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
  ],
)
```

### Circle Layout

Actions arranged in a full circle around the button

Região `sgFabCircle` em `sg_float_action_button_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final acoes = [
      SgFABAction(
        icon: const Icon(Icons.person_add),
        label: 'Novo usuário',
        onClick: () {},
      ),
      SgFABAction(
        icon: const Icon(Icons.note_add),
        label: 'Novo arquivo',
        onClick: () {},
      ),
      SgFABAction(
        icon: const Icon(Icons.create_new_folder),
        label: 'Nova pasta',
        onClick: () {},
      ),
    ];
    Widget caixa(double altura, String legenda, Widget fab) =>
        SizedBox(
          height: altura,
          child: DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black26),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Stack(
              children: [
                Positioned(
                  left: 12,
                  top: 8,
                  child: Text(
                    legenda,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                fab,
              ],
            ),
          ),
        );
    return caixa(
      384,
      'type="circle"',
      SgFloatActionButton(
        absolute: true,
        position: SgFloatActionButtonPosition.centerTop,
        offset: const SgFABOffset(y: 100),
        actions: [
          ...acoes,
          ...acoes,
          SgFABAction(
            icon: const Icon(Icons.edit),
            label: 'Edit',
            onClick: () {},
          ),
        ],
        type: SgFloatActionButtonType.circle,
        radius: 120,
        severity: SgFloatActionButtonSeverity.secondary,
      ),
    );
  },
)
```

### Animações

Diferentes tipos de animação: scale, fade, rotate, slide, pulse e none (disparadas ao passar o mouse).

Região `sgFabAnimacoes` em `sg_float_action_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 24,
  children: [
    for (final animation in const [
      SgFloatActionButtonAnimation.scale,
      SgFloatActionButtonAnimation.fade,
      SgFloatActionButtonAnimation.rotate,
      SgFloatActionButtonAnimation.slide,
      SgFloatActionButtonAnimation.pulse,
      SgFloatActionButtonAnimation.none,
    ])
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox.square(
            dimension: 88,
            child: SgFloatActionButton(
              absolute: true,
              animation: animation,
              animationOn: SgFloatActionButtonAnimationOn.hover,
              icon: const Icon(Icons.favorite),
              severity: SgFloatActionButtonSeverity.danger,
              size: SgFloatActionButtonSize.sm,
              onClick: () {},
            ),
          ),
          Text(
            animation.value,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
  ],
)
```

