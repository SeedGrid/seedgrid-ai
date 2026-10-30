---
description: "Exemplos Dart de Botões em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, buttons, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Botões (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/buttons/Exemplos|Exemplos — Botões (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/buttons/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgButton

Página: `apps/seedgrid_showcase/lib/pages/sg_button_page.dart` (5 exemplo(s) na página; abaixo 3).

### Severidades

Define o peso visual e semântico da ação.

Região `sgButtonSeveridades` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(label: Text('Primary'), onClick: () {}),
    SgButton(
      label: Text('Secondary'),
      severity: SgSeverity.secondary,
      onClick: () {},
    ),
    SgButton(
      label: Text('Success'),
      severity: SgSeverity.success,
      onClick: () {},
    ),
    SgButton(
      label: Text('Info'),
      severity: SgSeverity.info,
      onClick: () {},
    ),
    SgButton(
      label: Text('Warning'),
      severity: SgSeverity.warning,
      onClick: () {},
    ),
    SgButton(
      label: Text('Help'),
      severity: SgSeverity.help,
      onClick: () {},
    ),
    SgButton(
      label: Text('Danger'),
      severity: SgSeverity.danger,
      onClick: () {},
    ),
  ],
)
```

### Aparências

Região `sgButtonAparencias` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(label: Text('Solid'), onClick: () {}),
    SgButton(
      label: Text('Outline'),
      appearance: SgAppearance.outline,
      onClick: () {},
    ),
    SgButton(
      label: Text('Ghost'),
      appearance: SgAppearance.ghost,
      onClick: () {},
    ),
  ],
)
```

### Tamanhos, formas e sombra

Região `sgButtonTamanhos` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      label: Text('Small'),
      size: SgSize.sm,
      onClick: () {},
    ),
    SgButton(label: Text('Medium'), onClick: () {}),
    SgButton(
      label: Text('Large'),
      size: SgSize.lg,
      onClick: () {},
    ),
    SgButton(
      label: Text('Rounded'),
      shape: SgButtonShape.rounded,
      onClick: () {},
    ),
    SgButton(
      label: Text('Square'),
      shape: SgButtonShape.square,
      onClick: () {},
    ),
    SgButton(
      label: Text('Sombra'),
      elevation: SgElevation.md,
      onClick: () {},
    ),
  ],
)
```

## SgSplitButton

Página: `apps/seedgrid_showcase/lib/pages/sg_split_button_page.dart` (5 exemplo(s) na página; abaixo 3).

### Ícones, separador e item desabilitado

Região `sgSplitButtonItens` em `sg_split_button_page.snippets.g.dart`.

```dart
SgSplitButton(
  label: 'Exportar',
  leftIcon: const Icon(Icons.download),
  items: [
    SgSplitButtonItem(
      label: 'PDF',
      icon: const Icon(Icons.picture_as_pdf),
      onClick: () {},
    ),
    SgSplitButtonItem(
      label: 'Planilha',
      icon: const Icon(Icons.table_chart),
      onClick: () {},
    ),
    SgSplitButtonItem(
      label: 'Imprimir',
      icon: const Icon(Icons.print),
      separator: true,
      onClick: () {},
    ),
    SgSplitButtonItem(
      label: 'Indisponível',
      disabled: true,
    ),
  ],
)
```

### Severidades e aparências

Região `sgSplitButtonEstilos` em `sg_split_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgSplitButton(
      label: 'Success',
      severity: SgSeverity.success,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
    SgSplitButton(
      label: 'Danger',
      severity: SgSeverity.danger,
      appearance: SgAppearance.outline,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
    SgSplitButton(
      label: 'Help',
      severity: SgSeverity.help,
      appearance: SgAppearance.ghost,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
  ],
)
```

### Tamanhos, formas e sombra

Região `sgSplitButtonTamanhos` em `sg_split_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgSplitButton(
      label: 'Small',
      size: SgSize.sm,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
    SgSplitButton(
      label: 'Large',
      size: SgSize.lg,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
    SgSplitButton(
      label: 'Rounded',
      shape: SgSplitButtonShape.rounded,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
    SgSplitButton(
      label: 'Square',
      shape: SgSplitButtonShape.square,
      elevation: SgElevation.md,
      items: [
        SgSplitButtonItem(
          label: 'Opção',
          onClick: () {},
        ),
      ],
    ),
  ],
)
```

## SgFloatActionButton

Página: `apps/seedgrid_showcase/lib/pages/sg_float_action_button_page.dart` (6 exemplo(s) na página; abaixo 3).

### Aparência

severity, size, shape, elevation, color customizada, loading e disabled.

Região `sgFabAparencia` em `sg_float_action_button_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: const Stack(
      children: [
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.leftTop,
          size: SgFloatActionButtonSize.sm,
          severity: SgFloatActionButtonSeverity.secondary,
        ),
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.centerTop,
          shape: SgFloatActionButtonShape.rounded,
          elevation: SgFloatActionButtonElevation.lg,
          severity: SgFloatActionButtonSeverity.warning,
        ),
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.rightTop,
          size: SgFloatActionButtonSize.lg,
          shape: SgFloatActionButtonShape.square,
          color: '#7C3AED',
        ),
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.leftBottom,
          loading: true,
        ),
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.centerBottom,
          disabled: true,
        ),
      ],
    ),
  ),
)
```

### Layouts em arco

type: circle, semiCircle ou quarterCircle espalha as ações em arco; radius ajusta o alcance.

Região `sgFabArco` em `sg_float_action_button_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.centerBottom,
          type: SgFloatActionButtonType.semiCircle,
          radius: 90,
          actions: [
            SgFABAction(
              icon: Icon(Icons.home),
              label: 'Início',
            ),
            SgFABAction(
              icon: Icon(Icons.search),
              label: 'Buscar',
            ),
            SgFABAction(
              icon: Icon(Icons.person),
              label: 'Perfil',
            ),
          ],
        ),
      ],
    ),
  ),
)
```

### Animações

animation (scale, fade, slide, rotate, pulse) disparada em animationOn: mount, hover ou click. Cada botão também abre um speed-dial ao tocar.

Região `sgFabAnimacoes` em `sg_float_action_button_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.leftBottom,
          animation: SgFloatActionButtonAnimation.pulse,
          actions: [
            SgFABAction(
              icon: Icon(Icons.edit),
              label: 'Editar',
            ),
            SgFABAction(
              icon: Icon(Icons.share),
              label: 'Compartilhar',
            ),
          ],
        ),
        SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.centerBottom,
          animation: SgFloatActionButtonAnimation.rotate,
          animationOn: SgFloatActionButtonAnimationOn.hover,
          actions: [
            SgFABAction(
              icon: Icon(Icons.edit),
              label: 'Editar',
            ),
            SgFABAction(
              icon: Icon(Icons.share),
              label: 'Compartilhar',
            ),
          ],
        ),
        SgFloatActionButton(
          absolute: true,
          animation: SgFloatActionButtonAnimation.scale,
          animationOn: SgFloatActionButtonAnimationOn.click,
          actions: [
            SgFABAction(
              icon: Icon(Icons.edit),
              label: 'Editar',
            ),
            SgFABAction(
              icon: Icon(Icons.share),
              label: 'Compartilhar',
            ),
          ],
        ),
      ],
    ),
  ),
)
```

