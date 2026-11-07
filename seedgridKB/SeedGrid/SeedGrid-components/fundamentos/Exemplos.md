---
tags: [seedgrid, front, component, fundamentos, exemplos]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components; front/seedgrid-fe-components/apps/showcase/src/app/samples
branch: main
commit: cad3105
analisado-em: 2026-11-07
description: "Exemplos TSX (React) de Fundamentos (utilitários, i18n, tema), validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — fundamentos do `@seedgrid/fe-components` — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos — Fundamentos (utilitários, i18n, tema) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Referência: [[SeedGrid/SeedGrid-components/fundamentos/API|API dos utilitários]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Visão geral]].

Cada exemplo indica a fonte. Os exemplos 3, 4 e 5 são cópia 1:1 do `.sample` do showcase (`apps/showcase/src/app/samples/`); o 2 é cópia 1:1 do `.sample` da página de tema do showcase. Os exemplos 6 e 7 foram compilados com `tsc --strict` contra o código-fonte do pacote (2026-11-07); o 1 vem do README e do `package.json` do pacote; o 8 descreve a rota real do showcase.

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
