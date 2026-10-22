# Boilerplate `modular`

Ponto de partida para produtos que **não** são multiempresa: uso interno, ferramenta de equipe,
portal simples. Sem tenancy, sem cadastro público, sem billing e sem backoffice web.

```
modular/
├── backend/     API Quarkus 3.30.6 (porta 8080): seedgrid-security + seedgrid-audit
└── frontend/    App Next.js 16 (porta 3000): login e página inicial protegida
```

Não há pasta `admin/`: o modelo não tem backoffice web.

## O que vem

| Camada | Conteúdo |
|---|---|
| Backend | `seedgrid-security` (login, usuários, perfis, permissões, 2FA, primeiro administrador), `seedgrid-audit-postgresql`, health (`/q/health`), OpenAPI |
| Frontend | login, esqueci a senha, confirmação de e-mail (`/auth/welcome`), troca obrigatória de senha, 2FA, home protegida |

## O que NÃO vem

`login-tenancy`, `subdomain-tenancy`, `billing`, `backup`, `apikeys`, `notification`, `ai-pricing`,
`business-days`, signup e telas de administração. As extensions opcionais que o produto precisar são
escolhidas na criação do produto (`sg-new-product`): o scaffold acrescenta a dependência no `pom.xml`
e a configuração no `dev.env`.

## Usado pelo `sg-new-product`

O script copia `backend/` e `frontend/`, troca o pacote (`br.com.seedgrid.app`) e o artefato
(`seedgrid-app-api`), gera `dev.env`, as chaves JWT e o `docker-compose.yml`. Para rodar à mão:
ver [`backend/README.md`](backend/README.md).

## Diferenças em relação ao `login-tenancy`

- uma única unidade de persistência (sem schema por aplicação); as migrations do produto ficam em
  `backend/src/main/resources/db/migration/app/`;
- cadastro público e convite desligados (`self-enter` off); o usuário entra pelo primeiro
  administrador e pelas telas de usuários que o produto criar;
- sem OpenTelemetry, WhatsApp, Stripe nem Mongo no classpath.
