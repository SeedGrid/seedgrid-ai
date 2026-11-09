---
description: "Exemplos Dart de Dígitos animados em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (todos os exemplos de cada componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, digits, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Dígitos animados (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/digits/Exemplos|Exemplos — Dígitos animados (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/digits/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco foi regerado a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 e comparado texto a texto (idêntico). Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, `${context.tx('texto')}` dentro de uma string virou `texto` e `context.txf('texto {k}', {'k': v})` virou a interpolação `'texto $v'`. O showcase não usa `setState` de página: o estado dos exemplos fica em `ValueNotifier`/`SgFormController` (campos com `name` + `control`) lidos por `ValueListenableBuilder`/`ListenableBuilder`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam membros `_x` definidos na página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes. Todos os exemplos de cada componente do showcase estão abaixo, na ordem e com os títulos dele (`apps/seedgrid_showcase`).

## SgDiscardDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_discard_digit_page.dart` (11 exemplo(s) na página; abaixo 11).

### Básico

Clique em Próximo para adicionar uma folha e em Anterior para remover uma.

Região `sgDiscardDigitBasico` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _pilha,
      builder: (context, pilha, _) => SgDiscardDigit(
        value: '7',
        color: '#0f172a',
        font: sans,
        backgroundColor: '#f8fafc',
        stackDepth: pilha,
      ),
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgButton(
          label: Text('Próximo (+1 folha)'),
          onClick: () => _pilha.value = _pilha.value < 30
              ? _pilha.value + 1
              : 30,
        ),
        const SizedBox(height: 8),
        SgButton(
          label: Text('Anterior (-1 folha)'),
          appearance: SgAppearance.outline,
          onClick: () => _pilha.value = _pilha.value > 2
              ? _pilha.value - 1
              : 2,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _pilha = ValueNotifier(8);`
- `const sans = '"Inter", "Segoe UI", sans-serif';`

### Folhas sequenciais

Cada clique descarta uma folha e revela a seguinte.

Região `sgDiscardDigitFolhasSequenciais` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _folha,
      builder: (context, folha, _) => SgDiscardDigit(
        value: folhas[folha],
        color: '#111827',
        font: sans,
        backgroundColor: '#fffef7',
        fontSize: 58,
      ),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Descartar folha'),
      size: SgSize.sm,
      onClick: () =>
          _folha.value = (_folha.value + 1) % folhas.length,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _folha = ValueNotifier(0);`
- `const sans = '"Inter", "Segoe UI", sans-serif';`
- `const folhas = ['001', '002', '003', '004', '005'];`

### Variações de papel

Exemplos com cores diferentes em color e backgroundColor.

Região `sgDiscardDigitVariacoesDePapel` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Papel branco'),
        const SgDiscardDigit(
          value: '7',
          color: '#0f172a',
          font: sans,
          backgroundColor: '#f8fafc',
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Papel âmbar'),
        const SgDiscardDigit(
          value: '7',
          color: '#4a2d13',
          font: sans,
          backgroundColor: '#fff4d6',
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Papel azul frio'),
        const SgDiscardDigit(
          value: '7',
          color: '#0b2f50',
          font: sans,
          backgroundColor: '#e7f5ff',
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `const sans = '"Inter", "Segoe UI", sans-serif';`

### Fontes

Comparação de fontes no mesmo efeito de pilha.

Região `sgDiscardDigitFontes` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Sans'),
        const SgDiscardDigit(
          value: '42',
          color: '#0f172a',
          font: sans,
          backgroundColor: '#f8fafc',
          fontSize: 60,
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Serif'),
        const SgDiscardDigit(
          value: '42',
          color: '#1f2937',
          font: serif,
          backgroundColor: '#fffef7',
          fontSize: 60,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `const sans = '"Inter", "Segoe UI", sans-serif';`
- `const serif = '"Merriweather", "Times New Roman", serif';`

### Descarte automático

Atualização contínua para observar a direção aleatória da folha descartada.

Região `sgDiscardDigitAutoDescarte` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _contador,
      builder: (context, contador, _) => SgDiscardDigit(
        value: contador.toString().padLeft(2, '0'),
        color: '#0f172a',
        font: sans,
        backgroundColor: '#f8fafc',
        fontSize: 62,
        transitionMs: 700,
        stackDepth: 15,
      ),
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<bool>(
      valueListenable: _rodando,
      builder: (context, rodando, _) => SgButton(
        label: Text(rodando ? 'Parar' : 'Iniciar'),
        size: SgSize.sm,
        onClick: _alternarAutomatico,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _contador = ValueNotifier(0);`
- `final ValueNotifier<bool> _rodando = ValueNotifier(false);`
- `void _alternarAutomatico() {_rodando.value = !_rodando.value; _timer?.cancel(); if (_rodando.value) {_timer = Timer.periodic(const Duration(milliseconds: 800), (_) {if (mounted) _contador.value = (_contador.value + 1) % 100;});}}`
- `const sans = '"Inter", "Segoe UI", sans-serif';`

### Paginação imperativa (ref)

totalNumberPages define o total de folhas. O controller expõe increasePage(), decreasePage() e page().

Região `sgDiscardDigitPaginacaoRef` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 32,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _paginaAtual,
      builder: (context, paginaAtual, _) => SgDiscardDigit(
        value: '$paginaAtual',
        controller: _ref,
        totalNumberPages: totalPaginas,
        fontSize: 64,
      ),
    ),
    ValueListenableBuilder<int>(
      valueListenable: _paginaAtual,
      builder: (context, paginaAtual, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Página $paginaAtual de $totalPaginas',
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              SgButton(
                label: Text('Anterior'),
                size: SgSize.sm,
                enabled: paginaAtual > 1,
                onClick: () {
                  _ref.decreasePage();
                  _paginaAtual.value = _ref.page();
                },
              ),
              SgButton(
                label: Text('Próxima'),
                size: SgSize.sm,
                enabled: paginaAtual < totalPaginas,
                onClick: () {
                  _ref.increasePage();
                  _paginaAtual.value = _ref.page();
                },
              ),
            ],
          ),
        ],
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _paginaAtual = ValueNotifier(1);`
- `final SgDiscardDigitController _ref = SgDiscardDigitController();`
- `const totalPaginas = 10;`

### Descarte (padrão)

A folha de cima voa para fora em 640 ms e o valor novo aparece embaixo. O movimento é sorteado a cada troca.

Região `sgDiscardDigitDescarte` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _n,
      builder: (context, n, _) => SgDiscardDigit(value: '$n'),
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => _n.value = _n.value % 9 + 1,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(1);`

### Entrando por baixo

changeAnimationMode: incoming — a folha nova sobe por baixo e o topo só muda no fim.

Região `sgDiscardDigitEntrando` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _n,
      builder: (context, n, _) => SgDiscardDigit(
        value: '$n',
        changeAnimationMode:
            SgDiscardDigitChangeAnimationMode.incoming,
      ),
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => _n.value = _n.value % 9 + 1,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(1);`

### Páginas de um monte

totalNumberPages faz a pilha encolher a cada increasePage(); decreasePage() traz a folha de volta por baixo.

Região `sgDiscardDigitPaginas` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _page,
      builder: (context, page, _) => SgDiscardDigit(
        value: '$page',
        controller: _pages,
        totalNumberPages: 8,
        stackDepth: 8,
      ),
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ValueListenableBuilder<int>(
          valueListenable: _page,
          builder: (context, page, _) => Text('Página $page de 8'),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 16,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            SgButton(
              label: Text('Anterior'),
              appearance: SgAppearance.outline,
              onClick: () {
                _pages.decreasePage();
                _page.value = _pages.page();
              },
            ),
            SgButton(
              label: Text('Próxima'),
              onClick: () {
                _pages.increasePage();
                _page.value = _pages.page();
              },
            ),
          ],
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _page = ValueNotifier(1);`
- `final SgDiscardDigitController _pages = SgDiscardDigitController();`

### Sem animação

animateOnChange: false troca o valor na hora.

Região `sgDiscardDigitSemAnimacao` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _n,
      builder: (context, n, _) =>
          SgDiscardDigit(value: '$n', animateOnChange: false),
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => _n.value = _n.value % 9 + 1,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(1);`

### Aparência

Cores em texto CSS, peso da fonte, tamanho e duração da transição.

Região `sgDiscardDigitAparencia` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _n,
      builder: (context, n, _) => SgDiscardDigit(
        value: '$n',
        fontSize: 48,
        color: '#7c2d12',
        backgroundColor: '#ffedd5',
        fontWeight: 'bold',
        transitionMs: 900,
        stackDepth: 10,
      ),
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => _n.value = _n.value % 9 + 1,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(1);`

## SgFadeDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_fade_digit_page.dart` (9 exemplo(s) na página; abaixo 9).

### Básico (0-9)

Troca manual entre dígitos numéricos.

Região `sgFadeDigitBasico` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digito,
      builder: (context, digito, _) =>
          SgFadeDigit(value: '$digito'),
    ),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Próximo (+1)'),
          onClick: () => _digito.value = (_digito.value + 1) % 10,
        ),
        SgButton(
          label: Text('Anterior (-1)'),
          onClick: () => _digito.value = (_digito.value + 9) % 10,
        ),
        SgButton(
          label: Text('Aleatório'),
          onClick: () =>
              _digito.value = DateTime.now().microsecond % 10,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`

### Letras (A-Z)

Aceita qualquer caractere - letras, símbolos, espaços.

Região `sgFadeDigitLetras` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _letra,
      builder: (context, letra, _) =>
          SgFadeDigit(value: String.fromCharCode(65 + letra)),
    ),
    SgButton(
      label: Text('Próxima letra'),
      onClick: () => _letra.value = (_letra.value + 1) % 26,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _letra = ValueNotifier(0); // 0 = A final ValueNotifier<bool> _rodando = ValueNotifier(false);`

### Cores personalizadas

color e backgroundColor são totalmente livres - qualquer paleta funciona.

Região `sgFadeDigitPersonalizadas` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    Column(
      children: [
        Text('Padrão'),
        const SgFadeDigit(
          value: '7',
          color: '#edebeb',
          backgroundColor: '#333232',
        ),
      ],
    ),
    Column(
      children: [
        Text('Verde'),
        const SgFadeDigit(
          value: '7',
          color: '#4ade80',
          backgroundColor: '#052e16',
        ),
      ],
    ),
    Column(
      children: [
        Text('Azul'),
        const SgFadeDigit(
          value: '7',
          color: '#60a5fa',
          backgroundColor: '#0f172a',
        ),
      ],
    ),
    Column(
      children: [
        Text('Rosa'),
        const SgFadeDigit(
          value: '7',
          color: '#f472b6',
          backgroundColor: '#2d0a1e',
        ),
      ],
    ),
    Column(
      children: [
        Text('Âmbar'),
        const SgFadeDigit(
          value: '7',
          color: '#fbbf24',
          backgroundColor: '#1c1007',
        ),
      ],
    ),
  ],
)
```

### Incremento automático

Incremento automático para validar transições contínuas e rápidas.

Região `sgFadeDigitAuto` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _contador,
      builder: (context, contador, _) =>
          SgFadeDigit(value: '$contador'),
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _rodando,
      builder: (context, rodando, _) => SgButton(
        label: Text(rodando ? 'Parar' : 'Iniciar'),
        onClick: _alternarContador,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _contador = ValueNotifier(0);`
- `final ValueNotifier<bool> _rodando = ValueNotifier(false);`
- `void _alternarContador() {_rodando.value = !_rodando.value; _timerContador?.cancel(); if (_rodando.value) {_timerContador = Timer.periodic(const Duration(milliseconds: 800), (_) {if (mounted) _contador.value = (_contador.value + 1) % 10;});}}`

### Sequência estilo relógio

Composição de vários SgFadeDigit em linha - cada dígito atualiza de forma independente.

Região `sgFadeDigitRelogio` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _segundos,
      builder: (context, total, _) {
        String dois(int n) => n.toString().padLeft(2, '0');
        final horas = dois(total ~/ 3600);
        final minutos = dois(total % 3600 ~/ 60);
        final segundos = dois(total % 60);
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            SgFadeDigit(value: horas[0]),
            SgFadeDigit(value: horas[1]),
            const Text(
              ':',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            SgFadeDigit(value: minutos[0]),
            SgFadeDigit(value: minutos[1]),
            const Text(
              ':',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            SgFadeDigit(value: segundos[0]),
            SgFadeDigit(value: segundos[1]),
          ],
        );
      },
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<bool>(
      valueListenable: _relogioRodando,
      builder: (context, rodando, _) => SgButton(
        label: Text(rodando ? 'Parar' : 'Iniciar'),
        size: SgSize.sm,
        onClick: _alternarRelogio,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _segundos = ValueNotifier(0);`
- `final ValueNotifier<bool> _relogioRodando = ValueNotifier(false);`
- `void _alternarRelogio() {_relogioRodando.value = !_relogioRodando.value; _timerRelogio?.cancel(); if (_relogioRodando.value) {_timerRelogio = Timer.periodic(const Duration(seconds: 1), (_) {if (mounted) _segundos.value = (_segundos.value + 1) % 86400;});}}`

### Tamanhos

Ajuste de escala via fontSize - largura e altura do cartão são proporcionais.

Região `sgFadeDigitTamanhos` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    Column(
      children: [
        Text('Pequeno (40px)'),
        const SgFadeDigit(value: '5', fontSize: 40),
      ],
    ),
    Column(
      children: [
        Text('Médio (70px)'),
        const SgFadeDigit(value: '5', fontSize: 70),
      ],
    ),
    Column(
      children: [
        Text('Grande (110px)'),
        const SgFadeDigit(value: '5', fontSize: 110),
      ],
    ),
  ],
)
```

### Cartão com fade

O cartão tem as mesmas proporções do SgFlipDigit: 88% x 138% do fontSize.

Região `sgFadeDigitCartao` em `sg_fade_digit_page.snippets.g.dart`.

```dart
const Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    SgFadeDigit(value: '1'),
    SizedBox(width: 8),
    SgFadeDigit(value: '4'),
    SizedBox(width: 8),
    SgFadeDigit(value: '0'),
    SizedBox(width: 8),
    SgFadeDigit(value: '7'),
  ],
)
```

### Cores e tamanhos

color, backgroundColor, fontSize e font.

Região `sgFadeDigitCores` em `sg_fade_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgFadeDigit(
      value: '2',
      color: '#111827',
      backgroundColor: '#fde68a',
    ),
    SgFadeDigit(
      value: '9',
      fontSize: 40,
      color: '#22c55e',
      backgroundColor: '#052e16',
    ),
    SgFadeDigit(value: '0', fontSize: 100),
    SgFadeDigit(value: '1', fontSize: 24, font: 'monospace'),
  ],
)
```

### Troca de valor

O dígito atual apaga (200 ms), o novo entra invisível e acende (200 ms).

Região `sgFadeDigitTroca` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value = 0;
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgFadeDigit(value: '$value'),
          const SizedBox(width: 24),
          SgButton(
            label: Text('Próximo'),
            onClick: () => set(() => value = (value + 1) % 10),
          ),
        ],
      ),
    );
  },
)
```

## SgFlipDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_flip_digit_page.dart` (8 exemplo(s) na página; abaixo 8).

### Básico (0-9)

Incremento, decremento e valor aleatório.

Região `sgFlipDigitBasico` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digito,
      builder: (context, digito, _) =>
          SgFlipDigit(value: '$digito'),
    ),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Próximo (+1)'),
          onClick: () => _digito.value = (_digito.value + 1) % 10,
        ),
        SgButton(
          label: Text('Anterior (-1)'),
          onClick: () => _digito.value = (_digito.value + 9) % 10,
        ),
        SgButton(
          label: Text('Aleatório'),
          onClick: () =>
              _digito.value = DateTime.now().microsecond % 10,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`

### Letras (A-Z)

Também aceita caracteres alfabéticos.

Região `sgFlipDigitLetrasAz` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _letra,
      builder: (context, letra, _) =>
          SgFlipDigit(value: String.fromCharCode(65 + letra)),
    ),
    SgButton(
      label: Text('Próxima letra'),
      onClick: () => _letra.value = (_letra.value + 1) % 26,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _letra = ValueNotifier(0); // 0 = A final ValueNotifier<bool> _rodando = ValueNotifier(false);`

### Variações de tamanho

Ajuste de fontSize (a largura e a altura seguem dele).

Região `sgFlipDigitVariacoes` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    Column(
      children: [
        Text('Pequeno'),
        const SgFlipDigit(value: '5', fontSize: 45),
      ],
    ),
    Column(
      children: [
        Text('Médio'),
        const SgFlipDigit(value: '5'),
      ],
    ),
    Column(
      children: [
        Text('Grande'),
        const SgFlipDigit(value: '5', fontSize: 120),
      ],
    ),
  ],
)
```

### Sequência estilo relógio

Dígitos lado a lado com separador.

Região `sgFlipDigitSequencia` em `sg_flip_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgFlipDigit(value: '2'),
    SgFlipDigit(value: '3'),
    Text(
      ':',
      style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
    ),
    SgFlipDigit(value: '4'),
    SgFlipDigit(value: '5'),
  ],
)
```

### Incremento automático

Troca automática a cada 1,3 s.

Região `sgFlipDigitAuto` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _auto,
      builder: (context, auto, _) => SgFlipDigit(value: '$auto'),
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _rodando,
      builder: (context, rodando, _) => SgButton(
        label: Text(rodando ? 'Parar' : 'Iniciar'),
        onClick: _alternar,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _auto = ValueNotifier(0);`
- `final ValueNotifier<bool> _rodando = ValueNotifier(false);`
- `void _alternar() {_rodando.value = !_rodando.value; _timer?.cancel(); if (_rodando.value) {_timer = Timer.periodic(const Duration(milliseconds: 1300), (_) {if (mounted) _auto.value = (_auto.value + 1) % 10;});}}`

### Contador

Cada troca de valor vira uma carta que gira em 800 ms com ease-out-bounce (o padrão do @pqina/flip).

Região `sgFlipDigitContador` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _n,
      builder: (context, n, _) =>
          SgFlipDigit(value: '${n % 10}', fontSize: 56),
    ),
    SgButton(label: const Text('+1'), onClick: () => _n.value++),
    SgButton(
      label: Text('Zerar'),
      appearance: SgAppearance.outline,
      onClick: () => _n.value = 0,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(0);`

### Tamanhos

fontSize controla a escala do conjunto: as medidas vêm de múltiplos dele.

Região `sgFlipDigitTamanhos` em `sg_flip_digit_page.snippets.g.dart`.

```dart
ValueListenableBuilder<int>(
  valueListenable: _n,
  builder: (context, n, _) => Wrap(
    spacing: 24,
    runSpacing: 16,
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      SgFlipDigit(value: '${n % 10}', fontSize: 28),
      SgFlipDigit(value: '${n % 10}', fontSize: 48),
      SgFlipDigit(value: '${n % 10}', fontSize: 72),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _n = ValueNotifier(0);`

### Vários dígitos

Um dígito por caractere, como num relógio de cartas. Só gira quem mudou.

Região `sgFlipDigitVarios` em `sg_flip_digit_page.snippets.g.dart`.

```dart
ValueListenableBuilder<int>(
  valueListenable: _clock,
  builder: (context, clock, _) => Wrap(
    spacing: 16,
    runSpacing: 12,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final ch in clock.toString().padLeft(4, '0').split(''))
        SgFlipDigit(value: ch, fontSize: 44),
      SgButton(
        label: Text('Somar 111'),
        size: SgSize.sm,
        onClick: () => _clock.value = (clock + 111) % 10000,
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _clock = ValueNotifier(1234);`

## SgMatrixDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_matrix_digit_page.dart` (8 exemplo(s) na página; abaixo 8).

### Básico (0-9)

Troca de dígitos com botões de controle.

Região `sgMatrixDigitBasico` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digito,
      builder: (context, digito, _) => SgMatrixDigit(
        value: '$digito',
        color: '#22d3ee',
        backgroundColor: '#0b1220',
      ),
    ),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Próximo (+1)'),
          onClick: () => _digito.value = (_digito.value + 1) % 10,
        ),
        SgButton(
          label: Text('Anterior (-1)'),
          onClick: () => _digito.value = (_digito.value + 9) % 10,
        ),
        SgButton(
          label: Text('Aleatório'),
          onClick: () =>
              _digito.value = DateTime.now().microsecond % 10,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`

### Texto matricial

Exibição de texto com letras, números e símbolos.

Região `sgMatrixDigitTextoMatricial` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _mensagem,
      builder: (context, mensagem, _) => SgMatrixDigit(
        value: _mensagens[mensagem],
        color: '#a3e635',
        backgroundColor: '#06090f',
        dotSize: 8,
        gap: 2,
        charGap: 6,
      ),
    ),
    SgButton(
      label: Text('Trocar texto'),
      onClick: () => _mensagem.value =
          (_mensagem.value + 1) % _mensagens.length,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _mensagem = ValueNotifier(0);`
- `static const _mensagens = ['SEEDGRID', 'MATRIX 2026', 'ABC-123'];`

### Variações de color/backgroundColor

Exemplos de temas visuais.

Região `sgMatrixDigitVariacoes` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Ciano'),
        const SgMatrixDigit(
          value: '2026',
          color: '#22d3ee',
          backgroundColor: '#0b1220',
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Lima'),
        const SgMatrixDigit(
          value: 'HELLO',
          color: '#a3e635',
          backgroundColor: '#05070b',
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Laranja'),
        const SgMatrixDigit(
          value: 'SG',
          color: '#fb923c',
          backgroundColor: '#101826',
        ),
      ],
    ),
  ],
)
```

### Escala da matriz

Ajuste de dotSize, gap e charGap.

Região `sgMatrixDigitEscala` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Pequeno'),
        const SgMatrixDigit(
          value: '123',
          dotSize: 6,
          gap: 2,
          charGap: 4,
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Médio'),
        const SgMatrixDigit(
          value: '123',
          dotSize: 9,
          gap: 3,
          charGap: 7,
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Grande'),
        const SgMatrixDigit(
          value: '123',
          dotSize: 13,
          gap: 4,
          charGap: 10,
        ),
      ],
    ),
  ],
)
```

### Texto em matriz de pontos

Letras, números e símbolos comuns em grade 5 x 7; minúsculas viram maiúsculas.

Região `sgMatrixDigitTexto` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const SgMatrixDigit(value: 'Seed Grid 2026')
```

### Cores e brilho

color, offColor e backgroundColor; glow desliga o brilho dos pontos acesos.

Região `sgMatrixDigitCores` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgMatrixDigit(
      value: '12:34',
      color: '#22c55e',
      backgroundColor: '#04120a',
      offColor: 'rgba(34, 197, 94, 0.15)',
    ),
    SgMatrixDigit(
      value: 'OK',
      color: '#f97316',
      backgroundColor: '#1a0b02',
      offColor: 'rgba(249, 115, 22, 0.15)',
    ),
    SgMatrixDigit(value: 'OFF', glow: false),
  ],
)
```

### Medidas

dotSize, gap, charGap, padding e rounded em pixels.

Região `sgMatrixDigitMedidas` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgMatrixDigit(value: 'AB', dotSize: 5, gap: 1, charGap: 4),
    SgMatrixDigit(value: 'AB'),
    SgMatrixDigit(
      value: 'AB',
      dotSize: 13,
      gap: 4,
      charGap: 12,
      padding: 14,
      rounded: 24,
    ),
    SgMatrixDigit(value: 'AB', gap: 0, padding: 0, rounded: 0),
  ],
)
```

### Símbolos e caractere desconhecido

Pontuação comum tem glifo; qualquer outro caractere usa o glifo de reserva.

Região `sgMatrixDigitSimbolos` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const SgMatrixDigit(value: r'-_.:/?! @#')
```

## SgNeonDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_neon_digit_page.dart` (9 exemplo(s) na página; abaixo 9).

### Básico

Controle simples de dígito em estilo neon.

Região `sgNeonDigitBasico` em `sg_neon_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digito,
      builder: (context, digito, _) => SgNeonDigit(
        value: '$digito',
        color: '#f8fafc',
        backgroundColor: '#120f2b',
        shadowColor: '#8b5cf6',
      ),
    ),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Próximo (+1)'),
          onClick: () => _digito.value = (_digito.value + 1) % 10,
        ),
        SgButton(
          label: Text('Anterior (-1)'),
          onClick: () => _digito.value = (_digito.value + 9) % 10,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`

### Texto em neon

Troca de palavras com o mesmo componente.

Região `sgNeonDigitTexto` em `sg_neon_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _palavra,
      builder: (context, palavra, _) => SgNeonDigit(
        value: const ['teste', 'seedgrid', 'your text'][palavra],
        color: '#e2f6ff',
        backgroundColor: '#101934',
        shadowColor: '#47d1ff',
      ),
    ),
    SgButton(
      label: Text('Trocar texto'),
      onClick: () => _palavra.value = (_palavra.value + 1) % 3,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _palavra = ValueNotifier(0);`

### Neon script (referência visual)

Visual inspirado nas imagens azul e laranja.

Região `sgNeonDigitScript` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    SgNeonDigit(
      value: 'Your Text',
      color: '#e4fbff',
      backgroundColor: '#090f22',
      shadowColor: '#47d1ff',
      font:
          '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive',
      fontWeight: 500,
      fontSize: 62,
      padding: 18,
      shadowStrength: 1.25,
    ),
    SgNeonDigit(
      value: 'Your Text',
      color: '#fff7e5',
      backgroundColor: '#1c120b',
      shadowColor: '#ffae1a',
      font:
          '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive',
      fontWeight: 500,
      fontSize: 62,
      padding: 18,
      shadowStrength: 1.25,
    ),
  ],
)
```

### Variações de color/background/shadow

Mesmo texto com paletas diferentes.

Região `sgNeonDigitVariacoes` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    SgNeonDigit(
      value: 'teste',
      color: '#e2f6ff',
      backgroundColor: '#0b1130',
      shadowColor: '#38bdf8',
    ),
    SgNeonDigit(
      value: 'teste',
      color: '#f5e9ff',
      backgroundColor: '#170f2b',
      shadowColor: '#a855f7',
    ),
    SgNeonDigit(
      value: 'teste',
      color: '#fff7e8',
      backgroundColor: '#2a1a14',
      shadowColor: '#fb923c',
    ),
  ],
)
```

### Escala e leitura

fontSize e padding combinados.

Região `sgNeonDigitEscala` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 16,
  runSpacing: 16,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgNeonDigit(value: '5', fontSize: 24, padding: 10),
    SgNeonDigit(value: '5', fontSize: 44, padding: 14),
    SgNeonDigit(value: '5', fontSize: 72, padding: 18),
  ],
)
```

### Brilho neon

Cinco camadas de brilho no texto e duas no contorno, todas em torno da cor do texto.

Região `sgNeonDigitBrilho` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 32,
  runSpacing: 32,
  children: [
    SgNeonDigit(value: '24'),
    SgNeonDigit(
      value: '59',
      color: '#ff7ad9',
      shadowColor: '#ff00aa',
      backgroundColor: '#1a0612',
    ),
    SgNeonDigit(
      value: 'GO',
      color: '#7dd3fc',
      shadowColor: '#0ea5e9',
      backgroundColor: '#04121c',
    ),
  ],
)
```

### Intensidade, fonte e espaçamento

shadowStrength (mínimo 0,2), fontSize, fontWeight (número ou texto), letterSpacing, padding e rounded.

Região `sgNeonDigitFonte` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 32,
  runSpacing: 32,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgNeonDigit(value: '8', shadowStrength: 0.3, fontSize: 36),
    SgNeonDigit(value: '8', shadowStrength: 2, fontSize: 36),
    SgNeonDigit(
      value: 'OK',
      fontWeight: 'bold',
      letterSpacing: 6,
      padding: 20,
      rounded: 28,
    ),
    SgNeonDigit(value: '7', fontWeight: 300, fontSize: 64),
  ],
)
```

### Troca de valor com apagar e acender

Ao trocar o valor, o texto apaga, muda na metade de transitionMs e acende de novo (animateOnChange).

Região `sgNeonDigitTroca` em `sg_neon_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value = 1;
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgNeonDigit(value: '$value', transitionMs: 400),
          const SizedBox(width: 24),
          FilledButton(
            onPressed: () => set(() => value = value % 9 + 1),
            child: Text('Próximo'),
          ),
        ],
      ),
    );
  },
)
```

### Sem animação

Região `sgNeonDigitSemAnimacao` em `sg_neon_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value = 1;
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgNeonDigit(value: '$value', animateOnChange: false),
          const SizedBox(width: 24),
          FilledButton(
            onPressed: () => set(() => value = value % 9 + 1),
            child: Text('Próximo'),
          ),
        ],
      ),
    );
  },
)
```

## SgRoller3DDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_roller3d_digit_page.dart` (6 exemplo(s) na página; abaixo 6).

### Básico (0-9)

O tambor desliza até a posição de value em 500 ms com cubic-bezier(0.22, 1, 0.36, 1).

Região `sgRoller3dDigitDigitos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digit,
      builder: (context, digit, _) =>
          SgRoller3DDigit(value: '$digit', fontSize: 32),
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => _digit.value = (_digit.value + 1) % 10,
    ),
    SgButton(
      label: Text('Aleatório'),
      appearance: SgAppearance.outline,
      onClick: () => _digit.value = (_digit.value * 7 + 3) % 10,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digit = ValueNotifier(0);`

### Valor com 2 dígitos

items define os valores; a largura cresce com o maior deles.

Região `sgRoller3dDigitMinutos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _minute,
      builder: (context, minute, _) => SgRoller3DDigit(
        value: minute.toString().padLeft(2, '0'),
        items: List.generate(
          60,
          (i) => i.toString().padLeft(2, '0'),
        ),
        fontSize: 22,
      ),
    ),
    SgButton(
      label: Text('+7 minutos'),
      onClick: () => _minute.value = (_minute.value + 7) % 60,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _minute = ValueNotifier(42);`

### Letras (A-Z)

Região `sgRoller3dDigitLetras` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _letter,
      builder: (context, letter, _) => SgRoller3DDigit(
        value: String.fromCharCode(65 + letter),
        items: List.generate(
          26,
          (i) => String.fromCharCode(65 + i),
        ),
        fontSize: 32,
      ),
    ),
    SgButton(
      label: Text('Próxima letra'),
      onClick: () => _letter.value = (_letter.value + 5) % 26,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _letter = ValueNotifier(12);`

### Animação de nomes

Composição de vários SgRoller3DDigit para animar texto - exemplo: "LUCIANO" -> "MARTA".

Região `sgRoller3dDigitNomes` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_nome, _passo]),
  builder: (context, _) => Wrap(
    spacing: 8,
    runSpacing: 12,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final letra in _letrasDoNome())
        SgRoller3DDigit(
          value: letra,
          items: _alfabeto,
          fontSize: 28,
          transitionMs: 110,
        ),
      SgButton(
        label: Text('Animar nome'),
        size: SgSize.sm,
        onClick: _animarNome,
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _nome = ValueNotifier(0);`
- `final ValueNotifier<int> _passo = ValueNotifier(7);`
- `List<String> _letrasDoNome() {final atual = _nomes[_nome.value]; final anterior = _nomes[(_nome.value - 1 + _nomes.length) % _nomes.length]; final tamanho = atual.length > anterior.length ? atual.length : anterior.length; final a = anterior.padRight(tamanho); final b = atual.padRight(tamanho); return [for (var i = 0; i < tamanho; i++) i <= _passo.value ? b[i] : a[i]];}`
- `static final _alfabeto = [' ', ...List.generate(26, (i) => String.fromCharCode(65 + i))];`
- `void _animarNome() {_timer?.cancel(); final atual = _nomes[_nome.value]; final proximo = _nomes[(_nome.value + 1) % _nomes.length]; final maximo = atual.length > proximo.length ? atual.length : proximo.length; _nome.value = (_nome.value + 1) % _nomes.length; _passo.value = 0; _timer = Timer.periodic(const Duration(milliseconds: 120), (t) {if (!mounted) return; _passo.value++; if (_passo.value >= maximo) t.cancel();});}`

### Variações de tamanho

Ajuste de escala via prop fontSize.

Região `sgRoller3dDigitTamanhos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    for (final tamanho in const [16, 32, 56])
      Column(
        children: [
          Text('${tamanho}px'),
          SgRoller3DDigit(value: '5', fontSize: tamanho.toDouble()),
        ],
      ),
  ],
)
```

### Duração da transição

transitionMs: 150 ms contra 1500 ms, lado a lado.

Região `sgRoller3dDigitDuracao` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
ValueListenableBuilder<bool>(
  valueListenable: _slow,
  builder: (context, slow, _) => Wrap(
    spacing: 16,
    runSpacing: 12,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      SgRoller3DDigit(
        value: slow ? '9' : '0',
        transitionMs: 150,
        fontSize: 28,
      ),
      SgRoller3DDigit(
        value: slow ? '9' : '0',
        transitionMs: 1500,
        fontSize: 28,
      ),
      SgButton(
        label: Text('Alternar 0 e 9'),
        onClick: () => _slow.value = !slow,
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<bool> _slow = ValueNotifier(false);`

## SgSegmentDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_segment_digit_page.dart` (5 exemplo(s) na página; abaixo 5).

### Básico (0-9)

Troca manual de dígitos com controles.

Região `sgSegmentDigitBasico` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _digito,
      builder: (context, digito, _) =>
          SgSegmentDigit(value: '$digito', size: 64),
    ),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Próximo (+1)'),
          onClick: () => _digito.value = (_digito.value + 1) % 10,
        ),
        SgButton(
          label: Text('Anterior (-1)'),
          onClick: () => _digito.value = (_digito.value + 9) % 10,
        ),
        SgButton(
          label: Text('Aleatório'),
          onClick: () =>
              _digito.value = DateTime.now().microsecond % 10,
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`

### Composição estilo relógio

Composição HH:MM:SS com separador ':' usando o próprio componente.

Região `sgSegmentDigitRelogio` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _segundos,
      builder: (context, segundos, _) {
        final total = segundos % 86400;
        final hh = (total ~/ 3600).toString().padLeft(2, '0');
        final mm = ((total % 3600) ~/ 60).toString().padLeft(
          2,
          '0',
        );
        final ss = (total % 60).toString().padLeft(2, '0');
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            SgSegmentDigit(value: hh[0], size: 36),
            const SizedBox(width: 4),
            SgSegmentDigit(value: hh[1], size: 36),
            const SizedBox(width: 4),
            const SgSegmentDigit(value: ':', size: 36),
            const SizedBox(width: 4),
            SgSegmentDigit(value: mm[0], size: 36),
            const SizedBox(width: 4),
            SgSegmentDigit(value: mm[1], size: 36),
            const SizedBox(width: 4),
            const SgSegmentDigit(value: ':', size: 36),
            const SizedBox(width: 4),
            SgSegmentDigit(value: ss[0], size: 36),
            const SizedBox(width: 4),
            SgSegmentDigit(value: ss[1], size: 36),
          ],
        );
      },
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('+1 segundo'),
      onClick: () => _segundos.value++,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _segundos = ValueNotifier(0);`

### Tamanhos

Escala visual ajustando apenas a prop size.

Região `sgSegmentDigitTamanhos` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Pequeno'),
        SgSegmentDigit(value: '8', size: 18),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Médio'),
        SgSegmentDigit(value: '8', size: 32),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Grande'),
        SgSegmentDigit(value: '8', size: 52),
      ],
    ),
  ],
)
```

### Cores

Exemplos de color por dígito.

Região `sgSegmentDigitCores` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 12,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Padrão'),
        SgSegmentDigit(value: '8', size: 42),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Azul'),
        SgSegmentDigit(value: '8', size: 42, color: '#3b82f6'),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Amarelo'),
        SgSegmentDigit(value: '8', size: 42, color: '#eab308'),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Verde'),
        SgSegmentDigit(value: '8', size: 42, color: '#22c55e'),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Branco'),
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: const Color(0xFF171717),
            borderRadius: BorderRadius.circular(4),
          ),
          child: const SgSegmentDigit(
            value: '8',
            size: 42,
            color: '#f8fafc',
          ),
        ),
      ],
    ),
  ],
)
```

### Algarismos, sinal e dois pontos

Cada glifo é um conjunto de retângulos numa grade de 6 x 10 (dois pontos: 4 x 10).

Região `sgSegmentDigitAlgarismos` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final c in '0123456789-:'.split(''))
      SgSegmentDigit(value: c, size: 48),
  ],
)
```

## SgSevenSegmentDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_seven_segment_digit_page.dart` (9 exemplo(s) na página; abaixo 9).

### Básico (0-9)

Troca manual de dígitos com controles.

Região `sgSevenSegmentDigitBasico` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_digito, _paleta]),
  builder: (context, _) => Wrap(
    spacing: 16,
    runSpacing: 12,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      SgSevenSegmentDigit(
        value: '${_digito.value}',
        palette: _paleta.value,
      ),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgButton(
            label: Text('Próximo (+1)'),
            size: SgSize.sm,
            onClick: () => _digito.value = (_digito.value + 1) % 10,
          ),
          const SizedBox(height: 8),
          SgButton(
            label: Text('Anterior (-1)'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _digito.value = (_digito.value + 9) % 10,
          ),
          const SizedBox(height: 8),
          SgButton(
            label: Text('Aleatório'),
            size: SgSize.sm,
            onClick: () =>
                _digito.value = DateTime.now().microsecond % 10,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final item in SgSevenSegmentDigitPalette.values)
                SgButton(
                  label: Text(item.name),
                  size: SgSize.sm,
                  appearance: _paleta.value == item
                      ? SgAppearance.solid
                      : SgAppearance.outline,
                  onClick: () => _paleta.value = item,
                ),
            ],
          ),
        ],
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _digito = ValueNotifier(0);`
- `final ValueNotifier<SgSevenSegmentDigitPalette> _paleta = ValueNotifier(SgSevenSegmentDigitPalette.red);`

### Hexadecimal (0-9 A-F)

Suporte a caracteres comuns de display de 7 segmentos.

Região `sgSevenSegmentDigitHexadecimal` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _hexIndex,
      builder: (context, hexIndex, _) => SgSevenSegmentDigit(
        value: hex[hexIndex],
        color: '#f97316',
        backgroundColor: '#180b05',
        offColor: 'rgba(124,45,18,0.24)',
      ),
    ),
    SgButton(
      label: Text('Próximo caractere'),
      size: SgSize.sm,
      onClick: () =>
          _hexIndex.value = (_hexIndex.value + 1) % hex.length,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _hexIndex = ValueNotifier(10);`
- `const hex = '0123456789ABCDEF';`

### Temas de cor

Exemplos com as paletas red, blue, yellow, green e white.

Região `sgSevenSegmentDigitTemas` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    for (final palette in SgSevenSegmentDigitPalette.values)
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(palette.name),
          SgSevenSegmentDigit(value: '8', palette: palette),
        ],
      ),
  ],
)
```

### Tamanho e espessura

Escala do display via size e thickness.

Região `sgSevenSegmentDigitTamanhoEspessura` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Pequeno'),
        const SgSevenSegmentDigit(
          value: '5',
          size: 72,
          thickness: 10,
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Médio'),
        const SgSevenSegmentDigit(
          value: '5',
          size: 108,
          thickness: 14,
        ),
      ],
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Grande'),
        const SgSevenSegmentDigit(
          value: '5',
          size: 148,
          thickness: 18,
        ),
      ],
    ),
  ],
)
```

### Composição estilo relógio

Composição de vários dígitos para HH:MM:SS.

Região `sgSevenSegmentDigitRelogio` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<int>(
      valueListenable: _segundos,
      builder: (context, segundos, _) {
        String dois(int n) => n.toString().padLeft(2, '0');
        final total = segundos % 86400;
        final hh = dois(total ~/ 3600);
        final mm = dois(total % 3600 ~/ 60);
        final ss = dois(total % 60);
        return Wrap(
          spacing: 4,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            for (final c in hh.split(''))
              SgSevenSegmentDigit(value: c, size: 86),
            doisPontos,
            for (final c in mm.split(''))
              SgSevenSegmentDigit(value: c, size: 86),
            doisPontos,
            for (final c in ss.split(''))
              SgSevenSegmentDigit(value: c, size: 86),
          ],
        );
      },
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('+1 segundo'),
      size: SgSize.sm,
      onClick: () => _segundos.value++,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<int> _segundos = ValueNotifier(0);`

### Algarismos e letras

Cada caractere acende os segmentos da tabela do display; sem glifo, apaga tudo.

Região `sgSevenSegmentDigitAlgarismos` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final c in '0123456789-AbCdEFHJLPUY'.split(''))
      SgSevenSegmentDigit(
        value: c,
        size: 72,
        thickness: 8,
        padding: 8,
      ),
  ],
)
```

### Paletas

red (padrão), blue, yellow, green e white; color, backgroundColor e offColor vencem a paleta.

Região `sgSevenSegmentDigitPaletas` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final palette in SgSevenSegmentDigitPalette.values)
      SgSevenSegmentDigit(
        value: '8',
        palette: palette,
        size: 72,
        thickness: 8,
        padding: 8,
      ),
    const SgSevenSegmentDigit(
      value: '8',
      size: 72,
      thickness: 8,
      padding: 8,
      color: '#ff00aa',
      offColor: 'rgba(255, 0, 170, 0.15)',
      backgroundColor: '#14000d',
    ),
  ],
)
```

### Tamanho, espessura, inclinação e brilho

Região `sgSevenSegmentDigitMedidas` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgSevenSegmentDigit(value: '4', size: 48, thickness: 5),
    SgSevenSegmentDigit(value: '2', size: 108),
    SgSevenSegmentDigit(
      value: '7',
      size: 108,
      thickness: 8,
      width: 80,
    ),
    SgSevenSegmentDigit(
      value: '5',
      size: 108,
      thickness: 8,
      skew: 0,
      rounded: 0,
    ),
    SgSevenSegmentDigit(
      value: '3',
      size: 108,
      thickness: 8,
      skew: 15,
      glow: false,
    ),
  ],
)
```

### Contador com transição

Ao trocar o valor, cada segmento acende e apaga em transitionMs (200 ms aqui).

Região `sgSevenSegmentDigitContador` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value =
        0; // o estado fica na closure; o StatefulBuilder so reconstroi
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgSevenSegmentDigit(
            value: '$value',
            size: 72,
            thickness: 8,
            padding: 8,
            transitionMs: 200,
          ),
          const SizedBox(width: 16),
          SgButton(
            label: Text('Próximo'),
            onClick: () => set(() => value = (value + 1) % 10),
          ),
        ],
      ),
    );
  },
)
```

