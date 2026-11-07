---
description: "Exemplos Dart de Feedback e exibição em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, feedback-e-exibicao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 8a43f9d
analisado-em: 2026-11-07
---

# Exemplos — Feedback e exibição (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Exemplos|Exemplos — Feedback e exibição (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-07: cada bloco com "Região" foi comparado, texto a texto, com a constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 8a43f9d (idêntico, com `context.tx` já trocado pelo literal); os blocos "Exemplo próprio" foram lidos contra o construtor Dart. Continua sem `flutter analyze`/`flutter test` nesta conferência. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

> **Pré-requisitos.** Os exemplos de `toast` e `sgWhistle` só **disparam** mensagens: é preciso haver um `SgToaster` ou `SgToastHost` (para toasts) e um `SgWhistler` ou `SgWhistleHost` (para whistles) montado em algum lugar da árvore; os exemplos de `SgToastHost`/`SgWhistleHost` mostram a montagem. O exemplo com `_extraHost` usa uma variável `bool` de estado da página (`StatefulWidget`). Conferi, por amostragem (pelo menos um exemplo por componente), que nomes e parâmetros existem na API Dart real (por exemplo `toast.promise<T>`, `SgToastPromiseMessages`, `SgWhistleOptions(message:)`, `SgAvatarGroup(children:)`); não encontrei divergência.

## SgAvatar

Página: `apps/seedgrid_showcase/lib/pages/sg_avatar_page.dart` (7 exemplo(s) na página; abaixo 3).

### Iniciais, ícone e fallback

Do nome saem até 2 iniciais; sem nada, aparece "?".

Região `sgAvatarConteudo` em `sg_avatar_page.snippets.g.dart`.

```dart
Wrap(
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

### Severidades e cor própria

Cores padrão por severidade e uma cor própria com `SgAvatarSeverity.custom` e `customColors`.

Região `sgAvatarCores` em `sg_avatar_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgAvatar(
      label: Text('P'),
      severity: SgAvatarSeverity.primary,
    ),
    SgAvatar(
      label: Text('S'),
      severity: SgAvatarSeverity.success,
    ),
    SgAvatar(
      label: Text('D'),
      severity: SgAvatarSeverity.danger,
    ),
    SgAvatar(
      icon: Icon(Icons.photo_camera),
      severity: SgAvatarSeverity.custom,
      customColors: SgAvatarCustomColors(
        bg: Color(0xFF7C3AED),
        fg: Color(0xFFFFFFFF),
        border: Color(0xFF5B21B6),
        ring: Color(0x597C3AED),
      ),
    ),
  ],
)
```

### Tamanhos e formas

Formas `circle` e `square`, tamanhos `xs` e `lg` e imagem por `src`.

Região `sgAvatarTamanhos` em `sg_avatar_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgAvatar(
      label: Text('C'),
      shape: SgAvatarShape.circle,
    ),
    SgAvatar(
      label: Text('S'),
      shape: SgAvatarShape.square,
    ),
    SgAvatar(label: Text('XS'), size: SgAvatarSize.xs),
    SgAvatar(label: Text('LG'), size: SgAvatarSize.lg),
    SgAvatar(
      src: 'https://i.pravatar.cc/150?img=47',
      label: Text('Asiya Javayant'),
      shape: SgAvatarShape.square,
    ),
  ],
)
```

## SgAvatarGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_avatar_group_page.dart` (4 exemplo(s) na página; abaixo 3).

### Grupo simples

Os avatares se sobrepõem em 8 px (overlap md).

Região `sgAvatarGroupSimples` em `sg_avatar_group_page.snippets.g.dart`.

```dart
SgAvatarGroup(
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

max esconde o excesso; total soma quem não está na lista.

Região `sgAvatarGroupMax` em `sg_avatar_group_page.snippets.g.dart`.

```dart
SgAvatarGroup(
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

### Sobreposição

Região `sgAvatarGroupOverlap` em `sg_avatar_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    for (final o in SgAvatarGroupOverlap.values)
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: SgAvatarGroup(
          overlap: o,
          size: SgAvatarSize.sm,
          children: const [
            SgAvatar(label: Text('A B'), size: SgAvatarSize.sm),
            SgAvatar(label: Text('C D'), size: SgAvatarSize.sm),
            SgAvatar(label: Text('E F'), size: SgAvatarSize.sm),
          ],
        ),
      ),
  ],
)
```

## SgBadge

Página: `apps/seedgrid_showcase/lib/pages/sg_badge_page.dart` (9 exemplo(s) na página; abaixo 3).

### Severidades e estilos

Quatro estilos (solid, soft, outline, ghost) para cada severidade.

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

### Tamanhos

Os quatro tamanhos do badge: `xs`, `sm`, `md` e `lg`.

Região `sgBadgeTamanhos` em `sg_badge_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgBadge(value: Text('XS'), size: SgBadgeSize.xs),
    SgBadge(value: Text('SM'), size: SgBadgeSize.sm),
    SgBadge(value: Text('MD'), size: SgBadgeSize.md),
    SgBadge(value: Text('LG'), size: SgBadgeSize.lg),
  ],
)
```

### Contador, limite e ponto

`count` aplica `max` ("99+"); `dot` mostra só o ponto e `pulse` o anima.

Região `sgBadgeContador` em `sg_badge_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgBadge(count: 3, severity: SgBadgeSeverity.danger),
    SgBadge(count: 120, max: 99, severity: SgBadgeSeverity.danger),
    SgBadge(dot: true, severity: SgBadgeSeverity.success),
    SgBadge(
      dot: true,
      severity: SgBadgeSeverity.success,
      pulse: true,
    ),
  ],
)
```

## SgBadgeOverlay

Página: `apps/seedgrid_showcase/lib/pages/sg_badge_overlay_page.dart` (4 exemplo(s) na página; abaixo 3).

### Contador no canto do avatar

Padrão: top-right.

Região `sgBadgeOverlayAvatar` em `sg_badge_overlay_page.snippets.g.dart`.

```dart
SgBadgeOverlay(
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
SgBadgeOverlay(
  placement: SgBadgeOverlayPlacement.bottomRight,
  badge: SgBadge(dot: true, severity: SgBadgeSeverity.success),
  child: SgAvatar(
    label: Text('Bia Souza'),
    severity: SgAvatarSeverity.info,
  ),
)
```

### Em um botão

Região `sgBadgeOverlayBotao` em `sg_badge_overlay_page.snippets.g.dart`.

```dart
SgBadgeOverlay(
  badge: const SgBadge(
    count: 12,
    max: 9,
    size: SgBadgeSize.xs,
    severity: SgBadgeSeverity.danger,
  ),
  child: SgButton(
    label: Text('Mensagens'),
    appearance: SgAppearance.outline,
    onClick: () {},
  ),
)
```

## SgSkeleton

Página: `apps/seedgrid_showcase/lib/pages/sg_skeleton_page.dart` (4 exemplo(s) na página; abaixo 3).

### Formas

text (padrão), rectangle, rounded, square e circle.

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

wave (padrão), pulse e none.

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

### Dimensões em texto

Aceita número (px) ou "50%", "2rem", "1.5em"; size define largura e altura juntas.

Região `sgSkeletonDimensoes` em `sg_skeleton_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSkeleton(width: '50%', height: '2rem'),
    SizedBox(height: 8),
    SgSkeleton(size: '3rem', shape: SgSkeletonShape.circle),
    SizedBox(height: 8),
    SgSkeleton(width: 200, height: 24, borderRadius: 4),
  ],
)
```

## SgToaster

Página: `apps/seedgrid_showcase/lib/pages/sg_toaster_page.dart` (4 exemplo(s) na página; abaixo 3).

### Tipos

toast(), success, info, warning, error, loading e promise. O toast loading nunca some sozinho.

Região `sgToasterTipos` em `sg_toaster_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Padrão'),
      onClick: () => toast('Mensagem simples'),
    ),
    SgButton(
      label: Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => toast.success(
        'Salvo!',
        SgToastOptions(
          description: 'As alterações foram gravadas.',
        ),
      ),
    ),
    SgButton(
      label: Text('Info'),
      severity: SgSeverity.info,
      onClick: () => toast.info('Nova versão disponível'),
    ),
    SgButton(
      label: Text('Aviso'),
      severity: SgSeverity.warning,
      onClick: () => toast.warning('Sessão expira em 5 minutos'),
    ),
    SgButton(
      label: Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => toast.error('Falha ao salvar'),
    ),
    SgButton(
      label: Text('Carregando'),
      severity: SgSeverity.secondary,
      onClick: () => toast.loading(
        'Processando...',
        const SgToastOptions(id: 'processando'),
      ),
    ),
    SgButton(
      label: Text('Promise'),
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
      label: Text('Limpar tudo'),
      appearance: SgAppearance.ghost,
      onClick: toast.dismiss,
    ),
  ],
)
```

### Ação e botão de fechar

Cada toast pode ter uma ação e decidir se mostra o x, por cima do padrão do toaster.

Região `sgToasterAcao` em `sg_toaster_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Com ação'),
      onClick: () => toast(
        'Item removido',
        SgToastOptions(
          action: SgToastAction(
            label: 'Desfazer',
            onClick: () => toast.success('Restaurado'),
          ),
        ),
      ),
    ),
    SgButton(
      label: Text('Sem botão de fechar'),
      appearance: SgAppearance.outline,
      onClick: () => toast(
        'Sem x',
        const SgToastOptions(closeButton: false, duration: 2500),
      ),
    ),
  ],
)
```

### Duração

A duração do toast vence a do toaster (padrão 4000 ms). Zero deixa o toast fixo.

Região `sgToasterDuracao` em `sg_toaster_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('1 segundo'),
      onClick: () =>
          toast('Rápido', const SgToastOptions(duration: 1000)),
    ),
    SgButton(
      label: Text('8 segundos'),
      onClick: () =>
          toast('Devagar', const SgToastOptions(duration: 8000)),
    ),
    SgButton(
      label: Text('Fixo'),
      onClick: () => toast.info(
        'Fica até fechar',
        const SgToastOptions(duration: 0),
      ),
    ),
  ],
)
```

## SgToastHost

Página: `apps/seedgrid_showcase/lib/pages/sg_toast_host_page.dart` (4 exemplo(s) na página; abaixo 3).

### Um host para o app inteiro

Coloque o SgToastHost uma vez, por cima do conteúdo (ex.: no builder do MaterialApp); qualquer tela dispara toasts pela API toast.

Região `sgToastHostBasico` em `sg_toast_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => toast.success('Salvo pelo host'),
    ),
    SgButton(
      label: Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => toast.error('Falhou pelo host'),
    ),
    SgButton(
      label: Text('Limpar'),
      appearance: SgAppearance.ghost,
      onClick: toast.dismiss,
    ),
  ],
)
```

### O host prevalece sobre o SgToaster solto

Esta área tem um SgToaster dentro dela, mas existe um SgToastHost na página: o toaster solto não desenha nada, então cada toast aparece uma vez só.

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
          label: Text('Disparar'),
          onClick: () => toast('Só aparece no host'),
        ),
      ),
    ],
  ),
)
```

### Vários hosts

O último host montado é o ativo; quando ele sai, o anterior volta. Ligue o segundo host (canto inferior esquerdo) e dispare um toast.

Região `sgToastHostVarios` em `sg_toast_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    FilterChip(
      label: Text('Segundo host'),
      selected: _extraHost,
      onSelected: (v) => setState(() => _extraHost = v),
    ),
    SgButton(
      label: Text('Disparar'),
      onClick: () => toast.info(
        'Quem está ativo?',
        const SgToastOptions(duration: 3000),
      ),
    ),
  ],
)
```

## SgWhistler

Página: `apps/seedgrid_showcase/lib/pages/sg_whistler_page.dart` (5 exemplo(s) na página; abaixo 3).

### Severidades

Os avisos aparecem no rodapé da página.

Região `sgWhistlerSeveridades` em `sg_whistler_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Padrão'),
      onClick: () => sgWhistle.show(
        SgWhistleOptions(message: 'Aviso simples'),
      ),
    ),
    SgButton(
      label: Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => sgWhistle.success(
        SgWhistleOptions(
          title: 'Salvo',
          message: 'As alterações foram gravadas.',
        ),
      ),
    ),
    SgButton(
      label: Text('Info'),
      severity: SgSeverity.info,
      onClick: () => sgWhistle.info(
        SgWhistleOptions(
          message: 'Há uma nova versão.',
        ),
      ),
    ),
    SgButton(
      label: Text('Aviso'),
      severity: SgSeverity.warning,
      onClick: () => sgWhistle.warning(
        SgWhistleOptions(
          message: 'Sessão perto de expirar.',
        ),
      ),
    ),
    SgButton(
      label: Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => sgWhistle.error(
        SgWhistleOptions(
          title: 'Falha',
          message: 'Não foi possível salvar.',
        ),
      ),
    ),
    SgButton(
      label: Text('Limpar tudo'),
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

### Ação, ícone e onClose

A ação fecha o aviso; onClose roda quando ele sai por qualquer motivo.

Região `sgWhistlerAcao` em `sg_whistler_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Com ação'),
      onClick: () => sgWhistle.warning(
        SgWhistleOptions(
          title: 'Rascunho',
          message: 'Você tem alterações não salvas.',
          icon: const Icon(Icons.edit),
          duration: 0,
          action: SgWhistleAction(
            label: 'Salvar',
            onClick: () => sgWhistle.success(
              SgWhistleOptions(
                message: 'Rascunho salvo',
              ),
            ),
          ),
          onClose: () => debugPrint('whistle fechado'),
        ),
      ),
    ),
    SgButton(
      label: Text('Sem botão de fechar'),
      appearance: SgAppearance.outline,
      onClick: () => sgWhistle.info(
        SgWhistleOptions(
          message: 'Some em 3 segundos',
          dismissible: false,
          duration: 3000,
        ),
      ),
    ),
  ],
)
```

## SgWhistleHost

Página: `apps/seedgrid_showcase/lib/pages/sg_whistle_host_page.dart` (4 exemplo(s) na página; abaixo 3).

### Um host para a tela

O SgWhistleHost marca o lugar dos avisos; qualquer código dispara pela API sgWhistle.

Região `sgWhistleHostBasico` em `sg_whistle_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgButton(
      label: Text('Sucesso'),
      severity: SgSeverity.success,
      onClick: () => sgWhistle.success(
        SgWhistleOptions(message: 'Salvo pelo host'),
      ),
    ),
    SgButton(
      label: Text('Erro'),
      severity: SgSeverity.danger,
      onClick: () => sgWhistle.error(
        SgWhistleOptions(message: 'Falhou pelo host'),
      ),
    ),
    SgButton(
      label: Text('Limpar'),
      appearance: SgAppearance.ghost,
      onClick: sgWhistle.dismiss,
    ),
  ],
)
```

### O host prevalece sobre o SgWhistler solto

A caixa abaixo tem um SgWhistler solto, mas há um SgWhistleHost na página: o solto não desenha nada e cada aviso aparece uma vez só.

Região `sgWhistleHostPrevalece` em `sg_whistle_host_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const SgWhistler(),
    SgButton(
      label: Text('Disparar'),
      onClick: () => sgWhistle.info(
        SgWhistleOptions(message: 'Só aparece no host'),
      ),
    ),
  ],
)
```

### Vários hosts

O último host montado é o ativo (aqui, um segundo host com cantos retos); ao sair, o anterior volta.

Região `sgWhistleHostVarios` em `sg_whistle_host_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    FilterChip(
      label: Text('Segundo host (cantos retos)'),
      selected: _extraHost,
      onSelected: (v) => setState(() => _extraHost = v),
    ),
    SgButton(
      label: Text('Disparar'),
      onClick: () => sgWhistle.warning(
        SgWhistleOptions(
          message: 'Quem está ativo?',
          duration: 3000,
        ),
      ),
    ),
  ],
)
```

## SgNotificationBell

Página: `apps/seedgrid_showcase/lib/pages/sg_notification_bell_page.dart` (4 exemplo(s) na página; abaixo 4). O backend e o Pulse são simulados em memória (`demo_notifications_api.dart` e `SgSimulatedPulseConnection`), sem token nem chave.

### Básico

Toque no sino. Aqui não há servidor: a caixa vive em memória e um Pulse simulado avisa na hora quando o botão cria uma notificação nova.

Região `sgNotificationBellBasico` em `sg_notification_bell_page.snippets.g.dart`.

```dart
SgRealtimeProvider(
  channels: const ['user-notifications'],
  fetchToken: _demoToken,
  connectionFactory: () => _pulse,
  child: Wrap(
    spacing: 12,
    runSpacing: 8,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      SgNotificationBell(
        apiUrl: 'https://demo.local/user-notifications',
        fetcher: _basico.fetch,
      ),
      OutlinedButton(
        onPressed: () {
          final id = _basico.notify(
            'report.ready',
            'Novo relatório',
            'Acabou de ficar pronto.',
          );
          _pulse.emitMessage(
            channel: 'user-notifications',
            event: 'user-notification.created',
            data: {
              'notificationPublicId': id,
              'type': 'report.ready',
            },
          );
        },
        child: Text('Simular notificação'),
      ),
    ],
  ),
)
```

Observação: este trecho não é autocontido; ele usa estado, controllers e o backend simulado da página do showcase (`_pulse`, `_basico`, `_demoToken` e afins). Declare esses membros no seu `State` para copiá-lo.

### Tipos com ícone e ação

`types` liga cada tipo de notificação a um ícone e à ação de abrir; os callbacks avisam o que o usuário fez.

Região `sgNotificationBellTipos` em `sg_notification_bell_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgNotificationBell(
      apiUrl: 'https://demo.local/user-notifications',
      fetcher: _tipos.fetch,
      types: {
        'report.ready': SgNotificationTypeConfig(
          icon: const Icon(Icons.description_outlined),
          onOpen: (n) => setState(
            () => _evento = 'baixar relatório ${n.publicId}',
          ),
        ),
        'backup.finished': SgNotificationTypeConfig(
          icon: const Icon(Icons.check_circle_outline),
          onOpen: (n) => setState(
            () => _evento = 'baixar backup ${n.publicId}',
          ),
        ),
      },
      onNotificationDelete: (n) =>
          setState(() => _evento = 'excluiu: ${n.title}'),
    ),
    Text('Último evento: $_evento'),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado, controllers e o backend simulado da página do showcase (`_pulse`, `_basico`, `_demoToken` e afins). Declare esses membros no seu `State` para copiá-lo.

### Interruptor Não lidas

O painel traz o interruptor "Não lidas"; com `defaultUnreadOnly` desligado, ele abre em "Todas". A escolha não persiste entre recargas.

Região `sgNotificationBellInterruptor` em `sg_notification_bell_page.snippets.g.dart`.

```dart
SgNotificationBell(
  apiUrl: 'https://demo.local/user-notifications',
  fetcher: _interruptor.fetch,
  defaultUnreadOnly: false,
)
```

Observação: este trecho não é autocontido; ele usa estado, controllers e o backend simulado da página do showcase (`_pulse`, `_basico`, `_demoToken` e afins). Declare esses membros no seu `State` para copiá-lo.

### Sem o interruptor

`showUnreadToggle: false` esconde só o interruptor: o sino continua e o painel lista todas as notificações.

Região `sgNotificationBellSemInterruptor` em `sg_notification_bell_page.snippets.g.dart`.

```dart
SgNotificationBell(
  apiUrl: 'https://demo.local/user-notifications',
  fetcher: _semInterruptor.fetch,
  showUnreadToggle: false,
)
```

Observação: este trecho não é autocontido; ele usa estado, controllers e o backend simulado da página do showcase (`_pulse`, `_basico`, `_demoToken` e afins). Declare esses membros no seu `State` para copiá-lo.

### Uso real (não executa na demo)

Exemplo próprio, não vem do showcase: as props (`apiUrl`, `tokenEndpoint`, `requestInit`, `types`, `onNotification`, `connectionFactory`) existem no construtor de `SgNotificationBell`. `PulseAdapter`, `token` e `baixarRelatorio` são do app, não da biblioteca: `connectionFactory` espera uma função que devolve `SgPulseConnection`.

```dart
SgNotificationBell(
  apiUrl: 'https://api.meuapp.com/user-notifications',
  tokenEndpoint: 'https://api.meuapp.com/realtime/connect',
  requestInit: SgTokenRequestInit(headers: {'Authorization': 'Bearer $token'}),
  connectionFactory: () => PulseAdapter(), // cliente do Pulse (ver PULSE_ADAPTER.md)
  types: {
    'report.ready': SgNotificationTypeConfig(
      icon: Icon(Icons.description_outlined),
      onOpen: (n) => baixarRelatorio(n.payload?['reportExecutionId']),
    ),
  },
  onNotification: (n) => print(n.title),
)
```

Dependência do SDK pelo git, para quem quiser tempo real (provisório até o pub.dev):

```yaml
dependencies:
  seedgrid_pulse_subscriber:
    git:
      url: https://github.com/SeedGrid/seedgrid-pulse-sdk.git
      path: components/subscribers/seedgrid-pulse-subscriber-flutter
      ref: main
```
