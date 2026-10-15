---
tags: [seedgrid, component, frontend, react, inputs-texto, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Inputs de texto: exemplos

Todos os exemplos foram conferidos contra os tipos descritos em [[SeedGrid/SeedGrid-components/inputs-texto/API|API dos inputs de texto]]. Os que vêm do showcase indicam o arquivo de origem, relativo a `front/seedgrid-fe-components/apps/showcase/src/app/components/`. Cada componente também tem página no showcase em `/components/<slug>` (campo `showcase.route` dos `*.meta.ts`). Os exemplos não foram compilados nem executados nesta análise. A conferência foi feita contra os tipos.

## Configuração de idioma (recomendada)

Sem provider, as mensagens saem em `en-US`, que é o padrão do i18n global. **Confirmado**.

```tsx
import { SgComponentsI18nProvider } from "@seedgrid/fe-components";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SgComponentsI18nProvider locale="pt-BR">{children}</SgComponentsI18nProvider>;
}
```

## SgInputText com `register`

Fonte: `sg-input-text/samples/basico-rhf.tsx.sample`.

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

## SgInputText com `control` e validação

Baseado em `sg-input-text/samples/controlado.tsx.sample`, com `required`/`minLength` acrescentados. As props usadas estão confirmadas no tipo.

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputText } from "@seedgrid/fe-components";

export default function App() {
  const { control, handleSubmit } = useForm({ defaultValues: { cliente: "" } });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <SgInputText
        id="cliente"
        label="Cliente"
        name="cliente"
        control={control}
        required
        minLength={3}
        showCharCounter
        maxLength={60}
      />
      <SgButton type="submit">Salvar</SgButton>
    </form>
  );
}
```

## SgInputTextArea

Fonte: `sg-input-text-area/samples/minimo-de-linhas.tsx.sample`.

```tsx
import * as React from "react";
import { SgInputTextArea } from "@seedgrid/fe-components";

export default function App() {
  return <SgInputTextArea id="demo-minlines" label="Min 3 linhas" minLines={3} minLinesMessage="Digite ao menos 3 linhas" />;
}
```

## SgInputTextSearch (debounce)

Fonte: `sg-input-text-search/samples/minchars-e-debounce.tsx.sample`.

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

## SgInputEmail

Fonte: `sg-input-email/samples/basico.tsx.sample`. `blockedEmailDomains` foi acrescentado (prop confirmada).

```tsx
import * as React from "react";
import { SgInputEmail } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgInputEmail
      id="email"
      label="E-mail"
      hintText="name@domain.com"
      blockedEmailDomains={["exemplo-temporario.com"]}
      onChange={(value) => console.log(value)}
    />
  );
}
```

## SgInputPassword com política e gerador

Baseado em `sg-input-password/samples/basico.tsx.sample`, com props de política acrescentadas. Observe que o `maxLength` padrão é 15, e por isso aqui ele é aumentado.

```tsx
import * as React from "react";
import { SgInputPassword } from "@seedgrid/fe-components";

export default function App() {
  const [senha, setSenha] = React.useState("");
  return (
    <div className="w-80">
      <SgInputPassword
        id="senha"
        label="Senha"
        minSize={10}
        maxLength={64}
        specialCharacterRequired={false}
        createNewPasswordButton
        newPasswordLength={16}
        onChange={setSenha}
        onValidation={(msg) => console.log("primeira regra pendente:", msg)}
      />
      <p className="mt-2 text-xs">Tamanho atual: {senha.length}</p>
    </div>
  );
}
```

## Documentos brasileiros

Fontes: `sg-input-cpf/samples/basico.tsx.sample`, `sg-input-cnpj/samples/cnpj-publico.tsx.sample`, `sg-input-cpf-cnpj/samples/basico.tsx.sample` e `sg-input-phone/samples/basico.tsx.sample`, combinados em um formulário.

```tsx
import * as React from "react";
import { SgInputCNPJ, SgInputCPF, SgInputCPFCNPJ, SgInputPhone } from "@seedgrid/fe-components";

export default function App() {
  return (
    <>
      <SgInputCPF id="cpf" label="CPF" hintText="000.000.000-00" onChange={(value) => console.log(value)} />
      <SgInputCNPJ
        id="cnpj"
        label="CNPJ"
        hintText="00.000.000/0000-00"
        validateWithPublicaCnpj
        publicaCnpjErrorMessage="CNPJ nao encontrado"
        onPublicaCnpjResult={(data) => console.log(data)}
        onPublicaCnpjError={(error) => console.log(error)}
      />
      <SgInputCPFCNPJ id="doc" label="CPF ou CNPJ" required />
      <SgInputPhone id="telefone" label="Telefone" hintText="(11) 99999-0000" />
    </>
  );
}
```

`validateWithPublicaCnpj` faz uma chamada HTTP real a `publica.cnpj.ws`. Em testes, passe `publicaCnpjFetch={async () => ({ ok: true })}`.

## SgInputPostalCode com ViaCEP

Fonte: `sg-input-postal-code/samples/viacep.tsx.sample`.

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

## SgInputDate e SgInputBirthDate

Fontes: `sg-input-date/samples/intervalo.tsx.sample` e `sg-input-birth-date/samples/intervalo.tsx.sample`.

```tsx
import * as React from "react";
import { SgInputBirthDate, SgInputDate } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputDate id="demo-range" label="Periodo" minDate="2020-01-01" maxDate="2030-12-31" />
      <SgInputBirthDate id="demo-birth" label="Data de nascimento" minAge={12} maxAge={80} />
    </div>
  );
}
```

Sempre informe `minAge` e/ou `maxAge` no `SgInputBirthDate`. Sem eles, qualquer data gera erro de configuração.

## SgInputNumber e SgInputCurrency com `control`

`SgInputCurrency` vem de `sg-input-currency/samples/controlado.tsx.sample`. O `SgInputNumber` foi acrescentado no mesmo formulário: os samples `basico`/`controlado` dele no showcase não têm `useForm`.

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgGrid, SgInputCurrency, SgInputNumber } from "@seedgrid/fe-components";

export default function Example() {
  const { control, watch, setValue } = useForm({
    defaultValues: { quantidade: "1.000", controlled: "1234.50" }
  });

  return (
    <div className="w-96 space-y-3">
      <SgInputNumber id="qtd" label="Quantidade" name="quantidade" control={control} decimals={3} minValue={0} allowNegative={false} />
      <SgInputCurrency id="demo-controlled" label="Controlado" name="controlled" control={control} currency="BRL" />

      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => setValue("controlled", "12345.00")}>Set API</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue("controlled", "0.00")}>Reset</SgButton>
        <SgButton size="sm" appearance="outline" severity="danger" onClick={() => setValue("controlled", "")}>Limpar</SgButton>
      </SgGrid>

      <p>Estado atual: "{watch("controlled")}" / qtd "{watch("quantidade")}"</p>
    </div>
  );
}
```

O valor do formulário é uma **string canônica** (`"1234.50"`). Converta com `Number(...)` ao enviar.

## SgInputOTP com ref

Fonte: `sg-input-otp/samples/acesso-por-ref.tsx.sample`.

```tsx
import * as React from "react";
import { SgButton, SgGrid, SgInputOTP, type SgInputOTPRef } from "@seedgrid/fe-components";

export default function App() {
  const otpRef = React.useRef<SgInputOTPRef | null>(null);
  const [readout, setReadout] = React.useState('Clique em "Ler conteudo".');

  return (
    <div className="space-y-3">
      <SgInputOTP id="otp-ref" ref={otpRef} label="OTP por ref" hintText="Use os botoes abaixo" mask="###-###-99" />

      <SgGrid columns={{ base: 1, sm: 3 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => otpRef.current?.focus()}>Focar</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => otpRef.current?.clear()}>Limpar</SgButton>
        <SgButton
          size="sm"
          appearance="outline"
          onClick={() => {
            const masked = otpRef.current?.getMaskedValue() ?? "";
            const raw = otpRef.current?.getRawValue() ?? "";
            setReadout(`masked="${masked || "(vazio)"}" | raw="${raw || "(vazio)"}"`);
          }}
        >
          Ler conteudo
        </SgButton>
      </SgGrid>

      <div className="rounded border border-border bg-muted/40 p-3 text-xs">
        <strong>saida:</strong> {readout}
      </div>
    </div>
  );
}
```

`onComplete` está em `sg-input-otp/samples/colagem-on-complete.tsx.sample`: `onChange` entrega o valor mascarado, `onRawChange` o bruto e `onComplete` dispara quando todos os slots estão cheios.
