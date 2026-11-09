---
description: "Exemplos Dart de Feedback e exibição em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, feedback-e-exibicao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Feedback e exibição (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Exemplos|Exemplos — Feedback e exibição (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco com "Região" foi comparado, texto a texto, com a constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 (idêntico, com `context.tx` já trocado pelo literal); os blocos "Exemplo próprio" foram lidos contra o construtor Dart. Continua sem `flutter analyze`/`flutter test` nesta conferência. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

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

### Severidade e cores personalizadas

Preset por severity e override de cores.

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

### Forma e tamanho

Combinações de shape e size.

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

### Severidades

Cada severidade e cada estilo (solid, soft, outline, ghost).

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

XS, SM, MD e LG.

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

### Contador e dot

Badge numérico, max e indicador.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_badge_overlay_page.dart` (5 exemplo(s) na página; abaixo 3).

### Contador no canto do avatar

Contador sobre o canto do avatar; o padrão é top-right.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_skeleton_page.dart` (6 exemplo(s) na página; abaixo 3).

### Formas básicas

Variantes principais: "text", "rectangle", "rounded", "square" e "circle".

Região `sgSkeletonFormas` em `sg_skeleton_page.snippets.g.dart`.

```dart
const SgGrid(
  columns: {'base': 2, 'lg': 5},
  gap: 12,
  children: [
    SgSkeleton(shape: SgSkeletonShape.text),
    SgSkeleton(shape: SgSkeletonShape.rectangle, height: 48),
    SgSkeleton(shape: SgSkeletonShape.rounded, height: 48),
    SgSkeleton(shape: SgSkeletonShape.square, size: 56),
    SgSkeleton(shape: SgSkeletonShape.circle, size: 56),
  ],
)
```

### Animação

Escolha entre "wave", "pulse" ou "none".

Região `sgSkeletonAnimacao` em `sg_skeleton_page.snippets.g.dart`.

```dart
const SgGrid(
  columns: {'base': 1, 'sm': 3},
  gap: 16,
  children: [
    SgStack(
      gap: 8,
      children: [
        Text('wave'),
        SgSkeleton(animation: SgSkeletonAnimation.wave, height: 56),
      ],
    ),
    SgStack(
      gap: 8,
      children: [
        Text('pulse'),
        SgSkeleton(
          animation: SgSkeletonAnimation.pulse,
          height: 56,
        ),
      ],
    ),
    SgStack(
      gap: 8,
      children: [
        Text('none'),
        SgSkeleton(animation: SgSkeletonAnimation.none, height: 56),
      ],
    ),
  ],
)
```

### Dimensões em texto

Aceita número (px) ou "50%", "2rem", "1.5em"; size define largura e altura juntas.

Região `sgSkeletonDimensoes` em `sg_skeleton_page.snippets.g.dart`.

```dart
const SgStack(
  gap: 8,
  children: [
    SgSkeleton(width: '50%', height: '2rem'),
    SgSkeleton(size: '3rem', shape: SgSkeletonShape.circle),
    SgSkeleton(width: 200, height: 24, borderRadius: 4),
  ],
)
```

## SgToaster

Página: `apps/seedgrid_showcase/lib/pages/sg_toaster_page.dart` (11 exemplo(s) na página; abaixo 3).

### Tipos de toast

Use métodos específicos por severidade.

Região `sgToasterTipos` em `sg_toaster_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 8,
  children: [
    SgButton(
      label: Text('default'),
      onClick: () => toast.message('Mensagem neutra'),
    ),
    SgButton(
      label: Text('success'),
      severity: SgSeverity.success,
      onClick: () => toast.success('Operação concluída'),
    ),
    SgButton(
      label: Text('info'),
      severity: SgSeverity.info,
      onClick: () => toast.info('Informação importante'),
    ),
    SgButton(
      label: Text('warning'),
      severity: SgSeverity.warning,
      onClick: () => toast.warning('Atenção no fluxo'),
    ),
    SgButton(
      label: Text('error'),
      severity: SgSeverity.danger,
      onClick: () => toast.error('Falha ao salvar'),
    ),
    SgButton(
      label: Text('loading'),
      appearance: SgAppearance.outline,
      onClick: () => toast.loading('Processando...'),
    ),
    SgButton(
      label: Text('descartar todos'),
      appearance: SgAppearance.ghost,
      onClick: toast.dismiss,
    ),
  ],
)
```

### Ações e toast personalizado

Use action para CTA rápida e custom para renderização livre.

Região `sgToasterAcoes` em `sg_toaster_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 8,
  children: [
    SgButton(
      label: Text('Toast com ação'),
      severity: SgSeverity.warning,
      onClick: () => toast.warning(
        'Item arquivado',
        SgToastOptions(
          description: 'Clique em desfazer para restaurar.',
          action: SgToastAction(
            label: 'Desfazer',
            onClick: () => toast.success(
              'Ação desfeita',
              SgToastOptions(
                description: 'O item voltou para a lista.',
              ),
            ),
          ),
        ),
      ),
    ),
    SgButton(
      label: Text('Toast personalizado'),
      appearance: SgAppearance.outline,
      onClick: () => toast.custom(
        (String id) => Container(
          width: 280,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF7F1),
            border: Border.all(color: const Color(0x80C56A2D)),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Toast personalizado',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF8F4B1F),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Conteúdo renderizado via toast.custom(...)',
                style: const TextStyle(color: Color(0xFF6B4B33)),
              ),
              const SizedBox(height: 8),
              SgButton(
                label: Text('Fechar'),
                size: SgSize.sm,
                onClick: () => toast.dismiss(id),
              ),
            ],
          ),
        ),
        const SgToastOptions(duration: 8000, closeButton: false),
      ),
    ),
  ],
)
```

### Opções por toast

Cada toast aceita duration, closeButton, description e action.

Região `sgToasterOpcoes` em `sg_toaster_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 8,
  children: [
    SgButton(
      label: Text('Disparar toast com opções'),
      onClick: () => toast.info(
        'Toast com opções personalizadas',
        SgToastOptions(
          description: 'Duração de 10s, sem closeButton.',
          duration: 10000,
          closeButton: false,
        ),
      ),
    ),
    SgButton(
      label: Text('1 segundo'),
      appearance: SgAppearance.outline,
      onClick: () => toast('Rápido', const SgToastOptions(duration: 1000)),
    ),
    SgButton(
      label: Text('Fixo (duration: 0)'),
      appearance: SgAppearance.outline,
      onClick: () => toast.info(
        'Fica até fechar',
        const SgToastOptions(duration: 0),
      ),
    ),
  ],
)
```

## SgToastHost

Página: `apps/seedgrid_showcase/lib/pages/sg_toast_host_page.dart` (11 exemplo(s) na página; abaixo 3).

### Configuração básica

Neste showcase, o SgToastHost já está montado na página. Em um app real, monte-o uma vez na raiz.

Região `sgToastHostBasico` em `sg_toast_host_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 8,
  children: [
    SgButton(
      label: Text('toast.message'),
      onClick: () => toast.message('Mensagem básica'),
    ),
    SgButton(
      label: Text('toast.success'),
      severity: SgSeverity.success,
      onClick: () => toast.success('Operação concluída'),
    ),
    SgButton(
      label: Text('toast.dismiss (all)'),
      appearance: SgAppearance.outline,
      onClick: toast.dismiss,
    ),
  ],
)
```

### Prioridade: layout vs página

Esta área tem um SgToaster dentro dela, mas existe um SgToastHost na página: o toaster solto não desenha nada, então cada toast aparece uma vez só.

Região `sgToastHostPrioridade` em `sg_toast_host_page.snippets.g.dart`.

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

### Posicionamento

O último host montado é o ativo; quando ele sai, o anterior volta. Ligue o segundo host (canto inferior esquerdo) e dispare um toast.

Região `sgToastHostPosicionamento` em `sg_toast_host_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 12,
  children: [
    ValueListenableBuilder<bool>(
      valueListenable: _extraHost,
      builder: (context, v, _) => FilterChip(
        label: Text('Segundo host'),
        selected: v,
        onSelected: (value) => _extraHost.value = value,
      ),
    ),
    SgButton(
      label: Text('Disparar'),
      onClick: () => toast.info('Quem está ativo?', const SgToastOptions(duration: 3000)),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_extraHost`: `ValueNotifier<bool>`, valor inicial `false`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

## SgWhistler

Página: `apps/seedgrid_showcase/lib/pages/sg_whistler_page.dart` (11 exemplo(s) na página; abaixo 3).

### Severidades e comportamento do stack

O serviço expõe métodos de conveniência por severidade, enquanto props do host como max, newestOnTop e gap controlam o stack.

Região `sgWhistlerSeveridades` em `sg_whistler_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  gap: 8,
  children: [
  SgButton(
    label: const Text('default'),
    onClick: () => sgWhistle.show(
    SgWhistleOptions(
      title: 'Nota de contexto',
      message: 'Feedback inline renderizado dentro do fluxo do layout.',
      duration: 5000,
    ),
  ),
  ),
  SgButton(
    label: const Text('success'),
    severity: SgSeverity.success,
    onClick: () => sgWhistle.success(
    SgWhistleOptions(
      title: 'Salvo',
      message: 'O registro foi persistido com sucesso.',
      duration: 5000,
    ),
  ),
  ),
  SgButton(
    label: const Text('info'),
    severity: SgSeverity.info,
    onClick: () => sgWhistle.info(
    SgWhistleOptions(
      title: 'Atenção',
      message: 'Esta seção pode mostrar progresso ou dicas contextuais.',
      duration: 5000,
    ),
  ),
  ),
  SgButton(
    label: const Text('warning'),
    severity: SgSeverity.warning,
    onClick: () => sgWhistle.warning(
    SgWhistleOptions(
      title: 'Revisão pendente',
      message: 'A ação precisa de confirmação antes de continuar.',
      duration: 5000,
    ),
  ),
  ),
  SgButton(
    label: const Text('error'),
    severity: SgSeverity.danger,
    onClick: () => sgWhistle.error(
    SgWhistleOptions(
      title: 'Ação falhou',
      message: 'A requisição retornou um erro e precisa de atenção.',
      duration: 5000,
    ),
  ),
  ),
  SgButton(
    label: const Text('loading'),
    appearance: SgAppearance.outline,
    onClick: () => sgWhistle.loading(
    SgWhistleOptions(
      title: 'Processando...',
      message: 'Processando sem bloquear o layout da página.',
      duration: 0,
    ),
  ),
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

### Ícone e onClose

icon troca o ícone do aviso; onClose roda quando ele sai da pilha por qualquer motivo.

Região `sgWhistlerIconeOnclose` em `sg_whistler_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  children: [
    SgStack(
      direction: SgStackDirection.row,
      wrap: true,
      align: SgStackAlign.center,
      gap: 8,
      children: [
        SgButton(
          label: Text('Aviso com ícone'),
          onClick: () => sgWhistle.warning(
            SgWhistleOptions(
              title: 'Rascunho',
              message: 'Você tem alterações não salvas.',
              icon: const Icon(Icons.edit),
              duration: 0,
              onClose: () => _fechados.value++,
            ),
          ),
        ),
        ValueListenableBuilder<int>(
          valueListenable: _fechados,
          builder: (context, total, _) =>
              Text('${'onClose chamado'}: $total'),
        ),
      ],
    ),
    const SgWhistler(max: 3),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_fechados`: `ValueNotifier<int>`, valor inicial `0`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

## SgWhistleHost

Página: `apps/seedgrid_showcase/lib/pages/sg_whistle_host_page.dart` (8 exemplo(s) na página; abaixo 3).

### Configuração básica

Monte um SgWhistleHost onde o layout deve revelar mensagens contextuais. Depois dispare whistles de qualquer lugar da página.

Região `sgWhistleHostBasico` em `sg_whistle_host_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  gap: 8,
  children: [
  SgButton(
    label: const Text('sgWhistle.show'),
    onClick: () => sgWhistle.show(
    SgWhistleOptions(
      title: 'Exemplo base',
      message: 'Um whistle padrão apareceu no rodapé da página.',
    ),
  ),
  ),
  SgButton(
    label: const Text('sgWhistle.success'),
    severity: SgSeverity.success,
    onClick: () => sgWhistle.success(
    SgWhistleOptions(
      title: 'Salvo',
      message: 'Esta mensagem permaneceu no fluxo do documento.',
    ),
  ),
  ),
  SgButton(
    label: const Text('sgWhistle.dismiss'),
    appearance: SgAppearance.outline,
    onClick: sgWhistle.dismiss,
  ),
  ],
)
```

### O host prevalece sobre o SgWhistler solto

A caixa abaixo tem um SgWhistler solto, mas há um SgWhistleHost na página: o solto não desenha nada e cada aviso aparece uma vez só.

Região `sgWhistleHostPrevalece` em `sg_whistle_host_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  align: SgStackAlign.start,
  children: [
    SgButton(
      label: Text('Disparar'),
      onClick: () => sgWhistle.info(
        SgWhistleOptions(message: 'Só aparece no host'),
      ),
    ),
    const SgWhistler(),
  ],
)
```

### Vários hosts

O último host montado é o ativo (aqui, um segundo host com cantos retos); ao sair, o anterior volta.

Região `sgWhistleHostVarios` em `sg_whistle_host_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 8,
  children: [
    ValueListenableBuilder<bool>(
      valueListenable: _extraHost,
      builder: (context, ativo, _) => SgButton(
        label: Text('${'Segundo host (cantos retos)'}: $ativo'),
        appearance: SgAppearance.outline,
        onClick: () => _extraHost.value = !ativo,
      ),
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

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_extraHost`: `ValueNotifier<bool>`, valor inicial `false`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

## SgNotificationBell

Página: `apps/seedgrid_showcase/lib/pages/sg_notification_bell_page.dart` (4 exemplo(s) na página; abaixo 4). O backend e o Pulse são simulados em memória (`demo_notifications_api.dart` e `SgSimulatedPulseConnection`), sem token nem chave.

### Básico

Toque no sino. Aqui não há servidor: a caixa vive em memória e um Pulse simulado avisa na hora quando o botão cria uma notificação nova (sem Pulse, a lista se atualiza ao abrir o sino e no polling de reserva). placement escolhe o lado em que o painel abre.

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

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_basico`: `DemoNotificationsApi` (backend simulado em memória, `demo_notifications_api.dart` do showcase); `_demoToken`: função `Future<SgRealtimeConnectResponse> Function()` do arquivo da página, que devolve um `SgRealtimeConnectResponse(enabled: true, token: ...)`; `_pulse`: `SgSimulatedPulseConnection` (Pulse simulado em memória). Declare-os no seu widget.

### Tipos com ícone e ação

types liga cada tipo de notificação a um ícone e à ação de abrir (por exemplo, baixar o relatório). Os callbacks avisam o que o usuário fez.

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
          onOpen: (n) =>
              _evento.value = 'baixar relatório ${n.publicId}',
        ),
        'backup.finished': SgNotificationTypeConfig(
          icon: const Icon(Icons.check_circle_outline),
          onOpen: (n) =>
              _evento.value = 'baixar backup ${n.publicId}',
        ),
      },
      onNotificationDelete: (n) =>
          _evento.value = 'excluiu: ${n.title}',
    ),
    ValueListenableBuilder<String>(
      valueListenable: _evento,
      builder: (context, evento, _) =>
          Text('Último evento: $evento'),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_evento`: `ValueNotifier<String>`, valor inicial `'-'`; `_tipos`: `DemoNotificationsApi` (backend simulado). Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Interruptor Não lidas

O painel traz o interruptor Não lidas (aqui, com defaultUnreadOnly desligado, abre em Todas). Ligado, tocar numa notificação a tira da lista e o contador cai na hora; desligado, mostra todas. A escolha não persiste entre recargas.

Região `sgNotificationBellInterruptor` em `sg_notification_bell_page.snippets.g.dart`.

```dart
SgNotificationBell(
  apiUrl: 'https://demo.local/user-notifications',
  fetcher: _interruptor.fetch,
  defaultUnreadOnly: false,
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_interruptor`: `DemoNotificationsApi` (backend simulado). Declare-os no seu widget.

### Sem o interruptor

showUnreadToggle: false esconde só o interruptor: o sino continua e o painel lista todas as notificações.

Região `sgNotificationBellSemInterruptor` em `sg_notification_bell_page.snippets.g.dart`.

```dart
SgNotificationBell(
  apiUrl: 'https://demo.local/user-notifications',
  fetcher: _semInterruptor.fetch,
  showUnreadToggle: false,
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_semInterruptor`: `DemoNotificationsApi` (backend simulado). Declare-os no seu widget.

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
