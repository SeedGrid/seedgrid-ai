---
description: "Como ligar o login com Google no produto SeedGrid, em perguntas e respostas: o que fazer no Google Cloud (projeto, tela de consentimento, cliente OAuth, redirect_uri por ambiente, modo Testing x produção), as variáveis de ambiente e as propriedades seedgrid.security.social.*, os segredos de estado e de criptografia, o que o front recebe e o que fazer quando o e-mail não vem verificado."
tags: [seedgrid, extension, security, login-social, google, oauth, oidc, host, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Login com Google: como ligar, passo a passo

> **Status: NÃO PUBLICADO.** O módulo `seedgrid-security-social` e as versões de `security` e `login-tenancy` que o usam (todas **2026.10.22**) ainda não estão no Maven Central ([[SeedGrid/Versoes|Versões]]). Os nomes das propriedades abaixo foram conferidos no `microprofile-config.properties` e no README do módulo. O que é **procedimento do Google** (telas do Cloud Console) não foi executado aqui e pode mudar: confira na documentação do Google. Isso está marcado como **[procedimento do fornecedor]**.

Contexto: o login social é um módulo **opcional** (`seedgrid-security-social`, sobre o `quarkus-oidc`). Quem não o adiciona não carrega OIDC. As regras de segurança (vínculo de conta, 2FA, termos) estão em [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]], Fase 2b. Esta nota é só o **como fazer**.

## O que eu preciso fazer à mão?

Três coisas, nesta ordem: (1) criar o cliente OAuth no Google Cloud; (2) gerar dois segredos seus; (3) passar tudo ao produto por variável de ambiente. O código não muda.

## Como crio o cliente no Google Cloud? [procedimento do fornecedor]

1. Abra o Google Cloud Console e crie um **projeto** (ou escolha o do produto).
2. Em **APIs e serviços › Tela de consentimento OAuth**, configure o aplicativo: nome, e-mail de suporte, domínio, links da política de privacidade e dos termos (use os mesmos de `seedgrid.security.terms.documents`, veja [[SeedGrid/Extensions/security/Termos-de-uso|Termos de uso]]).
3. Em **Escopos**, deixe só `openid`, `email` e `profile`. O SeedGrid não pede mais nada ao Google.
4. Em **Credenciais › Criar credenciais › ID do cliente OAuth**, escolha **Aplicativo da Web**.
5. Em **URIs de redirecionamento autorizados**, cadastre a `redirect_uri` **exata** de cada ambiente (próxima pergunta).
6. Copie o **ID do cliente** e o **Segredo do cliente**. O segredo é credencial: vai só para variável de ambiente, nunca para o git, o chat ou o plano.

Recomendação: **um cliente por ambiente** (desenvolvimento, homologação, produção), cada um com a sua `redirect_uri`. Assim um segredo vazado em desenvolvimento não vale em produção.

## Qual é a `redirect_uri` exata?

É o endereço do **backend** que recebe a volta do Google. O caminho é sempre `/public/auth/social/google/callback`; o início é o endereço público da API naquele ambiente:

| Ambiente | `redirect_uri` a cadastrar no Google |
|---|---|
| Desenvolvimento local | `http://localhost:8080/public/auth/social/google/callback` |
| Homologação | `https://api-hml.exemplo.com.br/public/auth/social/google/callback` |
| Produção | `https://api.exemplo.com.br/public/auth/social/google/callback` |

- O Google compara **caractere por caractere**: `http` x `https`, porta, barra no fim e maiúsculas contam. Se não bater, o Google mostra o erro `redirect_uri_mismatch`.
- A mesma URL vai na propriedade `seedgrid.security.social.google.redirect-uri`. O padrão é só o caminho (`/public/auth/social/google/callback`); em produção use a URL absoluta que você cadastrou. Ela precisa **terminar** em `/public/auth/social/google/callback`.

## Quais propriedades e variáveis eu configuro?

```properties
# application.properties do produto
seedgrid.security.social.providers=google
seedgrid.security.social.allowed-return-hosts=app.exemplo.com.br
```

```bash
# variáveis de ambiente (valores reais só no ambiente, nunca no git)
SEEDGRID_SECURITY_SOCIAL_GOOGLE_CLIENT_ID=<id do cliente do Google>
SEEDGRID_SECURITY_SOCIAL_GOOGLE_CLIENT_SECRET=<segredo do cliente do Google>
SEEDGRID_SECURITY_SOCIAL_GOOGLE_STATE_SECRET=<segredo gerado por você, 32 caracteres ou mais>
SEEDGRID_SECURITY_SOCIAL_GOOGLE_ENCRYPTION_SECRET=<outro segredo gerado por você, 32 caracteres ou mais>
SEEDGRID_SECURITY_SOCIAL_GOOGLE_REDIRECT_URI=https://api.exemplo.com.br/public/auth/social/google/callback
```

| Propriedade | Efeito |
|---|---|
| `seedgrid.security.social.providers` | Lista de provedores ligados (`google`, `facebook`). Use `google`, **não** `gmail`. Ausente ou vazia = módulo inerte (nenhum botão, nenhuma rota ativa). Não existe chave "enabled" por provedor: quem liga é só a lista. |
| `seedgrid.security.social.google.client-id` / `.client-secret` | Credenciais do cliente OAuth. |
| `seedgrid.security.social.google.state-secret` | Cifra o estado do fluxo (proteção contra CSRF). |
| `seedgrid.security.social.google.encryption-secret` | Cifra o cookie de sessão do fluxo OIDC. |
| `seedgrid.security.social.google.redirect-uri` | A `redirect_uri` cadastrada no Google. |
| `seedgrid.security.social.allowed-return-hosts` | Hosts do **front** para onde o usuário pode voltar (`returnTo`), separados por vírgula; aceita `host:porta` e `*.dominio`. Padrão: o host de `seedgrid.security.frontend.base-url`. Protege contra *open redirect*. |
| `seedgrid.security.social.error-url` | URL do front para falhas do provedor (ex.: usuário cancelou). Padrão: `frontend.base-url` + `frontend.login-path`. |
| `seedgrid.security.social.ticket-ttl` | Validade do ticket de uso único que leva o resultado ao front. Padrão `PT60S`. |

## Como gero `state-secret` e `encryption-secret`?

São segredos **seus**, não do Google. Gere valores aleatórios com **32 caracteres ou mais**:

```bash
openssl rand -base64 48
```

Precisam ter 32 caracteres ou mais e ser **iguais em todas as instâncias** do mesmo ambiente (o estado e o cookie do fluxo são cifrados com eles; se cada pod tiver um valor, o login que começa num pod falha ao voltar em outro). O produto não sobe com provedor listado e segredo ausente ou fraco. Use um par diferente por ambiente.

## O que acontece se eu errar a configuração?

| Sintoma | Causa | Correção |
|---|---|---|
| O produto **não sobe**, com mensagem do validador de provedores | Provedor listado sem `client-id`/`client-secret`/segredos, id desconhecido (`gmail`) ou segredo fraco | Preencher as variáveis, usar `google`, ou tirar o provedor da lista |
| Google mostra `redirect_uri_mismatch` | A URL cadastrada não é igual à de `redirect-uri` | Igualar as duas, caractere por caractere |
| `404 SOCIAL_PROVIDER_DISABLED` | O provedor não está em `seedgrid.security.social.providers` | Incluir `google` na lista |
| Volta ao front com `status=REJECTED&code=...` | A política recusou (ex.: conta existente sem e-mail verificado) | Ver "e-mail não verificado" abaixo |
| Volta com `status=TERMS_REQUIRED` | `seedgrid.security.terms.required=true` e o usuário não aceitou a versão vigente | Mostrar os termos e reenviar `acceptedTerms`/`termsVersion` |
| Rotas autenticadas respondem 401, 403 ou 404 mesmo com token válido do SeedGrid, com o módulo no classpath | Versão do módulo anterior à 2026.10.22 (bug do `OidcJsonWebTokenProducer`) | Atualizar para a 2026.10.22 |

## Modo Testing x produção no Google [procedimento do fornecedor]

- Em **Testing**, só os **usuários de teste** que você cadastra na tela de consentimento conseguem entrar. Use em desenvolvimento e homologação.
- Para liberar qualquer conta Google, publique o aplicativo (**In production**). Com apenas os escopos `openid`, `email` e `profile`, o Google normalmente não exige verificação do aplicativo, mas confirme na documentação atual.

## O que o front faz?

1. `GET /public/signup/config` devolve `socialProviders` (a lista ligada). O front só mostra o botão dos provedores que estão nela.
2. O botão leva o navegador a `GET /public/auth/social/google/login?returnTo=<url do front>&acceptedTerms=&termsVersion=`.
3. O usuário autentica no Google; o Google volta ao callback do **backend**; o backend volta ao `returnTo` com `?ticket=...` (sucesso).
4. O front troca o ticket: `POST /public/auth/social/exchange {ticket}` devolve o mesmo `AuthResponse` do login por senha. O ticket vale uma vez e por 60 s. 2FA ativo continua valendo.
5. Resultados sem sucesso voltam como `?status=EMAIL_REQUIRED&pendingToken=...`, `TERMS_REQUIRED` ou `REJECTED&code=...`.

Os boilerplates `login-tenancy-b2c` e `login-tenancy-b2b` já trazem as rotas do BFF e o botão (no b2c, a lista vem de `SEEDGRID_SOCIAL_PROVIDERS`, vazia por padrão). O `subdomain-tenancy` não tem login social.

## E se o e-mail não vem verificado, ou nem vem?

- O Google devolve `email` e `email_verified` na maioria dos casos. O SeedGrid **só vincula** o login social a um usuário que já existe se o e-mail do provedor vier **verificado**.
- Sem e-mail verificado (ou sem e-mail, como no Facebook), o fluxo não cria nem vincula nada: devolve `EMAIL_REQUIRED` com um `pendingToken`. O front pede o e-mail (`POST /public/social/email`), o backend envia um **código de 6 dígitos** e o usuário o confirma (`POST /public/social/confirm-email`). Só então a conta é criada ou vinculada. Não existe confirmação só por link.
- A identidade é `(provedor, subject)`, nunca o e-mail: a mesma pessoa que trocar de e-mail no Google continua sendo a mesma conta.
- Pessoa física (`customer-type` B2C ou BOTH no `login-tenancy`): o CPF **não** é pedido no login social.

## E o Facebook?

Funciona com a mesma lista (`seedgrid.security.social.providers=google,facebook`) e variáveis `SEEDGRID_SECURITY_SOCIAL_FACEBOOK_*`, mas foi validado só com servidor falso, sem conta real da Meta. **[não verificado com conta real]**. Antes de usar em produção, confirme com a Meta o escopo, o emissor do ID token e as exigências de política de privacidade e exclusão de dados.

## Onde está o código e o que protege

Módulo `seedgrid-quarkus-ext-security-social` (2026.10.22). Guardiões: `SocialLoginPolicyGuardianIT`, `SocialLoginFlowGuardianIT`, `SocialNoTenantBootGuardianIT`, `SocialLoginSameAccountGuardianIT`. Detalhes de política, contratos e cookies: [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]], Fase 2b.
