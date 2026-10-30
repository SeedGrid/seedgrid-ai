---
tags: [seedgrid, front, component, fundamentos, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Fundamentos (utilitários, i18n, tema) (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API dos utilitários do `@seedgrid/fe-components` — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/fundamentos/API|API — Fundamentos (utilitários, i18n, tema) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral e instalação: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos — visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/fundamentos/Exemplos|Exemplos]].

Todas as assinaturas abaixo foram lidas no código (**Confirmado**), salvo indicação. Caminhos relativos a `front/seedgrid-fe-components/packages/seedgrid-fe-components/`.

## Máscaras — `src/masks.ts`

Todas recebem `value: string` e retornam `string`. Exportadas no barrel (`src/index.ts`).

| Função | Comportamento |
|---|---|
| `onlyDigits(value)` | remove tudo que não é dígito. **Também** existe uma `onlyDigits` em `validators.ts`; a exportada no barrel é a de `masks.ts`. |
| `maskCpf(value)` | até 11 dígitos → `000.000.000-00` progressivo. |
| `maskCnpj(value)` | até 14 caracteres **alfanuméricos** (maiúsculos) → `AA.AAA.AAA/AAAA-00` progressivo (suporta CNPJ alfanumérico). |
| `maskCpfCnpj(value)` | se houver letra → `maskCnpj`; senão ≤ 11 dígitos → `maskCpf`, acima → `maskCnpj`. |
| `maskCep(value)` | alias de `maskPostalCodeBR`. |
| `maskPostalCodeBR(value)` | 8 dígitos → `00000-000`. |
| `maskPostalCodePT(value)` | 7 dígitos → `0000-000`. |
| `maskPostalCodeUS(value)` | até 9 dígitos → `00000` ou `00000-0000`. |
| `maskPostalCodeES(value)` / `maskPostalCodeUY(value)` | 5 dígitos, sem separador. |
| `maskPostalCodeAR(value)` | até 8 alfanuméricos maiúsculos, sem separador (comentário: `A0000AAA` ou legado `0000`). |
| `maskPostalCodePY(value)` | 6 dígitos. |
| `maskPhone(value)` | até 11 dígitos → `(DD) 0000-0000` ou `(DD) 00000-0000` progressivo. |

## Validadores — `src/validators.ts`

| Export | Assinatura | Comportamento |
|---|---|---|
| `isValidCpf` | `(value: string) => boolean` | 11 dígitos, rejeita todos iguais, valida os 2 DV (módulo 11). |
| `isValidCnpj` | `(value: string) => boolean` | 14 alfanuméricos; valor do caractere = ASCII − 48 (regra do CNPJ alfanumérico); DV devem ser numéricos; rejeita explicitamente `00000000000000`. |
| `isValidEmail` | `(value: string) => boolean` | regex simples `/.+@.+\..+/` após `trim`. |
| `isBlockedEmailDomain` | `(email: string, extra?: string[]) => boolean` | extrai o domínio após o último `@` e compara (minúsculas) com `getBlockedEmailDomains(extra)`. |
| `getBlockedEmailDomains` | `(extra?: string[]) => string[]` | união deduplicada e normalizada (trim + lowercase) de: `DEFAULT_BLOCKED_EMAIL_DOMAINS` + `globalThis.__seedgridBlockedEmailDomains` (se for array) + `extra`. |
| `DEFAULT_BLOCKED_EMAIL_DOMAINS` | `string[]` | 37 domínios de `src/blocked-email-domains.ts` (yopmail, guerrillamail, mailinator, 10minutemail, temp-mail etc.). |
| `validatePassword` | `(value, policy: PasswordPolicy = {}, i18n?) => string \| null` | `null` = válida; senão mensagem i18n `components.validators.password.invalid` com `{reasons}` concatenadas por `; `. Vazio → `components.validators.password.empty`. |
| `validateBirthDate` | `(value, policy: BirthDatePolicy, i18n?) => string \| null` | exige `minAge` ou `maxAge` (senão retorna mensagem `configMissing`); `minAge > maxAge` → `configRange`; data inválida → `invalidDate`; fora da faixa → `ageBetween`/`ageMin`/`ageMax`. Valor vazio → `null`. |
| `isDateAfter` | `(value: string, minDate?: string) => boolean` | `true` se algum argumento vazio; compara `getTime()` com `>=`. |
| `isDateBefore` | `(value: string, maxDate?: string) => boolean` | idem com `<=`. |

### `PasswordPolicy` (tipo exportado)

| Campo | Tipo | Padrão efetivo em `validatePassword` | Efeito |
|---|---|---|---|
| `minSize` | `number` | `8` (mínimo forçado `1`) | tamanho mínimo |
| `upper` | `boolean` | `true` | exige `[A-Z]` |
| `lower` | `boolean` | `true` | exige `[a-z]` |
| `number` | `boolean` | `true` | exige dígito |
| `special` | `boolean` | `true` | exige `[^A-Za-z0-9]` |
| `noRepeat` | `boolean` | `true` | proíbe sequência asc/desc de 3 (`abc`, `321`) e repetição (`aaa`, padrões tipo `a-a-a-a`) |

### `BirthDatePolicy`
`{ minAge?: number; maxAge?: number }` — ver `validateBirthDate`.

### Configuração em runtime de domínios bloqueados
Global `globalThis.__seedgridBlockedEmailDomains: string[]` (lido em `getRuntimeBlockedEmailDomains()`). Não há setter exportado — o app atribui diretamente (**Confirmado** pela leitura; nenhum setter encontrado). `SgInputEmail` usa `isBlockedEmailDomain(value, blockedEmailDomains)` quando `blockFakeMail` (padrão `true`) — `src/inputs/SgInputEmail.tsx`.

## React Hook Form — `src/rhf.ts` (interno, **não exportado** no barrel)

| Símbolo | Descrição |
|---|---|
| `type RhfFieldProps` | `{ name?: string; control?: any; register?: UseFormRegister<any>; rules?: RegisterOptions<any>; error?: string }`. `any` proposital (comentário): permite passar `register`/`control` de `useForm<T>()` tipado sem conflito de contravariância. |
| `resolveFieldError(...errors)` | retorna a primeira string não vazia (após `trim`) ou `undefined`. |
| `mergeRequiredRule(rules, required, message)` | se `required` verdadeiro, injeta `required: message` em `rules` quando ausente/`false`; preserva um `required` já definido. |

Importado por 26 arquivos de `src/` (contagem `grep "../rhf"`), ex.: `SgAutocomplete`, `SgCheckboxGroup`, `SgCombobox`, `SgInputBirthDate`, `SgInputCNPJ`, `SgInputCPF`, `SgInputCurrency`, `SgInputDate`, `SgInputNumber`. Testes: `tests/rhf.test.mjs`, `tests/rhf-components-contract.test.mjs` (não executados).

## i18n — `src/i18n/index.ts` (`"use client"`)

Locais embutidos: `pt-BR`, `pt-PT`, `en-US` (alias `en`), `es`, `fr` — arquivos `.ts` com 214 chaves `components.*` cada (contagem por `grep`). Padrão global: `en-US`.

| Export no barrel | Nome interno | Assinatura / comportamento |
|---|---|---|
| `SgComponentsI18nProvider` | idem | `({ locale?, messages?, children })` — contexto React; mescla mensagens embutidas do locale + `messages`. |
| `useComponentsI18n` | idem | `() => SgComponentsI18n` — contexto ou, sem provider, `getComponentsI18n()`. |
| `setComponentsI18n` | idem | `(input: SgComponentsI18nInput) => void` — grava em `globalThis.__seedgridComponentsI18n`; preserva mensagens customizadas anteriores se o locale não mudar. |
| `getComponentsI18n` | idem | `() => SgComponentsI18n` — global ou `DEFAULT_I18N` (`en-US`). |
| `resolveComponentsI18n` | idem | `(input?) => SgComponentsI18n` — mescla global + input. |
| `tComponents` | `t` | `(i18n, key, params?) => string` — busca em `i18n.messages` → embutido do locale → `en-US` → a própria chave; aplica `formatMessage`. |
| `formatComponentsMessage` | `formatMessage` | `(template, params?)` — substitui `{nome}`; placeholders sem valor permanecem. |
| `normalizeComponentsLocale` | idem | `undefined` → `en-US`; `en` → `en-US`; demais inalterados. |
| `getBuiltInComponentsMessages` | idem | catálogo embutido do locale (desconhecido → `en-US`). |
| `componentsMessagesPtBr`, `componentsMessagesPtPt`, `componentsMessagesEnUs`, `componentsMessagesEn`, `componentsMessagesEs`, `componentsMessagesFr` | — | catálogos brutos. |

Tipos: `SgComponentsLocale` (`"pt-BR" | "pt-PT" | "en-US" | "en" | "es" | "fr" | (string & {})`), `SgComponentsMessages` (`Record<string,string>`), `SgComponentsMessagesByNamespace`, `SgComponentsI18n` (`{locale, messages}`), `SgComponentsI18nInput` (`{locale?, messages?}`).

`messages` aceita forma plana **ou** por namespace: se o objeto tiver a chave `components`, só ela é usada (`resolveMessages`).

Metadados de IA: `src/i18n/SgComponentsI18nProvider.meta.ts` e `useComponentsI18n.meta.ts` entram no manifesto (`build-ai-manifest.mjs`).

## Estilos — `src/injectStyles.ts` e `src/generated/compiledStyles.ts`

| Símbolo | Exportado? | Descrição |
|---|---|---|
| `ensureSeedgridStylesInjected()` | não (chamado no topo de `src/index.ts`) | Injeta `<style id="seedgrid-fe-components-styles">` uma vez; no-op em SSR. |
| `SEEDGRID_COMPILED_CSS` | não | String gerada por `scripts/build-style.mjs` ("AUTO-GENERATED … Do not edit by hand"). Começa com `:root{--sg-mode:light;--sg-bg:…}` (tema padrão). |

## Metadados de IA — `src/ai-meta/`

| Arquivo | Conteúdo |
|---|---|
| `types.ts` | `SgMetaPropV0`, `SgMetaExampleV0`, `SgMetaV0` (`version "0.1"`, `componentId`, `package "@seedgrid/fe-components"`, `exportName`, `slug`, `category` ∈ input/action/layout/feedback/navigation/data/provider/hook/gadget, `props`, `examples`, `showcase{route,hasPlayground,hasPropsTable}`, `sdui{rendererType,…}`) e `SgAiHintsV0` (`preferredUseCases`, `avoidUseCases`, `synonyms`, `rankingSignals`…). |
| `generated-props.json` | `{ [exportName]: [{name,type,required,description}] }` gerado por `scripts/extract-props.mjs` (~186 KB). |

O manifesto final `dist/ai/seedgrid-components.manifest.json` é servido pelo showcase em `GET /api/ai-manifest` e consumido pelo `seedgrid-components-mcp`.
