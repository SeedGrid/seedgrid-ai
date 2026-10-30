---
description: "Fundamentos do SeedGrid em Flutter (formulário SgForm, i18n em 5 idiomas, tema SeedThemeProvider, máscaras e validadores): o que existe, o que substitui no React, o que não foi portado e como instalar."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, fundamentos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Fundamentos — Flutter (`seedgrid_components`, `seedgrid_theme`, `seedgrid_commons`)

> **Plataforma: Flutter.** Esta nota cobre o que **não é widget `Sg*` de tela** no porte Dart: contrato de formulário, i18n, tema, máscaras, validadores e clientes HTTP. O equivalente em **React** está em [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos — React]] (utilitários do `@seedgrid/fe-components`) e em [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes — React]] (`@seedgrid/fe-theme`, `@seedgrid/fe-commons`). Escolha de plataforma e placar: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]]. Repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev.

- API completa (assinaturas, parâmetros, retornos): [[SeedGrid/SeedGrid-components/flutter/fundamentos/API|API — Fundamentos (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos — Fundamentos (Flutter)]]
- Regras de tradução React → Dart: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · decisões do dono: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] · placar: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]

## Para que serve

| Componente | Estado | Para que serve | Origem no código |
|---|---|---|---|
| `SgForm` | apoio, substitui `useForm` | Mantém o `SgFormController` acessível aos campos e envia com Enter ou botão `submit`. | `seedgrid_components/lib/src/form/sg_form.dart` |
| `SgFormController` | apoio, substitui `useForm` | Guarda valores, regras, erros e estado do formulário: `setValue`, `trigger`, `reset`, `handleSubmit`. | `seedgrid_components/lib/src/form/sg_form.dart` |
| `SgRules` | apoio, equivalente ao React | Regras de campo no estilo `RegisterOptions` do react-hook-form (required, min, max, pattern, validate). | `seedgrid_components/lib/src/form/sg_rules.dart` |
| `SgValidationScope` | apoio, só no Flutter | Registra campos sem formulário para o `SgWizard` validá-los ao avançar de etapa. | `seedgrid_components/lib/src/form/sg_validation_scope.dart` |
| `SgComponentsI18nProvider` | portado | Define o idioma (5 embutidos) e as mensagens dos componentes abaixo dele. | `seedgrid_components/lib/src/i18n/i18n.dart` |
| `setComponentsI18n` | apoio, equivalente ao React | Define o idioma e as mensagens globais dos componentes, fora de árvore de widgets. | `seedgrid_components/lib/src/i18n/i18n.dart` |
| `sgNode` | apoio, só no Flutter | Converte `String`/`num` em `Text` nas props de texto que aceitam `String` ou `Widget`. | `seedgrid_components/lib/src/props/sg_node.dart` |
| `SeedThemeProvider` | apoio, parcial (sem persistência nem `applyTo`) | Gera o tema SeedGrid por cor seed, claro/escuro, e o injeta no `ThemeData`. | `seedgrid_theme/lib/src/seed_theme_provider.dart` |
| `SgTheme` | apoio, mapa de variáveis mantido | Guarda as variáveis `--sg-*` com os mesmos nomes do React e getters tipados de cor. | `seedgrid_theme/lib/src/sg_theme.dart` |
| `maskCpf` | apoio, equivalente ao React | Máscaras de CPF, CNPJ, CEP (7 países) e telefone, com os mesmos nomes de função do React. | `seedgrid_commons/lib/src/masks.dart` |
| `isValidCpf` | apoio, equivalente ao React | Valida CPF, CNPJ alfanumérico, e-mail, domínio descartável, senha, datas e idade mínima. | `seedgrid_commons/lib/src/validators.dart` |
| `buscarCep` | apoio, equivalente ao React | Consulta CEP no ViaCEP e CNPJ na API pública, com cliente HTTP injetável. | `seedgrid_commons/lib/src/cep/viacep.dart` |
| `SgHttpClient` | apoio, equivalente ao React | Cliente HTTP mínimo com `baseUrl`, token Bearer e erro `SgHttpException`. | `seedgrid_commons/lib/src/http/http_client.dart` |

Estado em palavras: só `SgComponentsI18nProvider` é um dos **89 componentes** do placar de paridade (**portado**). As demais linhas são **apoio** (formulário, tema, funções de `seedgrid_commons`, helpers), listadas aqui porque o React as documenta no grupo de fundamentos ou em pacotes; a parte depois da vírgula diz a relação com o React (**equivalente ao React**, **parcial** = existe, falta parte do React, dita na coluna e na [[SeedGrid/SeedGrid-components/flutter/fundamentos/API|API]]; **só no Flutter** = não existe no React).

## Quando usar

- **Formulário com validação:** `SgForm` + `SgFormController` + `control:`/`name:`/`rules:` nos campos. É o lugar do react-hook-form (ADR 49): todo campo Flutter é controlado, não existe `register`. Para o desenho de uma tela CRUD, siga o exemplo em [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos]].
- **Idioma dos componentes:** `SgComponentsI18nProvider(locale: 'pt-BR')` perto da raiz (o padrão sem provider é `en-US`). `setComponentsI18n` serve quando não há árvore de widgets à mão.
- **Tema:** `SeedThemeProvider` logo abaixo do `MaterialApp` (em `builder:`) para o tema entrar no `ThemeData`; sem ele os widgets caem no tema padrão do React gerado na hora (`sgThemeOf`).
- **Máscaras e validadores fora de campo:** importe `seedgrid_commons` (por exemplo para mascarar um texto de relatório ou validar um CPF vindo de API).
- **Consulta CEP/CNPJ por código:** `buscarCep` e `buscarCnpj`; os campos `SgInputPostalCode`, `SgInputCNPJ` e `SgInputCPFCNPJ` já usam os mesmos serviços.

## Instalação (Confirmado: `README.md` do repositório)

O pacote **não está no pub.dev**: instala-se direto do Git, com `path: packages/seedgrid_components` (Flutter 3.38 ou mais novo, Dart 3.10). `seedgrid_components` depende de `seedgrid_theme` e `seedgrid_commons` por `path:` (`pubspec.yaml`) e **reexporta só o tema** (`seedgrid_components.dart` tem `export 'package:seedgrid_theme/seedgrid_theme.dart' hide relativeLuminance;`). Não há `export` de `seedgrid_commons` no barril do componentes (Confirmado por busca): para chamar `maskCpf` ou `isValidCpf` diretamente, importe `package:seedgrid_commons/seedgrid_commons.dart` (Inferência: o analisador pode pedir a dependência declarada no seu `pubspec.yaml`, regra `depend_on_referenced_packages`).

## O que muda em relação ao React

| Tema | React | Flutter |
|---|---|---|
| Formulário | `react-hook-form` (`useForm`, `control`, `register`, `Controller`) | `SgFormController` próprio; `register` não existe; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] |
| Validação ao enviar | `handleSubmit`/`trigger` rodam só as `rules` | rodam também o validador do componente (`SgFieldValidator`); decisão do dono de 2026-10-25, em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] |
| Mensagem dos validadores | `validatePassword`/`validateBirthDate` devolvem o texto traduzido | devolvem um **resultado** (`PasswordValidation`, `BirthDateValidation`); o texto sai de `passwordValidationMessage`/`birthDateValidationMessage` (`seedgrid_components`) |
| Hooks | `useComponentsI18n()`, `useSgTheme()` | funções com `BuildContext`: `useComponentsI18n(context)`, `useSgTheme(context)`; atalho `context.sgI18n` |
| i18n global | `globalThis.__seedgridComponentsI18n` | variável de módulo do pacote (`setComponentsI18n`); `resetComponentsI18n()` existe só no Flutter (isola testes) |
| Estilos | CSS injetado/compilado, `style.css` | não existe CSS; tema vira `ThemeData` + extensão `SgTheme` |
| Tema persistido | `persistMode`, `persistenceStrategy` | **não portado** (depende do `SgEnvironmentProvider`; ver [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|Providers — Flutter]]) |
| Domínios de e-mail bloqueados | `globalThis.__seedgridBlockedEmailDomains` | lista mutável `runtimeBlockedEmailDomains` |
| Textos de prop | `ReactNode` | `Object?` aceitando `String`/`num`/`Widget` (`sgNode`) |
| Metadados de IA | `*.meta.ts`, manifesto | `SgPropSpec` gerado por componente; manifesto MCP Flutter em `tools/mcp_manifest/` (conteúdo **não confirmado** nesta nota) |

## Equivalência símbolo a símbolo (React → Flutter)

A tabela completa, com assinatura, está na [[SeedGrid/SeedGrid-components/flutter/fundamentos/API|API]] (seção "Mapa React → Flutter"). Resumo do que **não tem equivalente**:

- Nenhum equivalente (sem CSS no Flutter): `ensureSeedgridStylesInjected`, `SEEDGRID_COMPILED_CSS`, `style.css`, `sandbox.cjs`.
- Não portados de propósito (caminho legado do React, `@deprecated`): `ThemeProvider`, `useTheme`, `SeedGridThemeConfig`, `defaultTheme`, `AppShell` (`seedgrid_theme/lib/src/theme_config.dart`, comentário de cabeçalho).
- Não portados por depender de persistência: `persistMode` e `persistenceStrategy` do `SeedThemeInput`.
- Opções de cancelamento `CepLookupOptions`/`CnpjLookupOptions` (`AbortSignal`): sem equivalente; no Dart há o parâmetro `client:` injetável, sem cancelamento.
- Pacotes `@seedgrid/fe-core` (registry de módulos, manifesto da CLI, `createApiClient`, tratamento de exceções) e `@seedgrid/fe-playground`: **sem equivalente em `seedgrid_*`** neste commit (busca por `ApiClient`, `SeedGridRegistry` e `mergeMessages` no código Dart não achou nada); a persistência do `fe-core` está no grupo [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|Providers]].
- `PublicaCnpjResponse` está **parcial**: guarda o JSON cru e expõe só alguns getters.

## Não verificado

- Não executei `flutter test`, `flutter analyze` nem o showcase; os exemplos de [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos]] foram conferidos **por leitura** contra as assinaturas (e contra testes e telas do repositório), não compilados.
- Não li os 5 arquivos `messages_*.dart` por inteiro (só os prefixos de chave e a contagem: 214 chaves por idioma); o texto de cada mensagem não é reproduzido aqui.
- `tools/mcp_manifest/` e as ADR 49 a 52 não foram lidos; as citações às ADR vêm dos comentários do código.
- Não comparei os valores numéricos de `buildScaleFromHex` (tabelas `_lLight`, `_lDark`) com o `colorUtils.ts` do React; a paridade é afirmada pelo cabeçalho do código ("conferida por `test/parity`"), **não confirmada** por mim.
