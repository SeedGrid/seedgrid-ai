---
description: "Flutter (nota anterior, commit 314cb5a): exemplos Flutter de Overlay e feedback copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos, plataforma-flutter]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Overlay e feedback

> **Plataforma: Flutter.** Nota anterior, por tema, mantida como estava no commit `314cb5a` (não foi revista contra o commit `e9989b8`). Os exemplos **atuais e completos por grupo** estão em: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Navegação e overlay]] · [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos|Feedback e exibição]].

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgDialog

Fonte: `apps/seedgrid_showcase/lib/pages/sg_dialog_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgDialogBasico` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: const Text('Abrir diálogo'),
      onClick: () => setState(() => _basico = true),
    ),
    SgDialog(
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: const Text('Novo cadastro'),
      subtitle: const Text('Preencha os dados abaixo'),
      footer: SgButton(
        label: const Text('Salvar'),
        onClick: () => setState(() => _basico = false),
      ),
      child: const Text('O conteúdo do diálogo fica aqui.'),
    ),
  ],
)
```

### Cor customizada e sombra

Região `sgDialogCores` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: const Text('Abrir diálogo escuro'),
      onClick: () => setState(() => _cores = true),
    ),
    SgDialog(
      open: _cores,
      onOpenChange: (open) => setState(() => _cores = open),
      customColor: '#101820',
      elevation: 'lg',
      title: const Text('Modo escuro'),
      subtitle: const Text('Paleta derivada da cor de fundo'),
      child: const Text('Texto claro sobre fundo escuro.'),
    ),
  ],
)
```

## SgConfirmationDialog

Fonte: `apps/seedgrid_showcase/lib/pages/sg_confirmation_dialog_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgConfirmationDialogBasico` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: const Text('Excluir registro'),
      severity: SgSeverity.danger,
      onClick: () => setState(() => _basico = true),
    ),
    if (_resultado.isNotEmpty) Text(_resultado),
    SgConfirmationDialog(
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: const Text('Excluir registro?'),
      message: const Text('Esta ação não pode ser desfeita.'),
      onConfirm: () => setState(() => _resultado = 'Confirmado'),
      onCancel: () => setState(() => _resultado = 'Cancelado'),
    ),
  ],
)
```

### Ícone no topo

Região `sgConfirmationDialogIcone` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: const Text('Publicar'),
      severity: SgSeverity.success,
      onClick: () => setState(() => _icone = true),
    ),
    SgConfirmationDialog(
      open: _icone,
      onOpenChange: (open) => setState(() => _icone = open),
      severity: SgDialogSeverity.success,
      iconPlacement: SgConfirmationDialogIconPlacement.top,
      icon: const Icon(Icons.rocket_launch, size: 28),
      closeable: true,
      title: const Text('Publicar agora?'),
      message: const Text('A versão ficará visível para todos.'),
    ),
  ],
)
```

## SgPopup

Fonte: `apps/seedgrid_showcase/lib/pages/sg_popup_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgPopupBasico` em `sg_popup_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgButton(
      key: _basicoKey,
      label: const Text('Abrir popup'),
      onClick: () => setState(() => _basico = !_basico),
    ),
    SgPopup(
      anchorRef: _basicoKey,
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: 'Perfil',
      subtitle: 'Conta pessoal',
      child: const Text('Conteúdo livre do popup.'),
    ),
  ],
)
```

### Fechamento

Região `sgPopupFechamento` em `sg_popup_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgButton(
      key: _fechaKey,
      label: const Text('Abrir fixo'),
      onClick: () => setState(() => _fecha = !_fecha),
    ),
    SgPopup(
      anchorRef: _fechaKey,
      open: _fecha,
      onOpenChange: (open) => setState(() => _fecha = open),
      closeOnOutsideClick: false,
      closeOnEscape: false,
      title: 'Fixo',
      actions: [SgPopupAction(label: 'Fechar')],
    ),
  ],
)
```

## SgToaster

Fonte: `apps/seedgrid_showcase/lib/pages/sg_toaster_page.dart` (4 exemplo(s) na página; abaixo 2).

### Tipos

Região `sgToasterTipos` em `sg_toaster_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: const Text('Padrão'),
      onClick: () => toast('Mensagem simples'),
    ),
    SgButton(
      label: const Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => toast.success(
        'Salvo!',
        const SgToastOptions(
          description: 'As alterações foram gravadas.',
        ),
      ),
    ),
    SgButton(
      label: const Text('Info'),
      severity: SgSeverity.info,
      onClick: () => toast.info('Nova versão disponível'),
    ),
    SgButton(
      label: const Text('Aviso'),
      severity: SgSeverity.warning,
      onClick: () => toast.warning('Sessão expira em 5 minutos'),
    ),
    SgButton(
      label: const Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => toast.error('Falha ao salvar'),
    ),
    SgButton(
      label: const Text('Carregando'),
      severity: SgSeverity.secondary,
      onClick: () => toast.loading(
        'Processando...',
        const SgToastOptions(id: 'processando'),
      ),
    ),
    SgButton(
      label: const Text('Promise'),
      appearance: SgAppearance.outline,
      onClick: () => toast.promise<String>(
        Future<String>.delayed(
          const Duration(seconds: 2),
          () => 'ok',
        ),
        SgToastPromiseMessages<String>(
          loading: 'Enviando...',
          success: (String v) => 'Enviado: $v',
          error: 'Não foi possível enviar',
        ),
      ),
    ),
    SgButton(
      label: const Text('Limpar tudo'),
      appearance: SgAppearance.ghost,
      onClick: toast.dismiss,
    ),
  ],
)
```

### Duração

Região `sgToasterDuracao` em `sg_toaster_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: const Text('1 segundo'),
      onClick: () =>
          toast('Rápido', const SgToastOptions(duration: 1000)),
    ),
    SgButton(
      label: const Text('8 segundos'),
      onClick: () =>
          toast('Devagar', const SgToastOptions(duration: 8000)),
    ),
    SgButton(
      label: const Text('Fixo'),
      onClick: () => toast.info(
        'Fica até fechar',
        const SgToastOptions(duration: 0),
      ),
    ),
  ],
)
```

## SgToastHost

Fonte: `apps/seedgrid_showcase/lib/pages/sg_toast_host_page.dart` (4 exemplo(s) na página; abaixo 2).

### Um host para o app inteiro

Região `sgToastHostBasico` em `sg_toast_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: const Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => toast.success('Salvo pelo host'),
    ),
    SgButton(
      label: const Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => toast.error('Falhou pelo host'),
    ),
    SgButton(
      label: const Text('Limpar'),
      appearance: SgAppearance.ghost,
      onClick: toast.dismiss,
    ),
  ],
)
```

### O host prevalece sobre o SgToaster solto

Região `sgToastHostPrevalece` em `sg_toast_host_page.snippets.g.dart`.

```dart
SizedBox(
  height: 120,
  child: Stack(
    children: [
      const SgToaster(position: SgToasterPosition.bottomLeft),
      Align(
        alignment: Alignment.center,
        child: SgButton(
          label: const Text('Disparar'),
          onClick: () => toast('Só aparece no host'),
        ),
      ),
    ],
  ),
)
```

## SgWhistler

Fonte: `apps/seedgrid_showcase/lib/pages/sg_whistler_page.dart` (5 exemplo(s) na página; abaixo 2).

### Severidades

Região `sgWhistlerSeveridades` em `sg_whistler_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: const Text('Padrão'),
      onClick: () => sgWhistle.show(
        const SgWhistleOptions(message: 'Aviso simples'),
      ),
    ),
    SgButton(
      label: const Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => sgWhistle.success(
        const SgWhistleOptions(
          title: 'Salvo',
          message: 'As alterações foram gravadas.',
        ),
      ),
    ),
    SgButton(
      label: const Text('Info'),
      severity: SgSeverity.info,
      onClick: () => sgWhistle.info(
        const SgWhistleOptions(message: 'Há uma nova versão.'),
      ),
    ),
    SgButton(
      label: const Text('Aviso'),
      severity: SgSeverity.warning,
      onClick: () => sgWhistle.warning(
        const SgWhistleOptions(message: 'Sessão perto de expirar.'),
      ),
    ),
    SgButton(
      label: const Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => sgWhistle.error(
        const SgWhistleOptions(
          title: 'Falha',
          message: 'Não foi possível salvar.',
        ),
      ),
    ),
    SgButton(
      label: const Text('Limpar tudo'),
      appearance: SgAppearance.ghost,
      onClick: sgWhistle.dismiss,
    ),
  ],
)
```

### Estilos de borda

Região `sgWhistlerBordas` em `sg_whistler_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final style in SgWhistleBorderStyle.values)
      SgButton(
        label: Text(style.value),
        appearance: SgAppearance.outline,
        onClick: () => sgWhistle.info(
          SgWhistleOptions(
            message: 'borderStyle: ${style.value}',
            borderStyle: style,
            duration: 3000,
          ),
        ),
      ),
  ],
)
```

## SgWhistleHost

Fonte: `apps/seedgrid_showcase/lib/pages/sg_whistle_host_page.dart` (4 exemplo(s) na página; abaixo 2).

### Um host para a tela

Região `sgWhistleHostBasico` em `sg_whistle_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: const Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => sgWhistle.success(
        const SgWhistleOptions(message: 'Salvo pelo host'),
      ),
    ),
    SgButton(
      label: const Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => sgWhistle.error(
        const SgWhistleOptions(message: 'Falhou pelo host'),
      ),
    ),
    SgButton(
      label: const Text('Limpar'),
      appearance: SgAppearance.ghost,
      onClick: sgWhistle.dismiss,
    ),
  ],
)
```

### O host prevalece sobre o SgWhistler solto

Região `sgWhistleHostPrevalece` em `sg_whistle_host_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const SgWhistler(),
    SgButton(
      label: const Text('Disparar'),
      onClick: () => sgWhistle.info(
        const SgWhistleOptions(message: 'Só aparece no host'),
      ),
    ),
  ],
)
```

## SgWizardDemo

Fonte: `apps/seedgrid_showcase/lib/pages/sg_wizard_demo_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgWizardBasico` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgWizard(
      onFinish: () => setState(() => _resultado = 'finalizado'),
      children: const [
        SgWizardPage(child: Text('Etapa 1: dados pessoais')),
        SgWizardPage(child: Text('Etapa 2: endereço')),
        SgWizardPage(child: Text('Etapa 3: revisão')),
      ],
    ),
    const SizedBox(height: 12),
    Text('Resultado: $_resultado'),
  ],
)
```

### Stepper numerado ou com ícones

Região `sgWizardStepper` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    FilterChip(
      label: const Text('Ícones'),
      selected: _icones,
      onSelected: (v) => setState(() => _icones = v),
    ),
    const SizedBox(height: 12),
    SgWizard(
      stepper: _icones
          ? SgWizardStepper.icons
          : SgWizardStepper.numbered,
      onFinish: () {},
      children: const [
        SgWizardPage(
          title: 'Conta',
          icon: Icon(Icons.person),
          child: Text('Dados da conta'),
        ),
        SgWizardPage(
          title: 'Endereço',
          icon: Icon(Icons.home),
          child: Text('Onde você mora'),
        ),
        SgWizardPage(child: Text('Sem título nem ícone')),
      ],
    ),
  ],
)
```

## SgWizardPage

Fonte: `apps/seedgrid_showcase/lib/pages/sg_wizard_page_page.dart` (3 exemplo(s) na página; abaixo 2).

### Título e ícone no stepper

Região `sgWizardPageTitulo` em `sg_wizard_page_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.icons,
  onFinish: () {},
  children: const [
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

Região `sgWizardPageSemTitulo` em `sg_wizard_page_page.snippets.g.dart`.

```dart
SgWizard(
  stepper: SgWizardStepper.numbered,
  onFinish: () {},
  children: const [
    SgWizardPage(child: Text('Primeira')),
    SgWizardPage(child: Text('Segunda')),
  ],
)
```

## SgBadge

Fonte: `apps/seedgrid_showcase/lib/pages/sg_badge_page.dart` (6 exemplo(s) na página; abaixo 2).

### Severidades e estilos

Região `sgBadgeSeveridades` em `sg_badge_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final s in SgBadgeSeverity.values)
      SgBadge(value: Text(s.value), severity: s),
    for (final st in SgBadgeBadgeStyle.values)
      SgBadge(
        value: Text(st.value),
        badgeStyle: st,
        severity: SgBadgeSeverity.danger,
      ),
  ],
)
```

### Cores customizadas

Região `sgBadgeCores` em `sg_badge_page.snippets.g.dart`.

```dart
const SgBadge(
  value: Text('Roxo'),
  customColors: SgBadgeCustomColors(
    bg: Color(0xFF7C3AED),
    fg: Colors.white,
    border: Color(0xFF6D28D9),
  ),
)
```

## SgBadgeOverlay

Fonte: `apps/seedgrid_showcase/lib/pages/sg_badge_overlay_page.dart` (4 exemplo(s) na página; abaixo 2).

### Contador no canto do avatar

Região `sgBadgeOverlayAvatar` em `sg_badge_overlay_page.snippets.g.dart`.

```dart
const SgBadgeOverlay(
  badge: SgBadge(
    count: 3,
    size: SgBadgeSize.sm,
    severity: SgBadgeSeverity.danger,
  ),
  child: SgAvatar(label: Text('Ana Lima')),
)
```

### Ponto de status

Região `sgBadgeOverlayStatus` em `sg_badge_overlay_page.snippets.g.dart`.

```dart
const SgBadgeOverlay(
  placement: SgBadgeOverlayPlacement.bottomRight,
  badge: SgBadge(dot: true, severity: SgBadgeSeverity.success),
  child: SgAvatar(
    label: Text('Bia Souza'),
    severity: SgAvatarSeverity.info,
  ),
)
```

## SgAvatar

Fonte: `apps/seedgrid_showcase/lib/pages/sg_avatar_page.dart` (6 exemplo(s) na página; abaixo 2).

### Iniciais, ícone e fallback

Região `sgAvatarConteudo` em `sg_avatar_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgAvatar(label: Text('Maria Silva')),
    SgAvatar(label: Text('joao')),
    SgAvatar(
      icon: Icon(Icons.person),
      severity: SgAvatarSeverity.info,
    ),
    SgAvatar(),
    SgAvatar(
      fallback: Icon(Icons.help_outline),
      severity: SgAvatarSeverity.neutral,
    ),
  ],
)
```

### Severidades

Região `sgAvatarSeveridades` em `sg_avatar_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    for (final s in SgAvatarSeverity.values)
      SgAvatar(label: Text(s.value), severity: s),
  ],
)
```

## SgAvatarGroup

Fonte: `apps/seedgrid_showcase/lib/pages/sg_avatar_group_page.dart` (4 exemplo(s) na página; abaixo 2).

### Grupo simples

Região `sgAvatarGroupSimples` em `sg_avatar_group_page.snippets.g.dart`.

```dart
const SgAvatarGroup(
  children: [
    SgAvatar(label: Text('Ana Lima')),
    SgAvatar(
      label: Text('Bia Souza'),
      severity: SgAvatarSeverity.success,
    ),
    SgAvatar(
      label: Text('Caio Reis'),
      severity: SgAvatarSeverity.warning,
    ),
  ],
)
```

### Limite com +n

Região `sgAvatarGroupMax` em `sg_avatar_group_page.snippets.g.dart`.

```dart
const SgAvatarGroup(
  max: 3,
  total: 12,
  children: [
    SgAvatar(label: Text('Ana Lima')),
    SgAvatar(
      label: Text('Bia Souza'),
      severity: SgAvatarSeverity.success,
    ),
    SgAvatar(
      label: Text('Caio Reis'),
      severity: SgAvatarSeverity.warning,
    ),
    SgAvatar(
      label: Text('Duda Melo'),
      severity: SgAvatarSeverity.danger,
    ),
  ],
)
```

## SgSkeleton

Fonte: `apps/seedgrid_showcase/lib/pages/sg_skeleton_page.dart` (4 exemplo(s) na página; abaixo 2).

### Formas

Região `sgSkeletonFormas` em `sg_skeleton_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 16,
  runSpacing: 16,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgSkeleton(width: 160),
    SgSkeleton(
      shape: SgSkeletonShape.rectangle,
      width: 120,
      height: 48,
    ),
    SgSkeleton(
      shape: SgSkeletonShape.rounded,
      width: 120,
      height: 48,
    ),
    SgSkeleton(shape: SgSkeletonShape.square),
    SgSkeleton(shape: SgSkeletonShape.circle),
  ],
)
```

### Animações

Região `sgSkeletonAnimacoes` em `sg_skeleton_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSkeleton(width: 220),
    SizedBox(height: 8),
    SgSkeleton(width: 220, animation: SgSkeletonAnimation.pulse),
    SizedBox(height: 8),
    SgSkeleton(width: 220, animation: SgSkeletonAnimation.none),
  ],
)
```
