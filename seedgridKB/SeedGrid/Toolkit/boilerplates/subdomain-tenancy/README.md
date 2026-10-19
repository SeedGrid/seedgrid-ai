# SeedGrid — Subdomain Tenancy

Boilerplate com três projetos independentes no monorepo:

| Projeto | Função | Desenvolvimento |
|---|---|---|
| [backend](backend/README.md) | API Quarkus e provisionamento DATABASE | `localhost:8085` |
| [admin](admin/README.md) | Backoffice da plataforma, banco master | `localhost:3003` |
| [frontend](frontend/README.md) | Aplicação do cliente, banco por subdomínio | `cliente.localhost:3002` |

Base copiada de `login-tenancy`, com Java **21**, Quarkus **3.30.6**, Next.js **16.2.11**
e React **19.1.0**. Os lockfiles de admin e frontend preservam as versões da referência.
Não foi realizado upgrade de Java ou alteração nas extensões.

O backend importa o BOM e usa `seedgrid-subdomain-tenancy:2026.10.13`, já instalado
no `.m2`. Security, billing-core, backup, audit-core, apikeys, privacy, commons e
infraestrutura Quarkus chegam transitivamente. Providers concretos continuam sendo
escolhas do host. O exemplo de referência é
`../../seedgrid-platform-examples/examples/seedgrid-subdomain-tenancy-example`.

## Rodar

1. Na raiz deste projeto, execute `docker compose up -d` e confira `docker compose ps`.
   O Compose fornece PostgreSQL 16 em `5441` (banco `sg_master`, usuário/senha locais
   `postgres`) e SMTP em `1026`. Abra os e-mails em `http://localhost:8026`.
   Preencha `backend/dev.env` a partir de `backend/dev.env.example` e gere suas chaves
   conforme o README do backend. Se já possui `dev.env` ou `backend/.env`, ajuste as URLs
   master/tenant para `5441`, ambas as senhas para `postgres` e as duas portas SMTP para `1026`.
   `backend/.env` tem precedência sobre `dev.env`.
2. Execute `bash run.sh` em `backend` usando Git Bash.
3. Copie `.env.example` para `.env.local` em `admin` e `frontend`.
4. Em cada aplicação Next, execute `pnpm install --frozen-lockfile` e `pnpm dev`.
5. Acesse o admin com o usuário master configurado no backend.
6. Cadastre a empresa em `http://localhost:3002/auth/signup`, escolha o subdomínio
   e confirme o código enviado por e-mail. A extensão provisiona o banco do cliente.
7. Faça login no domínio da empresa. A raiz `http://localhost:3002` permite informar
   o subdomínio de uma empresa já cadastrada.

## Isolamento

O admin encaminha sempre o domínio master. O frontend valida o `Host` da requisição
e encaminha o domínio do cliente em `X-Forwarded-Host`; não aceita esse header do navegador
como fonte do tenant. O backend resolve o banco e autentica por meio das extensões.
As sessões usam cookies HttpOnly sem atributo `Domain`, com nomes distintos por aplicação.

Configure o mesmo sufixo em `SEEDGRID_SUBDOMAIN_TENANCY_DOMAIN_SUFFIX` no backend e
`SEEDGRID_TENANCY_DOMAIN` nos dois BFFs. No deploy, preserve o `Host` original no proxy.
Os bancos e suas credenciais nunca são escolhidos pelo frontend.

As operações de senha, login, refresh, 2FA, usuários, perfil próprio, permissões e avatar
reutilizam os endpoints e DTOs do Security. A escrita comum de usuários usa o contrato restrito
da extensão; o host não mantém controllers nem conversões próprias para essas operações.
Os links de segurança reutilizam o gerador da extensão. A extensão subdomain-tenancy
ajusta a origem para o subdomínio do tenant durante a requisição; fora desse contexto,
usa a origem configurada diretamente. Configure `SEEDGRID_SECURITY_FRONTEND_BASE_URL`
com a origem raiz do frontend (por exemplo, `http://localhost:3002` no desenvolvimento).

## E-mails de acesso do Billing

O `seedgrid-billing` envia os e-mails quando o limite de usuários altera o acesso. O host não implementa
`UserAccessEmailObserver` nem `UserAccessEmails`; os templates SeedGrid de exemplo ficam em
`backend/src/main/resources/templates/billing/{html,txt}` e podem ser personalizados no host. Os arquivos
correspondem a `user-access-loss` e `user-access-restored`, com placeholders `{name}`, `{plan}`,
`{explanation}` e `{notice}`.

## Validação

```bash
cd backend && mvn -o -DskipTests package
cd ../admin && pnpm exec tsc --noEmit && pnpm build
cd ../frontend && pnpm exec tsc --noEmit && pnpm build
```

Os builds não substituem a validação com PostgreSQL, SMTP e credenciais reais.
Nenhum serviço Podman é iniciado automaticamente e nenhum segredo da referência foi copiado.

## Infraestrutura com Docker Compose

No Git Bash, na raiz de `subdomain-tenancy`:

```bash
docker compose up -d
docker compose ps
cd backend
bash run.sh
```

Antes do primeiro `run.sh`, configure `backend/dev.env` e as chaves JWT conforme
o [README do backend](backend/README.md). Aguarde o PostgreSQL ficar `healthy`.
Os e-mails locais ficam em `http://localhost:8026`; não são enviados para destinatários reais.
API, admin e frontend continuam sendo executados no host.

Para parar a infraestrutura, execute `docker compose down` na raiz do projeto.
Se usa Podman, substitua `docker compose` por `podman compose` nos comandos.
O volume do PostgreSQL é preservado. `down -v` apaga os dados locais.
Cada boilerplate possui nome de projeto, volume e portas próprios.
Os bancos iniciais são criados somente quando o volume está vazio.
Não reutilize os dados da stack antiga sem uma migração explícita.

## AI pricing

O backend usa `seedgrid-ai-pricing:2026.10.13`, instalado no `.m2` com as
versoes atuais da foundation, Java 21 e Quarkus 3.30.6. A implementacao duplicada foi
removida, mantendo apenas o provider WhatsApp no host. As entidades ficam na PU master;
dados, migrations historicas, rotas e permissoes foram preservados.
Consulte [instalacao e validacao](backend/README.md#ai-pricing-pela-extensao).


## Exchange

Cambio centralizado em `seedgrid-exchange:2026.10.13`, instalado no `.m2`.
As classes duplicadas foram removidas; o host mantem somente o provider de notificacao.
Veja [instalacao e validacao](backend/README.md#exchange-pela-extensao).


## Tela nova: menu e permissões

Menu e catálogo de permissões são mantidos à mão em alguns lugares que precisam ficar sincronizados (migration da
permissão, `data.ts`, ícone no `Shell`, catálogo do editor de perfis e, se for vendável por plano, o catálogo do
admin). O passo a passo e o checklist estão na skill
[`.ai/skills/seedgrid-new-screen`](.ai/skills/seedgrid-new-screen/SKILL.md).

## Extensibilidade de PlanTerm e User

Veja o [guia de atributos adicionais](docs/extensibilidade.md) para contratos CDI, exemplos de
`supportLevel` e `cargo`, payloads, merge, remoção e validação. Para cobrar por uso (franquia e
excedente por plano, um ou vários contadores), veja o [guia de contadores de uso](docs/contadores-de-uso.md).
Para avisar o usuário na hora que um processo demorado terminou (o backup já faz isso; relatórios e
importações podem fazer igual), veja o [guia de eventos em tempo real](docs/eventos-em-tempo-real.md).
