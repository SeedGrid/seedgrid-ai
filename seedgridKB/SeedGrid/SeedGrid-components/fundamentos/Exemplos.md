---
tags: [seedgrid, front, component, fundamentos, exemplos]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components; front/seedgrid-fe-components/apps/showcase/src/app/samples
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — fundamentos do `@seedgrid/fe-components`

Referência: [[SeedGrid/SeedGrid-components/fundamentos/API|API dos utilitários]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Visão geral]].

Cada exemplo indica a fonte. Os marcados "montado a partir da API" usam apenas assinaturas confirmadas no código, mas não existem literalmente no repositório.

## 1. Instalação e estilos

Fonte: `packages/seedgrid-fe-components/README.md`.

```bash
pnpm add @seedgrid/fe-components @seedgrid/fe-theme react-hook-form lucide-react
```

```tsx
// Opcional: CSS estático em vez da injeção automática via JS
import "@seedgrid/fe-components/style.css";
import { SgInputText } from "@seedgrid/fe-components";
```

## 2. Tema no layout raiz (Next.js App Router)

Fonte: `apps/showcase/src/app/layout.tsx` (trecho).

```tsx
import { SeedThemeProvider } from "@seedgrid/fe-theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[rgb(var(--sg-bg))] text-[rgb(var(--sg-text))]">
        <SeedThemeProvider
          initialTheme={{ seed: "#16803D", mode: "auto", radius: 8, persistMode: true }}
          applyTo="html"
        >
          {children}
        </SeedThemeProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` é usado porque o tema `auto`/persistido é resolvido no client (comentário no arquivo).

## 3. i18n global (fora do React)

Fonte: `apps/showcase/src/app/samples/set-components-i18n.tsx.sample`.

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

Fonte: `apps/showcase/src/app/samples/i18n-provider-root-layout.tsx.sample`.

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

Fonte: `packages/seedgrid-fe-components/README.md` ("Formulario com React Hook Form").

```tsx
"use client";
import { useForm } from "react-hook-form";
import { SgButton, SgInputEmail, SgInputText, SgStack } from "@seedgrid/fe-components";

type FormValues = { nome: string; email: string };

export default function ExampleForm() {
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: { nome: "", email: "" } });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <SgStack gap={12}>
        <SgInputText id="nome" name="nome" register={register} label="Nome" required requiredMessage="Informe o nome." />
        <SgInputEmail id="email" name="email" register={register} label="Email" required />
        <SgButton label="Salvar" type="submit" />
      </SgStack>
    </form>
  );
}
```

## 6. Máscaras e validadores em código próprio

Montado a partir da API (`src/masks.ts`, `src/validators.ts`).

```ts
import {
  maskCpfCnpj, maskPhone, maskPostalCodeBR,
  isValidCpf, isValidCnpj, validatePassword, validateBirthDate, isBlockedEmailDomain
} from "@seedgrid/fe-components";

maskCpfCnpj("12345678901");      // "123.456.789-01"
maskPhone("11987654321");        // "(11) 98765-4321"
maskPostalCodeBR("01001000");    // "01001-000"

isValidCpf("123.456.789-09");    // boolean (checa DV)
isValidCnpj(valorDigitado);      // aceita CNPJ numérico ou alfanumérico; os 2 DV devem ser numéricos

// null = ok; string = mensagem i18n com os motivos
const erroSenha = validatePassword("abc", { minSize: 10, special: false });
const erroNascimento = validateBirthDate("2010-05-01", { minAge: 18 });

isBlockedEmailDomain("x@yopmail.com");                 // true (lista padrão)
isBlockedEmailDomain("x@empresa.com", ["empresa.com"]); // true (lista extra)
```

## 7. Domínios bloqueados em runtime (global)

Montado a partir de `getRuntimeBlockedEmailDomains()` em `src/validators.ts` — não há setter exportado; o app atribui a global.

```ts
(globalThis as { __seedgridBlockedEmailDomains?: string[] }).__seedgridBlockedEmailDomains = [
  "dominio-descartavel.example"
];
```

## 8. Consumo do manifesto de IA

Fonte: `apps/showcase/src/app/api/ai-manifest/route.ts` — lê `packages/seedgrid-fe-components/dist/ai/seedgrid-components.manifest.json` e devolve em `GET /api/ai-manifest` (`cache-control: no-store`; 404 `{"error":"AI manifest not available"}` se ausente).
