---
tags: [seedgrid, component, frontend, react, editor, tiptap, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# SgTextEditor: exemplos

Os exemplos foram conferidos contra [[SeedGrid/SeedGrid-components/editor/API|API do SgTextEditor]]. As fontes são relativas a `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/`. Não foram compilados nem executados.

## Instalação dos peers

Versões conforme `peerDependencies` (`^2.9.1`).

```bash
pnpm add @seedgrid/fe-components react-hook-form lucide-react \
  @tiptap/core @tiptap/pm @tiptap/react @tiptap/starter-kit \
  @tiptap/extension-color @tiptap/extension-font-family @tiptap/extension-highlight \
  @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript \
  @tiptap/extension-superscript @tiptap/extension-text-align \
  @tiptap/extension-text-style @tiptap/extension-underline
```

## Controlado, com CSS e salvar

Fonte: `basico.tsx.sample`.

```tsx
import React from "react";
import { SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [htmlBody, setHtmlBody] = React.useState("<p><strong>SeedGrid</strong> editor</p>");
  const [cssText, setCssText] = React.useState("body { font-family: Arial; }");

  return (
    <SgTextEditor
      id="sg-text-editor"
      valueHtml={htmlBody}
      onChangeHtml={setHtmlBody}
      cssText={cssText}
      onCssTextChange={setCssText}
      showCssEditor
      style={{ border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 14, padding: 8 }}
      onSave={(file) => console.log(file.name)}
    />
  );
}
```

## Enviando o arquivo gerado

`onSave` entrega um `File` pronto para upload, junto com o documento como string. O endpoint `/api/templates` abaixo é ilustrativo.

```tsx
import React from "react";
import { SgTextEditor, type SgTextEditorSaveMeta } from "@seedgrid/fe-components";

export default function TemplateEditor() {
  const [body, setBody] = React.useState("");

  async function handleSave(file: File, meta: SgTextEditorSaveMeta) {
    const form = new FormData();
    form.append("file", file);
    form.append("css", meta.cssText);
    await fetch("/api/templates", { method: "POST", body: form });
  }

  return (
    <SgTextEditor
      id="modelo-email"
      fileName="modelo-email.html"
      valueHtml={body}
      onChangeHtml={setBody}
      onSave={handleSave}
      onLoad={(meta) => console.log("carregado", meta.contentHtml.length)}
      height={400}
    />
  );
}
```

## Com react-hook-form (`control`)

Só o caminho `control` é suportado. Nesse modo o `onChangeHtml` próprio é ignorado.

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgTextEditor } from "@seedgrid/fe-components";

export default function Form() {
  const { control, handleSubmit } = useForm({ defaultValues: { corpo: "<p>Olá</p>" } });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data.corpo))}>
      <SgTextEditor id="corpo" name="corpo" control={control} rules={{ required: "Informe o conteúdo" }} />
      <SgButton type="submit">Salvar</SgButton>
    </form>
  );
}
```

## Desabilitado

Fonte: `desabilitado.tsx.sample`. Usa a prop `disabled` (confirmada no tipo).

```tsx
import React from "react";
import { SgTextEditor } from "@seedgrid/fe-components";

export default function ReadOnlyPreview({ html }: { html: string }) {
  return <SgTextEditor id="preview" valueHtml={html} disabled />;
}
```
