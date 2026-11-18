---
tags: [seedgrid, component, frontend, react, editor, tiptap, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Editor de texto rico, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# SgTextEditor: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos|Exemplos — Editor de texto rico (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase do `SgTextEditor` (`/components/sg-text-editor`), na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles; **não foram compilados nem executados nesta rodada**. Prop a prop: [[SeedGrid/SeedGrid-components/editor/API|API do SgTextEditor]]. O Playground da página é interativo e não tem `.sample`.

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

## SgTextEditor

### Básico

Exemplo com CSS embutido e download do HTML.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/basico.tsx.sample`

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

### Modo sem CSS

Exemplo com o editor de CSS oculto.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/sem-css.tsx.sample`

```tsx
import React from "react";
import { SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [htmlBody, setHtmlBody] = React.useState("<p>Editor without CSS</p>");

  return (
    <SgTextEditor
      id="sg-text-editor-no-css"
      valueHtml={htmlBody}
      onChangeHtml={setHtmlBody}
      showCssEditor={false}
      onSave={(file) => console.log(file.name)}
    />
  );
}
```

### Desabilitado

Renderização somente leitura do conteúdo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/desabilitado.tsx.sample`

```tsx
import { SgStack, SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack gap={16}>
      <SgTextEditor
        id="sg-text-editor-disabled"
        height={120}
        valueHtml="<p><strong>Conteúdo bloqueado</strong></p>"
        enabled={false}
        showCssEditor={false}
      />
      <SgTextEditor id="sg-text-editor-error" height={120} error="Conteúdo obrigatório" />
    </SgStack>
  );
}
```

### Raio da borda

Aplica raio de borda ao editor e à área de CSS.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/border-radius.tsx.sample`

```tsx
import React from "react";
import { SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [radiusBody, setRadiusBody] = React.useState("<p>Editor with custom border radius</p>");
  const [cssText, setCssText] = React.useState("body { font-family: Arial; }");
  const onSave = (file: File) => console.log(file.name);

  return (
    <SgTextEditor
      id="sg-text-editor-radius"
      valueHtml={radiusBody}
      onChangeHtml={setRadiusBody}
      cssText={cssText}
      onCssTextChange={setCssText}
      showCssEditor
      borderRadius={20}
      onSave={(file) => onSave(file)}
    />
  );
}
```

### Valor controlado

valueHtml troca o conteúdo; mudar o valor por fora não dispara onChangeHtml.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/valor-controlado.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgStack, SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [controlledBody, setControlledBody] = React.useState("<p>Valor controlado pelo estado da página</p>");

  return (
    <SgStack gap={8} align="start">
      <SgTextEditor
        id="sg-text-editor-controlled"
        height={180}
        valueHtml={controlledBody}
        onChangeHtml={setControlledBody}
      />
      <SgButton
        appearance="outline"
        onClick={() => setControlledBody("<h2>Título</h2><ul><li><p>Item</p></li></ul>")}
      >
        Trocar o conteúdo
      </SgButton>
    </SgStack>
  );
}
```

### Salvar, carregar HTML e CSS embutido

Salvar entrega um arquivo HTML completo (onSave); Carregar HTML lê o <style> do arquivo para o editor de CSS.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/salvar-e-carregar.tsx.sample`

```tsx
import React from "react";
import { SgStack, SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [fileCss, setFileCss] = React.useState("p { line-height: 1.5; }");
  const [fileInfo, setFileInfo] = React.useState("");

  return (
    <SgStack gap={8} align="start">
      <SgTextEditor
        id="sg-text-editor-file"
        height={200}
        fileName="nota.html"
        showCssEditor
        cssEditorLabel="CSS do documento"
        cssText={fileCss}
        onCssTextChange={setFileCss}
        onSave={(file, meta) =>
          setFileInfo(`${file.name}: ${file.size} bytes, ${meta.cssText.length} caracteres de CSS`)
        }
        onLoad={(meta) => setFileInfo(`Carregado: ${meta.contentHtml.length} caracteres`)}
      />
      {fileInfo ? <p className="text-sm">{fileInfo}</p> : null}
    </SgStack>
  );
}
```

### Dentro de um formulário

name + control: o valor do campo é o HTML do corpo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgStack, SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  const [sent, setSent] = React.useState("");
  const { control, handleSubmit } = useForm<{ descricao: string }>({ defaultValues: { descricao: "" } });

  return (
    <form onSubmit={handleSubmit((values) => setSent(values.descricao))}>
      <SgStack gap={12} align="start">
        <SgTextEditor id="sg-text-editor-form" name="descricao" control={control} height={180} />
        <SgButton type="submit">Enviar</SgButton>
        {sent ? <p className="text-sm">Enviado: {sent}</p> : null}
      </SgStack>
    </form>
  );
}
```

### Placeholder

placeholder mostra uma dica enquanto o editor está vazio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-text-editor/samples/placeholder.tsx.sample`

```tsx
import { SgTextEditor } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgTextEditor
      id="sg-text-editor-placeholder"
      height={160}
      placeholder="Escreva aqui"
      showCssEditor={false}
    />
  );
}
```

## Variação fora do showcase: enviando o arquivo gerado

Não existe `.sample` para este caso; o bloco abaixo é uma variação escrita à mão, **não copiada do showcase** nem compilada nesta rodada. O exemplo «Salvar, carregar HTML e CSS embutido» acima cobre `onSave` e `onLoad`; aqui só se acrescenta o envio do `File` para um endpoint.

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
