# Backend subdomain-tenancy

Java 21 e Quarkus 3.30.6, preservados da base login-tenancy anterior ao upgrade de Java.
Usa `br.com.seedgrid:seedgrid-subdomain-tenancy:2026.10.13`, instalado no Maven local,
e o BOM da mesma versão. As dependências de fundação seguem esse BOM.

## Infraestrutura local

Na pasta `subdomain-tenancy`, execute `docker compose up -d` antes do backend.
Confira `docker compose ps`: aguarde o PostgreSQL ficar `healthy`.
PostgreSQL: `localhost:5441`, banco `sg_master`, usuário/senha de desenvolvimento `postgres`.
O usuário local tem permissão para criar os bancos dos clientes.
SMTP: `localhost:1026`, sem autenticação/TLS; e-mails em `http://localhost:8026`.

Se já existe `dev.env` ou `.env`, ajuste as URLs master/tenant para a porta `5441`,
as duas senhas de banco para `postgres` e as portas de ambos os mailers para `1026`.
O `.env` sobrescreve `dev.env`. O Compose não lê esses arquivos do backend.

## Executar com Git Bash

```bash
cp dev.env.example dev.env
mkdir -p src/main/resources/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out src/main/resources/keys/private.pem
openssl pkey -in src/main/resources/keys/private.pem -pubout -out src/main/resources/keys/public.pem
openssl rand -base64 32
```

Preencha `dev.env`: credenciais PostgreSQL, senha inicial do administrador e a chave
de criptografia gerada pelo último comando. Use um PostgreSQL dedicado ao produto;
o usuário de provisionamento precisa de permissão `CREATEDB`.
O prefixo `sg` identifica o banco master `sg_master` e os bancos de clientes.
Configure SMTP para receber o código de confirmação do cadastro.

WhatsApp usa o provider `default` da extensão quando não configurado. Para ativar
Evolution, defina `SEEDGRID_WHATSAPP_API=evolution`,
`SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL` e `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY`.
Não defina `SEEDGRID_WHATSAPP_API` como uma string vazia.

```bash
bash run.sh
```

API em `http://localhost:8085`; OpenAPI em `/q/openapi` e Swagger em `/swagger-ui`.
O `run.sh` inicia somente o Quarkus; a infraestrutura deve estar rodando antes.

## Tenancy

- A autenticação segue o padrão proativo do `seedgrid-security` (`quarkus.http.auth.proactive=true`): o escopo de RBAC vem da claim `subdomain` do JWT, sem depender do contexto da requisição.
- `Host: localhost` seleciona o master; `Host: cliente.localhost` seleciona o cliente.
- O BFF repassa o domínio em `X-Forwarded-Host`, mantendo a conexão interna em `127.0.0.1`.
- `POST /public/tenants` cadastra; `POST /public/tenants/validate-email` recebe
  `{ "subdomain": "cliente", "code": "123456" }` e provisiona o banco.
- `POST /public/tenants/resend-email?subdomain=cliente` reenvia a confirmação.
- Autenticação e usuários pertencem ao banco escolhido pelo domínio.
- Billing e tabelas administrativas do produto ficam na persistence unit `master`.
- Migrations do host ficam em `db/migration/app`, anexadas ao migrador master. O host mantém
  somente o seed de permissões em V3000; não duplica tabelas ou seeds de AI Pricing, Exchange,
  Audit ou Notification.
  Novas tabelas do cliente usam `db/migration/tenant`,
  com versões a partir de V3000 e seu pacote adicionado à persistence unit default.
- O bootstrap de banco único do security fica desativado; a extensão inicializa
  o administrador master e o usuário root de cada tenant.

## Build

```bash
mvn -o -DskipTests package
```

O modo offline usa os artefatos já instalados no `.m2`. Para produção, forneça chaves
JWT e segredos pelo ambiente; não copie `dev.env` ou chaves privadas para a imagem.

## Auditoria das operacoes administrativas

Moedas (criar/editar/excluir), cotacoes (edicao/retry manual), lancamentos de precos de IA
e aprovacoes/rejeicoes usam `@SgAudit` de `seedgrid-audit-core`. O host nao possui mais
`AdminAuditEntryEntity`, `AdminAuditService` ou o endpoint `/admin/audit`.
O admin consulta `/audit-logs` (incluindo o total paginado do dashboard), sempre com
`LOG_READ` e com o escopo de leitura da extensao. URLs de origem sao removidas dos
snapshots porque podem conter credenciais.

Os repositorios das extensoes exchange e ai-pricing permitem ao interceptor
resolver o estado anterior na persistence unit configurada (`seedgrid.ai-pricing.persistence-unit`
e `seedgrid.exchange.persistence-unit`). Desde a 2026.10.13 as entidades sao JPA puras sobre
`BaseEntity` (sem Panache, campos privados com getters/setters), em `entities`, e os lookups
ficam em `repositories`, convencao da extensao. As migrations V903 (ai-pricing) e V804
(exchange), que adicionam a coluna `active`, vem junto com as extensions.

Validacao de integracao, usando um PostgreSQL **ja iniciado** (padrao: o Compose de
subdomain-tenancy em `5441`; nao inicia containers):

```bash
mvn -o -Daudit.integration=true test
# Outra instancia local:
mvn -o -Daudit.integration=true -Daudit.test.jdbc.base=jdbc:postgresql://localhost:5440 test
```

O teste cria um banco de nome aleatorio `audittest..._master` e o remove no final.
Nao usa `dev.env`, nao envia e-mails e nao modifica os bancos do produto.
Valida registros CREATE/UPDATE/DELETE, snapshots antes/depois, autoria, remocao de
credenciais e ausencia de evento de sucesso quando a operacao falha.

No subdomain-tenancy, os lookups administrativos usam `master`; a auditoria JPA usa o
banco selecionado pelo contexto do tenant. A extensão `seedgrid-subdomain-tenancy` acrescenta
`productTenant` aos eventos e, quando o store e MongoDB, exige esse mesmo escopo na leitura
(inclusive detalhes e combos), negando leitura sem tenant. Logs MongoDB antigos sem essa
metadata precisam de classificacao/migracao explicita antes de aparecer nesse store.


## AI pricing pela extensao

O backend consome `br.com.seedgrid:seedgrid-ai-pricing:2026.10.13`, instalado
localmente com Java 21 e Quarkus 3.30.6. Em outra maquina/CI, instale primeiro a mesma
versao a partir de `seedgrid-platform/java/seedgrid-quarkus-ext-ai-pricing`:

```bash
mvn -o -pl runtime,deployment -am -Dgpg.skip=true -Dmaven.javadoc.skip=true install
```

Controllers `/admin/ai/models` e `/admin/ai/price-approvals`, entidades, services,
DTOs, scheduler, prompt e catálogo dos eventos pertencem à extensão. Ela publica
`ai-pricing.approval-pending` e `ai-pricing.check-failed` via `seedgrid-notification-api`; o `seedgrid-notification`
instalado no host aplica os canais e destinatários configurados.
Para ligar um LLM, implemente `br.com.seedgrid.aipricing.spis.AiPriceExtractor`;
o prompt esta no jar em `/ai-pricing/prompts/pricing-extract.md`.
Sem extrator concreto, vale o provider inerte da extensao.

O host nao cria nem semeia tabelas ou dados de AI Pricing. Schema, migrations e catalogo
padrao pertencem à extension; as entidades ficam na persistence unit `master`.
Lancamento, aprovacao e rejeicao usam `@SgAudit` na extensao, com snapshots e remocao de
`sourceUrl`; nao ha gravacao paralela pelo antigo sink administrativo.
O teste `DomainAuditTest` cobre historico de precos, aprovacao, rejeicao, auditoria
e recusa de revisao repetida, usando banco temporario.


## Exchange pela extensao

O backend usa `br.com.seedgrid:seedgrid-exchange:2026.10.13`. Instale a versao
local em outra maquina/CI a partir de `seedgrid-platform/java/seedgrid-quarkus-ext-exchange`:

```bash
mvn -o -pl runtime,deployment -am -Dgpg.skip=true -Dmaven.javadoc.skip=true install
```

Java 21, Quarkus 3.30.6 e o BOM de tenancy permanecem nas mesmas versoes.
Controllers, entidades, DTOs, services, parser, historico, scheduler e publicacao do evento
`exchange.rate-fetch-failed` pertencem a extensao. Com o `seedgrid-notification` instalado, o evento entra
no catalogo dinamicamente e usa o canal configurado no admin. As rotas `/admin/currencies`,
`/admin/currency-exchange-rates` e `/admin/exchange-rate` e suas permissoes nao mudaram.

Schema e migrations de moedas e cotações pertencem à extension Exchange. As entidades ficam
somente na persistence unit `master`.
A pesquisa paginada usa o EntityManager da PU configurada em `seedgrid.exchange.persistence-unit`.
A extension de tenancy ja define `master` para as duas chaves.

CRUD de moedas, edicao manual e retry manual usam `@SgAudit` dentro da extensao,
com repositorios para snapshots antes/depois; URLs de origem de moedas sao removidas.
O antigo `ExchangeAuditSink` nao e chamado em paralelo. A edicao manual cancela
retries pendentes. `DomainAuditTest` valida CRUD auditado, pesquisa na PU correta,
edicao manual e preservacao da auditoria de AI pricing, em banco temporario.


## Numeração das próximas migrations

As migrations do domínio do host começam em V3000. `db/migration/app/V3000__seed_permissions.sql`
semeia apenas permissões próprias do host e seus vínculos. Cada extension define o `audience` das
próprias permissões e as associa às roles; o host não corrige audience nem cria esses vínculos.
Migrations e históricos das extensions permanecem nas próprias locations; não copie tabelas ou
seeds de extensions para `app`.
AI Pricing e Exchange rodam no master; Business days roda no master e em cada tenant. Todos vêm ligados
(`seedgrid.subdomain-tenancy.modules.<módulo>.enabled`, default `true`); cada extension mantém sua tabela de
histórico. Tenants já migrados só recebem o schema novo quando `seedgrid.subdomain-tenancy.migration.target-version`
muda.

## Notifications pela extensão

O backend inclui `seedgrid-notification` e o BOM `seedgrid-notification-parent`.
Entidades, migrations, dispatch, histórico de entregas e endpoints genéricos são da extensão.
O host mantém apenas produtores e o catálogo dos eventos que pertencem ao produto e suas
adaptações de canal.

O admin configura a lista dinâmica em `/configuracao/notificacoes`. A API da extensão expõe
`/admin/notifications/events`, `/admin/notifications/events/{code}` e
`/admin/notifications/deliveries`, protegidos por `NOTIFICATION_READ` e `NOTIFICATION_UPDATE`.
O `seedgrid-notification` inicializa seu próprio schema em
`db/migration/notification`, usando `sg_flyway_schema_history_notification` no datasource `master`
quando disponível. O host não declara entidades, migrations nem bootstrap da extensão. O `seedgrid-notification-api`
continua agnóstico: extensões produtoras publicam eventos pelo contrato comum, sem dependência do
motor.


## Exemplo de extensibilidade de usuários: cargo

O campo opcional `cargo` usa `User.additionalAttributes`, no JSONB gerenciado pelo Security.
O bean CDI `security/AppUserAdditionalFieldsValidator` implementa
`UserAdditionalFieldsValidator`: aceita texto de até 100 caracteres e rejeita tipos inválidos
com `InvalidUserAdditionalAttributesException` (HTTP 400). Não exige cargo dos usuários existentes.
Não há entidade, endpoint ou migration adicional no host.

Admin e frontend exibem Cargo na lista e no formulário de usuários. Enviam
`{"additionalAttributes":{"cargo":"Analista"}}`; ao limpar o campo, enviam `cargo: null`.
O merge da extensão remove essa chave e preserva os demais atributos. O cargo pertence ao
usuário, não ao vínculo com a empresa nem às permissões de acesso.

Validação do exemplo, sem banco:

```bash
mvn -o -Dtest=AppUserAdditionalFieldsValidatorTest test
```

### Teste de subida do backend (sempre roda)

`BackendStartsGuardianTest` sobe o backend de verdade (contexto CDI completo, Flyway das migrations de todas as
extensions, Postgres real via Testcontainers) e confere `GET /q/health` = `UP`. E' o que impede um produto novo de
nascer com um backend que nao inicia. Precisa de Docker/Podman; nao depende de Postgres local nem de variavel de
ambiente. Rodar: `mvn -o -Dtest=BackendStartsGuardianTest test`.

Em teste a saude do `mongodb-client` fica desligada (`%test.quarkus.mongodb.health.enabled=false`): a auditoria
roda em `jpa` e o indicador esperaria 30 s por um Mongo que nao existe. Em producao (strategy `MONGODB`) ele segue ligado.



## Extensibilidade de PlanTerm e User

Veja o [guia de atributos adicionais](../docs/extensibilidade.md) para contratos CDI, exemplos de
`supportLevel` e `cargo`, payloads, merge, remoção e validação. Para cobrar por uso (franquia e
excedente por plano, um ou vários contadores), veja o [guia de contadores de uso](../docs/contadores-de-uso.md).
