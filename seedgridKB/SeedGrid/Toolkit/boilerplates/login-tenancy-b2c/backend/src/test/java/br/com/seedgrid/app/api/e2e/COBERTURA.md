# Cobertura da bateria E2E do backend (login-tenancy-b2c)

Tarefa TB.3 (parte backend) do plano do boilerplate de pessoa fisica, no padrao da Fase E2E (TE.2). HTTP real na porta em
que o backend sobe (`@QuarkusTest` + `@TestHTTPResource` + RestAssured), Postgres 16 via Testcontainers, limites de taxa
desligados. O e-mail e simulado e **gravado** (`E2eRecordingEmailService`, prioridade acima do `@Mock` no-op da
auditoria) para o teste ler o codigo de confirmacao que o usuario receberia; o codigo do cadastro tambem pode ser lido do
repositorio. Fixture em processo sem caminho HTTP, por desenho: conceder ao administrador da plataforma o perfil global
`OPERADOR_PLATAFORMA` com `COMPANY_ACCESS_MODE_UPDATE` (a permissao nao vai no ADMIN e o ADMIN nao a delega).

## Contornos

Nenhum. O contorno `OidcProducerWorkaroundProfile` foi removido: o defeito 1 foi corrigido no `seedgrid-security-social` 2026.10.22 (exclui `OidcJsonWebTokenProducer`/`OidcSessionImpl` do ArC). `B2cBearerAuthWithSocialModuleE2ETest` agora e verde e guarda a regressao.

Comando (um `mvn` por vez, com a trava de infra):

```
cd backend
flock /d/tmp/infra.lock ~/.sdkman/candidates/maven/current/bin/mvn.cmd -o -Dgpg.skip=true test '-Dtest=B2c*E2ETest'
```

## Item -> teste ou motivo

| Item | Teste / motivo |
|---|---|
| `GET /public/signup/config` (B2C, CPF opcional, sem termos, sem social) | `B2cSignupE2ETest.signupConfigDescribesAB2cProduct...` |
| Cadastro PF sem CPF: pendente -> confirma -> conta PF, titular ADMIN, trial | `B2cSignupE2ETest.signupWithoutCpfIsPendingThenConfirms...` |
| Cadastro PF com CPF: documento registrado, CPF repetido (pendente e confirmado) = 409 | `B2cSignupE2ETest.signupWithCpfRegistersTheDocument...` |
| CPF invalido / campos faltando / senha fraca = 400 | `B2cSignupE2ETest.invalidCpfAndWeakOrMissingFieldsAreRefused` |
| E-mail existente = 409 (sem vinculacao: uma conta, uma pessoa) | `B2cSignupE2ETest.anEmailThatAlreadyHasAnAccountIsConflict` |
| Mesmo e-mail pendente reaproveita a solicitacao | `B2cSignupE2ETest.theSamePendingEmailReusesTheRequest` |
| Cadastro por CNPJ indisponivel (403 `SIGNUP_TYPE_NOT_ALLOWED`) | `B2cSignupE2ETest.companySignupByCnpjIsNotAvailable...` |
| Login, refresh, sem acesso de plataforma | `B2cSignupE2ETest.thePersonCanLogInRefreshAndChangeNothing...` |
| `personal-document-required=true`: sem CPF = 400 `PERSONAL_DOCUMENT_REQUIRED`; com CPF segue | `B2cDocumentRequiredE2ETest` (3) |
| Termos (exigencia, versao vigente, aceite gravado, versao errada = 409) | `B2cTermsE2ETest` (3) |
| Estado de acesso: READ_ONLY (le, nao grava, outra pessoa intacta), volta a ACTIVE; DISABLED e desativar o titular recusados (unica empresa / ultimo ADMIN); cliente sem acesso ao endpoint | `B2cAccessStateE2ETest` (3) |
| Planos GRATIS/PREMIUM semeados, trial na assinatura, sem BASICO/PRO | `B2cAccountE2ETest.personalDemoPlansAreSeeded...` |
| Isolamento entre duas pessoas (empresa pessoal, calendario, chave de API) | `B2cAccountE2ETest.twoPeopleNeverSeeEachOthers...` |
| Ausencia dos endpoints de equipe/convite | `B2cAccountE2ETest.teamAndInviteEndpointsAreAbsentInThePersonalProduct` (verde: self-enter, convite e `/me/security/*` desligados por config) |
| Login social com provedor OIDC simulado (`quarkus-test-oidc-server` no lugar do Google): provedor anunciado, outro desligado (404 `SOCIAL_PROVIDER_DISABLED`), `returnTo` fora da lista (400), fluxo completo sem e-mail -> pedir e confirmar e-mail por codigo -> conta PF sem senha e sem CPF -> novo login com ticket de uso unico (`/exchange`) | `B2cSocialLoginE2ETest` (3) |
| Social + termos, 2FA no social, Facebook, provedor real | Nao coberto: termos no social e 2FA ja tem guardiao no security (`SocialLoginTermsGuardianIT`, `SocialLoginPolicyGuardianIT`); login real com Google/Facebook e manual do dono (E2E.M1/E2E.M2). |
| Limites de plano, downgrade, inadimplencia na conta PF | A conta PF tem 1 empresa e os planos de demonstracao nao limitam empresas/usuarios; troca de plano exige vinculo com o provedor (Stripe), e a aplicacao no fim do ciclo depende de relogio e agendador. Mesmos motivos do b2b (`COBERTURA.md` de la). Entram na regressao TE.4. |

## Defeitos encontrados (corrigidos)

1. **Bearer nao reconhecido com o modulo social** — corrigido na extension `seedgrid-security-social` (exclusao do produtor do `quarkus-oidc`; ver CHANGELOG de la).
2. **Equipe e convite na API** — corrigido por configuracao no `application.properties`: `seedgrid.security.self-enter.enabled=false`, `...self-enter.invite-enabled=false` e `seedgrid.security.account.enabled=false` (desliga `/me/security/*`). Todas as quatro rotas respondem 404.
3. **Observacao (por desenho, mas relevante para B2C):** a conta pessoal nao pode ser colocada em DISABLED nem o titular desativado pela plataforma (409 `LAST_ADMIN_PROTECTED`). O unico freio contra conta abusiva e o READ_ONLY. Registrado em `B2cAccessStateE2ETest.aPersonalAccountCannotBeDisabled...`.
