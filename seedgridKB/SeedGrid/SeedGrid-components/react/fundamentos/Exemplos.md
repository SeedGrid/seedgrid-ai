---
tags: [seedgrid, front, component, fundamentos, exemplos]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components; front/seedgrid-fe-components/apps/showcase/src/app/samples
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Fundamentos (utilitários, i18n, tema), validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — fundamentos do `@seedgrid/fe-components` — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos — Fundamentos (utilitários, i18n, tema) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Referência: [[SeedGrid/SeedGrid-components/fundamentos/API|API dos utilitários]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Visão geral]].

Cada exemplo indica a fonte. Os exemplos 2, 3, 4 e 5 são cópia 1:1 do `.sample` do showcase (o 2 vem da página de tema, os 3, 4 e 5 da página inicial, em `apps/showcase/src/app/samples/`), regenerados por script em 2026-11-09 a partir do código `0f304bb`. Os exemplos 9 e 10 reúnem **todos** os exemplos das páginas `SgComponentsI18nProvider` e `useComponentsI18n` do showcase, cada bloco copiado 1:1 do `.sample`. Os exemplos 6 e 7 foram compilados com `tsc --strict` contra o código-fonte do pacote (2026-11-07); o 1 vem do README e do `package.json` do pacote; o 8 descreve a rota real do showcase. Nenhum bloco foi compilado nesta rodada.

## 1. Instalação e estilos

Fonte: `packages/seedgrid-fe-components/README.md` (comando) e `exports["./style.css"]` do `package.json` do pacote.

```bash
pnpm add @seedgrid/fe-components @seedgrid/fe-theme react-hook-form lucide-react
```

```tsx
// Opcional: CSS estático em vez da injeção automática via JS
import "@seedgrid/fe-components/style.css";
import { SgInputText } from "@seedgrid/fe-components";
```

## 2. Tema no layout raiz (Next.js App Router)

Fonte: `apps/showcase/src/app/theme/samples/setup-basico.tsx.sample` (cópia 1:1). O layout real do showcase (`apps/showcase/src/app/layout.tsx`) usa `suppressHydrationWarning` no `<html>`, porque o tema `auto`/persistido é resolvido no client (comentário no arquivo).

```tsx
import { SeedThemeProvider } from "@seedgrid/fe-theme";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <SeedThemeProvider
          initialTheme={{
            seed: "#16803D",
            mode: "auto",
            radius: 8,
            persistMode: true,
          }}
          applyTo="html"
        >
          {children}
        </SeedThemeProvider>
      </body>
    </html>
  );
}
```

## 3. i18n global (fora do React)

Fonte: `apps/showcase/src/app/samples/set-components-i18n.tsx.sample` (cópia 1:1).

```tsx
import { setComponentsI18n } from "@seedgrid/fe-components";

setComponentsI18n({
  locale: "en-US",
  messages: {
    "components.inputs.required": "Required field.",
    "components.password.common": "Password is too common."
  }
});
```

## 4. i18n por provider

Fonte: `apps/showcase/src/app/samples/i18n-provider-root-layout.tsx.sample` (cópia 1:1).

```tsx
import { SgComponentsI18nProvider } from "@seedgrid/fe-components";

const messagesEn = {
  "components.inputs.required": "Required field.",
  "components.inputs.email.invalid": "Invalid email."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <body>
        <SgComponentsI18nProvider locale="en-US" messages={messagesEn}>
          {children}
        </SgComponentsI18nProvider>
      </body>
    </html>
  );
}
```

Para português: `locale="pt-BR"` já carrega o catálogo embutido; `messages` só sobrescreve chaves.

## 5. Formulário com React Hook Form

Fonte: `apps/showcase/src/app/samples/react-hook-form-basico.tsx.sample` (cópia 1:1; trecho, `onSubmit` é uma função sua).

```tsx
import { useForm } from "react-hook-form";
import { SgInputEmail, SgInputText } from "@seedgrid/fe-components";

const { register, handleSubmit } = useForm({
  defaultValues: { nome: "", email: "" }
});

<form onSubmit={handleSubmit(onSubmit)}>
  <SgInputText
    id="nome"
    name="nome"
    register={register}
    label="Nome"
    required
    requiredMessage="Informe o nome."
  />

  <SgInputEmail
    id="email"
    name="email"
    register={register}
    label="Email"
    required
  />
</form>;
```

## 6. Máscaras e validadores em código próprio

Compilado com `tsc --strict` contra `src/index.ts` (exports de `src/masks.ts` e `src/validators.ts`); os resultados comentados foram conferidos lendo as funções.

```ts
import {
  maskCpfCnpj, maskPhone, maskPostalCodeBR,
  isValidCpf, isValidCnpj, validatePassword, validateBirthDate, isBlockedEmailDomain
} from "@seedgrid/fe-components";

const valorDigitado = "11222333000181";
maskCpfCnpj("12345678901");      // "123.456.789-01"
maskPhone("11987654321");        // "(11) 98765-4321"
maskPostalCodeBR("01001000");    // "01001-000"

isValidCpf("123.456.789-09");    // boolean (checa DV)
isValidCnpj(valorDigitado);      // aceita CNPJ numérico ou alfanumérico; os 2 DV devem ser numéricos

// null = ok; string = mensagem i18n com os motivos
const erroSenha: string | null = validatePassword("abc", { minSize: 10, special: false });
const erroNascimento: string | null = validateBirthDate("2010-05-01", { minAge: 18 });

isBlockedEmailDomain("x@yopmail.com");                 // true (lista padrão)
isBlockedEmailDomain("x@empresa.com", ["empresa.com"]); // true (lista extra)
```

## 7. Domínios bloqueados em runtime (global)

Compilado com `tsc --strict`. Vem de `getRuntimeBlockedEmailDomains()` em `src/validators.ts`: não há setter exportado; o app atribui a global.

```ts
(globalThis as { __seedgridBlockedEmailDomains?: string[] }).__seedgridBlockedEmailDomains = [
  "dominio-descartavel.example"
];
```

## 8. Consumo do manifesto de IA

Fonte: `apps/showcase/src/app/api/ai-manifest/route.ts` — lê `packages/seedgrid-fe-components/dist/ai/seedgrid-components.manifest.json` e devolve em `GET /api/ai-manifest` (`cache-control: no-store`; 404 `{"error":"AI manifest not available"}` se ausente).

## 9. SgComponentsI18nProvider (página do showcase)

Página `/components/providers/sg-components-i18n-provider`.

### Uso básico

Envolva o app com SgComponentsI18nProvider passando o locale e as mensagens do idioma desejado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-components-i18n-provider/samples/uso-basico.tsx.sample`

```tsx
import {
  SgComponentsI18nProvider,
  SgGrid,
  componentsMessagesEnUs,
  tComponents,
  useComponentsI18n,
} from "@seedgrid/fe-components";

function Mensagens() {
  const i18n = useComponentsI18n();

  return (
    <SgGrid gap={4} className="rounded-lg border border-border bg-foreground/5 p-4 font-mono text-sm">
      <span>locale: {i18n.locale}</span>
      <span>components.actions.clear: {tComponents(i18n, "components.actions.clear")}</span>
      <span>components.password.show: {tComponents(i18n, "components.password.show")}</span>
      <span>components.inputs.required: {tComponents(i18n, "components.inputs.required")}</span>
    </SgGrid>
  );
}

export default function App() {
  return (
    <SgComponentsI18nProvider locale="en-US" messages={componentsMessagesEnUs}>
      <Mensagens />
    </SgComponentsI18nProvider>
  );
}
```

### Troca dinâmica de locale

Altere o locale em runtime. Os componentes re-renderizam automaticamente com as novas mensagens.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-components-i18n-provider/samples/troca-dinamica-de-locale.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgComponentsI18nProvider,
  SgGrid,
  componentsMessagesEnUs,
  componentsMessagesEs,
  componentsMessagesFr,
  componentsMessagesPtBr,
  componentsMessagesPtPt,
  tComponents,
  useComponentsI18n,
} from "@seedgrid/fe-components";

const LOCALES = {
  "pt-BR": componentsMessagesPtBr,
  "pt-PT": componentsMessagesPtPt,
  "en-US": componentsMessagesEnUs,
  es: componentsMessagesEs,
  fr: componentsMessagesFr,
};

type LocaleId = keyof typeof LOCALES;

function Mensagens() {
  const i18n = useComponentsI18n();

  return (
    <SgGrid gap={4} className="rounded-lg border border-border bg-foreground/5 p-4 font-mono text-sm">
      <span>locale: {i18n.locale}</span>
      <span>components.actions.clear: {tComponents(i18n, "components.actions.clear")}</span>
      <span>components.password.show: {tComponents(i18n, "components.password.show")}</span>
      <span>components.inputs.required: {tComponents(i18n, "components.inputs.required")}</span>
    </SgGrid>
  );
}

export default function App() {
  const [locale, setLocale] = React.useState<LocaleId>("pt-BR");

  return (
    <SgGrid gap={12}>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LOCALES) as LocaleId[]).map((id) => (
          <SgButton
            key={id}
            size="sm"
            appearance={id === locale ? "solid" : "outline"}
            onClick={() => setLocale(id)}
          >
            {id}
          </SgButton>
        ))}
      </div>
      <SgComponentsI18nProvider locale={locale} messages={LOCALES[locale]}>
        <Mensagens />
      </SgComponentsI18nProvider>
    </SgGrid>
  );
}
```

### API imperativa (setComponentsI18n)

Alternativa ao Provider. Útil para definir o idioma antes de montar a árvore de componentes.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-components-i18n-provider/samples/api-imperativa-setcomponentsi18n.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgGrid,
  getComponentsI18n,
  setComponentsI18n,
  tComponents,
} from "@seedgrid/fe-components";

export default function App() {
  const [resultado, setResultado] = React.useState("");

  const aplicar = (locale: string) => {
    const anterior = getComponentsI18n();

    setComponentsI18n({ locale });
    const atual = getComponentsI18n();
    setResultado(`${atual.locale}: ${tComponents(atual, "components.actions.clear")}`);

    // Devolve o estado global anterior para nao afetar o restante da pagina.
    setComponentsI18n({ locale: anterior.locale, messages: anterior.messages });
  };

  return (
    <SgGrid gap={12}>
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" onClick={() => aplicar("es")}>
          es
        </SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => aplicar("fr")}>
          fr
        </SgButton>
      </div>
      <span className="font-mono text-sm">{resultado || "-"}</span>
    </SgGrid>
  );
}
```

### Sobrescrita de mensagens

Sobrescreva apenas as chaves que deseja customizar. Mescle suas mensagens com o objeto built-in do locale.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-components-i18n-provider/samples/sobrescrita-de-mensagens.tsx.sample`

```tsx
import {
  SgComponentsI18nProvider,
  SgGrid,
  componentsMessagesEnUs,
  tComponents,
  useComponentsI18n,
} from "@seedgrid/fe-components";

const meusTextos = {
  "components.actions.clear": "Reset",
  "components.password.show": "Reveal",
  "components.inputs.required": "Mandatory field.",
};

function Mensagens() {
  const i18n = useComponentsI18n();

  return (
    <SgGrid gap={4} className="rounded-lg border border-border bg-foreground/5 p-4 font-mono text-sm">
      <span>locale: {i18n.locale}</span>
      <span>components.actions.clear: {tComponents(i18n, "components.actions.clear")}</span>
      <span>components.password.show: {tComponents(i18n, "components.password.show")}</span>
      <span>components.inputs.required: {tComponents(i18n, "components.inputs.required")}</span>
    </SgGrid>
  );
}

export default function App() {
  return (
    <SgComponentsI18nProvider
      locale="en-US"
      messages={{ ...componentsMessagesEnUs, ...meusTextos }}
    >
      <Mensagens />
    </SgComponentsI18nProvider>
  );
}
```

## 10. useComponentsI18n (página do showcase)

Página `/components/hooks/use-components-i18n`.

### Uso básico

Use useComponentsI18n para ler o locale ativo e traduzir chaves com o helper t.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-components-i18n/samples/uso-basico.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgComponentsI18nProvider,
  SgGrid,
  tComponents,
  useComponentsI18n,
} from "@seedgrid/fe-components";

const LOCALES = ["pt-BR", "pt-PT", "en-US", "es", "fr"];

function Consumidor() {
  const i18n = useComponentsI18n();

  return (
    <SgGrid gap={4} className="rounded-lg border border-border bg-foreground/5 p-4 font-mono text-sm">
      <span>locale: {i18n.locale}</span>
      <span>messages: {Object.keys(i18n.messages).length}</span>
      <span>components.actions.clear: {tComponents(i18n, "components.actions.clear")}</span>
      <span>components.password.show: {tComponents(i18n, "components.password.show")}</span>
      <span>components.inputs.required: {tComponents(i18n, "components.inputs.required")}</span>
    </SgGrid>
  );
}

export default function App() {
  const [locale, setLocale] = React.useState("pt-BR");

  return (
    <SgGrid gap={12}>
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((id) => (
          <SgButton
            key={id}
            size="sm"
            appearance={id === locale ? "solid" : "outline"}
            onClick={() => setLocale(id)}
          >
            {id}
          </SgButton>
        ))}
      </div>
      <SgComponentsI18nProvider locale={locale}>
        <Consumidor />
      </SgComponentsI18nProvider>
    </SgGrid>
  );
}
```

### Construindo componentes cientes de locale

Combine useComponentsI18n com t para construir componentes que respeitam automaticamente o locale ativo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-components-i18n/samples/componentes-conscientes-do-locale.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgComponentsI18nProvider,
  SgGrid,
  tComponents,
  useComponentsI18n,
} from "@seedgrid/fe-components";

function BotaoLimpar({ onClear }: { onClear: () => void }) {
  const i18n = useComponentsI18n();

  return (
    <SgButton
      size="sm"
      appearance="outline"
      aria-label={tComponents(i18n, "components.actions.clear")}
      onClick={onClear}
    >
      {tComponents(i18n, "components.actions.clear")}
    </SgButton>
  );
}

export default function App() {
  const [limpezas, setLimpezas] = React.useState(0);

  return (
    <SgComponentsI18nProvider locale="es">
      <SgGrid gap={8}>
        <BotaoLimpar onClear={() => setLimpezas((n) => n + 1)} />
        <span className="font-mono text-sm">onClear: {limpezas}</span>
      </SgGrid>
    </SgComponentsI18nProvider>
  );
}
```
