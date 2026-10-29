# Backend — primeira execução

API Quarkus sobre `seedgrid-login-tenancy`. Este arquivo é o caminho de **clone → rodando**.

---

## 1. Subir a stack de dev

```bash
cd ..
docker compose up -d
docker compose ps
cd backend
```

Aguarde o PostgreSQL ficar `healthy`. O Compose da raiz fornece PostgreSQL 16 em
**5440**, usuário/senha locais `postgres`, e cria `seedgrid_app` no primeiro uso do volume.
SMTP local em **1025**, sem autenticação/TLS; e-mails em `http://localhost:8025`.
O `run.sh` inicia apenas o Quarkus; os containers precisam estar rodando antes.
O Compose antigo em `backend/podman` é uma stack alternativa e disputa a porta 5440;
não execute as duas stacks de login-tenancy ao mesmo tempo.

## 2. Gerar o par de chaves JWT

Não vêm no repositório — cada clone gera o seu (`keys/*.pem` está no `.gitignore`):

```bash
cd src/main/resources/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem
```

## 3. Configurar segredos

O `dev.env` **nao e versionado**. O que vai para o repositorio e o modelo `dev.env.example`:

```bash
cp dev.env.example dev.env
```

Se já possui `dev.env` ou `.env`, configure `SECURITY_MAILER_HOST=localhost`,
`SECURITY_MAILER_PORT=1025`, `SECURITY_MAILER_START_TLS=DISABLED` e deixe
`SECURITY_MAILER_USERNAME` e `SECURITY_MAILER_PASSWORD` vazios para usar o SMTP local.
O `.env` sobrescreve `dev.env`; o Compose não lê esses arquivos do backend.

Depois preencha tudo que estiver como `TROQUE-ME` ou `GERE-A-SUA` -- o comando que gera cada
segredo esta comentado ao lado da propria variavel. O que ja vem preenchido (porta, host, flag) e
valor de desenvolvimento e pode ficar como esta. A explicacao de **cada variavel**, uma a uma, esta
em [`../README.md`](../README.md) §4.

> **Por que o `dev.env` saiu do versionamento.** Ate 2026-09-11 ele era versionado "porque so tinha
> placeholder" -- e nao tinha: a copia feita a partir do `seedgrid-report` trouxe junto SETE
> segredos de PRODUCAO, incluindo a chave privada que assina os JWT e a chave de criptografia
> at-rest. Nao reverta isso.

> **Comentario em `dev.env` vai em LINHA PROPRIA.** O `run.sh` nao corta ` # ...` do valor, e isso e
> deliberado -- senha com `#` e comum. Ja aconteceu de `SECURITY_JWT_KID=x # Key ID` produzir tokens
> com `kid` = `"x # Key ID "`.

## 4. Subir

```bash
./run.sh
```

### O primeiro boot loga erros que NÃO são erro

Contra banco vazio, você vai ver isto **antes** de as migrations terminarem:

```
Failed to validate Schema: Schema-validation: missing table [accounts]
ERROR: relation "export_jobs" does not exist
```

É **corrida de boot**: a validação de schema do Hibernate e os schedulers começam antes de o
`LoginTenancyMigrationService` terminar. As migrations da fundação completam logo em seguida.

---

## 5. Primeiro login — leia antes de tentar

O bootstrap cria a empresa-plataforma e o primeiro admin, **mas o e-mail nasce NÃO confirmado** e a
API recusa o login com `403 E-mail nao confirmado`. Em produção o mailer entrega o link; em dev,
sem SMTP, o e-mail não sai de lugar nenhum e você fica travado.

O token de confirmação está no banco. Para destravar:

```bash
TOKEN=$(psql -h localhost -p 5440 -U postgres -d seedgrid_app -tAc \
  "select email_confirmation_token from sg_users where email_confirmation_token is not null limit 1" | tr -d '[:space:]')

curl "http://127.0.0.1:8080/public/auth/confirm-email?token=$TOKEN"
```

> É **`GET` com query param**, não `POST` com body — `POST` responde `405`. O mesmo vale para a
> troca de senha, que é **`PUT /users/change-password`**.

Depois disso o login funciona, e devolve `changePasswordRequired: true`: o primeiro admin nasce com
troca de senha obrigatória, e a API recusa **todo** endpoint com `401 PASSWORD_CHANGE_REQUIRED` até
a senha mudar. O admin web já trata isso e leva para `/change-password` (não confunda com "sessão
expirada" — ver `PLAN.md` §6).

Com o SMTP do Compose configurado, abra `http://localhost:8025` e use o link do e-mail
de confirmação. A consulta SQL acima é uma alternativa de diagnóstico local.

---

## 6. O bootstrap só roda UMA vez

`SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` / `_INITIAL_PASSWORD` só têm efeito quando o usuário
**ainda não existe**. Trocar o `dev.env` depois não atualiza ninguém — o login passa a falhar com
"Usuário ou senha inválido" enquanto o env parece certo.

Com `seedgrid.privacy.encryption.enabled=true` o e-mail fica cifrado e um `select` não resolve.
Para descobrir de quem é a conta, compare `users.email_hash` com o HMAC:

```python
import hmac, hashlib, base64
chave = base64.b64decode(SEEDGRID_PRIVACY_SEARCH_KEY)
hmac.new(chave, "email@dominio".encode(), hashlib.sha256).hexdigest()
```

Para recomeçar do zero, dropar e recriar o banco é mais simples do que corrigir na mão.

---

## 7. Onde ficam as coisas

| | |
|---|---|
| Migrations do produto | `src/main/resources/db/migration/app/` (**não** em `db/migration/`) |
| Cobrança por uso (contadores) | declarados em `billing/AppUsageMeters.java`, contados com `@SgConsumesUsage(meter = ...)` ou `UsageService.consume(...)` — exemplo em `demo/UsageDemoResource.java`, planos em `V3001`; troque pelos do seu produto. Franquia e excedente são do plano, nas telas do admin. Guia: [`docs/contadores-de-uso.md`](../docs/contadores-de-uso.md) |
| Campos do produto no plano | `additionalAttributes` do term (exemplo: `supportLevel`), validado em `billing/AppPlanTermValidator.java` |
| Plano, assinatura, checkout, contas e avisos de mudança de acesso | **não** implemente: endpoints e e-mails transacionais de `UserAccessEvent` são responsabilidade do `seedgrid-billing` |
| Templates de e-mail | `src/main/resources/templates/` — inclui overrides em `templates/billing/{html,txt}/` para os avisos de acesso |
| Extrator de preço (robô) | implemente `AiPriceExtractor`; sem bean próprio o robô fica inerte |

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

A concessao de acesso a plataforma tambem usa `@SgAudit`, com lookup pelo e-mail do usuario.
O escopo de leitura/escrita por empresa continua fornecido pelo login-tenancy.


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

O host nao cria nem semeia tabelas ou dados de AI Pricing e Exchange. Suas migrations,
entidades e seeds padrao pertencem às extensions; no subdomain-tenancy, as entidades ficam na
persistence unit `master`. O host mantém somente o seed de permissões usado pelas telas e endpoints.
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
Controllers, entidades, DTOs, services, parser, historico e scheduler pertencem a
extensao. Ela publica `exchange.rate-fetch-failed`; com o `seedgrid-notification` instalado, o evento
aparece no catalogo e segue o canal configurado no admin. As rotas `/admin/currencies`,
`/admin/currency-exchange-rates` e `/admin/exchange-rate` e suas permissoes nao mudaram.

Schema e migrations de moedas e cotações pertencem à extension Exchange. No subdomain,
`br.com.seedgrid.exchange.entities` pertence somente à PU master.
A pesquisa paginada usa o EntityManager da PU configurada em `seedgrid.exchange.persistence-unit`.
Vazia, vale a PU default (caso deste backend).

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
AI Pricing, Exchange e Business days são migrados pela tenancy, ligados por padrão
(`seedgrid.login-tenancy.modules.<módulo>.enabled`, default `true`; desligado = não migra e as rotas
respondem 404); cada uma mantém sua tabela de histórico. Não há flag de migration.

## Notifications pela extensão

O backend inclui `seedgrid-notification` e o BOM `seedgrid-notification-parent`.
Entidades, migrations, dispatch, histórico de entregas e endpoints genéricos são da extensão.
O host mantém apenas produtores e o catálogo dos eventos que pertencem ao produto e suas
adaptações de canal.

O admin configura a lista dinâmica em `/configuracao/notificacoes`. A API da extensão expõe
`/admin/notifications/events`, `/admin/notifications/events/{code}` e
`/admin/notifications/deliveries`, protegidos por `NOTIFICATION_READ` e `NOTIFICATION_UPDATE`.
O `seedgrid-notification` inicializa seu próprio schema em
`db/migration/notification`, usando `sg_flyway_schema_history_notification` no datasource padrão.
O host não declara entidades, migrations nem bootstrap da extensão. O `seedgrid-notification-api` continua agnóstico:
extensões produtoras publicam eventos pelo contrato comum, sem dependência do motor.


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
`supportLevel` e `cargo`, payloads, merge, remoção e validação. Para cobrar por uso (franquia e excedente
por plano), veja o [guia de contadores de uso](../docs/contadores-de-uso.md).
