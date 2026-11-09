---
description: "Exemplos Dart de Navegação, overlay e wizard em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (todos os exemplos de cada componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, navegacao-e-overlay, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Navegação, overlay e wizard (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Exemplos|Exemplos — Navegação, overlay e wizard (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza, na ordem e com os títulos do showcase; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco foi regenerado por script a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 (cópia 1:1). Única alteração: `context.tx('texto')` e `context.txf('texto {x}', {'x': v})` (i18n do showcase, não fazem parte da biblioteca) viraram o literal `'texto'` e a interpolação `'texto ${v}'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`. O showcase não usa `setState` de página: campos de formulário usam `name` + `control: SgFormController`, e o estado de exibição é local e isolado (`ValueNotifier` com `ValueListenableBuilder`/`ListenableBuilder`). Quando o trecho depende de um campo ou auxiliar da página, a linha **Ajuste** logo abaixo do bloco mostra a declaração dele. Todos os exemplos de cada componente estão aqui; o showcase fica em `apps/seedgrid_showcase`.

> **Pré-requisitos.** Os exemplos usam os campos locais listados na linha **Ajuste** de cada um (flags e escolhas como `ValueNotifier`, `GlobalKey`s das âncoras do `SgPopup` e um `SgFormController` nos exemplos do `SgWizard`); os nomes e parâmetros usados existem na API Dart real (`SgDialog(open:, onOpenChange:, title:, footer:)`, `SgPopup(anchorRef:, open:)`, `SgConfirmationDialog(onConfirm:, onCancel:)`, `SgWizard(control:, stepper: SgWizardStepper.numbered)`, `SgWizardPage(fields:)`, `SgDockMenu(items:)`).

## SgDockMenu

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_menu_page.dart` (9 exemplo(s) na página; todos abaixo).

### Como prender dentro da área

Para ficar dentro do preview, coloque o dock em um Stack dentro de uma área com altura definida.

Região `sgDockMenuPrender` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 224,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgDockMenu(
          position: SgDockMenuPosition.centerBottom,
          items: [
            SgDockMenuItem(
              id: 'home',
              icon: const Icon(Icons.home),
              label: 'Home',
            ),
            SgDockMenuItem(
              id: 'mail',
              icon: const Icon(Icons.mail),
              label: 'Mail',
              badge: 5,
            ),
            SgDockMenuItem(
              id: 'notifications',
              icon: const Icon(Icons.notifications),
              label: 'Notifications',
              badge: 12,
            ),
          ],
        ),
      ],
    ),
  ),
)
```

### Básico

Dock padrão na base central com itens clicáveis.

Região `sgDockMenuBasico` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 240,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgDockMenu(
          position: SgDockMenuPosition.centerBottom,
          items: [
            SgDockMenuItem(
              id: 'home',
              icon: const Icon(Icons.home),
              label: 'Home',
              onClick: () => toast.info('Home clicked'),
            ),
            SgDockMenuItem(
              id: 'mail',
              icon: const Icon(Icons.mail),
              label: 'Mail',
              badge: 5,
              onClick: () => toast.info('Mail clicked'),
            ),
            SgDockMenuItem(
              id: 'notifications',
              icon: const Icon(Icons.notifications),
              label: 'Notifications',
              badge: 12,
              onClick: () => toast.info('Notifications clicked'),
            ),
            SgDockMenuItem(
              id: 'settings',
              icon: const Icon(Icons.settings),
              label: 'Settings',
              onClick: () => toast.info('Settings clicked'),
            ),
            SgDockMenuItem(
              id: 'profile',
              icon: const Icon(Icons.person),
              label: 'Profile',
              onClick: () => toast.info('Profile clicked'),
            ),
          ],
        ),
      ],
    ),
  ),
)
```

### Badge externo

Atualize o badge por estado externo e reflita no dock em tempo real.

Região `sgDockMenuBadge` em `sg_dock_menu_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ListenableBuilder(
      listenable: Listenable.merge([_mail, _notificacoes]),
      builder: (context, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgGrid(
            columns: const {'base': 2, 'sm': 4},
            gap: 8,
            children: [
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('+1 Mail'),
                onClick: () => _mail.value++,
              ),
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('+1 Notifications'),
                onClick: () => _notificacoes.value++,
              ),
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('-1 Mail'),
                onClick: () => _mail.value = _mail.value > 0
                    ? _mail.value - 1
                    : 0,
              ),
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('Reset'),
                onClick: () {
                  _mail.value = 0;
                  _notificacoes.value = 0;
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 240,
            child: DecoratedBox(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black26),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Stack(
                children: [
                  SgDockMenu(
                    position: SgDockMenuPosition.centerBottom,
                    items: [
                      SgDockMenuItem(
                        id: 'home',
                        icon: const Icon(Icons.home),
                        label: 'Home',
                        onClick: () => toast.info('Home clicked'),
                      ),
                      SgDockMenuItem(
                        id: 'mail',
                        icon: const Icon(Icons.mail),
                        label: 'Mail',
                        badge: _mail.value,
                        onClick: () => toast.info('Mail clicked'),
                      ),
                      SgDockMenuItem(
                        id: 'notifications',
                        icon: const Icon(Icons.notifications),
                        label: 'Notifications',
                        badge: _notificacoes.value,
                        onClick: () =>
                            toast.info('Notifications clicked'),
                      ),
                      SgDockMenuItem(
                        id: 'settings',
                        icon: const Icon(Icons.settings),
                        label: 'Settings',
                        onClick: () =>
                            toast.info('Settings clicked'),
                      ),
                      SgDockMenuItem(
                        id: 'profile',
                        icon: const Icon(Icons.person),
                        label: 'Profile',
                        onClick: () =>
                            toast.info('Profile clicked'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_mail`, `_notificacoes`), definido assim na página do showcase:

```dart
final ValueNotifier<int> _mail = ValueNotifier(5);
final ValueNotifier<int> _notificacoes = ValueNotifier(12);
```

### Todas as posições

Exibe as 8 posições suportadas em uma grade.

Região `sgDockMenuPosicoes` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 3,
  gap: 16,
  children: [
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.leftTop,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerTop,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.rightTop,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.leftCenter,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    const SizedBox(height: 160),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.rightCenter,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.leftBottom,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.rightBottom,
              itemSize: 36,
              gap: 8,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ],
)
```

### Arrastar e soltar

Permite arrastar o dock e salvar a posição.

Região `sgDockMenuArrastar` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 320,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgDockMenu(
          dragId: 'demo-dockmenu-draggable',
          position: SgDockMenuPosition.centerBottom,
          enableDragDrop: true,
          items: [
            SgDockMenuItem(
              id: 'home',
              icon: const Icon(Icons.home),
              label: 'Home',
              onClick: () => toast.info('Home clicked'),
            ),
            SgDockMenuItem(
              id: 'mail',
              icon: const Icon(Icons.mail),
              label: 'Mail',
              badge: 5,
              onClick: () => toast.info('Mail clicked'),
            ),
            SgDockMenuItem(
              id: 'notifications',
              icon: const Icon(Icons.notifications),
              label: 'Notifications',
              badge: 12,
              onClick: () => toast.info('Notifications clicked'),
            ),
            SgDockMenuItem(
              id: 'settings',
              icon: const Icon(Icons.settings),
              label: 'Settings',
              onClick: () => toast.info('Settings clicked'),
            ),
            SgDockMenuItem(
              id: 'profile',
              icon: const Icon(Icons.person),
              label: 'Profile',
              onClick: () => toast.info('Profile clicked'),
            ),
          ],
        ),
      ],
    ),
  ),
)
```

### Variantes visuais

Sem magnify, sem labels e com estilo customizado.

Região `sgDockMenuVariantes` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SgStack(
  gap: 16,
  children: [
    SizedBox(
      height: 192,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              magnify: false,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
                SgDockMenuItem(
                  id: 'settings',
                  icon: const Icon(Icons.settings),
                  label: 'Settings',
                  onClick: () => toast.info('Settings clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 192,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              showLabels: false,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
                SgDockMenuItem(
                  id: 'settings',
                  icon: const Icon(Icons.settings),
                  label: 'Settings',
                  onClick: () => toast.info('Settings clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      height: 192,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              itemSize: 58,
              gap: 10,
              borderRadius: 28,
              backgroundColor: 'rgba(59, 130, 246, 0.95)',
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                  onClick: () => toast.info('Home clicked'),
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                  onClick: () => toast.info('Mail clicked'),
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  onClick: () =>
                      toast.info('Notifications clicked'),
                ),
                SgDockMenuItem(
                  id: 'settings',
                  icon: const Icon(Icons.settings),
                  label: 'Settings',
                  onClick: () => toast.info('Settings clicked'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ],
)
```

### Muitos itens

Exemplo com uma lista maior de itens.

Região `sgDockMenuMuitos` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 240,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgDockMenu(
          position: SgDockMenuPosition.centerBottom,
          itemSize: 44,
          gap: 10,
          items: [
            SgDockMenuItem(
              id: 'search',
              icon: const Icon(Icons.search),
              label: 'Search',
            ),
            SgDockMenuItem(
              id: 'favorites',
              icon: const Icon(Icons.favorite),
              label: 'Favorites',
              badge: 3,
            ),
            SgDockMenuItem(
              id: 'messages',
              icon: const Icon(Icons.message),
              label: 'Messages',
              badge: '99+',
            ),
            SgDockMenuItem(
              id: 'calendar',
              icon: const Icon(Icons.calendar_today),
              label: 'Calendar',
            ),
            SgDockMenuItem(
              id: 'starred',
              icon: const Icon(Icons.star),
              label: 'Starred',
            ),
            SgDockMenuItem(
              id: 'bookmarks',
              icon: const Icon(Icons.bookmark),
              label: 'Bookmarks',
            ),
            SgDockMenuItem(
              id: 'gallery',
              icon: const Icon(Icons.image),
              label: 'Gallery',
            ),
            SgDockMenuItem(
              id: 'documents',
              icon: const Icon(Icons.description),
              label: 'Documents',
            ),
          ],
        ),
      ],
    ),
  ),
)
```

### Callbacks e desabilitado

Logs de clique e item desabilitado no mesmo exemplo.

Região `sgDockMenuCallbacks` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SgStack(
  gap: 16,
  children: [
    SizedBox(
      height: 240,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              items: [
                SgDockMenuItem(
                  id: 'search',
                  icon: const Icon(Icons.search),
                  label: 'Search',
                  onClick: () => _registrar('Search'),
                ),
                SgDockMenuItem(
                  id: 'favorites',
                  icon: const Icon(Icons.favorite),
                  label: 'Favorites',
                  badge: 3,
                  onClick: () => _registrar('Favorites'),
                ),
                SgDockMenuItem(
                  id: 'messages',
                  icon: const Icon(Icons.message),
                  label: 'Messages',
                  badge: '99+',
                  onClick: () => _registrar('Messages'),
                ),
                SgDockMenuItem(
                  id: 'calendar',
                  icon: const Icon(Icons.calendar_today),
                  label: 'Calendar',
                  onClick: () => _registrar('Calendar'),
                ),
                SgDockMenuItem(
                  id: 'starred',
                  icon: const Icon(Icons.star),
                  label: 'Starred',
                  onClick: () => _registrar('Starred'),
                ),
                SgDockMenuItem(
                  id: 'bookmarks',
                  icon: const Icon(Icons.bookmark),
                  label: 'Bookmarks',
                  onClick: () => _registrar('Bookmarks'),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    ValueListenableBuilder<List<String>>(
      valueListenable: _log,
      builder: (context, log, _) => SizedBox(
        height: 128,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (log.isEmpty)
                Text('Clique em um item para gerar logs...')
              else
                for (final entry in log) Text(entry),
            ],
          ),
        ),
      ),
    ),
    SizedBox(
      height: 240,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            SgDockMenu(
              position: SgDockMenuPosition.centerBottom,
              items: [
                SgDockMenuItem(
                  id: 'home',
                  icon: const Icon(Icons.home),
                  label: 'Home',
                ),
                SgDockMenuItem(
                  id: 'mail',
                  icon: const Icon(Icons.mail),
                  label: 'Mail',
                  badge: 5,
                ),
                SgDockMenuItem(
                  id: 'notifications',
                  icon: const Icon(Icons.notifications),
                  label: 'Notifications',
                  badge: 12,
                  enabled: false,
                ),
                SgDockMenuItem(
                  id: 'settings',
                  icon: const Icon(Icons.settings),
                  label: 'Settings',
                ),
                SgDockMenuItem(
                  id: 'profile',
                  icon: const Icon(Icons.person),
                  label: 'Profile',
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_log`, `_registrar`), definido assim na página do showcase:

```dart
final ValueNotifier<List<String>> _log = ValueNotifier(const []);
void _registrar(String label) {
  final now = TimeOfDay.now().format(context);
  _log.value = ['[$now] $label clicked', ..._log.value].take(10).toList();
}
```

### Zoom, elevação e deslocamento

magnifyScale amplia mais o item sob o mouse, elevation ajusta a sombra e offset afasta o dock da borda.

Região `sgDockMenuZoom` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 240,
  child: DecoratedBox(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.black26),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Stack(
      children: [
        SgDockMenu(
          position: SgDockMenuPosition.centerBottom,
          magnifyScale: 2,
          elevation: SgDockMenuElevation.sm,
          offset: const SgDockMenuOffset(y: -8),
          items: [
            SgDockMenuItem(
              id: 'home',
              icon: const Icon(Icons.home),
              label: 'Home',
            ),
            SgDockMenuItem(
              id: 'mail',
              icon: const Icon(Icons.mail),
              label: 'Mail',
              badge: 5,
            ),
            SgDockMenuItem(
              id: 'notifications',
              icon: const Icon(Icons.notifications),
              label: 'Notifications',
              badge: 12,
            ),
          ],
        ),
      ],
    ),
  ),
)
```

## SgPopup

Página: `apps/seedgrid_showcase/lib/pages/sg_popup_page.dart` (6 exemplo(s) na página; todos abaixo).

### Básico

Popup controlado com ações e conteúdo.

Região `sgPopupBasico` em `sg_popup_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      key: _basicoKey,
      label: Text('Abrir popup'),
      onClick: () => _basico.value = !_basico.value,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _basico,
      builder: (context, aberto, _) => SgPopup(
        anchorRef: _basicoKey,
        open: aberto,
        onOpenChange: (open) => _basico.value = open,
        title: 'Confirma',
        subtitle: 'Tem certeza que deseja continuar?',
        placement: SgPopupPlacement.auto,
        preferPlacement: SgPopupPreferPlacement.right,
        align: SgPopupAlign.start,
        actions: [
          SgPopupAction(label: 'Sim'),
          SgPopupAction(label: 'Não'),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_basicoKey`, `_basico`), definido assim na página do showcase:

```dart
final GlobalKey _basicoKey = GlobalKey();
final ValueNotifier<bool> _basico = ValueNotifier<bool>(false);
```

### Ícone e hint

Ações com ícone e hint (tooltip).

Região `sgPopupIconeHint` em `sg_popup_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      key: _iconeKey,
      label: Text('Abrir popup com ícone'),
      onClick: () => _icone.value = !_icone.value,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _icone,
      builder: (context, aberto, _) => SgPopup(
        anchorRef: _iconeKey,
        open: aberto,
        onOpenChange: (open) => _icone.value = open,
        title: 'Confirma',
        placement: SgPopupPlacement.auto,
        preferPlacement: SgPopupPreferPlacement.right,
        align: SgPopupAlign.start,
        actions: [
          SgPopupAction(
            label: 'Aprovar',
            hint: 'Confirmar aprovação',
            icon: const Icon(Icons.check, size: 16),
          ),
          SgPopupAction(
            label: 'Rejeitar',
            hint: 'Negar a ação',
            icon: const Icon(Icons.close, size: 16),
          ),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_iconeKey`, `_icone`), definido assim na página do showcase:

```dart
final GlobalKey _iconeKey = GlobalKey();
final ValueNotifier<bool> _icone = ValueNotifier<bool>(false);
```

### Conteúdo custom

Use children para renderizar qualquer conteúdo.

Região `sgPopupCustom` em `sg_popup_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      key: _customKey,
      label: Text('Abrir popup custom'),
      onClick: () => _custom.value = !_custom.value,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _custom,
      builder: (context, aberto, _) => SgPopup(
        anchorRef: _customKey,
        open: aberto,
        onOpenChange: (open) => _custom.value = open,
        title: 'Configuração',
        placement: SgPopupPlacement.auto,
        child: SgInputText(
          id: 'popup-modo',
          label: 'Modo',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_customKey`, `_custom`), definido assim na página do showcase:

```dart
final GlobalKey _customKey = GlobalKey();
final ValueNotifier<bool> _custom = ValueNotifier<bool>(false);
```

### Ações

Cada ação tem ícone, dica, severidade e pode manter o popup aberto.

Região `sgPopupAcoes` em `sg_popup_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      key: _acoesKey,
      label: Text('Ações'),
      appearance: SgAppearance.outline,
      onClick: () => _acoes.value = !_acoes.value,
    ),
    const SizedBox(width: 12),
    ValueListenableBuilder<String>(
      valueListenable: _ultima,
      builder: (context, ultima, _) => ultima.isEmpty
          ? const SizedBox()
          : Text('Última ação: $ultima'),
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _acoes,
      builder: (context, aberto, _) => SgPopup(
        anchorRef: _acoesKey,
        open: aberto,
        onOpenChange: (open) => _acoes.value = open,
        actions: [
          SgPopupAction(
            label: 'Editar',
            icon: const Icon(Icons.edit),
            hint: 'Abre o editor',
            onClick: () => _ultima.value = 'editar',
          ),
          SgPopupAction(
            label: 'Duplicar (não fecha)',
            icon: const Icon(Icons.copy),
            closeOnClick: false,
            onClick: () => _ultima.value = 'duplicar',
          ),
          SgPopupAction(
            label: 'Indisponível',
            enabled: false,
          ),
          SgPopupAction(
            label: 'Excluir',
            icon: const Icon(Icons.delete),
            severity: SgPopupSeverity.danger,
            onClick: () => _ultima.value = 'excluir',
          ),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_acoesKey`, `_acoes`, `_ultima`), definido assim na página do showcase:

```dart
final GlobalKey _acoesKey = GlobalKey();
final ValueNotifier<bool> _acoes = ValueNotifier<bool>(false);
final ValueNotifier<String> _ultima = ValueNotifier<String>('');
```

### Posicionamento

placement e align; no modo auto o popup escolhe o lado que cabe na tela.

Região `sgPopupPosicionamento` em `sg_popup_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ListenableBuilder(
      listenable: Listenable.merge([_placement, _align]),
      builder: (context, _) => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          for (final p in SgPopupPlacement.values)
            ChoiceChip(
              label: Text(p.value),
              selected: _placement.value == p,
              onSelected: (_) => _placement.value = p,
            ),
          for (final a in SgPopupAlign.values)
            ChoiceChip(
              label: Text('align ${a.value}'),
              selected: _align.value == a,
              onSelected: (_) => _align.value = a,
            ),
        ],
      ),
    ),
    const SizedBox(height: 12),
    SgButton(
      key: _posKey,
      label: Text('Abrir'),
      onClick: () => _pos.value = !_pos.value,
    ),
    ListenableBuilder(
      listenable: Listenable.merge([_pos, _placement, _align]),
      builder: (context, _) => SgPopup(
        anchorRef: _posKey,
        open: _pos.value,
        onOpenChange: (open) => _pos.value = open,
        placement: _placement.value,
        align: _align.value,
        child: Text('${_placement.value.value} / ${_align.value.value}'),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_posKey`, `_pos`, `_placement`, `_align`), definido assim na página do showcase:

```dart
final GlobalKey _posKey = GlobalKey();
final ValueNotifier<bool> _pos = ValueNotifier<bool>(false);
final ValueNotifier<SgPopupPlacement> _placement =
    ValueNotifier<SgPopupPlacement>(SgPopupPlacement.bottom);
final ValueNotifier<SgPopupAlign> _align = ValueNotifier<SgPopupAlign>(
  SgPopupAlign.start,
);
```

### Fechamento

Sem fechar por clique fora nem por Esc: só o botão do próprio popup fecha.

Região `sgPopupFechamento` em `sg_popup_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      key: _fechaKey,
      label: Text('Abrir fixo'),
      onClick: () => _fecha.value = !_fecha.value,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _fecha,
      builder: (context, aberto, _) => SgPopup(
        anchorRef: _fechaKey,
        open: aberto,
        onOpenChange: (open) => _fecha.value = open,
        closeOnOutsideClick: false,
        closeOnEscape: false,
        title: 'Fixo',
        actions: [SgPopupAction(label: 'Fechar')],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_fechaKey`, `_fecha`), definido assim na página do showcase:

```dart
final GlobalKey _fechaKey = GlobalKey();
final ValueNotifier<bool> _fecha = ValueNotifier<bool>(false);
```

## SgDialog

Página: `apps/seedgrid_showcase/lib/pages/sg_dialog_page.dart` (6 exemplo(s) na página; todos abaixo).

### Básico

Dialog com title, subtitle, leading e trailing.

Região `sgDialogBasico` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir dialog'),
      onClick: () => _basico.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _basico,
      builder: (context, open, _) => SgDialog(
        open: open,
        onOpenChange: (v) => _basico.value = v,
        title: Text('Confirmar ação'),
        subtitle: Text(
          'Essa ação não pode ser desfeita.',
        ),
        customColor: '#fff7ed',
        elevation: 'lg',
        leading: const Text('O'),
        trailing: const Text('ID: 428'),
        footer: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SgButton(
              label: Text('Cancelar'),
              appearance: SgAppearance.ghost,
              onClick: () => _basico.value = false,
            ),
            const SizedBox(width: 8),
            SgButton(
              label: Text('Confirmar'),
              onClick: () => _basico.value = false,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tem certeza que deseja continuar?'),
            const SizedBox(height: 8),
            SgInputText(
              id: 'dialog-input',
              hintText: 'Escreva algo...',
            ),
          ],
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_basico`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _basico = ValueNotifier(false);
```

### Severidade

Cada severidade tinge o fundo e a faixa do topo do diálogo, como no SgWhistler.

Região `sgDialogSeveridade` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final s in SgSeverity.values)
          SgButton(
            label: Text(s.value),
            severity: s,
            onClick: () {
              _sev.value = s;
              _severidade.value = true;
            },
          ),
      ],
    ),
    ListenableBuilder(
      listenable: Listenable.merge([_severidade, _sev]),
      builder: (context, _) => SgDialog(
        open: _severidade.value,
        onOpenChange: (v) => _severidade.value = v,
        severity: SgDialogSeverity.fromValue(_sev.value.value)!,
        title: Text(
          'Severidade: ${_sev.value.value}',
        ),
        footer: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SgButton(
              label: Text('Cancelar'),
              appearance: SgAppearance.ghost,
              onClick: () => _severidade.value = false,
            ),
            const SizedBox(width: 8),
            SgButton(
              label: Text('Confirmar'),
              severity: _sev.value,
              onClick: () => _severidade.value = false,
            ),
          ],
        ),
        child: Text(
          'O fundo e a faixa do topo seguem a severidade escolhida.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_severidade`, `_sev`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _severidade = ValueNotifier(false);
final ValueNotifier<SgSeverity> _sev = ValueNotifier(SgSeverity.primary);
```

### Sem closeable

Exemplo sem botão de fechar no header.

Região `sgDialogSemClose` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir sem close'),
      appearance: SgAppearance.outline,
      onClick: () => _semClose.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _semClose,
      builder: (context, open, _) => SgDialog(
        open: open,
        onOpenChange: (v) => _semClose.value = v,
        closeable: false,
        title: Text('Dialog sem close'),
        subtitle: Text(
          'Fechamento apenas pelos botões do footer.',
        ),
        footer: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SgButton(
              label: Text('Cancelar'),
              appearance: SgAppearance.ghost,
              onClick: () => _semClose.value = false,
            ),
            const SizedBox(width: 8),
            SgButton(
              label: Text('Confirmar'),
              onClick: () => _semClose.value = false,
            ),
          ],
        ),
        child: Text(
          'Use esse modo quando quiser forçar uma escolha explícita.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_semClose`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _semClose = ValueNotifier(false);
```

### Sem overlay e ESC

Fechamento apenas pelos botões do footer.

Região `sgDialogEstrito` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir estrito'),
      appearance: SgAppearance.outline,
      onClick: () => _estrito.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _estrito,
      builder: (context, open, _) => SgDialog(
        open: open,
        onOpenChange: (v) => _estrito.value = v,
        closeable: false,
        closeOnOverlayClick: false,
        closeOnEsc: false,
        title: Text('Dialog estrito'),
        subtitle: Text('Não fecha por overlay ou ESC.'),
        footer: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SgButton(
              label: Text('Cancelar'),
              appearance: SgAppearance.ghost,
              onClick: () => _estrito.value = false,
            ),
            const SizedBox(width: 8),
            SgButton(
              label: Text('Confirmar'),
              onClick: () => _estrito.value = false,
            ),
          ],
        ),
        child: Text(
          'Use quando o usuário precisa tomar uma decisão.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_estrito`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _estrito = ValueNotifier(false);
```

### Fechamento automático

Fecha automaticamente após alguns segundos.

Região `sgDialogAuto` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir auto close'),
      appearance: SgAppearance.outline,
      onClick: () => _auto.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _auto,
      builder: (context, open, _) => SgDialog(
        open: open,
        onOpenChange: (v) => _auto.value = v,
        autoCloseMs: 3000,
        title: Text('Dialog temporizado'),
        subtitle: Text('Este dialog fecha sozinho.'),
        child: Text('Apenas uma informação rápida.'),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_auto`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _auto = ValueNotifier(false);
```

### Animações

animation escolhe como o diálogo entra e sai (fade, zoom ou slideUp) e transitionMs define a duração.

Região `sgDialogAnimacao` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final a in SgDialogAnimation.values)
          SgButton(
            label: Text(a.value),
            appearance: SgAppearance.outline,
            size: SgSize.sm,
            onClick: () {
              _anim.value = a;
              _animacao.value = true;
            },
          ),
      ],
    ),
    ListenableBuilder(
      listenable: Listenable.merge([_animacao, _anim]),
      builder: (context, _) => SgDialog(
        open: _animacao.value,
        onOpenChange: (v) => _animacao.value = v,
        animation: _anim.value,
        transitionMs: 300,
        title: Text(
          'Animação ${_anim.value.value}',
        ),
        child: Text(
          'A animação define como o diálogo entra e sai.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_animacao`, `_anim`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _animacao = ValueNotifier(false);
final ValueNotifier<SgDialogAnimation> _anim = ValueNotifier(
  SgDialogAnimation.zoom,
);
```

## SgConfirmationDialog

Página: `apps/seedgrid_showcase/lib/pages/sg_confirmation_dialog_page.dart` (6 exemplo(s) na página; todos abaixo).

### Básico

Confirmar e cancelar fecham o diálogo; Esc, fundo e X contam como cancelar.

Região `sgConfirmationDialogBasico` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Excluir registro'),
      severity: SgSeverity.danger,
      onClick: () => _basico.value = true,
    ),
    ValueListenableBuilder<String>(
      valueListenable: _resultado,
      builder: (context, resultado, _) => resultado.isEmpty
          ? const SizedBox.shrink()
          : Text(resultado),
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _basico,
      builder: (context, open, _) => SgConfirmationDialog(
        open: open,
        onOpenChange: (value) => _basico.value = value,
        title: Text('Excluir registro?'),
        message: Text(
          'Esta ação não pode ser desfeita.',
        ),
        onConfirm: () => _resultado.value = 'Confirmado',
        onCancel: () => _resultado.value = 'Cancelado',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_basico`, `_resultado`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _basico = ValueNotifier<bool>(false);
final ValueNotifier<String> _resultado = ValueNotifier<String>('');
```

### Severidades

A severidade escolhe o ícone padrão (info, aviso, perigo), tinge o fundo e dá a cor do botão de confirmar.

Região `sgConfirmationDialogSeveridade` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final s in SgSeverity.values)
          SgButton(
            label: Text(s.value),
            severity: s,
            onClick: () {
              _sev.value = SgDialogSeverity.fromValue(s.value)!;
              _severidade.value = true;
            },
          ),
      ],
    ),
    ListenableBuilder(
      listenable: Listenable.merge([_severidade, _sev]),
      builder: (context, _) => SgConfirmationDialog(
        open: _severidade.value,
        onOpenChange: (value) => _severidade.value = value,
        severity: _sev.value,
        showSeverityAccent: true,
        title: Text('Severidade ${_sev.value.value}'),
        message: Text(
          'Veja o ícone, o fundo e o botão de confirmar.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_severidade`, `_sev`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _severidade = ValueNotifier<bool>(false);
final ValueNotifier<SgDialogSeverity> _sev = ValueNotifier<SgDialogSeverity>(
  SgDialogSeverity.warning,
);
```

### Ícone à esquerda

icon próprio e iconPlacement left (padrão): o ícone fica ao lado do texto.

Região `sgConfirmationDialogEsquerda` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir aviso'),
      appearance: SgAppearance.outline,
      onClick: () => _esquerda.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _esquerda,
      builder: (context, open, _) => SgConfirmationDialog(
        open: open,
        onOpenChange: (value) => _esquerda.value = value,
        severity: SgDialogSeverity.warning,
        iconPlacement: SgConfirmationDialogIconPlacement.left,
        icon: const Icon(Icons.warning_amber_rounded, size: 20),
        title: Text('Alterações não salvas'),
        message: Text(
          'Você tem atualizações pendentes. Deseja continuar sem salvar?',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_esquerda`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _esquerda = ValueNotifier<bool>(false);
```

### Ícone no topo

icon próprio e iconPlacement top; closeable mostra o X.

Região `sgConfirmationDialogIcone` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Publicar'),
      severity: SgSeverity.success,
      onClick: () => _icone.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _icone,
      builder: (context, open, _) => SgConfirmationDialog(
        open: open,
        onOpenChange: (value) => _icone.value = value,
        severity: SgDialogSeverity.success,
        iconPlacement: SgConfirmationDialogIconPlacement.top,
        icon: const Icon(Icons.rocket_launch, size: 28),
        closeable: true,
        title: Text('Publicar agora?'),
        message: Text(
          'A versão ficará visível para todos.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_icone`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _icone = ValueNotifier<bool>(false);
```

### Botões customizados

Rótulo, ícone, severidade e aparência de cada botão.

Região `sgConfirmationDialogBotoes` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Sair sem salvar'),
      appearance: SgAppearance.outline,
      onClick: () => _botoes.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _botoes,
      builder: (context, open, _) => SgConfirmationDialog(
        open: open,
        onOpenChange: (value) => _botoes.value = value,
        severity: SgDialogSeverity.danger,
        title: Text('Descartar alterações?'),
        message: Text(
          'As alterações não salvas serão perdidas.',
        ),
        cancelButton: SgConfirmationDialogButtonConfig(
          label: Text('Continuar editando'),
          icon: Icon(Icons.edit),
        ),
        confirmButton: SgConfirmationDialogButtonConfig(
          label: Text('Descartar'),
          icon: Icon(Icons.delete),
          appearance: SgAppearance.outline,
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_botoes`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _botoes = ValueNotifier<bool>(false);
```

### Superfície customizada (customColor + elevation)

customColor muda o fundo do diálogo e elevation define a sombra.

Região `sgConfirmationDialogSuperficie` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir superfície customizada'),
      appearance: SgAppearance.outline,
      onClick: () => _superficie.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _superficie,
      builder: (context, open, _) => SgConfirmationDialog(
        open: open,
        onOpenChange: (value) => _superficie.value = value,
        severity: SgDialogSeverity.danger,
        customColor: '#fff7ed',
        elevation:
            '0 0 0 1px rgba(234, 88, 12, 0.22), 0 24px 56px rgba(234, 88, 12, 0.28)',
        title: Text('Excluir registro?'),
        message: Text(
          'Esta ação não pode ser desfeita.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_superficie`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _superficie = ValueNotifier<bool>(false);
```

## SgWizard

Página: `apps/seedgrid_showcase/lib/pages/sg_wizard_demo_page.dart` (9 exemplo(s) na página; todos abaixo).

### Validação automática

O wizard valida automaticamente os inputs da página antes de avançar. Por padrão, as etapas anteriores e o próximo passo imediato também podem ser clicados no stepper, com a mesma validação do botão Continuar.

Região `sgWizardValidacaoAutomatica` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgWizard(
      control: _form,
      stepper: SgWizardStepper.numbered,
      initialStep: 0,
      stepNavigation: SgWizardStepNavigation.previousAndNext,
      onStepChange: (i) => _etapa.value = i,
      onFinish: () async {
        _enviado.value = null;
        await Future<void>.delayed(
          const Duration(milliseconds: 800),
        );
        _enviado.value = Map.of(_form.getValues());
      },
      children: [
        SgWizardPage(
          title: 'Etapa 1 - Dados pessoais',
          fields: const ['nome', 'email'],
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Preencha nome e e-mail para avançar.',
              ),
              const SizedBox(height: 12),
              SgInputText(
                id: 'wizard-name',
                name: 'nome',
                control: _form,
                labelText: 'Nome',
                required: true,
                requiredMessage: 'Informe o nome.',
              ),
              const SizedBox(height: 12),
              SgInputEmail(
                id: 'wizard-email',
                name: 'email',
                control: _form,
                labelText: 'E-mail',
                required: true,
                requiredMessage: 'Informe o e-mail.',
                invalidMessage: 'E-mail inválido.',
              ),
            ],
          ),
        ),
        SgWizardPage(
          title: 'Etapa 2 - Contato',
          fields: const ['telefone'],
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Informe o telefone.'),
              const SizedBox(height: 12),
              SgInputPhone(
                id: 'wizard-phone',
                name: 'telefone',
                control: _form,
                labelText: 'Telefone',
                required: true,
                requiredMessage: 'Informe o telefone.',
                lengthMessage: 'Telefone inválido.',
              ),
            ],
          ),
        ),
        SgWizardPage(
          title: 'Etapa 3 - Confirmação',
          child: ListenableBuilder(
            listenable: _form,
            builder: (context, _) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Revise os dados e finalize.',
                ),
                const SizedBox(height: 12),
                Text(
                  'Nome: ${_form.getValue('nome') ?? '-'}',
                ),
                Text(
                  'E-mail: ${_form.getValue('email') ?? '-'}',
                ),
                Text(
                  'Telefone: ${_form.getValue('telefone') ?? '-'}',
                ),
              ],
            ),
          ),
        ),
      ],
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<int>(
      valueListenable: _etapa,
      builder: (context, etapa, _) => Text(
        'Etapa atual: ${etapa + 1}',
      ),
    ),
    ValueListenableBuilder<Map<String, Object?>?>(
      valueListenable: _enviado,
      builder: (context, dados, _) => dados == null
          ? const SizedBox.shrink()
          : Text('Dados enviados: $dados'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`, `_etapa`, `_enviado`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
final _etapa = ValueNotifier<int>(0);
final _enviado = ValueNotifier<Map<String, Object?>?>(null);
```

### stepNavigation

Use stepNavigation para limitar o clique nas etapas. O padrão é previous-and-next; neste exemplo apenas as etapas anteriores aceitam clique.

Região `sgWizardStepNavigation` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.numbered,
  initialStep: 2,
  stepNavigation: SgWizardStepNavigation.previous,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Introdução',
      child: Text(
        'Somente etapas anteriores podem ser clicadas.',
      ),
    ),
    SgWizardPage(
      title: 'Detalhes',
      child: Text(
        'O usuário pode voltar clicando no stepper.',
      ),
    ),
    SgWizardPage(
      title: 'Revisão',
      child: Text('A etapa atual não fica clicável.'),
    ),
    SgWizardPage(
      title: 'Confirmação',
      child: Text(
        'Passos futuros continuam bloqueados.',
      ),
    ),
  ],
)
```

### Stepper com ícones

stepper="icons" + icon em cada SgWizardPage: exibe o ícone no círculo em vez do número.

Região `sgWizardStepperIcones` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.icons,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Posição',
      icon: const Icon(Icons.place_outlined),
      child: Text('Selecione a posição desejada.'),
    ),
    SgWizardPage(
      title: 'Categoria',
      icon: const Icon(Icons.sell_outlined),
      child: Text('Escolha a categoria.'),
    ),
    SgWizardPage(
      title: 'Enviar',
      icon: const Icon(Icons.send_outlined),
      child: Text('Revise e envie.'),
    ),
  ],
)
```

### Stepper numerado

stepper="numbered": círculos numerados com o título de cada passo.

Região `sgWizardStepperNumerado` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.numbered,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Introdução',
      child: Text('Conteúdo introdutório.'),
    ),
    SgWizardPage(
      title: 'Detalhes',
      child: Text('Preencha os detalhes.'),
    ),
    SgWizardPage(
      title: 'Revisão',
      child: Text('Revise as informações.'),
    ),
    SgWizardPage(
      title: 'Confirmação',
      child: Text('Confirme e finalize.'),
    ),
  ],
)
```

### Labels customizados

Personalize os textos dos botões.

Região `sgWizardLabels` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  labels: SgWizardLabels(
    next: 'Continuar',
    previous: 'Voltar',
    finish: 'Concluir',
  ),
  onFinish: () {},
  children: [
    SgWizardPage(
      child: Text(
        'Dados: ajuste os labels como quiser.',
      ),
    ),
    SgWizardPage(
      child: Text(
        'Fim: clique em Concluir para finalizar.',
      ),
    ),
  ],
)
```

### onBeforeNext async

Validação assíncrona antes de avançar (ex.: consultar uma API).

Região `sgWizardBeforeNext` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  onBeforeNext: (i) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return true;
  },
  onFinish: () async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
  },
  children: [
    SgWizardPage(
      child: Text(
        'Etapa 1: simula validação assíncrona (600ms).',
      ),
    ),
    SgWizardPage(
      child: Text('Etapa 2: pode finalizar.'),
    ),
  ],
)
```

### validateStep

Validação customizada por etapa, além da validação automática dos inputs.

Região `sgWizardValidateStep` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  validateStep: (i) {
    if (i != 0) return true;
    final nome = (_form.getValue('nome') as String?) ?? '';
    final email = (_form.getValue('email') as String?) ?? '';
    return nome.trim().isNotEmpty && email.trim().isNotEmpty;
  },
  onFinish: () {},
  children: [
    SgWizardPage(
      child: Text(
        'Etapa 1: valida via validateStep (nome e e-mail do primeiro exemplo).',
      ),
    ),
    SgWizardPage(
      child: Text('Etapa 2: pode finalizar.'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
```

### Avanço bloqueado (nextDisabled)

onBeforeNext só age no clique: o botão continua com aparência de habilitado e, quando ele recusa, nada acontece na tela. Quando o bloqueio já é conhecido (o resultado de uma checagem assíncrona que já terminou), nextDisabled deixa isso visível.

Região `sgWizardNextDisabled` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
ValueListenableBuilder<bool>(
  valueListenable: _jaUsado,
  builder: (context, jaUsado, _) => SgWizard(
    nextDisabled: jaUsado,
    onFinish: () {},
    children: [
      SgWizardPage(
        title: 'Convite',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgInputText(
              id: 'wizard-codigo-convite',
              labelText: 'Código do convite',
              error: jaUsado
                  ? 'Este código já foi utilizado.'
                  : null,
              onChange: (v) {
                _codigo = v;
                _jaUsado.value = false;
              },
              onExit: () async {
                if (_codigo.trim().isEmpty) return;
                _checando.value = true;
                await Future<void>.delayed(
                  const Duration(milliseconds: 600),
                );
                if (!mounted) return;
                _jaUsado.value =
                    _codigo.trim().toUpperCase() == 'SG-123';
                _checando.value = false;
              },
            ),
            const SizedBox(height: 8),
            ValueListenableBuilder<bool>(
              valueListenable: _checando,
              builder: (context, checando, _) => Text(
                checando
                    ? 'Verificando o código...'
                    : 'Digite "SG-123" e saia do campo: o botão Próximo fica desabilitado.',
              ),
            ),
          ],
        ),
      ),
      SgWizardPage(
        title: 'Conclusão',
        child: Text(
          'Código aceito: só se chega aqui com um código que a checagem liberou.',
        ),
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_checando`, `_jaUsado`, `_codigo`), definido assim na página do showcase:

```dart
final _checando = ValueNotifier<bool>(false);
final _jaUsado = ValueNotifier<bool>(false);
String _codigo = '';
```

### Desabilitado (enabled)

Com enabled: false o wizard inteiro fica desabilitado: Anterior, Próximo, Concluir e os passos do stepper não respondem; a etapa atual continua visível.

Região `sgWizardEnabled` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  enabled: false,
  initialStep: 1,
  stepper: SgWizardStepper.numbered,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Dados',
      child: Text('Primeira etapa'),
    ),
    SgWizardPage(
      title: 'Revisão',
      child: Text('Segunda etapa'),
    ),
    SgWizardPage(
      title: 'Confirmação',
      child: Text('Terceira etapa'),
    ),
  ],
)
```

## SgWizardPage

Página: `apps/seedgrid_showcase/lib/pages/sg_wizard_page_page.dart` (3 exemplo(s) na página; todos abaixo).

### Título e ícone no stepper

title aparece sob o círculo do stepper; icon só aparece no modo icons.

Região `sgWizardPageTitulo` em `sg_wizard_page_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.icons,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Perfil',
      icon: Icon(Icons.person),
      child: Text('Conteúdo do perfil'),
    ),
    SgWizardPage(
      title: 'Segurança',
      icon: Icon(Icons.lock),
      child: Text('Conteúdo de segurança'),
    ),
  ],
)
```

### Sem título

Sem title o stepper mostra "Etapa N" (do i18n).

Região `sgWizardPageSemTitulo` em `sg_wizard_page_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.numbered,
  onFinish: () {},
  children: [
    SgWizardPage(child: Text('Primeira')),
    SgWizardPage(child: Text('Segunda')),
  ],
)
```

### fields: campos da etapa

No React a validação varre os inputs da página; aqui fields lista os campos do formulário que a etapa valida.

Região `sgWizardPageFields` em `sg_wizard_page_page.snippets.g.dart`.

```dart
SgWizard(
  control: _form,
  onFinish: () {},
  children: [
    SgWizardPage(
      fields: const ['cidade'],
      child: SgInputText(
        id: 'wp-cidade',
        name: 'cidade',
        control: _form,
        labelText: 'Cidade',
        required: true,
        requiredMessage: 'Informe a cidade',
      ),
    ),
    SgWizardPage(child: Text('Pronto!')),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
```

