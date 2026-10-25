---
description: "Exemplos Flutter de Botões copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos]
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Botões

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgButton

Fonte: `apps/seedgrid_showcase/lib/pages/sg_button_page.dart` (5 exemplo(s) na página; abaixo 2).

### Severidades

Região `sgButtonSeveridades` em `sg_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(label: const Text('Primary'), onClick: () {}),
    SgButton(
      label: const Text('Secondary'),
      severity: SgSeverity.secondary,
      onClick: () {},
    ),
    SgButton(
      label: const Text('Success'),
      severity: SgSeverity.success,
      onClick: () {},
    ),
    SgButton(
      label: const Text('Info'),
      severity: SgSeverity.info,
      onClick: () {},
    ),
    SgButton(
      label: const Text('Warning'),
      severity: SgSeverity.warning,
      onClick: () {},
    ),
    SgButton(
      label: const Text('Help'),
      severity: SgSeverity.help,
      onClick: () {},
    ),
    SgButton(
      label: const Text('Danger'),
      severity: SgSeverity.danger,
      onClick: () {},
    ),
  ],
)
```

### Cores customizadas

Região `sgButtonCores` em `sg_button_page.snippets.g.dart`.

```dart
SgButton(
  label: const Text('Roxo'),
  customColors: const SgButtonCustomColors(
    bg: Color(0xFF7C3AED),
    fg: Colors.white,
    border: Color(0xFF6D28D9),
    hoverBg: Color(0xFF6D28D9),
  ),
  onClick: () {},
)
```

## SgSplitButton

Fonte: `apps/seedgrid_showcase/lib/pages/sg_split_button_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgSplitButtonBasico` em `sg_split_button_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgSplitButton(
      label: 'Salvar',
      onClick: () => setState(() => _ultima = 'salvar'),
      items: [
        SgSplitButtonItem(
          label: 'Salvar e fechar',
          onClick: () =>
              setState(() => _ultima = 'salvar e fechar'),
        ),
        SgSplitButtonItem(
          label: 'Salvar como rascunho',
          onClick: () => setState(() => _ultima = 'rascunho'),
        ),
      ],
    ),
    const SizedBox(width: 12),
    if (_ultima.isNotEmpty) Text('Última ação: $_ultima'),
  ],
)
```

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
    const SgSplitButtonItem(label: 'Indisponível', disabled: true),
  ],
)
```

## SgFloatActionButton

Fonte: `apps/seedgrid_showcase/lib/pages/sg_float_action_button_page.dart` (6 exemplo(s) na página; abaixo 2).

### Básico e posições

Região `sgFabBasico` em `sg_float_action_button_page.snippets.g.dart`.

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
        Center(child: Text('Cliques: $_cliques')),
        SgFloatActionButton(
          absolute: true,
          hint: 'Novo item',
          onClick: () => setState(() => _cliques++),
        ),
        const SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.leftTop,
          severity: SgFloatActionButtonSeverity.success,
          icon: Icon(Icons.check),
        ),
        const SgFloatActionButton(
          absolute: true,
          position: SgFloatActionButtonPosition.centerBottom,
          severity: SgFloatActionButtonSeverity.danger,
          icon: Icon(Icons.delete),
        ),
      ],
    ),
  ),
)
```

### Arrastar e lembrar a posição

Região `sgFabArrastar` em `sg_float_action_button_page.snippets.g.dart`.

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
          enableDragDrop: true,
          dragId: 'showcase-fab',
          hint: 'Arraste-me',
          actions: [
            SgFABAction(icon: Icon(Icons.edit), label: 'Editar'),
            SgFABAction(icon: Icon(Icons.share), label: 'Enviar'),
          ],
        ),
      ],
    ),
  ),
)
```
