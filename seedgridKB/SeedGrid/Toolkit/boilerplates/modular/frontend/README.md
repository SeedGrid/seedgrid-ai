# Front do modelo "modular"

Front do produto: **login**, esqueci a senha, confirmação de e-mail, troca obrigatória de senha, 2FA
(quando ligado) e uma página inicial protegida. Sem cadastro, sem assinatura, sem backoffice.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- `@seedgrid/fe-components` · `@seedgrid/fe-theme` · `@seedgrid/fe-core`

## Rodar

```bash
pnpm install
cp .env.example .env.local   # o sg-new-product já gera o .env.local do produto
pnpm dev                     # http://localhost:3000
```

O backend precisa estar em pé (porta 8080 por padrão; variável `SEEDGRID_APP_API_BASE_URL`).

## Arquitetura de sessão

O browser fala **só** com `/api/**` deste Next. Quem fala com a API Quarkus é o servidor
(`lib/seedgrid-app-api-server.ts`):

- o token **nunca** chega ao browser: fica em cookie `httpOnly`;
- existe **um único** ponto de refresh, server-side (`fetchWithAdminSession`);
- rota nova de BFF usa `apiFetchSecurity` / `fetchWithAdminSession`; componente client novo usa
  `adminProxyClient` (`lib/core`).

## Como acrescentar uma tela

1. Crie `app/<rota>/page.tsx` dentro do `Shell` (`app/components/Shell.tsx`).
2. Acrescente o item em `navItems` (`app/data.ts`) com a permissão de READ que o backend cobra.
   Cada `href` do menu precisa ter a página correspondente.
3. Rotas de BFF autenticadas ficam em `app/api/**` e passam pela sessão do servidor.

## Testes

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
```
