---
tags: [seedgrid, component, frontend, react, editor, tiptap, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgTextEditor.tsx
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# SgTextEditor: API

Import: `import { SgTextEditor, type SgTextEditorProps, type SgTextEditorSaveMeta } from "@seedgrid/fe-components";` (pacote v`2026.7.1`). Contexto: [[SeedGrid/SeedGrid-components/editor/Visao-geral|Visão geral do SgTextEditor]]. Exemplos: [[SeedGrid/SeedGrid-components/editor/Exemplos|Exemplos do SgTextEditor]]. A metodologia da tabela está em [[SeedGrid/SeedGrid-components/inputs-texto/API#Como as tabelas foram montadas|Como as tabelas foram montadas]]. As props RHF seguem o [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato RhfFieldProps (react-hook-form)|contrato RhfFieldProps]], com o desvio indicado na própria tabela.

## Props (21)

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `error` | `string` | — | Não | Erro abaixo do editor. |
| `id` | `string` | — | Sim | `id` do elemento editável; nome padrão do arquivo salvo (`<id>.html`). |
| `valueHtml` | `string` | — | Não | HTML do corpo (controlado quando string). |
| `defaultValueHtml` | `string` | `""` | Não | HTML inicial não controlado. |
| `onChangeHtml` | `((htmlBody: string) => void)` | — | Não | Recebe `editor.getHTML()` a cada atualização. Com `control`, é substituída pelo `field.onChange`. |
| `cssText` | `string` | `""` | Não | CSS embutido no documento salvo. |
| `onCssTextChange` | `((cssText: string) => void)` | — | Não | CSS alterado (textarea ou ao carregar HTML com `<style>`). |
| `fileName` | `string` | `<id>.html` | Não | Nome do arquivo gerado no salvar. |
| `onSave` | `((file: File, meta: SgTextEditorSaveMeta) => void)` | — | Não | Botão Salvar: `(file: File, meta: SgTextEditorSaveMeta)`; `meta = {htmlDocument, contentHtml, cssText}`. |
| `onLoad` | `((meta: SgTextEditorSaveMeta) => void)` | — | Não | Após carregar um `.html` pelo botão: recebe `SgTextEditorSaveMeta`. |
| `height` | `number` | `320` | Não | Altura da área de edição (px). |
| `placeholder` | `string` | i18n `components.textEditor.placeholder` | Não | Vai para `data-placeholder` do editor. |
| `disabled` | `boolean` | — | Não | Editor não editável e toolbar desabilitada. |
| `borderRadius` | `string \| number` | — | Não | Raio das bordas. |
| `showCssEditor` | `boolean` | `false` | Não | Mostra textarea de CSS. |
| `cssEditorLabel` | `string` | i18n `components.textEditor.cssEditorLabel` | Não | Rótulo do editor de CSS. |
| `className` | `string` | — | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo do wrapper. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

## Tipos exportados

| Tipo | Forma |
|---|---|
| `SgTextEditorProps` | Tabela acima. |
| `SgTextEditorSaveMeta` | `{ htmlDocument: string; contentHtml: string; cssText: string }` |

## Eventos e formatos de retorno

- **`onChangeHtml(htmlBody)`:**
  - Disparado no `onUpdate` do TipTap com `editor.getHTML()`.
  - Entrega **só o HTML do corpo**, por exemplo `"<p><strong>SeedGrid</strong> editor</p>"`, sem `<html>`/`<style>`.
- **`onSave(file, meta)`:** acionado pelo botão "Salvar" da toolbar (i18n `components.actions.save`).
  - `file` é um `File` `text/html;charset=utf-8`, com nome `fileName ?? "<id>.html"`.
  - O conteúdo é um documento completo: `<!doctype html>`, `<html lang="<locale do i18n>">`, `<meta charset>`, `<meta viewport>`, `<style>` com o `cssText` (se houver) e `<body>` com o HTML.
  - `meta` traz o mesmo documento como string (`htmlDocument`), além de `contentHtml` e `cssText`.
- **`onLoad(meta)`:** o botão "Carregar HTML" (i18n `components.actions.loadHtml`) abre um `<input type="file" accept="text/html,.html">`. O componente então:
  1. lê o arquivo;
  2. extrai o CSS de `head style` e o `body`;
  3. troca o conteúdo do editor;
  4. chama `onCssTextChange` se o CSS mudou;
  5. chama `onLoad`.
- **`onCssTextChange(css)`:** chamado pela textarea de CSS (`showCssEditor`) e no carregamento de arquivo.

**Confirmado** (`buildFullHtmlDocument`, `parseHtmlDocument`, `doSave`, `loadFromHtmlString`).

## Controlado e não controlado

- **Controlado:** quando `valueHtml` é `string`. Se o HTML do editor divergir de `valueHtml`, o componente chama `setContent(valueHtml)`.
- **Não controlado:** o conteúdo inicial vem de `defaultValueHtml`.
- **`cssText`:** é sempre lido da prop. Sem `onCssTextChange`, a textarea de CSS não altera nada.

**Confirmado**.

## Integração react-hook-form

- **Integração:** via `control` + `name` (`<Controller>`). O valor do campo é o HTML do corpo (`field.value` string → `valueHtml`; `onChangeHtml` → `field.onChange`).
- Nesse caminho, o `onChangeHtml` do usuário é substituído por `field.onChange`.
- `rules` são repassadas sem `mergeRequiredRule` (o tipo não tem `required`).

Teste de contrato: `tests/rhf-components-contract.test.mjs` ("SgTextEditor preserves control integration path"). **Confirmado**.

## Ref

O componente não usa `forwardRef` e não expõe a instância do TipTap (`Editor`). **Confirmado**.

## Toolbar e extensões TipTap

| Recurso | Implementação (`useEditor`) |
|---|---|
| Parágrafo/títulos H1, H2, H3 | `StarterKit` (`codeBlock` habilitado) + `<select>` |
| Fonte (Arial, Georgia, Times, Courier) | `@tiptap/extension-font-family` |
| Tamanho da fonte | `TextStyle` estendido com o atributo `fontSize` (`TextStyleWithSize`) |
| Negrito, itálico, sublinhado, tachado | `StarterKit` + `@tiptap/extension-underline` |
| Cor do texto e realce multicolor | `@tiptap/extension-color`, `@tiptap/extension-highlight` (`multicolor: true`) |
| Sub/sobrescrito | `@tiptap/extension-subscript`, `@tiptap/extension-superscript` |
| Listas, recuo e avanço | `StarterKit` |
| Alinhamento (esquerda, centro, direita, justificado) | `@tiptap/extension-text-align` (`types: ["heading", "paragraph"]`) |
| Link | `@tiptap/extension-link` (`openOnClick: false`, `autolink`, `linkOnPaste`) via `window.prompt` |
| Imagem por URL | `@tiptap/extension-image` (`inline: false`) via `window.prompt` |
| Limpar formatação | `unsetAllMarks().clearNodes()` |

O editor é criado com `immediatelyRender: false` (seguro para SSR) e `editable: !disabled`. **Confirmado**.

## Internacionalização

As chaves usadas são:
- `components.textEditor.placeholder`, `cssEditorLabel`, `editorAriaLabel`, `help.cssEmbedded`;
- `components.textEditor.prompt.url` e `prompt.imageUrl`;
- `components.textEditor.toolbar.*`: `heading`, `subheading`, `normal`, `heading3`, `defaultFont`, `bold`, `italic`, `underline`, `strike`, `textColor`, `highlightColor`, `bullets`, `numbered`, `indent`, `outdent`, `alignLeft`, `alignCenter`, `alignRight`, `justify`, `link`, `image`, `clear`, `subscript`, `superscript`;
- `components.actions.save` e `components.actions.loadHtml`.

O `lang` do documento salvo é o `locale` do i18n. **Confirmado**.

## Acessibilidade comprovável

- A área editável tem `id` e `aria-label` (i18n `components.textEditor.editorAriaLabel`).
- Os botões da toolbar (`ToolbarButton`) têm `aria-label`, e os ícones são `aria-hidden`.
- Os `<select>` de estilo, fonte e tamanho **não** têm rótulo associado.
- O rótulo do editor de CSS é um `<label>` sem `htmlFor`.

**Confirmado**.

## Fontes

- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgTextEditor.tsx` (`SgTextEditorBase`, `SgTextEditor`, `ToolbarButton`, `TextStyleWithSize`)
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/package.json` (`peerDependencies`)
