---
description: "Exemplos Dart de Navegação, overlay e wizard em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, navegacao-e-overlay, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Navegação, overlay e wizard (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Exemplos|Exemplos — Navegação, overlay e wizard (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

> **Pré-requisitos.** Vários exemplos usam estado da página, num `State` de `StatefulWidget`: flags e escolhas (`_basico`, `_severidade`, `_sev`, `_animacao`, `_anim`, `_placement`, `_align`, `_pos`, `_acoes`, `_icones`, `_botoes`, `_ultima`, `_resultado`), `GlobalKey`s das âncoras do `SgPopup` (`_basicoKey`, `_acoesKey`, `_posKey`) e um `SgFormController` (`_form`) nos exemplos do `SgWizard`; declare-os antes de copiar. Conferi, por amostragem (pelo menos um exemplo por componente), que nomes e parâmetros existem na API Dart real (`SgDialog(open:, onOpenChange:, title:, footer:)`, `SgPopup(anchorRef:, open:)`, `SgConfirmationDialog(onConfirm:, onCancel:)`, `SgWizard(control:, stepper: SgWizardStepper.numbered)`, `SgWizardPage(fields:)`, `SgDockMenu(items:)`); não encontrei divergência.

## SgDockMenu

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_menu_page.dart` (4 exemplo(s) na página; abaixo 3).

### Dock básico

Ancorado embaixo ao centro. Passe o mouse (desktop/web) para ampliar o item e ver o rótulo; em toque não há zoom.

Região `sgDockMenuBasico` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 220,
  child: Stack(
    children: [
      SgDockMenu(
        items: [
          SgDockMenuItem(
            id: 'home',
            icon: const Icon(Icons.home),
            label: 'Início',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'search',
            icon: const Icon(Icons.search),
            label: 'Buscar',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'settings',
            icon: const Icon(Icons.settings),
            label: 'Ajustes',
            onClick: () {},
          ),
        ],
      ),
    ],
  ),
)
```

### Posição vertical e badges

left-center e right-center empilham os itens; o badge aceita texto ou número.

Região `sgDockMenuVertical` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 320,
  child: Stack(
    children: [
      SgDockMenu(
        position: SgDockMenuPosition.leftCenter,
        items: [
          SgDockMenuItem(
            id: 'mail',
            icon: const Icon(Icons.mail),
            label: 'Mensagens',
            badge: 3,
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'bell',
            icon: const Icon(Icons.notifications),
            label: 'Avisos',
            badge: 'novo',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'lock',
            icon: const Icon(Icons.lock),
            label: 'Bloqueado',
            disabled: true,
          ),
        ],
      ),
    ],
  ),
)
```

### Tamanho, zoom e aparência

itemSize, gap, magnifyScale, borderRadius, elevation e backgroundColor.

Região `sgDockMenuAparencia` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 240,
  child: Stack(
    children: [
      SgDockMenu(
        position: SgDockMenuPosition.centerTop,
        itemSize: 40,
        gap: 10,
        magnifyScale: 2,
        borderRadius: 28,
        elevation: SgDockMenuElevation.sm,
        backgroundColor: '#e0f2fe',
        items: [
          SgDockMenuItem(
            id: 'a',
            icon: const Icon(Icons.folder),
            label: 'Arquivos',
          ),
          SgDockMenuItem(
            id: 'b',
            icon: const Icon(Icons.image),
            label: 'Imagens',
          ),
          SgDockMenuItem(
            id: 'c',
            icon: const Icon(Icons.music_note),
            label: 'Música',
          ),
          SgDockMenuItem(
            id: 'd',
            icon: const Icon(Icons.movie),
            label: 'Vídeos',
          ),
        ],
      ),
    ],
  ),
)
```

## SgPopup

Página: `apps/seedgrid_showcase/lib/pages/sg_popup_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Título, subtítulo e conteúdo ancorados em um botão. Clique fora ou Esc fecha.

Região `sgPopupBasico` em `sg_popup_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgButton(
      key: _basicoKey,
      label: Text('Abrir popup'),
      onClick: () => setState(() => _basico = !_basico),
    ),
    SgPopup(
      anchorRef: _basicoKey,
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: 'Perfil',
      subtitle: 'Conta pessoal',
      child: Text('Conteúdo livre do popup.'),
    ),
  ],
)
```

### Ações

Cada ação tem ícone, dica, severidade e pode manter o popup aberto.

Região `sgPopupAcoes` em `sg_popup_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgButton(
      key: _acoesKey,
      label: Text('Ações'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _acoes = !_acoes),
    ),
    const SizedBox(width: 12),
    if (_ultima.isNotEmpty) Text('Última ação: $_ultima'),
    SgPopup(
      anchorRef: _acoesKey,
      open: _acoes,
      onOpenChange: (open) => setState(() => _acoes = open),
      actions: [
        SgPopupAction(
          label: 'Editar',
          icon: const Icon(Icons.edit),
          hint: 'Abre o editor',
          onClick: () => setState(() => _ultima = 'editar'),
        ),
        SgPopupAction(
          label: 'Duplicar (não fecha)',
          icon: const Icon(Icons.copy),
          closeOnClick: false,
          onClick: () => setState(() => _ultima = 'duplicar'),
        ),
        SgPopupAction(
          label: 'Indisponível',
          disabled: true,
        ),
        SgPopupAction(
          label: 'Excluir',
          icon: const Icon(Icons.delete),
          severity: SgPopupSeverity.danger,
          onClick: () => setState(() => _ultima = 'excluir'),
        ),
      ],
    ),
  ],
)
```

### Posicionamento

placement e align; no modo auto o popup escolhe o lado que cabe na tela.

Região `sgPopupPosicionamento` em `sg_popup_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final p in SgPopupPlacement.values)
          ChoiceChip(
            label: Text(p.value),
            selected: _placement == p,
            onSelected: (_) => setState(() => _placement = p),
          ),
        for (final a in SgPopupAlign.values)
          ChoiceChip(
            label: Text('align ${a.value}'),
            selected: _align == a,
            onSelected: (_) => setState(() => _align = a),
          ),
      ],
    ),
    const SizedBox(height: 12),
    SgButton(
      key: _posKey,
      label: Text('Abrir'),
      onClick: () => setState(() => _pos = !_pos),
    ),
    SgPopup(
      anchorRef: _posKey,
      open: _pos,
      onOpenChange: (open) => setState(() => _pos = open),
      placement: _placement,
      align: _align,
      child: Text('${_placement.value} / ${_align.value}'),
    ),
  ],
)
```

## SgDialog

Página: `apps/seedgrid_showcase/lib/pages/sg_dialog_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Título, subtítulo, corpo e rodapé. Fecha pelo X, pelo Esc ou clicando no fundo.

Região `sgDialogBasico` em `sg_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir diálogo'),
      onClick: () => setState(() => _basico = true),
    ),
    SgDialog(
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: Text('Novo cadastro'),
      subtitle: Text('Preencha os dados abaixo'),
      footer: SgButton(
        label: Text('Salvar'),
        onClick: () => setState(() => _basico = false),
      ),
      child: Text('O conteúdo do diálogo fica aqui.'),
    ),
  ],
)
```

### Severidades

Cada severidade tinge o fundo e a faixa do topo do diálogo com a cor do botão correspondente, como no SgWhistler.

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
            onClick: () => setState(() {
              _sev = SgDialogSeverity.fromValue(s.value)!;
              _severidade = true;
            }),
          ),
      ],
    ),
    SgDialog(
      open: _severidade,
      onOpenChange: (open) => setState(() => _severidade = open),
      severity: _sev,
      size: SgDialogSize.sm,
      title: Text('Severidade ${_sev.value}'),
      footer: SgButton(
        label: Text('Confirmar'),
        severity:
            SgSeverity.fromValue(_sev.value) ?? SgSeverity.primary,
        onClick: () => setState(() => _severidade = false),
      ),
      child: Text(
        context.tx(
          'O fundo e a faixa do topo seguem a severidade escolhida.',
        ),
      ),
    ),
  ],
)
```

### Animações e fechamento automático

fade, zoom e slideUp; autoCloseMs fecha sozinho depois do tempo.

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
            onClick: () => setState(() {
              _anim = a;
              _animacao = true;
            }),
          ),
      ],
    ),
    SgDialog(
      open: _animacao,
      onOpenChange: (open) => setState(() => _animacao = open),
      animation: _anim,
      transitionMs: 300,
      autoCloseMs: 3000,
      title: Text('Animação ${_anim.value}'),
      child: Text(
        'Este diálogo fecha sozinho em 3 segundos.',
      ),
    ),
  ],
)
```

## SgConfirmationDialog

Página: `apps/seedgrid_showcase/lib/pages/sg_confirmation_dialog_page.dart` (4 exemplo(s) na página; abaixo 3).

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
      onClick: () => setState(() => _basico = true),
    ),
    if (_resultado.isNotEmpty) Text(_resultado),
    SgConfirmationDialog(
      open: _basico,
      onOpenChange: (open) => setState(() => _basico = open),
      title: Text('Excluir registro?'),
      message: Text('Esta ação não pode ser desfeita.'),
      onConfirm: () => setState(() => _resultado = 'Confirmado'),
      onCancel: () => setState(() => _resultado = 'Cancelado'),
    ),
  ],
)
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
            onClick: () => setState(() {
              _sev = SgDialogSeverity.fromValue(s.value)!;
              _severidade = true;
            }),
          ),
      ],
    ),
    SgConfirmationDialog(
      open: _severidade,
      onOpenChange: (open) => setState(() => _severidade = open),
      severity: _sev,
      showSeverityAccent: true,
      title: Text('Severidade ${_sev.value}'),
      message: Text(
        'Veja o ícone, o fundo e o botão de confirmar.',
      ),
    ),
  ],
)
```

### Botões personalizados

Rótulo, ícone, severidade e aparência de cada botão.

Região `sgConfirmationDialogBotoes` em `sg_confirmation_dialog_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Sair sem salvar'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _botoes = true),
    ),
    SgConfirmationDialog(
      open: _botoes,
      onOpenChange: (open) => setState(() => _botoes = open),
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
  ],
)
```

## SgWizard

Página: `apps/seedgrid_showcase/lib/pages/sg_wizard_demo_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Três etapas, Anterior/Próximo e Finalizar na última.

Região `sgWizardBasico` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgWizard(
      onFinish: () => setState(() => _resultado = 'finalizado'),
      children: [
        SgWizardPage(
          child: Text('Etapa 1: dados pessoais'),
        ),
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

stepper: numbered ou icons; o título padrão da etapa é "Etapa N".

Região `sgWizardStepper` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    FilterChip(
      label: Text('Ícones'),
      selected: _icones,
      onSelected: (v) => setState(() => _icones = v),
    ),
    const SizedBox(height: 12),
    SgWizard(
      stepper: _icones
          ? SgWizardStepper.icons
          : SgWizardStepper.numbered,
      onFinish: () {},
      children: [
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
        SgWizardPage(
          child: Text('Sem título nem ícone'),
        ),
      ],
    ),
  ],
)
```

### Validação por etapa com SgForm

O Próximo valida os campos da etapa (fields) no formulário e só avança se estiverem válidos.

Região `sgWizardFormulario` em `sg_wizard_demo_page.snippets.g.dart`.

```dart
SgWizard(
  control: _form,
  stepper: SgWizardStepper.numbered,
  onFinish: () {},
  children: [
    SgWizardPage(
      title: 'Nome',
      fields: const ['nome'],
      child: SgInputText(
        id: 'wz-nome',
        name: 'nome',
        control: _form,
        labelText: 'Nome',
        required: true,
        requiredMessage: 'Informe o nome',
      ),
    ),
    SgWizardPage(
      title: 'E-mail',
      fields: const ['email'],
      child: SgInputText(
        id: 'wz-email',
        name: 'email',
        control: _form,
        labelText: 'E-mail',
        rules: SgRules(
          required: 'Informe o e-mail',
          pattern: SgRuleValue(
            RegExp(r'.+@.+\..+'),
            'E-mail inválido',
          ),
        ),
      ),
    ),
  ],
)
```

## SgWizardPage

Página: `apps/seedgrid_showcase/lib/pages/sg_wizard_page_page.dart` (3 exemplo(s) na página; abaixo 3).

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

