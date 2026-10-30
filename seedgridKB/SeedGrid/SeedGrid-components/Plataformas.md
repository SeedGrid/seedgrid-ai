---
description: "Plataformas dos componentes SeedGrid, React e Flutter: onde está cada uma, como escolher, qual é a fonte de verdade, o placar de paridade (89 de 89 portados no Flutter) e onde ler a documentação de cada plataforma. Leia antes de escolher ou copiar código."
tags: [seedgrid, front, component, plataforma-react, plataforma-flutter, plataformas, indice]
fonte: front/seedgrid-fe-components e front/seedgrid-fe-flutter
branch: main
commit: ad30fc11de
commit-flutter: e9989b8
analisado-em: 2026-10-30
---

# Plataformas dos componentes SeedGrid: React × Flutter

- **Duas plataformas, os mesmos nomes.** **React** = `@seedgrid/fe-components` (repositório `front/seedgrid-fe-components`, TypeScript, versão 2026.7.1, é a **fonte da verdade**); **Flutter** = `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, Dart, mesma versão 2026.7.1, porte do React; **não publicado** no pub.dev, instala-se do Git). `SgButton`, `SgInputCPF`, `SgDatatable` existem nas duas, com as mesmas props e valores.
- **Onde ler o React:** os grupos `buttons`, `datatable`, `digits`, `editor`, `feedback-e-exibicao`, `gadgets`, `inputs-selecao`, `inputs-texto`, `layout`, `navegacao-e-overlay`, `providers`, `fundamentos` (mais `pacotes`, `modulos` e `showcase`, que só existem no React) dentro de `SeedGrid/SeedGrid-components/`. Cada nota diz **React** no título e no `description`.
- **Onde ler o Flutter:** a pasta `SeedGrid/SeedGrid-components/flutter/`, com os **mesmos nomes de grupo** (`flutter/buttons/`, `flutter/inputs-texto/`...), cada um com `Visao-geral`, `API` e `Exemplos` em Dart, mais as notas transversais [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]], [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]], [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] e [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]].
- **Como escolher:** a plataforma é a do **app que você está escrevendo** (React/Next.js na web; Flutter em app Flutter, inclusive mobile). Não há renderização compartilhada: o Flutter reescreve cada componente, não reaproveita código React. Se o app é React, use só as notas React; se é Flutter, use `flutter/` e **não copie TSX**.
- **Como converter:** o nome do componente e das props é o mesmo; mudam `className`/`style` (não existem no Flutter), strings que viram enum (`severity: SgSeverity.danger`), `children` que vira `child`/`children`, `ref` que vira controller e o formulário (`react-hook-form` vira `SgForm` + `SgFormController`). Regras completas em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]].
- **Placar de paridade** (`docs/PARIDADE.md` do repositório Flutter, commit `e9989b8`): dos **89 componentes** do React, **89 portados, 0 parciais, 0 pendentes**; 27 sem nenhuma ressalva e 62 com ressalva registrada (diferença de propósito ou limite, como tema de relógio por URL, `href` no menu e no breadcrumb, tabelas no editor). Detalhe e critério em [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]].
- **O que só existe no React:** `pacotes` (`fe-core`, `fe-commons`, `fe-theme`, `fe-playground`), `modulos` de tela `@seedgrid/fe-*` (login, billing, segurança...) e os hooks do React; no Flutter hooks viram widgets, funções ou controllers (ver "Símbolos do React" em cada `flutter/<grupo>/Visao-geral`). **O que só existe no Flutter:** `SgForm`/`SgFormController`/`SgValidationScope` e o `sgNode`, que substituem o que o React resolve com `react-hook-form` e `ReactNode`.
- **Comportamentos que diferem de propósito** (decisões do dono): em formulário o `onChange` do usuário sempre roda; os validadores dos componentes também rodam no envio; texto de props como `label` aceita `String` ou `Widget`. Lista em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]].
- **Qual nota é a mais fresca:** as notas Flutter foram revistas contra o commit `e9989b8` do `seedgrid-fe-flutter` (2026-10-29); as notas React seguem no commit `ad30fc11de` e podem estar defasadas (veja `SeedGrid/Versoes.md`). Em dúvida, confirme no repositório de origem.
- **Índices:** [[SeedGrid/SeedGrid-components/Indice|Índice]] (nomes por grupo, as duas plataformas em seções separadas) e [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]] (resumo de cada símbolo). Para escolher o componente por necessidade: [[SeedGrid/SeedGrid-components/Preciso-de|Preciso de X, use Y]].

## Não verificado

- O estado de publicação do `@seedgrid/fe-components` no npm não foi conferido para esta nota; o Flutter não está no pub.dev (`publish_to: none` em todos os `pubspec.yaml`).
- Não executei os testes de nenhuma das duas plataformas.
