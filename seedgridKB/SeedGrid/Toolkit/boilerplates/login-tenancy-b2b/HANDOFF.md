# HANDOFF — Boilerplate `login-tenancy`

> **Pausa em 2026-09-28:** próximo trabalho é integrar AI pricing à notification.
> A implementação ainda não começou. Estado, commits de referência, pendências e
> roteiro estão em [NOTIFICATION-HANDOFF.md](../NOTIFICATION-HANDOFF.md).

**Última atualização:** 2026-09-28 (auditoria, AI pricing e exchange nas extensoes)
**Plano mestre:** `PLAN.md` (é a fonte da verdade detalhada; este arquivo é só o **estado
operacional** para retomar de onde parou).

> **Retomar com:** "vamos voltar pro boilerplate".

---

## Atualizacao de 2026-09-28 — auditoria e adocao de AI pricing

- A auditoria administrativa propria foi substituida por `@SgAudit` nos dois boilerplates.
  `AdminAuditEntryEntity`, `AdminAuditService` e `AdminAuditResource` foram removidos.
  O admin usa `/audit-logs` da extensao para consulta, eventos recentes e total do dashboard.
- A tabela `admin_audit_entries` fica preservada como arquivo legado, sem novas escritas.
  Os registros antigos nao entram automaticamente na nova consulta. Veja o README do backend
  para consultar/exportar o historico e executar o teste de integracao em banco isolado.
- `seedgrid-ai-pricing:2026.09.12-SNAPSHOT` instalado no `.m2` e adotado nos dois
  backends. Controllers, services, entidades, scheduler, DTO e prompt locais removidos.
  O provider WhatsApp implementa `AiPricingNotificationService`; o extrator usa a SPI
  da extensao. Rotas, permissoes e dados existentes foram preservados.
- Com autorizacao explicita, a extensao foi ajustada para Java 21/Quarkus 3.30.6,
  commons/security/audit nas versoes do BOM atual e auditoria de lancamento/aprovacao/
  rejeicao com snapshots. A extensao exchange tambem foi preparada conforme o item abaixo.
- No subdomain-tenancy, `br.com.seedgrid.aipricing.entities` pertence a PU master.
  Migrations historicas permanecem intactas; nao ativar uma segunda baseline pricing.
  Em outra maquina/CI, instalar a extensao conforme o README do backend.
- `seedgrid-exchange:2026.09.12-SNAPSHOT` instalado e adotado nos dois backends.
  Foram removidos controllers, entidades, services, DTOs, scheduler e repositorios locais.
  A extension Exchange publica `exchange.rate-fetch-failed`; o subscriber instalado controla canal e destinatarios.
  A extensao preserva `@SgAudit`, snapshots e remocao de URLs de origem das moedas;
  pesquisa de cotacoes usa a PU da entidade (master no subdomain).
  Dados, migrations, rotas, permissoes e versoes da foundation preservados.
- As secoes abaixo registram sessoes anteriores: referencias a entidades removidas, versoes
  de setembro/10 e ao Compose antigo sao historicas; o codigo e os READMEs atuais prevalecem.

## 0. Onde parei e por quê

O trabalho no boilerplate foi pausado para executar a **§12 do PLAN.md** — subir `maxUsers` e
`permissions` do `PlanTerm` para o `seedgrid-login-tenancy`. **Isso está CONCLUÍDO e em produção:**

1. ✅ `seedgrid-login-tenancy 2026.09.10` — `LoginTenancyPlanTerm` (`@MappedSuperclass`) + `V704`;
   publicado no Maven Central e empurrado (`20b5f52`).
2. ✅ `seedgrid-report` adotou (`88465f89`), a `V1026` virou idempotente (`bc61b243`) e o runbook do
   realinhamento de checksum ficou em `seedgrid-report-api/docs/RUNBOOK-plan-term-na-fundacao.md`.
3. ✅ Deploy verde e **boot verde em produção** (`/q/health/ready` UP, `login-tenancy-foundation` UP).
   O checksum foi realinhado pelo dono antes do push.

**A adoção também já foi aplicada AQUI** (§3.6 fechado) e provada em banco limpo: a `V704` consta
em `sg_flyway_schema_history_login_tenancy` e foi ela quem criou `plan_term_permissions` **e** a coluna
`max_users`. O produto não cria mais nenhuma das duas.

> Diferença deliberada em relação ao report: lá o conserto foi `create table **if not exists**` na
> `V1026`, porque a migration já estava aplicada em produção. Aqui, que nasce depois da fundação, a
> `V1000` simplesmente **não cria** a tabela. Copiar o `if not exists` seria carregar a cicatriz de
> um problema que este projeto nunca teve.

Nada do boilerplate está pela metade — as fases 2 a 6 fecharam. O que falta está no §3 abaixo.

---

## 1. Estado por fase (PLAN.md §7)

| Fase | Estado |
|---|---|
| 1. Decisões + nomenclatura | ✅ D1–D5 fechadas (§10); nomes confirmados (§1) |
| 2. Esqueleto do backend | ✅ pom, application.properties, dev.env, run.sh, Dockerfile, 13 templates, banner, chaves RSA de dev, podman-compose |
| 3. Migrations | ✅ `V1000` (12 tabelas) + `V1001` (33 permissões) + seeds V1002–V1005 + `billing/V502.1`. **Rodaram em banco limpo.** |
| 4. Java | ✅ 97 arquivos + `ai/pricing` (6) + o seam (2) |
| 5. Admin | ✅ 170 arquivos; `tsc --noEmit` limpo |
| 6. Front | ✅ esqueleto + Signup/Assinatura portadas + i18n; `tsc --noEmit` limpo |
| 7. Testes de sessão | ⬜ **não iniciada** |
| 8. PWA + `rename.sh` + CI | ⬜ **não iniciada** (PWA: o dono pediu para confirmar antes) |
| §12 `PlanTerm` na fundação | ✅ concluída — fundação publicada, report em produção **e aplicada aqui** (§3.6) |
| §13 módulos `fe-*` | ⬜ adiada por decisão do dono (só `fe-core` por ora) |

---

## 2. O que já foi exercitado de verdade

- `pnpm install` + `tsc --noEmit` **verdes** no `admin/` e no `frontend/`.
- Backend sobe: `/q/health/ready` UP (datasource + MongoDB).
- Migrations aplicadas **em banco vazio** — o banco `seedgrid_app` reflete os arquivos atuais
  (0 colunas de parceiro, 0 permissões `AI_PRICING_MODEL`, `billing/V502.1` aplicada).
- Signup ponta a ponta: criou empresa (LCK), usuário ROOT, conta de billing e trial.
- Login + troca de senha obrigatória verificados **contra a API**, com `curl`.

**Não** foi exercitado: build de produção (`next build`), suíte de testes, deploy.

---

## 2.5 Sessão de 2026-09-10/11 — a família `plan` mudou de dono, e o trial ganhou tempo

Tudo abaixo está **aplicado aqui** e compilando (`mvn compile` e `tsc --noEmit` limpos). Falta o
teste de ponta a ponta com banco novo (§3.7).

**Fundação (publicada no Maven Central):**

| lib | versão | o que mudou |
|---|---|---|
| `billing` | `2026.09.10-1` | vira dono de `plans`/`plan_terms`/`plan_term_permissions`; passa a depender do `security`; semeia o plano TRIAL (V505); `plans.trial_days` + `PlanEntity.trialEndsAt` (V506) |
| `login-tenancy` | `2026.09.10-2` | `LoginTenancyPlanTerm` e a V704 **apagadas** — a tabela é do billing, e o passo `login-tenancy` roda incondicionalmente |
| `subdomain-tenancy` | `2026.09.10-1` | só pinagem |

**Aqui no boilerplate:**

- pin `login-tenancy` → `2026.09.10-2`; `PlanTerm` volta a estender `PlanTermEntity`
- `V1002` deixou de criar o plano TRIAL e virou **UPDATE** da cota. O plano vem da fundação (V505)
  com o mesmo `public_id`; um `insert ... on conflict do nothing` viraria no-op silencioso e a cota
  ficaria no default 0. O `seedgrid-report` levou esse defeito e precisou de uma V1034 para
  consertar — aqui, que nasce depois, já nasce certo.
- `AccountProvisioningService`: 148 → 56 linhas. O find-or-create à prova de corrida (REQUIRES_NEW,
  SQLSTATE 23505, releitura) subiu para o `billing-core` (`ensureForCompany`). Sobrou o que é deste
  produto: provisionar o trial.
- **trial por tempo**: `TrialProvisioningService` grava `endsAt` a partir de `plan.trialEndsAt()`;
  `PlanFeatureGate` barra com **402 `TRIAL_EXPIRED`**.
- admin: campo "Dias de trial" com a observação (0 = não expira; vale para assinaturas novas),
  coluna "Vence em" nas contas, concessão de dias no mesmo diálogo do grant de requests, e a rota
  BFF `grant-trial-days`.

> **Por que o gate ficou no `PlanFeatureGate` e não num serviço de consumo:** este boilerplate não
> tem `UsageAccountingService` — isso é do report (medir requisição de IA) e ficou de fora, certo.
> O `PlanFeatureGate` é o único gate de plano que existe aqui. E havia um furo: ele tem postura
> defensiva ("sem assinatura resolvida, NUNCA bloqueia"), e `findActiveSubscription` filtra por
> `endsAt` — então trial vencido caía no `subscription == null` e **liberava tudo**. Vencer o trial
> daria mais acesso do que tê-lo. Por isso a checagem entra ANTES de resolver a assinatura.

## 2.6 Sessão de 2026-09-11 — documentação, e dois achados no caminho

Escrita do `README.md` do monorepo e do `README.md` deste projeto (§4 documenta as **98** variáveis
do `dev.env.example`, uma a uma, e §5 é o passo a passo do Stripe: onde se obtém cada valor, quais
seis eventos marcar no webhook e por que `sk_live_` nunca entra em arquivo versionado).

Dois defeitos apareceram durante a escrita e foram corrigidos:

1. **O `frontend` apontava, por default, para `https://report-api.seedgrid.com.br`** — a API de
   PRODUÇÃO do report. A resolução era por `DEBUG_MODE`, e sem essa env o ramo escolhido era o de
   produção. Quem subisse o front deste boilerplate sem saber disso estaria autenticando contra o
   backend de outro produto, sem erro de conexão nenhum para denunciar. O `admin` já tinha sido
   corrigido; o `frontend` tinha passado batido. Agora os dois usam `SEEDGRID_APP_API_BASE_URL`
   com `http://127.0.0.1:8080` como default, e o `DEBUG_MODE` foi removido.
2. **O `dev.env.example` ainda carregava segredos reais**: a chave `sk_live_` e o `whsec_` de
   produção do Stripe (comentados, mas commitados — o GitHub varre o commit, não a linha ativa), a
   secret key do MinIO em dois lugares, e o e-mail/WhatsApp/senha inicial do primeiro admin. Todos
   neutralizados. O `HANDOFF.md` §4 também citava a senha do primeiro admin em texto claro; saiu.

Além disso: `SEEDGRID_REPORT_API_TOKEN`/`_COMPANY_ID` viraram `SEEDGRID_APP_API_*` nos dois fronts;
`SEEDGRID_APP_PUBLIC_BASE_URL` foi removida do modelo (nada no código a lê); `.gitignore` do
monorepo criado na raiz de `boilerplate/`; `run.sh` e `backend/README.md` §3 atualizados para o
fluxo `cp dev.env.example dev.env`.


## 3. Pendências para quando eu voltar

### 3.0 NOVO — primeira instalação trava no e-mail não confirmado
O bootstrap cria o admin com `email_confirmation_token` pendente, e o login recusa com **403
"E-mail nao confirmado"**. Em produção o mailer entrega o link; em dev, sem SMTP, a instalação fica
intransponível. **Não há config para criar já confirmado — é desenho da fundação**, então não mexi
nela. Destrava com o token do banco + `GET /public/auth/confirm-email?token=…` (é **GET**; `POST`
responde 405). Documentado em `backend/README.md`.

### 3.1 Verificar a correção do 500 em `/me/subscription`
Era **corrida** entre o `SignupAccountProvisioner` e o primeiro `/me/subscription` do front: os dois
chamaram `ensureAccount`, os dois leram "não existe", os dois inseriram, e o perdedor bateu em
`uk_sg_accounts_cnpj_hash`. Corrigido em `AccountProvisioningService`: criação isolada em
`REQUIRES_NEW`, detecção por **SQLSTATE 23505** (não pelo texto da mensagem, que sai em português) e
releitura. **Falta abrir a tela e confirmar.**

### 3.2 ~~Limpar o `dev.env`~~ ✅ feito
`SEEDGRID_REPORT_TRIAL_*` → `SEEDGRID_APP_TRIAL_*` (as antigas não eram lidas por nada, e o
`INCLUDED_REQUESTS` saiu junto — era config morta dizendo 20 enquanto o seed dá 3);
`SECURITY_JWT_KID` → `seedgrid-app-local`, com o comentário movido para linha própria (era ele que
fazia o `kid` sair como `"seedgrid-report # Key ID "` — confirmado no token emitido);
`SEEDGRID_REPORT_PUBLIC_BASE_URL` → `SEEDGRID_APP_PUBLIC_BASE_URL`.

**Continua valendo:** o arquivo carrega **segredos reais** (chave RSA, SMTP, MinIO, Stripe) e é
versionado. O `dev.env` original deste boilerplate era todo placeholder + `.env` gitignored.

### 3.3 ~~Dropar e refazer~~ ✅ feito
O banco foi dropado e recriado (só o `seedgrid_app`; o `seedgrid_report` conferido intacto, 63
tabelas). Deixou de ser opcional: ao editar `V1000` e `billing/V502.1` os checksums divergiram
(`1464120052`×`358842547`, `-1740400451`×`-1567452342`) e o Flyway abortaria o boot.

Boot limpo: `started in 22.683s`, `/q/health/ready` 200, **zero erro depois das migrations**.
Login verificado com `kid = seedgrid-app-local`, `audience = platform`, `groups = [ADMIN]`.

**O dono ia refazer o ciclo por conta, incluindo signup e Minha assinatura pelo front.**

### 3.7 Teste de ponta a ponta com banco NOVO (o mais importante)

Dropar e recriar o banco local e subir. É o único lugar onde a sequência V500→V506 + V1000→V1002
roda sem nenhuma cicatriz de produção. O que conferir:

1. o plano TRIAL existe e tem **uma** vigência (`public_id` terminando em `a2`), com
   `monthly_requests` = o valor da V1002 e **não** 0;
2. `plans.trial_days` = 0 e a coluna "Vence em" das contas lendo "nao expira";
3. a vigência do trial tem permissions ligadas — sem isso o acesso é interseção vazia e ninguém
   consegue nada;
4. **subir com `modules.billing.enabled=false`**: era exatamente o cenário que a V704 quebrava, e é
   o que prova que a fundação nova não tem mais essa dependência.

---

### 3.4 Fase 7 — testes de sessão (PLAN.md §6)
Derrubar o access token e provar: (a) a tela se recupera sozinha; (b) N chamadas concorrentes geram
**um** refresh; (c) refresh inválido leva ao login. Sem isso a regressão volta calada — já voltou
duas vezes.

### 3.5 Fase 8 — PWA, `rename.sh`, CI
PWA está desenhado no §5.4 e **o dono pediu para confirmar antes de fazer**.

### 3.6 ~~Consequência da §12~~ ✅ feito
Quatro mudanças, e o backend compila e sobe limpo contra a `2026.09.10`:
1. `PlanTerm extends LoginTenancyPlanTerm`; saíram `maxUsers`, `permissions` e `hasPermission()`.
   Sobrou `monthly_requests`, marcado no comentário como **o ponto de customização do boilerplate**
   — é a unidade que o report cobra; cada produto troca pela sua ou apaga.
2. `pom.xml` → `seedgrid.login-tenancy.version = 2026.09.10`.
3. `V1000` deixou de criar `plan_term_permissions` (agora é da `V704`).
4. `billing/V502.1` deixou de criar `max_users` (idem); ficou só `monthly_requests`.

**Também entrou `backend/README.md`** — o caminho clone → rodando, com os erros do primeiro boot que
não são erro, o destravamento do e-mail (§3.0) e o aviso de que o bootstrap do admin só roda uma vez.

---

## 4. Credenciais e ambiente de dev

- Backend: `cd backend && ./run.sh` (porta 8080). Admin e front: `pnpm run dev` (3000 / 3001).
- Postgres de dev: container `seedgrid-platform-dev_postgres_1`, porta **5440**, banco
  `seedgrid_app`, `postgres/postgres`.
- **Primeiro admin no banco:** o e-mail e a senha inicial sao os do `dev.env` de *quando o banco
  nasceu* (`SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` / `..._INITIAL_PASSWORD`), com
  `change_password_required = true`. Pode nao corresponder ao `dev.env` atual: o bootstrap cria o
  admin **uma vez so** e trocar o env depois nao atualiza o usuario existente. Os valores em si
  ficam no `dev.env` (nao versionado) -- nao os copie para ca.
- E-mail cifrado no banco (privacy ligado): para descobrir de quem é uma conta, compare
  `users.email_hash` com `HMAC-SHA256(SEEDGRID_PRIVACY_SEARCH_KEY_decodificada, email)` em hex.

---

## 5. Correções feitas fora do roteiro (não perder o porquê)

| O quê | Por quê |
|---|---|
| `isPasswordChangeRequiredResponse` + 409 no `/api/auth/me` + `/change-password` fora da busca de permissões | O 401 `PASSWORD_CHANGE_REQUIRED` se disfarçava de "sessão expirada" **no primeiro login de instalação nova** — o caminho crítico de um boilerplate. Latente no report-admin. |
| Cookie do front → `sg_app_*` | Cookie é por **domínio, não por porta**: logar no front derrubava a sessão do admin, e o sintoma era **403 ao criar plano, sem nada no log**. |
| Seam `AiPriceExtractor` + `NoOpAiPriceExtractor` | O robô de preços puxava o subsistema de IA inteiro por **uma** chamada. ~30 linhas novas preservaram 829 copiadas. |
| Contrato do dashboard alinhado (admin) | O tipo TS prometia `aiReliability`, `aiConfig`, `catalogReady`, tokens — que o backend deixou de enviar. `lib/*-api.ts`: 1181 → 785 linhas. |
| `pnpm-workspace.yaml` com `allowBuilds` | pnpm 11 não roda build script sem allowlist, e as settings **saíram do campo `pnpm` do `package.json`**. |
| `%dev.seedgrid.show-dev-message=true` | Sem isso todo 500 chega ao browser com `devMessage: ""` e a causa vive só no stdout. Só em `dev`: expõe SQL e nomes de coluna. |
| `.gitattributes` | Origem é CRLF; arquivos tocados viraram LF. Sem isso o 1º commit vira um diff de fim-de-linha que esconde a mudança real. |
| 6 rotas de BFF do front | Vieram de template com `{{` não desescapado — **nenhuma compilava**; a assinatura inteira estava quebrada. |

---

## 6. Regras que valem para qualquer retomada

1. **Copiar, não refazer** (PLAN.md §0). É a regra que rege tudo.
2. **403 ≠ 401.** 403 = sessão válida sem permissão (não desloga, não loga nada); 401 = sessão
   inválida. 403 onde a permissão está concedida no banco ⇒ desconfiar de **qual sessão** está em
   uso, não da permissão.
3. **Erro nunca vira lista vazia** (PLAN.md §6, item 6).
4. **Nunca empurrar `seedgrid-fe-components`** sem autorização explícita: push na main **publica no
   npm**.

---

## 7. Retomada — ownership dos endpoints admin e aviso de acesso (2026-09-29)

Decisão de arquitetura reafirmada pelo dono: **o que é específico do host fica no host; o que é
específico de uma extensão fica na extensão; extensão não conhece domínio do host**. Não aproveitar
uma retomada para refatorações fora do escopo pedido.

### Feito nesta etapa

- Removido `AdminDashboardResource` dos backends login-tenancy e subdomain-tenancy. Ele consultava
  diretamente entidades da extensão AI Pricing. O BFF do dashboard agora obtém modelos de
  `/admin/ai/models`; esse endpoint da extensão também devolve `currentPriceValidFrom`, usado para
  manter a data da última atualização no dashboard.
- Movido o fluxo genérico de conceder acesso à empresa-plataforma para um usuário já existente para
  `seedgrid-security`: `AdminPlatformAccessController`, `AdminPlatformAccessService` e o DTO.
  Contrato HTTP preservado em `/admin/platform-access`, protegido por `SELFENTER_INVITE`. As cópias
  do login-tenancy foram removidas; o subdomain-tenancy usa o endpoint da extensão também.
- Builds `mvn -o -DskipTests package` dos dois backends passaram; `pnpm exec tsc --noEmit` passou nos
  dois admins. AI Pricing e Security compilaram e foram instaladas localmente no `.m2`, sem upgrade
  de versão.
- Os testes Surefire de Security **não foram concluídos**: foram interrompidos quando inicializaram
  Testcontainers, para respeitar a instrução de não iniciar Podman. Não há resultado de testes de
  integração desta etapa.

### Billing e avisos de acesso

O Billing observa internamente `UserAccessEvent` após commit e envia os avisos de perda agendada,
perda efetivada e restauração. `UserAccessEmailObserver` e `UserAccessEmails` foram removidos dos dois
hosts. Os templates padrão vivem em `seedgrid-billing-core/runtime/src/main/resources/templates/billing-default/`;
os hosts podem personalizá-los em `backend/src/main/resources/templates/billing/{html,txt}/`.
