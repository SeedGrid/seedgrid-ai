---
tags: [seedgrid, component, frontend, react, inputs-texto, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Inputs de texto e documentos, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Inputs de texto: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos|Exemplos — Inputs de texto e documentos (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente estão abaixo (React, 15 componentes, 182 exemplos), na ordem e com os títulos da página dele em pt-BR (`/components/<slug>`). Cada bloco é cópia 1:1 do arquivo `samples/*.tsx.sample` do exemplo, indicado em `Fonte:` (caminho relativo à raiz do repositório `seedgrid-fe-components`), e é o mesmo código que o showcase renderiza e mostra no bloco de código. Conferência de 2026-11-13 dos exemplos novos "Formulário com control" e "Formulário com register" de `SgInputPhone`, `SgInputCPF`, `SgInputCNPJ` e `SgInputCPFCNPJ` (cópia 1:1 dos `formulario-control.tsx.sample` e `formulario-register.tsx.sample` do working tree do fe-components; não compilados nem executados). Conferência de 2026-11-12 dos exemplos de `SgInputNumber` e `SgInputCurrency` (validação customizada e valor vazio mudaram com `emptyValueIsNull` e `validation(number | null)`; working tree do fe-components, HEAD local `4b150cc`, sem push) e, antes, de 2026-11-09 para os demais (seedgrid-fe-components 0f304bb): os blocos foram regerados por script a partir dos `.sample` e comparados texto a texto (idênticos). Não foram compilados nem executados no navegador nesta conferência. O texto abaixo de cada título é a descrição que a página mostra (i18n pt-BR do showcase; alguns trechos ainda estão em inglês). A seção Playground de cada página não tem `.sample` e fica de fora. As classes utilitárias (`flex`, `gap-4`…) são Tailwind do app de exemplo. Os tipos e props usados estão descritos em [[SeedGrid/SeedGrid-components/inputs-texto/API|API]].

## Configuração de idioma (recomendada)

Sem provider, as mensagens saem em `en-US`, que é o padrão do i18n global. **Confirmado**.

```tsx
import { SgComponentsI18nProvider } from "@seedgrid/fe-components";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SgComponentsI18nProvider locale="pt-BR">{children}</SgComponentsI18nProvider>;
}
```

## SgInputText

Página: `sg-input-text/page.tsx` (19 exemplo(s) com código na página; abaixo 19).

### Básico

Exemplo integrado com React Hook Form usando register (uncontrolled).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/basico-rhf.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { nome: "" } });
  return (
    <>
      <SgInputText id="demo-basic" label="Nome completo" name="nome" register={register} />
      <p>Valor atual: {watch("nome")}</p>
    </>
  );
}
```

### Obrigatório

required valida ao sair do campo; requiredMessage troca a mensagem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { required: "", requiredCustom: "" } });
  return (
    <>
      <SgInputText id="demo-required" label="Campo obrigatorio" required name="required" register={register} />
      <SgInputText id="demo-required-custom" label="Mensagem customizada" required requiredMessage="Campo obrigatorio" name="requiredCustom" register={register} />
    </>
  );
}
```

### Controlado

Este exemplo precisa ser controlled porque usa watch (valor em tempo real no render) e setValue externos. Caso contrario, prefira register (uncontrolled).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/controlado.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { control, watch, setValue } = useForm({ defaultValues: { controlled: "SeedGrid" } });
  return (
    <>
      <SgInputText id="demo-controlled" label="Cliente" name="controlled" control={control} />
      <button type="button" onClick={() => setValue("controlled", "Valor de API")}>Set API</button>
      <button type="button" onClick={() => setValue("controlled", "Outro valor")}>Set Outro</button>
      <button type="button" onClick={() => setValue("controlled", "")}>Limpar</button>
      <p>Estado atual: "{watch("controlled")}"</p>
    </>
  );
}
```

### Contador de caracteres

Usa maxLength e showCharCounter para limitar e exibir contagem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/contador-de-caracteres.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { counter: "" } });
  return <SgInputText id="demo-counter" label="Max 20" maxLength={20} showCharCounter name="counter" register={register} />;
}
```

### Tamanho mínimo

Valida que o texto tem um tamanho minimo ao perder foco.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/tamanho-minimo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { minlength: "" } });
  return <SgInputText id="demo-minlength" label="Min 5" minLength={5} showCharCounter name="minlength" register={register} />;
}
```

### Mínimo de palavras

Valida quantidade minima de palavras.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/minimo-de-palavras.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { words: "" } });
  return <SgInputText id="demo-words" label="Min 3 palavras" minNumberOfWords={3} minNumberOfWordsMessage="Digite ao menos 3 palavras" name="words" register={register} />;
}
```

### Validação customizada

validation devolve a mensagem de erro (ou null) e onValidation informa o resultado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { validation: "" } });
  return (
    <SgInputText
      id="demo-validation"
      label="Apenas letras"
      validation={(value) => (/[^\p{L}\s]/u.test(value) ? "Apenas letras" : null)}
      onValidation={(message) => console.log(message)}
      name="validation"
      register={register}
    />
  );
}
```

### Ícone de prefixo

Icone posicionado a esquerda do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/icone-prefixo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { prefixIcon: "" } });
  return (
    <SgInputText
      id="demo-prefix"
      label="Buscar"
      prefixIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
      name="prefixIcon"
      register={register}
    />
  );
}
```

### Prefixo e sufixo

Prefixo/sufixo são apenas visuais. O valor retornado já vem concatenado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/prefixo-e-sufixo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { control, setValue } = useForm({ defaultValues: { suffix: "", prefix: "", both: "" } });
  return (
    <>
      <SgInputText id="demo-suffix" label="Email" suffixText="@gmail.com" name="suffix" control={control} />
      <SgInputText id="demo-prefix-text" label="Website" prefixText="www." name="prefix" control={control} />
      <button type="button" onClick={() => setValue("prefix", "www.test.com.br")}>Set valor externo</button>
      <SgInputText id="demo-both" label="Dominio" prefixText="www." suffixText=".seedgrid.com.br" name="both" control={control} />
    </>
  );
}
```

### Botões de ícone

iconButtons recebe uma lista de botões; cada botão tem o onClick que você definir.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/botoes-de-icone.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { iconbtns: "" } });
  const value = watch("iconbtns");
  return (
    <SgInputText
      id="demo-iconbtns"
      label="Copiar texto"
      name="iconbtns"
      register={register}
      iconButtons={[
        <button key="copy" type="button" onClick={() => navigator.clipboard.writeText(value)}>Copiar</button>,
        <button key="alert" type="button" onClick={() => alert("ok")}>Alerta</button>
      ]}
    />
  );
}
```

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { noborder: "", filled: "" } });
  return (
    <>
      <SgInputText id="demo-noborder" label="Sem borda" withBorder={false} name="noborder" register={register} />
      <SgInputText id="demo-filled" label="Filled" filled name="filled" register={register} />
    </>
  );
}
```

### Sem botão de limpar

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { noclear: "" } });
  return <SgInputText id="demo-noclear" label="Sem limpar" clearButton={false} name="noclear" register={register} />;
}
```

### Largura e borda

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { w200: "", w300: "" } });
  return (
    <>
      <SgInputText id="demo-w200" label="Width 200" width={200} name="w200" register={register} />
      <SgInputText id="demo-w300" label="Width 300" width={300} borderRadius={20} name="w300" register={register} />
    </>
  );
}
```

### Desabilitado e somente leitura

enabled=false desabilita, readOnly=true impede edição.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/desabilitado-e-somente-leitura.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { disabled: "desabilitado", readonly: "readonly" } });
  return (
    <>
      <SgInputText id="demo-disabled" label="Desabilitado" enabled={false} name="disabled" register={register} />
      <SgInputText id="demo-readonly" label="Somente leitura" readOnly name="readonly" register={register} />
    </>
  );
}
```

### Erro externo

Prop error exibe mensagem de erro vinda do pai (server-side, etc).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/erro-externo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { error: "" } });
  return <SgInputText id="demo-error" label="Erro externo" error="Erro externo" name="error" register={register} />;
}
```

### Standalone (form completo)

Exemplo 100% standalone com default no load e botao salvar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/standalone-form-completo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputText } from "@seedgrid/fe-components";

export default function Example() {
  const nomeRef = React.useRef<HTMLInputElement | null>(null);
  const emailRef = React.useRef<HTMLInputElement | null>(null);
  const cpfRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (nomeRef.current) nomeRef.current.value = "Maria";
    if (emailRef.current) emailRef.current.value = "maria@seedgrid.com";
    if (cpfRef.current) cpfRef.current.value = "12345678909";
  }, []);

  const handleSave = () => {
    console.log({
      nome: nomeRef.current?.value ?? "",
      email: emailRef.current?.value ?? "",
      cpf: cpfRef.current?.value ?? ""
    });
  };

  return (
    <div className="space-y-3">
      <SgInputText id="nome" label="Nome" inputProps={{ ref: nomeRef }} />
      <SgInputText id="email" label="Email" inputProps={{ ref: emailRef }} />
      <SgInputText id="cpf" label="CPF" inputProps={{ ref: cpfRef }} />
      <button type="button" onClick={handleSave}>Salvar</button>
    </div>
  );
}
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/eventos-standalone.tsx.sample`

```tsx
import * as React from "react";
import { SgInputText } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputText
      id="demo-events"
      label="Digite e acompanhe"
      required
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("onValidation:", message)}
    />
  );
}
```

### 18) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputText } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputText id="sg-input-text-label-float" label="Float" labelPosition="float" />
      <SgInputText id="sg-input-text-label-top" label="Top" labelPosition="top" elevation="md" withBorder={false} />
      <SgInputText id="sg-input-text-label-left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

### 19) 

Compare os niveis de sombra disponiveis no campo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text/samples/elevacao.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputText } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={8}>
      <SgInputText id="sg-input-text-elevation-none" label="Elevation none" elevation="none" />
      <SgInputText id="sg-input-text-elevation-sm" label="Elevation sm" elevation="sm" />
      <SgInputText id="sg-input-text-elevation-md" label="Elevation md" elevation="md" />
      <SgInputText id="sg-input-text-elevation-lg" label="Elevation lg" elevation="lg" />
    </SgGrid>
  );
}
```

## SgInputTextArea

Página: `sg-input-text-area/page.tsx` (18 exemplo(s) com código na página; abaixo 18).

### 1) 

Textarea com floating label e botao limpar (padrao).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-basic" label="Descricao" onChange={(value) => console.log(value)} />;
}
```

### 2) 

Valida ao perder o foco (validateOnBlur=true por padrao).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputTextArea id="demo-required" label="Campo obrigatorio" required />
      <SgInputTextArea id="demo-required-custom" label="Mensagem customizada" required requiredMessage="Campo obrigatorio" />
    </>
  );
}
```

### 3) 

Para controlar o valor de fora (setar, limpar, preencher via API), use textareaProps.value + textareaProps.onChange. O estado vive no pai.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/controlado.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgGrid, SgInputTextArea } from "@seedgrid/fe-components";

export default function Example() {
  const [controlledValue, setControlledValue] = React.useState("Texto controlado");
  return (
    <div className="w-96 space-y-3">
      <SgInputTextArea id="demo-controlled" label="Notas" textareaProps={{ value: controlledValue, onChange: (event) => setControlledValue(event.target.value) }} />
      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => setControlledValue("Texto vindo da API")}>Set API</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setControlledValue("Outro exemplo")}>Set Outro</SgButton>
        <SgButton size="sm" appearance="outline" severity="danger" onClick={() => setControlledValue("")}>Limpar</SgButton>
      </SgGrid>
      <p>Estado atual: "{controlledValue}"</p>
    </div>
  );
}
```

### 4) 

Usa maxLength e showCharCounter para limitar e exibir contagem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/contador.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-counter" label="Max 100" maxLength={100} showCharCounter />;
}
```

### 5) 

Valida que o texto tem um tamanho minimo ao perder foco.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/tamanho-minimo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-minlength" label="Min 10" minLength={10} showCharCounter />;
}
```

### 6) 

Valida quantidade minima de palavras.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/minimo-de-palavras.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-words" label="Min 5 palavras" minNumberOfWords={5} minNumberOfWordsMessage="Digite ao menos 5 palavras" />;
}
```

### 7) 

Valida que o texto tem um numero minimo de linhas (quebras de linha). Exclusivo do TextArea.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/minimo-de-linhas.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-minlines" label="Min 3 linhas" minLines={3} minLinesMessage="Digite ao menos 3 linhas" />;
}
```

### 8) 

Funcao de validacao retorna mensagem de erro ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-validation" label="Sem numeros" validation={(value) => (/\d/.test(value) ? "Sem numeros" : null)} onValidation={(message) => console.log(message)} />;
}
```

### 9) 

height controla a altura do container. maxLines define as linhas visíveis do campo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/tamanho-e-linhas.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputTextArea id="demo-height-small" label="Compacto" height={100} maxLines={2} />
      <SgInputTextArea id="demo-height-large" label="Expandido" height={250} maxLines={8} />
    </>
  );
}
```

### 10) 

Icone posicionado no canto superior esquerdo do textarea.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/icone-prefixo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputTextArea
      id="notas"
      label="Notas"
      prefixIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>}
    />
  );
}
```

### 11) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputTextArea id="demo-noborder" label="Sem borda" withBorder={false} />
      <SgInputTextArea id="demo-filled" label="Filled" filled />
    </>
  );
}
```

### 12) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-noclear" label="Sem limpar" clearButton={false} />;
}
```

### 13) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, sm: 2 }} gap={16}>
      <SgInputTextArea id="demo-w250" label="Width 250" width={250} />
      <SgInputTextArea id="demo-w350" label="Width 350" width={350} borderRadius={16} />
    </SgGrid>
  );
}
```

### 14) 

enabled=false desabilita o campo; readOnly impede a edição, mas deixa copiar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/desabilitado-e-somente-leitura.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputTextArea id="demo-disabled" label="Desabilitado" enabled={false} />
      <SgInputTextArea id="demo-readonly" label="Somente leitura" textareaProps={{ readOnly: true }} />
    </>
  );
}
```

### 15) 

Prop error exibe mensagem de erro vinda do pai (server-side, etc).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/erro-externo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-error" label="Erro externo" error="Erro externo" />;
}
```

### 16) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputTextArea
      id="demo-events"
      label="Com eventos"
      required
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 17) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputTextArea id="sg-input-text-area-label-float" label="Float" labelPosition="float" />
      <SgInputTextArea id="sg-input-text-area-label-top" label="Top" labelPosition="top" />
      <SgInputTextArea id="sg-input-text-area-label-left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

### 18) 

Compare os niveis de sombra disponiveis no campo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-area/samples/elevacao.tsx.sample`

```tsx
import { SgGrid, SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={8}>
      <SgInputTextArea id="sg-input-text-area-elevation-none" label="Elevação none" elevation="none" />
      <SgInputTextArea id="sg-input-text-area-elevation-sm" label="Elevação sm" elevation="sm" />
      <SgInputTextArea id="sg-input-text-area-elevation-md" label="Elevação md" elevation="md" />
      <SgInputTextArea id="sg-input-text-area-elevation-lg" label="Elevação lg" elevation="lg" />
    </SgGrid>
  );
}
```

## SgInputTextSearch

Página: `sg-input-text-search/page.tsx` (4 exemplo(s) com código na página; abaixo 4).

### 1) Básico (minChars 3, debounce 350ms)

Digite e observe: o valor imediato muda a cada tecla, o termo de busca só atualiza após parar de digitar e com 3+ caracteres.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-search/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextSearch } from "@seedgrid/fe-components";

export default function App() {
  const [immediate, setImmediate] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  return (
    <>
      <SgInputTextSearch
        id="search-basic"
        label="Busca"
        placeholder="Digite para buscar"
        onChange={setImmediate}
        onSearchChange={setSearchTerm}
      />
      <p>Valor imediato (onChange): {immediate}</p>
      <p>Termo de busca (onSearchChange): {searchTerm}</p>
    </>
  );
}
```

### 2) minChars 1 e debounce 800ms

Dispara com 1 caractere, mas com um debounce mais longo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-search/samples/minchars-e-debounce.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextSearch } from "@seedgrid/fe-components";

export default function App() {
  const [immediate, setImmediate] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  return (
    <>
      <SgInputTextSearch
        id="search-tuned"
        label="Busca"
        placeholder="Digite para buscar"
        minChars={1}
        debounceMs={800}
        onChange={setImmediate}
        onSearchChange={setSearchTerm}
      />
      <p>Valor imediato (onChange): {immediate}</p>
      <p>Termo de busca (onSearchChange): {searchTerm}</p>
    </>
  );
}
```

### 3) onChange imediato x onSearchChange com debounce

onChange recebe cada digitação com o valor cru; onSearchChange só o valor normalizado e sem repetição.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-search/samples/onchange-imediato-x-onsearchchange-com-debounce.tsx.sample`

```tsx
import * as React from "react";
import { SgInputTextSearch } from "@seedgrid/fe-components";

export default function App() {
  const [raw, setRaw] = React.useState("");
  const [fired, setFired] = React.useState(0);
  return (
    <>
      <SgInputTextSearch
        id="search-events"
        label="Digite e veja os eventos"
        onChange={setRaw}
        onSearchChange={() => setFired((n) => n + 1)}
      />
      <p>onChange (cru): "{raw}"</p>
      <p>Buscas disparadas: {fired}</p>
    </>
  );
}
```

### 4) Rótulo, largura e botão de limpar

Limpar o campo dispara a busca vazia (volta para a lista completa).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-text-search/samples/rotulo-largura-e-botao-de-limpar.tsx.sample`

```tsx
import { SgInputTextSearch } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputTextSearch
      id="search-appearance"
      label="Cliente"
      labelPosition="top"
      placeholder="Nome ou CPF"
      width={320}
      filled
      onSearchChange={() => {}}
    />
  );
}
```

## SgInputEmail

Página: `sg-input-email/page.tsx` (13 exemplo(s) com código na página; abaixo 13).

### 1) 

Email com label e hint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="E-mail"
      hintText="name@domain.com"
      onChange={(value) => console.log(value)}
    />
  );
}
```

### 2) 

Valida se está vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="E-mail obrigatório"
      hintText="name@domain.com"
      required
      requiredMessage="Informe um e-mail válido"
    />
  );
}
```

### 3) 

Personaliza mensagem de email inválido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/invalido.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="E-mail"
      hintText="name@domain.com"
      invalidMessage="E-mail inválido"
    />
  );
}
```

### 4) 

blockFakeMail=true (padrão) bloqueia domínios descartáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/bloqueados.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="E-mail"
      blockFakeMail={false}
    />
  );
}
```

### 5) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="Apenas .com"
      hintText="name@domain.com"
      validation={(value) => (value.endsWith(".com") ? null : "Use um domínio .com")}
      onValidation={(message) => console.log(message)}
    />
  );
}
```

### 6) 

Domínios bloqueados por default.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/lista-de-bloqueados.tsx.sample`

```tsx
import { DEFAULT_BLOCKED_EMAIL_DOMAINS } from "@seedgrid/fe-components";

console.log(DEFAULT_BLOCKED_EMAIL_DOMAINS);
```

### 7) 

A aplicação host pode carregar um JSON e adicionar domínios em runtime.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/json.tsx.sample`

```tsx
fetch("/seedgrid-blocked-email-domains.json")
  .then((response) => response.json())
  .then((data) => {
    window.__seedgridBlockedEmailDomains = data.blockedEmailDomains ?? [];
  });
```

### 8) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputEmail id="a" label="Sem borda" hintText="name@domain.com" withBorder={false} />
      <SgInputEmail id="b" label="Filled" hintText="name@domain.com" filled />
    </>
  );
}
```

### 9) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputEmail id="email" label="Sem botão limpar" hintText="name@domain.com" clearButton={false} />;
}
```

### 10) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputEmail id="a" label="Width 200" hintText="name@domain.com" width={200} />
      <SgInputEmail id="b" label="Width 300" hintText="name@domain.com" width={300} borderRadius={20} />
    </>
  );
}
```

### 11) 

enabled=false desabilita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputEmail id="email" label="Desabilitado" hintText="name@domain.com" enabled={false} />;
}
```

### 12) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="eventos"
      label="Digite e acompanhe os eventos"
      hintText="name@domain.com"
      required
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 13) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-email/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputEmail id="float" label="Float" labelPosition="float" />
      <SgInputEmail id="top" label="Top" labelPosition="top" />
      <SgInputEmail id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

## SgInputPassword

Página: `sg-input-password/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### 1) 

Senha com label, hint e toggle de visibilidade.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  const [basicValue, setBasicValue] = React.useState("");

  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-basic"
        label="Senha"
        hintText="Digite sua senha"
        onChange={(value) => setBasicValue(value)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {basicValue}</p>
    </div>
  );
}
```

### 2) 

Valida se esta vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-required"
        label="Senha obrigatoria"
        hintText="Campo obrigatorio"
        required
      />
    </div>
  );
}
```

### 3) 

Funcao de validacao retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/validacao.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  const [validationMsg, setValidationMsg] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-validation"
        label="Senha com validacao"
        hintText="Minimo de 8 caracteres"
        validation={(value) => (value.length < 8 ? "A senha deve ter pelo menos 8 caracteres" : null)}
        onValidation={(msg) => setValidationMsg(msg)}
      />
      <p className="mt-2 text-xs text-muted-foreground">onValidation: {validationMsg ?? "valid"}</p>
    </div>
  );
}
```

### 4) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <div className="w-80">
        <SgInputPassword id="demo-noborder" label="Sem borda" withBorder={false} />
      </div>
      <div className="w-80">
        <SgInputPassword id="demo-filled" label="Filled" filled />
      </div>
      <div className="w-80">
        <SgInputPassword id="demo-noclear" label="Sem limpar" clearButton={false} />
      </div>
    </>
  );
}
```

### 5) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  const [eventLog, setEventLog] = React.useState<string[]>([]);

  const log = (msg: string) => {
    setEventLog((prev) => [`[evento] ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-events"
        label="Digite e acompanhe"
        required
        onChange={(value) => log(`onChange: "${value}"`)}
        onEnter={() => log("onEnter")}
        onExit={() => log("onExit")}
        onClear={() => log("onClear")}
      />
      <div className="mt-3 h-40 overflow-y-auto rounded border border-border bg-foreground/5 p-2 font-mono text-xs">
        {eventLog.length === 0 ? <span className="text-muted-foreground">Interaja para gerar eventos.</span> : eventLog.map((entry, index) => <div key={index}>{entry}</div>)}
      </div>
    </div>
  );
}
```

### 6) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputPassword id="label-float" label="Float" labelPosition="float" />
      <SgInputPassword id="label-top" label="Top" labelPosition="top" />
      <SgInputPassword id="label-left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

### 7) 

O botão gera uma senha que cumpre a política; newPasswordLength define o tamanho.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/gerar-senha-forte.tsx.sample`

```tsx
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-generate"
        label="Senha"
        createNewPasswordButton
        newPasswordLength={12}
        maxLength={32}
        hidePassword={false}
      />
    </div>
  );
}
```

### 8) 

Cada critério liga e desliga; minSize muda o tamanho mínimo e showStrengthBar esconde a barra.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-password/samples/politica-propria.tsx.sample`

```tsx
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputPassword
        id="demo-policy"
        label="PIN alfanumérico"
        minSize={6}
        upperRequired={false}
        specialCharacterRequired={false}
        prohibitsSequentialAscCharacters={false}
        prohibitsSequentialDescCharacters={false}
        showStrengthBar={false}
        commonPasswordCheck={false}
      />
    </div>
  );
}
```

## SgInputPhone

Página: `sg-input-phone/page.tsx` (12 exemplo(s) com código na página; abaixo 12).

### 1) 

Telefone com label e hint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputPhone id="telefone" label="Telefone" hintText="(11) 99999-0000" onChange={(value) => console.log(value)} />;
}
```

### 2) 

Valida se esta vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPhone
      id="telefone"
      label="Telefone obrigatorio"
      hintText="(11) 99999-0000"
      required
      requiredMessage="Informe o telefone"
    />
  );
}
```

### 3) 

Personaliza mensagem de telefone invalido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/invalido.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputPhone id="telefone" label="Telefone" hintText="(11) 99999-0000" invalidMessage="Telefone invalido" />;
}
```

### 4) 

Funcao de validacao retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPhone
      id="telefone"
      label="Telefone"
      hintText="(11) 99999-0000"
      validation={(value) => (value.startsWith("(00)") ? "DDD invalido" : null)}
      onValidation={(message) => console.log(message)}
    />
  );
}
```

### 5) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputPhone id="a" label="Sem borda" hintText="(11) 99999-0000" withBorder={false} />
      <SgInputPhone id="b" label="Filled" hintText="(11) 99999-0000" filled />
    </>
  );
}
```

### 6) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputPhone id="x" label="Sem botao limpar" hintText="(11) 99999-0000" clearButton={false} />;
}
```

### 7) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputPhone id="a" label="Width 200" hintText="(11) 99999-0000" width={200} />
      <SgInputPhone id="b" label="Width 300" hintText="(11) 99999-0000" width={300} borderRadius={20} />
    </>
  );
}
```

### 8) 

enabled=false desabilita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputPhone id="a" label="Desabilitado" hintText="(11) 99999-0000" enabled={false} />;
}
```

### 9) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPhone
      id="eventos"
      label="Com eventos"
      hintText="(11) 99999-0000"
      required
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 10) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputPhone id="float" label="Float" labelPosition="float" />
      <SgInputPhone id="top" label="Top" labelPosition="top" />
      <SgInputPhone id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

### 11) Formulário com control

Com react-hook-form e control, o valor do formulário vem sempre mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/formulario-control.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  const { control, watch } = useForm({ defaultValues: { telefone: "11987654321" } });
  const value = String(watch("telefone") ?? "");

  return (
    <div>
      <SgInputPhone
        id="telefone-control"
        name="telefone"
        label="Telefone"
        control={control}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

### 12) Formulário com register

Com react-hook-form e register, o valor do formulário também vem mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-phone/samples/formulario-register.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { telefone: "11987654321" } });
  const value = String(watch("telefone") ?? "");

  return (
    <div>
      <SgInputPhone
        id="telefone-register"
        name="telefone"
        label="Telefone"
        register={register}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

## SgInputCPF

Página: `sg-input-cpf/page.tsx` (13 exemplo(s) com código na página; abaixo 13).

### 1) 

CPF com label e hint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="cpf"
      label="CPF"
      hintText="000.000.000-00"
      inputProps={{}}
      onChange={(value) => console.log(value)}
    />
  );
}
```

### 2) 

Valida se está vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="cpf"
      label="CPF obrigatório"
      hintText="000.000.000-00"
      required
      requiredMessage="Informe um CPF"
      inputProps={{}}
    />
  );
}
```

### 3) 

Personaliza mensagem quando CPF não tem 11 dígitos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/tamanho.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="cpf"
      label="CPF"
      hintText="000.000.000-00"
      lengthMessage="CPF incompleto"
      inputProps={{}}
    />
  );
}
```

### 4) 

Personaliza mensagem de CPF inválido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/invalido.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="cpf"
      label="CPF"
      hintText="000.000.000-00"
      invalidMessage="CPF inválido"
      inputProps={{}}
    />
  );
}
```

### 5) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="cpf"
      label="CPF"
      hintText="000.000.000-00"
      validation={(value) => (value.startsWith("123") ? "Nao pode iniciar com 123" : null)}
      onValidation={(message) => console.log(message)}
      inputProps={{}}
    />
  );
}
```

### 6) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCPF id="a" label="Sem borda" hintText="000.000.000-00" withBorder={false} inputProps={{}} />
      <SgInputCPF id="b" label="Filled" hintText="000.000.000-00" filled inputProps={{}} />
    </>
  );
}
```

### 7) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCPF id="cpf" label="Sem botão limpar" hintText="000.000.000-00" clearButton={false} inputProps={{}} />;
}
```

### 8) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCPF id="a" label="Width 200" hintText="000.000.000-00" width={200} inputProps={{}} />
      <SgInputCPF id="b" label="Width 300" hintText="000.000.000-00" width={300} borderRadius={20} inputProps={{}} />
    </>
  );
}
```

### 9) 

enabled=false desabilita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCPF id="cpf" label="Desabilitado" hintText="000.000.000-00" enabled={false} inputProps={{}} />;
}
```

### 10) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPF
      id="eventos"
      label="Digite e acompanhe os eventos"
      hintText="000.000.000-00"
      required
      inputProps={{}}
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 11) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputCPF id="float" label="Float" labelPosition="float" inputProps={{}} />
      <SgInputCPF id="top" label="Top" labelPosition="top" inputProps={{}} />
      <SgInputCPF id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" inputProps={{}} />
    </SgGrid>
  );
}
```

### 12) Formulário com control

Com react-hook-form e control, o valor do formulário vem sempre mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/formulario-control.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  const { control, watch } = useForm({ defaultValues: { cpf: "52998224725" } });
  const value = String(watch("cpf") ?? "");

  return (
    <div>
      <SgInputCPF
        id="cpf-control"
        name="cpf"
        label="CPF"
        control={control}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

### 13) Formulário com register

Com react-hook-form e register, o valor do formulário também vem mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf/samples/formulario-register.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCPF } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { cpf: "52998224725" } });
  const value = String(watch("cpf") ?? "");

  return (
    <div>
      <SgInputCPF
        id="cpf-register"
        name="cpf"
        label="CPF"
        register={register}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

## SgInputCNPJ

Página: `sg-input-cnpj/page.tsx` (16 exemplo(s) com código na página; abaixo 16).

### 1) 

CNPJ com label e hint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ"
      hintText="00.000.000/0000-00"
      inputProps={{}}
      onChange={(value) => console.log(value)}
    />
  );
}
```

### 2) 

Exemplo com letras (A-Z) no corpo e DVs numéricos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/alfanumerico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ alfanumerico"
      hintText="00.000.000/E08G-12"
      inputProps={{ defaultValue: "00.000.000/E08G-12" }}
    />
  );
}
```

### 3) 

Lista de CNPJs alfanuméricos válidos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/lista-alfanumerica.tsx.sample`

```tsx
console.log(`// Exemplos validos
00.000.000/E08G-12  (raw: 00000000E08G12)
GK.IPC.PIK/0001-52  (raw: GKIPCPIK000152)
AB.12C.345/D6E7-99  (raw: AB12C345D6E799)
12.ABC.345/DE67-34  (raw: 12ABC345DE6734)
A1.B2C.3D4/E5F6-68  (raw: A1B2C3D4E5F668)
ZX.CVB.NM1/2345-84  (raw: ZXCVBNM1234584)`);
```

### 4) 

Consulta publica.cnpj.ws para verificar se o CNPJ existe.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/cnpj-publico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ"
      hintText="00.000.000/0000-00"
      validateWithPublicaCnpj
      publicaCnpjErrorMessage="CNPJ nao encontrado"
      onPublicaCnpjResult={(data) => console.log(data)}
      onPublicaCnpjError={(error) => console.log(error)}
      inputProps={{}}
    />
  );
}
```

### 5) 

Valida se está vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ obrigatorio"
      hintText="00.000.000/0000-00"
      required
      requiredMessage="Informe um CNPJ"
      inputProps={{}}
    />
  );
}
```

### 6) 

Personaliza mensagem quando CNPJ não tem 14 dígitos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/tamanho.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ"
      hintText="00.000.000/0000-00"
      lengthMessage="CNPJ incompleto"
      inputProps={{}}
    />
  );
}
```

### 7) 

Personaliza mensagem de CNPJ inválido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/invalido.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ"
      hintText="00.000.000/0000-00"
      invalidMessage="CNPJ invalido"
      inputProps={{}}
    />
  );
}
```

### 8) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="cnpj"
      label="CNPJ"
      hintText="00.000.000/0000-00"
      validation={(value) => (value.startsWith("00") ? "Nao pode iniciar com 00" : null)}
      onValidation={(message) => console.log(message)}
      inputProps={{}}
    />
  );
}
```

### 9) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCNPJ id="a" label="Sem borda" hintText="00.000.000/0000-00" withBorder={false} inputProps={{}} />
      <SgInputCNPJ id="b" label="Filled" hintText="00.000.000/0000-00" filled inputProps={{}} />
    </>
  );
}
```

### 10) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCNPJ id="cnpj" label="Sem botao limpar" hintText="00.000.000/0000-00" clearButton={false} inputProps={{}} />;
}
```

### 11) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCNPJ id="a" label="Width 200" hintText="00.000.000/0000-00" width={200} inputProps={{}} />
      <SgInputCNPJ id="b" label="Width 300" hintText="00.000.000/0000-00" width={300} borderRadius={20} inputProps={{}} />
    </>
  );
}
```

### 12) 

enabled=false desabilita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCNPJ id="cnpj" label="Desabilitado" hintText="00.000.000/0000-00" enabled={false} inputProps={{}} />;
}
```

### 13) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCNPJ
      id="eventos"
      label="Digite e acompanhe os eventos"
      hintText="00.000.000/0000-00"
      required
      inputProps={{}}
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 14) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputCNPJ id="float" label="Float" labelPosition="float" inputProps={{}} />
      <SgInputCNPJ id="top" label="Top" labelPosition="top" inputProps={{}} />
      <SgInputCNPJ id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" inputProps={{}} />
    </SgGrid>
  );
}
```

### 15) Formulário com control

Com react-hook-form e control, o valor do formulário vem sempre mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/formulario-control.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  const { control, watch } = useForm({ defaultValues: { cnpj: "11222333000181" } });
  const value = String(watch("cnpj") ?? "");

  return (
    <div>
      <SgInputCNPJ
        id="cnpj-control"
        name="cnpj"
        label="CNPJ"
        control={control}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

### 16) Formulário com register

Com react-hook-form e register, o valor do formulário também vem mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cnpj/samples/formulario-register.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCNPJ } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { cnpj: "11222333000181" } });
  const value = String(watch("cnpj") ?? "");

  return (
    <div>
      <SgInputCNPJ
        id="cnpj-register"
        name="cnpj"
        label="CNPJ"
        register={register}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

## SgInputCPFCNPJ

Página: `sg-input-cpf-cnpj/page.tsx` (15 exemplo(s) com código na página; abaixo 15).

### 1) 

CPF/CNPJ com label e hint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="doc"
      label="CPF ou CNPJ"
      hintText="CPF ou CNPJ"
      inputProps={{}}
      onChange={(value) => console.log(value)}
    />
  );
}
```

### 2) 

Valida se está vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="doc"
      label="Documento obrigatorio"
      hintText="CPF ou CNPJ"
      required
      requiredMessage="Informe um documento"
      inputProps={{}}
    />
  );
}
```

### 3) 

Personaliza mensagem de documento inválido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/invalido.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="doc"
      label="CPF ou CNPJ"
      hintText="CPF ou CNPJ"
      invalidMessage="Documento invalido"
      inputProps={{}}
    />
  );
}
```

### 4) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="doc"
      label="CPF ou CNPJ"
      hintText="CPF ou CNPJ"
      validation={(value) => (value.startsWith("00") ? "Nao pode iniciar com 00" : null)}
      onValidation={(message) => console.log(message)}
      inputProps={{}}
    />
  );
}
```

### 5) 

Aceita letras (A-Z) no corpo do CNPJ.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/alfanumerico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="doc"
      label="Documento alfanumerico"
      hintText="00.000.000/E08G-12"
      inputProps={{ defaultValue: "00.000.000/E08G-12" }}
    />
  );
}
```

### 6) 

Lista de CNPJs alfanuméricos válidos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/lista-alfanumerica.tsx.sample`

```tsx
console.log(`// Exemplos validos
00.000.000/E08G-12  (raw: 00000000E08G12)
GK.IPC.PIK/0001-52  (raw: GKIPCPIK000152)
AB.12C.345/D6E7-99  (raw: AB12C345D6E799)
12.ABC.345/DE67-34  (raw: 12ABC345DE6734)
A1.B2C.3D4/E5F6-68  (raw: A1B2C3D4E5F668)
ZX.CVB.NM1/2345-84  (raw: ZXCVBNM1234584)`);
```

### 7) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCPFCNPJ id="a" label="Sem borda" hintText="CPF ou CNPJ" withBorder={false} inputProps={{}} />
      <SgInputCPFCNPJ id="b" label="Filled" hintText="CPF ou CNPJ" filled inputProps={{}} />
    </>
  );
}
```

### 8) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCPFCNPJ id="doc" label="Sem botao limpar" hintText="CPF ou CNPJ" clearButton={false} inputProps={{}} />;
}
```

### 9) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCPFCNPJ id="a" label="Width 200" hintText="CPF ou CNPJ" width={200} inputProps={{}} />
      <SgInputCPFCNPJ id="b" label="Width 300" hintText="CPF ou CNPJ" width={300} borderRadius={20} inputProps={{}} />
    </>
  );
}
```

### 10) 

enabled=false desabilita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputCPFCNPJ id="doc" label="Desabilitado" hintText="CPF ou CNPJ" enabled={false} inputProps={{}} />;
}
```

### 11) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputCPFCNPJ
      id="eventos"
      label="Digite e acompanhe os eventos"
      hintText="CPF ou CNPJ"
      required
      inputProps={{}}
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 12) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputCPFCNPJ id="float" label="Float" labelPosition="float" inputProps={{}} />
      <SgInputCPFCNPJ id="top" label="Top" labelPosition="top" inputProps={{}} />
      <SgInputCPFCNPJ id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" inputProps={{}} />
    </SgGrid>
  );
}
```

### 13) 

Quando o documento é um CNPJ numérico válido, consulta publica.cnpj.ws para confirmar que ele existe.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/cnpj-publico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  const [result, setResult] = React.useState<unknown | null>(null);

  return (
    <>
      <SgInputCPFCNPJ
        id="documento"
        label="Documento"
        validateWithPublicaCnpj
        publicaCnpjErrorMessage="CNPJ nao encontrado."
        onPublicaCnpjResult={setResult}
        onPublicaCnpjError={(error) => console.log(error)}
        inputProps={{}}
      />
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </>
  );
}
```

### 14) Formulário com control

Com react-hook-form e control, o valor do formulário vem sempre mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/formulario-control.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  const { control, watch } = useForm({ defaultValues: { documento: "52998224725" } });
  const value = String(watch("documento") ?? "");

  return (
    <div>
      <SgInputCPFCNPJ
        id="documento-control"
        name="documento"
        label="CPF/CNPJ"
        control={control}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

### 15) Formulário com register

Com react-hook-form e register, o valor do formulário também vem mascarado. Para enviar só os dígitos, limpe com value.replace(/\D/g, "").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-cpf-cnpj/samples/formulario-register.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputCPFCNPJ } from "@seedgrid/fe-components";

export default function App() {
  const { register, watch } = useForm({ defaultValues: { documento: "52998224725" } });
  const value = String(watch("documento") ?? "");

  return (
    <div>
      <SgInputCPFCNPJ
        id="documento-register"
        name="documento"
        label="CPF/CNPJ"
        register={register}
      />
      <p>Valor no formulário: "{value}"</p>
      <p>Só os dígitos: "{value.replace(/\D/g, "")}"</p>
    </div>
  );
}
```

## SgInputPostalCode

Página: `sg-input-postal-code/page.tsx` (16 exemplo(s) com código na página; abaixo 16).

### 1) 

Codigo postal com label e hint (padrao: Brasil).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { cep: "" } });
  return <SgInputPostalCode id="cep" label="CEP (Brasil)" hintText="00000-000" name="cep" register={register} />;
}
```

### 2) 

Cada pais tem mascara, tamanho e validacao especificos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/paises.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputPostalCode id="br" country="BR" label="CEP (Brasil)" hintText="00000-000" />
      <SgInputPostalCode id="pt" country="PT" label="Codigo postal (Portugal)" hintText="0000-000" />
      <SgInputPostalCode id="us" country="US" label="ZIP code (USA)" hintText="00000" />
      <SgInputPostalCode id="es" country="ES" label="Codigo postal (Espanha)" hintText="00000" />
      <SgInputPostalCode id="uy" country="UY" label="Codigo postal (Uruguai)" hintText="00000" />
      <SgInputPostalCode id="ar" country="AR" label="Codigo postal (Argentina)" hintText="A0000AAA" />
      <SgInputPostalCode id="py" country="PY" label="Codigo postal (Paraguai)" hintText="000000" />
    </>
  );
}
```

### 3) 

Valida se esta vazio e mostra mensagem customizada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputPostalCode id="postal" label="Codigo postal obrigatorio" required requiredMessage="Informe o codigo postal." />;
}
```

### 4) 

Use quando precisa do valor em tempo real e de setValue externos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/controlado.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { control, setValue, watch } = useForm({ defaultValues: { controlled: "01001-000" } });
  const controlledValue = watch("controlled");

  return (
    <div>
      <SgInputPostalCode id="demo-controlled" label="Controlado" hintText="00000-000" name="controlled" control={control} />
      <button type="button" onClick={() => setValue("controlled", "04538-132")}>Set API</button>
      <button type="button" onClick={() => setValue("controlled", "20040-020")}>Set other</button>
      <button type="button" onClick={() => setValue("controlled", "")}>Clear</button>
      <p>Estado atual: "{controlledValue}"</p>
    </div>
  );
}
```

### 5) 

Funcao de validacao retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/validacao-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPostalCode
      id="cep"
      label="CEP (Brasil)"
      hintText="00000-000"
      validation={(value) => (value.startsWith("00") ? "CEP nao pode iniciar com 00." : null)}
      onValidation={(message) => console.log(message)}
    />
  );
}
```

### 6) 

Consulta ViaCEP para verificar se o CEP existe. Disponivel apenas para country="BR".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/viacep.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPostalCode
      id="cep"
      label="CEP (Brasil)"
      hintText="00000-000"
      country="BR"
      validateWithViaCep
      viaCepErrorMessage="CEP invalido."
      onViaCepResult={(data) => console.log(data)}
    />
  );
}
```

### 7) 

Icone posicionado a esquerda do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/icone-prefixo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { prefixIcon: "" } });
  return (
    <SgInputPostalCode
      id="demo-prefix-icon"
      label="Buscar"
      hintText="00000-000"
      prefixIcon={
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      }
      name="prefixIcon"
      register={register}
    />
  );
}
```

### 8) 

Prefixo/sufixo sao apenas visuais.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/prefixo-e-sufixo.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { prefix: "", suffix: "" } });
  return (
    <>
      <SgInputPostalCode id="demo-prefix-text" label="Prefixo" hintText="00000-000" prefixText="CEP:" name="prefix" register={register} />
      <SgInputPostalCode id="demo-suffix-text" label="Sufixo" hintText="00000-000" suffixText="BR" name="suffix" register={register} />
    </>
  );
}
```

### 9) 

iconButtons recebe uma lista de botões; cada botão tem o onClick que você definir.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/botoes-de-icone.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { iconbtns: "" } });
  return (
    <SgInputPostalCode
      id="demo-iconbtns"
      label="Copiar texto"
      hintText="00000-000"
      name="iconbtns"
      register={register}
      iconButtons={[
        <button key="copy" type="button" onClick={() => navigator.clipboard.writeText("01001-000")}>Copiar</button>,
        <button key="alert" type="button" onClick={() => alert("ok")}>Alerta</button>
      ]}
    />
  );
}
```

### 10) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/variacoes-visuais.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { noborder: "", filled: "" } });
  return (
    <>
      <SgInputPostalCode id="a" label="Sem borda" hintText="00000-000" withBorder={false} name="noborder" register={register} />
      <SgInputPostalCode id="b" label="Filled" hintText="00000-000" filled name="filled" register={register} />
    </>
  );
}
```

### 11) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/largura-e-borda.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { w200: "", w300: "" } });
  return (
    <>
      <SgInputPostalCode id="a" label="Width 200" hintText="00000-000" width={200} name="w200" register={register} />
      <SgInputPostalCode id="b" label="Width 300" hintText="00000-000" width={300} borderRadius={20} name="w300" register={register} />
    </>
  );
}
```

### 12) 

enabled=false desabilita, readOnly impede edicao.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/desabilitado-e-somente-leitura.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { disabled: "01001-000", readonly: "01001-000" } });
  return (
    <>
      <SgInputPostalCode id="demo-disabled" label="Desabilitado" hintText="00000-000" enabled={false} name="disabled" register={register} />
      <SgInputPostalCode id="demo-readonly" label="Somente leitura" hintText="00000-000" readOnly name="readonly" register={register} />
    </>
  );
}
```

### 13) 

Usando refs em vez de React Hook Form.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/standalone.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function Example() {
  const refA = React.useRef<HTMLInputElement | null>(null);
  const refB = React.useRef<HTMLInputElement | null>(null);
  const refC = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (refA.current) refA.current.value = "01001-000";
    if (refB.current) refB.current.value = "04538-132";
    if (refC.current) refC.current.value = "20040-020";
  }, []);

  const handleSave = () => {
    const payload = {
      entrega: refA.current?.value ?? "",
      cobranca: refB.current?.value ?? "",
      comercial: refC.current?.value ?? ""
    };
    console.log("Salvar:", payload);
  };

  return (
    <div className="space-y-3">
      <SgInputPostalCode id="a" label="Entrada 1" hintText="00000-000" inputProps={{ ref: refA }} />
      <SgInputPostalCode id="b" label="Entrada 2" hintText="00000-000" inputProps={{ ref: refB }} />
      <SgInputPostalCode id="c" label="Entrada 3" hintText="00000-000" inputProps={{ ref: refC }} />
      <button type="button" onClick={handleSave}>Salvar</button>
    </div>
  );
}
```

### 14) 

onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/eventos.tsx.sample`

```tsx
import * as React from "react";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputPostalCode
      id="eventos"
      label="Com eventos"
      hintText="00000-000"
      required
      onChange={(value) => console.log("onChange:", value)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(message) => console.log("validation:", message)}
    />
  );
}
```

### 15) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
      <SgInputPostalCode id="float" label="Float" labelPosition="float" />
      <SgInputPostalCode id="top" label="Top" labelPosition="top" />
      <SgInputPostalCode id="left" label="Left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

### 16) 

clearButton=false remove o X do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-postal-code/samples/sem-botao-limpar.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgInputPostalCode } from "@seedgrid/fe-components";

export default function App() {
  const { register } = useForm({ defaultValues: { noclear: "" } });
  return <SgInputPostalCode id="demo-noclear" label="Sem limpar" hintText="00000-000" clearButton={false} name="noclear" register={register} />;
}
```

## SgInputDate

Página: `sg-input-date/page.tsx` (5 exemplo(s) com código na página; abaixo 5).

### 1) 

Digite ou abra o calendário; o valor entregue é a data ISO.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-date/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  const [basicValue, setBasicValue] = React.useState("");

  return (
    <div className="w-80">
      <SgInputDate id="demo-basic" label="Data" hintText="Selecione uma data" onChange={(value) => setBasicValue(value)} />
      <p className="mt-2 text-xs text-muted-foreground">Valor: {basicValue}</p>
    </div>
  );
}
```

### 2) 

Fora do intervalo aparece a mensagem; no calendário os dias ficam desabilitados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-date/samples/intervalo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputDate id="demo-range" label="Período" minDate="2020-01-01" maxDate="2030-12-31" />
    </div>
  );
}
```

### 3) 

Valida campo vazio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-date/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputDate id="demo-required" label="Data da consulta" required requiredMessage="Escolha uma data" />
    </div>
  );
}
```

### 4) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-date/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputDate id="sg-input-date-label-float" label="Flutuante" labelPosition="float" />
      <SgInputDate id="sg-input-date-label-top" label="Acima" labelPosition="top" />
      <SgInputDate
        id="sg-input-date-label-left"
        label="Esquerda"
        labelPosition="left"
        labelWidth={140}
        labelAlign="end"
      />
    </SgGrid>
  );
}
```

### 5) 

O formulário guarda a data ISO.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-date/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ date: string }>({ defaultValues: { date: "" } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.date))}>
      <SgInputDate
        id="demo-form"
        name="date"
        control={control}
        label="Data"
        required
        requiredMessage="Escolha uma data"
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgInputBirthDate

Página: `sg-input-birth-date/page.tsx` (5 exemplo(s) com código na página; abaixo 5).

### 1) 

minAge: 18 limita a data máxima e valida a idade.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-birth-date/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputBirthDate } from "@seedgrid/fe-components";

export default function App() {
  const [validationMsg, setValidationMsg] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgInputBirthDate id="demo-basic" label="Data de nascimento" minAge={18} onValidation={(msg) => setValidationMsg(msg)} />
      <p className="mt-2 text-xs text-muted-foreground">onValidation: {validationMsg ?? "válido"}</p>
    </div>
  );
}
```

### 2) 

Valida campo vazio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-birth-date/samples/obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgInputBirthDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputBirthDate
        id="demo-required"
        label="Data de nascimento"
        minAge={18}
        required
        requiredMessage="Informe a data de nascimento."
      />
    </div>
  );
}
```

### 3) 

minAge e maxAge configuráveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-birth-date/samples/intervalo.tsx.sample`

```tsx
import * as React from "react";
import { SgInputBirthDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputBirthDate id="demo-range" label="Data de nascimento" minAge={12} maxAge={80} />
    </div>
  );
}
```

### 4) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-birth-date/samples/posicao-do-rotulo.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgInputBirthDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputBirthDate id="sg-input-birth-date-label-float" label="Flutuante" labelPosition="float" />
      <SgInputBirthDate id="sg-input-birth-date-label-top" label="Acima" labelPosition="top" />
      <SgInputBirthDate
        id="sg-input-birth-date-label-left"
        label="Esquerda"
        labelPosition="left"
        labelWidth={140}
        labelAlign="end"
      />
    </SgGrid>
  );
}
```

### 5) 

O formulário guarda a data de nascimento.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-birth-date/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputBirthDate } from "@seedgrid/fe-components";

export default function App() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ birthDate: string }>({ defaultValues: { birthDate: "" } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.birthDate))}>
      <SgInputBirthDate
        id="demo-form"
        name="birthDate"
        control={control}
        label="Data de nascimento"
        minAge={18}
        required
        requiredMessage="Informe a data de nascimento."
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgInputNumber

Página: `sg-input-number/page.tsx` (16 exemplo(s) com código na página; abaixo 16).

### 1) 

Exemplo integrado com React Hook Form usando register (uncontrolled).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/basico.tsx.sample`

```tsx
import { SgButton, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber
        id="demo-basic"
        label="Valor"
        name="valor"
        decimals={2}
      />

      <SgButton type="submit" size="sm" appearance="outline">
        Submit
      </SgButton>

      <p>Valor atual: {"{watch(\"valor\")}"}</p>
    </>
  );
}
```

### 2) 

Valida ao perder o foco (validateOnBlur=true por padrão).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/obrigatorio.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber
        id="demo-required"
        label="Obrigatório"
        required
        name="required"
        decimals={2}
      />

      <SgInputNumber
        id="demo-required-custom"
        label="Mensagem customizada"
        required
        requiredMessage="Campo obrigatório customizado"
        name="requiredCustom"
        decimals={2}
      />
    </>
  );
}
```

### 3) 

Use quando precisa do valor em tempo real e de setValue externos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/controlado.tsx.sample`

```tsx
import { SgButton, SgGrid, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber
        id="demo-controlled"
        label="Controlado"
        name="controlled"
        decimals={2}
      />

      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => {}}>
          Set API
        </SgButton>

        <SgButton size="sm" appearance="outline" onClick={() => {}}>
          Reset
        </SgButton>

        <SgButton size="sm" appearance="outline" severity="danger" onClick={() => {}}>
          Clear
        </SgButton>
      </SgGrid>

      <p>Estado atual: "{'{watch("controlled")}'}"</p>
    </>
  );
}
```

### 4) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/validacao-customizada.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-validation"
      label="Somente pares"
      name="validation"
      decimals={0}
      validation={(v) => {
        return v !== null && v % 2 === 0 ? null : "Apenas números pares";
      }}
      onValidation={(msg) => console.log(msg)}
    />
  );
}
```

### 5) 

Ícone posicionado à esquerda do input.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/icone-prefixo.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-prefix-icon"
      label="Buscar"
      name="prefixIcon"
      decimals={2}
      prefixIcon={
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      }
    />
  );
}
```

### 6) 

Prefixo/sufixo são apenas visuais.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/prefixo-e-sufixo.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber
        id="demo-prefix-text"
        label="Preço"
        prefixText="R$"
        name="prefix"
        decimals={2}
      />

      <SgInputNumber
        id="demo-suffix-text"
        label="Peso"
        suffixText="kg"
        name="suffix"
        decimals={2}
      />

      <SgInputNumber
        id="demo-both"
        label="Total"
        prefixText="R$"
        suffixText="m"
        name="both"
        decimals={2}
      />
    </>
  );
}
```

### 7) 

iconButtons recebe um array de ReactNode.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/botoes-de-icone.tsx.sample`

```tsx
import { SgButton, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-iconbtns"
      label="Copiar número"
      name="iconbtns"
      decimals={2}
      iconButtons={[
        <SgButton key="copy" type="button" iconOnly size="sm" appearance="ghost" onClick={() => {}} leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>} />,
        <SgButton key="alert" type="button" iconOnly size="sm" appearance="ghost" onClick={() => {}} leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>} />
      ]}
    />
  );
}
```

### 8) 

Bloqueia o sinal de menos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/sem-negativos.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-no-negative"
      label="Somente positivos"
      name="positivo"
      allowNegative={false}
      decimals={2}
    />
  );
}
```

### 9) 

decimals=0 (apenas inteiro com separador de milhar).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/sem-decimais.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-no-decimals"
      label="Quantidade"
      name="inteiro"
      decimals={0}
    />
  );
}
```

### 10) 

Valida intervalo numérico.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/minimo-e-maximo.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-minmax"
      label="Mínimo e máximo"
      name="minmax"
      minValue={10}
      maxValue={100}
      decimals={2}
    />
  );
}
```

### 11) 

emptyValueIsNull permite limpar totalmente (o valor passa a ser null em vez de 0).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/empty-value.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-empty"
      label="Pode ser vazio"
      name="vazio"
      emptyValueIsNull
      decimals={2}
    />
  );
}
```

### 12) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/variacoes-visuais.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber id="demo-noborder" label="Sem borda" withBorder={false} name="noborder" decimals={2} />
      <SgInputNumber id="demo-filled" label="Filled" filled name="filled" decimals={2} />
    </>
  );
}
```

### 13) 

Exemplo 100% standalone com default no load e botão salvar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/standalone-form-completo.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  const refA = React.useRef<HTMLInputElement | null>(null);
  const refB = React.useRef<HTMLInputElement | null>(null);
  const refC = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (refA.current) refA.current.value = "1200.00";
    if (refB.current) refB.current.value = "55.90";
    if (refC.current) refC.current.value = "980.00";
  }, []);

  const handleSave = () => {
    const payload = {
      a: refA.current?.value ?? "",
      b: refB.current?.value ?? "",
      c: refC.current?.value ?? ""
    };
    console.log("Salvar:", payload);
  };

  return (
    <div className="space-y-3">
      <SgInputNumber id="a" label="Entrada 1" decimals={2} inputProps={{ ref: refA }} />
      <SgInputNumber id="b" label="Entrada 2" decimals={2} inputProps={{ ref: refB }} />
      <SgInputNumber id="c" label="Entrada 3" decimals={2} inputProps={{ ref: refC }} />
      <SgButton type="button" size="sm" appearance="outline" onClick={handleSave}>
        Salvar
      </SgButton>
    </div>
  );
}
```

### 14) 

Exemplo sem formulário com onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/eventos-standalone.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputNumber
      id="demo-events"
      label="Digite e acompanhe"
      required
      decimals={2}
      onChange={(v) => console.log("onChange:", v)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(msg) => console.log("validation:", msg)}
    />
  );
}
```

### 15) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/largura-e-borda.tsx.sample`

```tsx
import { SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgInputNumber id="demo-w200" label="Width 200" width={200} name="w200" decimals={2} />
      <SgInputNumber id="demo-w300" label="Width 300 + rounded" width={300} borderRadius={20} name="w300" decimals={2} />
    </>
  );
}
```

### 16) 

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-number/samples/posicao-do-rotulo.tsx.sample`

```tsx
import { SgGrid, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputNumber
        id="sg-input-number-label-float"
        label="Float"
        labelPosition="float"
      />
      <SgInputNumber
        id="sg-input-number-label-top"
        label="Top"
        labelPosition="top"
      />
      <SgInputNumber
        id="sg-input-number-label-left"
        label="Left"
        labelPosition="left"
        labelWidth={140}
        labelAlign="end"
      />
    </SgGrid>
  );
}
```

## SgInputCurrency

Página: `sg-input-currency/page.tsx` (15 exemplo(s) com código na página; abaixo 15).

### 1) 

Exemplo integrado com React Hook Form usando register (uncontrolled).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/basico.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      total: "0.00"
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))} className="w-80 space-y-2">
      <SgInputCurrency id="demo-basic" label="Valor" name="total" register={register} currency="BRL" />
      <SgButton type="submit" size="sm" appearance="outline">
        Enviar
      </SgButton>
      <p>Valor atual: "{watch("total")}"</p>
    </form>
  );
}
```

### 2) 

Valida ao perder o foco (validateOnBlur=true por padrão).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/obrigatorio.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <>
      <SgInputCurrency id="demo-required" label="Obrigatório" required name="required" register={register} currency="BRL" />
      <SgInputCurrency
        id="demo-required-custom"
        label="Mensagem customizada"
        required
        requiredMessage="Informe um valor monetário."
        name="requiredCustom"
        register={register}
        currency="BRL"
      />
    </>
  );
}
```

### 3) 

Use quando precisa do valor em tempo real e de setValue externos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/controlado.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgGrid, SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      controlled: "1234.50"
    }
  });

  return (
    <div className="w-96 space-y-3">
      <SgInputCurrency id="demo-controlled" label="Controlado" name="controlled" control={control} currency="BRL" />

      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => setValue("controlled", "12345.00")}>Set API</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue("controlled", "0.00")}>Reset</SgButton>
        <SgButton size="sm" appearance="outline" severity="danger" onClick={() => setValue("controlled", "")}>Limpar</SgButton>
      </SgGrid>

      <p>Estado atual: "{watch("controlled")}"</p>
    </div>
  );
}
```

### 4) 

Função de validação retorna mensagem ou null.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/validacao-customizada.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgInputCurrency
      id="demo-validation"
      label="Mínimo"
      name="validation"
      register={register}
      currency="BRL"
      validation={(value) => {
        return value !== null && value >= 1000 ? null : "O valor deve ser maior ou igual a 1000.";
      }}
      onValidation={(msg) => console.log(msg)}
    />
  );
}
```

### 5) 

O display muda conforme currency + locale.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/moeda.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <>
      <SgInputCurrency id="demo-brl" label="BRL" name="brl" register={register} currency="BRL" locale="pt-BR" />
      <SgInputCurrency id="demo-usd" label="USD" name="usd" register={register} currency="USD" locale="en-US" />
      <SgInputCurrency id="demo-eur" label="EUR" name="eur" register={register} currency="EUR" locale="pt-PT" />
    </>
  );
}
```

### 6) 

Mostre/oculte símbolo e altere o posicionamento.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/simbolo.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <>
      <SgInputCurrency
        id="demo-no-symbol"
        label="Sem símbolo"
        name="noSymbol"
        register={register}
        currency="BRL"
        showCurrencySymbol={false}
      />
      <SgInputCurrency
        id="demo-code"
        label="Código no sufixo"
        name="codeSuffix"
        register={register}
        currency="USD"
        currencyDisplay="code"
        currencySymbolPlacement="suffix"
      />
    </>
  );
}
```

### 7) 

iconButtons recebe um array de ReactNode.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/botoes-de-icone.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputCurrency } from "@seedgrid/fe-components";

function CopyIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
}

function BellIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}

export default function Example() {
  const { register, watch } = useForm({
    defaultValues: { iconbtns: "9876.54" }
  });

  const value = watch("iconbtns") ?? "";

  return (
    <SgInputCurrency
      id="demo-iconbtns"
      label="Copiar valor"
      name="iconbtns"
      register={register}
      currency="BRL"
      iconButtons={[
        <SgButton key="copy" type="button" iconOnly size="sm" appearance="ghost" onClick={() => navigator.clipboard.writeText(value)} leftIcon={<CopyIcon />} />,
        <SgButton key="alert" type="button" iconOnly size="sm" appearance="ghost" onClick={() => console.log("alerta")} leftIcon={<BellIcon />} />
      ]}
    />
  );
}
```

### 8) 

Bloqueia o sinal de menos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/sem-negativos.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgInputCurrency
      id="demo-no-negative"
      label="Somente positivo"
      name="positivo"
      register={register}
      allowNegative={false}
      currency="BRL"
    />
  );
}
```

### 9) 

decimals=0 (apenas inteiro com separador de milhar).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/sem-decimais.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgInputCurrency
      id="demo-no-decimals"
      label="Quantidade"
      name="inteiro"
      register={register}
      decimals={0}
      currency="BRL"
    />
  );
}
```

### 10) 

Valida intervalo numérico.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/minimo-e-maximo.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgInputCurrency
      id="demo-minmax"
      label="Min e max"
      name="minmax"
      register={register}
      minValue={10}
      maxValue={100}
      currency="BRL"
    />
  );
}
```

### 11) 

emptyValueIsNull permite limpar totalmente (o valor passa a ser null em vez de 0).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/valor-vazio.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgInputCurrency
      id="demo-empty"
      label="Pode ficar vazio"
      name="vazio"
      register={register}
      emptyValueIsNull
      currency="BRL"
    />
  );
}
```

### 12) 

Sem borda (withBorder=false) e preenchido (filled=true).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/variacoes-visuais.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <>
      <SgInputCurrency id="demo-noborder" label="Sem borda" withBorder={false} name="noborder" register={register} currency="BRL" />
      <SgInputCurrency id="demo-filled" label="Filled" filled name="filled" register={register} currency="BRL" />
    </>
  );
}
```

### 13) 

Exemplo 100% standalone com default no load e botão salvar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/standalone.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const refA = React.useRef<HTMLInputElement | null>(null);
  const refB = React.useRef<HTMLInputElement | null>(null);
  const refC = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (refA.current) refA.current.value = "1200.00";
    if (refB.current) refB.current.value = "55.90";
    if (refC.current) refC.current.value = "980.00";
  }, []);

  const handleSave = () => {
    const payload = {
      a: refA.current?.value ?? "",
      b: refB.current?.value ?? "",
      c: refC.current?.value ?? ""
    };
    console.log("Salvar:", payload);
  };

  return (
    <div className="space-y-3">
      <SgInputCurrency id="a" label="Entrada 1" currency="BRL" inputProps={{ ref: refA }} />
      <SgInputCurrency id="b" label="Entrada 2" currency="BRL" inputProps={{ ref: refB }} />
      <SgInputCurrency id="c" label="Entrada 3" currency="BRL" inputProps={{ ref: refC }} />
      <SgButton type="button" size="sm" appearance="outline" onClick={handleSave}>
        Salvar
      </SgButton>
    </div>
  );
}
```

### 14) 

Exemplo sem formulário com onEnter, onExit, onChange, onClear, onValidation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/eventos.tsx.sample`

```tsx
import React from "react";
import { SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgInputCurrency
      id="demo-events"
      label="Digite e acompanhe"
      required
      currency="BRL"
      onChange={(v) => console.log("onChange:", v)}
      onEnter={() => console.log("focus")}
      onExit={() => console.log("blur")}
      onClear={() => console.log("cleared")}
      onValidation={(msg) => console.log("validation:", msg)}
    />
  );
}
```

### 15) 

width e borderRadius customizáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-currency/samples/largura-e-borda.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgGrid, SgInputCurrency } from "@seedgrid/fe-components";

export default function Example() {
  const { register } = useForm();

  return (
    <SgGrid columns={{ base: 1, sm: 2 }} gap={16}>
      <SgInputCurrency id="demo-w200" label="Width 200" width={200} name="w200" register={register} currency="BRL" />
      <SgInputCurrency id="demo-w300" label="Width 300 rounded" width={300} borderRadius={20} name="w300" register={register} currency="BRL" />
    </SgGrid>
  );
}
```

## CRUD com valores da API (número, moeda e data/hora)

Exemplo da KB (não é do showcase: o exemplo de CRUD do showcase é da sessão `front` e ainda não existe). Mostra o ciclo carregar da API, editar e salvar com `react-hook-form` e `control`, que é o padrão do CRUD. O código **compila** contra o `fe-components` local (`tsc --noEmit` sobre `src/index.ts`, 2026-11-12, HEAD `4b150cc`); **não foi executado no navegador**.

O que o exemplo mostra:

- **Carregar:** `reset(registro)` entrega os valores da API ao formulário e vira o novo valor inicial (`isDirty` volta a `false`). Número aceita número ou texto (`12.5` ou `"12,5"`); a data/hora aceita `local`, `utc` ou `offset`. Atribua **número** nos campos numéricos: o formulário guarda o que foi atribuído e só a edição do usuário grava número.
- **Editar:** `quantidade` e `preco` voltam como `number` (`preco` é `null` com `emptyValueIsNull` e campo vazio); `entregaEm` volta como `Instant` em UTC (`2026-01-15T13:30:00Z`, `valueMode="utc"` com `timeZone="America/Sao_Paulo"`, então o usuário vê 10:30) e `""` quando vazio.
- **`validation` recebe `number | null`:** em `quantidade` (vazio chega como `0`) e em `preco` (vazio chega como `null`, serve de "obrigatório").
- **Salvar:** o payload sai no tipo certo; para o JSON, troque `""` por `null` (`values.entregaEm || null`). No Java, `entregaEm` lê com `Instant.parse(...)` e `quantidade`/`preco` como `BigDecimal` ou `double` (o número é um `double`: precisão para 2 casas, não para cripto).
- **Sem `useState` na página:** o estado fica no `react-hook-form` (`formState.isDirty`, `watch()`).

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgGrid, SgInputCurrency, SgInputDateTime, SgInputNumber, SgInputText } from "@seedgrid/fe-components";

// O que a API devolve no JSON: número é número e a data/hora é um Instant em UTC.
type Pedido = { descricao: string; quantidade: number; preco: number | null; entregaEm: string | null };

// O que o formulário guarda: número, número (ou null) e texto ("" quando a data/hora está vazia).
type PedidoForm = { descricao: string; quantidade: number; preco: number | null; entregaEm: string };

// API simulada (troque por fetch).
async function carregarPedido(): Promise<Pedido> {
  return { descricao: "Cadeira de escritório", quantidade: 12.5, preco: 1234.56, entregaEm: "2026-01-15T13:30:00Z" };
}

async function salvarPedido(pedido: Pedido): Promise<void> {
  console.log("PUT /pedidos/1", JSON.stringify(pedido));
}

export default function Example() {
  const { control, handleSubmit, reset, watch, formState } = useForm<PedidoForm>({
    defaultValues: { descricao: "", quantidade: 0, preco: null, entregaEm: "" }
  });

  // Carregar: reset(registro) vira o novo valor inicial; número e texto ("37,5") são aceitos, a data/hora em qualquer formato.
  React.useEffect(() => {
    carregarPedido().then((pedido) =>
      reset({ descricao: pedido.descricao, quantidade: pedido.quantidade, preco: pedido.preco, entregaEm: pedido.entregaEm ?? "" })
    );
  }, [reset]);

  // Salvar: os valores já saem no tipo certo (number, number | null, Instant em UTC).
  const salvar = handleSubmit(async (values) => {
    await salvarPedido({
      descricao: values.descricao,
      quantidade: values.quantidade,
      preco: values.preco,
      entregaEm: values.entregaEm || null
    });
    reset(values);
  });

  return (
    <form className="w-96 space-y-3" onSubmit={salvar}>
      <SgInputText id="crud-descricao" label="Descrição" name="descricao" control={control} required />
      <SgInputNumber
        id="crud-quantidade"
        label="Quantidade"
        name="quantidade"
        control={control}
        decimals={1}
        validation={(value) => (value !== null && value > 0 ? null : "A quantidade deve ser maior que zero")}
      />
      <SgInputCurrency
        id="crud-preco"
        label="Preço"
        name="preco"
        control={control}
        currency="BRL"
        emptyValueIsNull
        validation={(value) => (value === null ? "Informe o preço" : null)}
      />
      <SgInputDateTime
        id="crud-entrega"
        label="Entrega"
        name="entregaEm"
        control={control}
        timeZone="America/Sao_Paulo"
        valueMode="utc"
        required
      />
      <SgGrid columns={{ base: 2 }} gap={8}>
        <SgButton type="submit" size="sm" appearance="outline">Salvar</SgButton>
        <SgButton type="button" size="sm" appearance="outline" onClick={() => carregarPedido().then((p) => reset({ descricao: p.descricao, quantidade: p.quantidade, preco: p.preco, entregaEm: p.entregaEm ?? "" }))}>
          Recarregar
        </SgButton>
      </SgGrid>
      <p className="text-xs text-muted-foreground">Alterado: {formState.isDirty ? "sim" : "não"}</p>
      <pre className="text-xs">{JSON.stringify(watch(), null, 2)}</pre>
    </form>
  );
}
```

Equivalente em Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos#CRUD com valores da API (número, moeda e data/hora)|CRUD no Flutter]]. Props e regras: [[SeedGrid/SeedGrid-components/inputs-texto/API#SgInputNumber|SgInputNumber]], [[SeedGrid/SeedGrid-components/inputs-texto/API#SgInputCurrency|SgInputCurrency]] e [[SeedGrid/SeedGrid-components/inputs-midia/API#Formato do valor (`valueMode`)|SgInputDateTime]].

## SgInputOTP

Página: `sg-input-otp/page.tsx` (7 exemplo(s) com código na página; abaixo 7).

### 1) 

Seis dígitos. Digitar avança, Backspace volta, setas movem, e colar o código inteiro distribui nos campos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  const [masked, setMasked] = React.useState("");
  const [raw, setRaw] = React.useState("");

  return (
    <div className="space-y-3">
      <SgInputOTP
        id="otp-basic"
        label="Código OTP"
        hintText="Digite os 6 dígitos"
        onChange={setMasked}
        onRawChange={setRaw}
      />

      <div className="rounded border border-border bg-muted/40 p-3 text-xs">
        <div><strong>masked:</strong> {masked || "(vazio)"}</div>
        <div><strong>raw:</strong> {raw || "(vazio)"}</div>
      </div>
    </div>
  );
}
```

### 2) 

9 = dígito, # = letra ou dígito, qualquer outro caractere é separador. onChange recebe o valor com separador e onRawChange, sem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/mascara-customizada.tsx.sample`

```tsx
import * as React from "react";
import { SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  const [masked, setMasked] = React.useState("");
  const [raw, setRaw] = React.useState("");

  return (
    <div className="space-y-3">
      <SgInputOTP
        id="otp-mask"
        label="Token de acesso"
        hintText="Formato: ###-###-99"
        mask="###-###-99"
        onChange={setMasked}
        onRawChange={setRaw}
      />

      <div className="rounded border border-border bg-muted/40 p-3 text-xs">
        <div><strong>masked:</strong> {masked || "(vazio)"}</div>
        <div><strong>raw:</strong> {raw || "(vazio)"}</div>
      </div>
    </div>
  );
}
```

### 3) 

Cole um OTP e receba callback ao completar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/colagem-on-complete.tsx.sample`

```tsx
import * as React from "react";
import { SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  const [masked, setMasked] = React.useState("");
  const [raw, setRaw] = React.useState("");
  const [completeValue, setCompleteValue] = React.useState("");

  return (
    <div className="space-y-3">
      <SgInputOTP
        id="otp-paste"
        label="Cole o código"
        hintText='Teste colando: "AB1-CD2-34"'
        mask="###-###-99"
        onChange={setMasked}
        onRawChange={setRaw}
        onComplete={(value) => setCompleteValue(value)}
      />

      <div className="rounded border border-border bg-muted/40 p-3 text-xs">
        <div><strong>masked:</strong> {masked || "(vazio)"}</div>
        <div><strong>raw:</strong> {raw || "(vazio)"}</div>
        <div><strong>onComplete:</strong> {completeValue || "(aguardando)"}</div>
      </div>
    </div>
  );
}
```

### 4) 

Focar, limpar e ler valores via API do ref.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/acesso-por-ref.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgGrid, SgInputOTP, type SgInputOTPRef } from "@seedgrid/fe-components";

export default function App() {
  const otpRef = React.useRef<SgInputOTPRef | null>(null);
  const [readout, setReadout] = React.useState('Clique em "Ler conteúdo".');

  return (
    <div className="space-y-3">
      <SgInputOTP
        id="otp-ref"
        ref={otpRef}
        label="OTP por controle"
        hintText="Use os botões abaixo"
        mask="###-###-99"
      />

      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => otpRef.current?.focus()}>
          Focar
        </SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => otpRef.current?.clear()}>
          Limpar
        </SgButton>
        <SgButton
          size="sm"
          appearance="outline"
          onClick={() => {
            const masked = otpRef.current?.getMaskedValue() ?? "";
            const raw = otpRef.current?.getRawValue() ?? "";
            const empty = "(vazio)";
            setReadout(`masked="${masked || empty}" | raw="${raw || empty}"`);
          }}
        >
          Ler conteúdo
        </SgButton>
      </SgGrid>

      <div className="rounded border border-border bg-muted/40 p-3 text-xs">
        <strong>saída:</strong> {readout}
      </div>
    </div>
  );
}
```

### 5) 

Obrigatório e validação própria (recebe o valor sem e com separador). A mensagem aparece ao sair do campo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/validacao.tsx.sample`

```tsx
import * as React from "react";
import { SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputOTP
      id="otp-validation"
      label="Código de convite"
      mask="99-99"
      required
      requiredMessage="Informe o código."
      validation={(raw) => (raw.length < 4 ? "O código tem 4 dígitos." : null)}
    />
  );
}
```

### 6) 

O formulário guarda o valor sem separador.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  const [confirmed, setConfirmed] = React.useState("");
  const { control, handleSubmit } = useForm<{ code: string }>({ defaultValues: { code: "" } });

  return (
    <form className="space-y-3" onSubmit={handleSubmit((values) => setConfirmed(values.code))}>
      <SgInputOTP
        id="otp-form"
        name="code"
        control={control}
        label="Código"
        mask="9999"
        required
        requiredMessage="Informe o código."
      />
      <SgButton type="submit">Confirmar</SgButton>
      {confirmed ? <p className="text-sm">Confirmado: {confirmed}</p> : null}
    </form>
  );
}
```

### 7) 

Erro externo, desabilitado e somente leitura.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-input-otp/samples/estados.tsx.sample`

```tsx
import * as React from "react";
import { SgInputOTP } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="space-y-4">
      <SgInputOTP id="otp-error" label="Com erro" mask="9999" defaultValue="1234" error="Código expirado." />
      <SgInputOTP id="otp-disabled" label="Desabilitado" mask="9999" defaultValue="12" enabled={false} />
      <SgInputOTP id="otp-readonly" label="Somente leitura" mask="9999" defaultValue="9876" readOnly />
    </div>
  );
}
```
