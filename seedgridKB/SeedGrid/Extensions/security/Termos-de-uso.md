---
description: "Como exigir o aceite dos termos de uso e da política de privacidade no produto SeedGrid, em perguntas e respostas: onde publicar os documentos, as propriedades seedgrid.security.terms.{required,version,documents}, como subir a versão e o que o usuário vê (reaceite), os endpoints e os erros."
tags: [seedgrid, extension, security, termos-de-uso, privacidade, lgpd, aceite, host, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Aceite de termos de uso e política de privacidade

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-quarkus-ext-security` e `seedgrid-quarkus-ext-login-tenancy` **2026.10.22** (migration `V239` do security, `V704`/`V705` do login-tenancy). Não existe nas versões do Maven Central ([[SeedGrid/Versoes|Versões]]). Os nomes foram conferidos em `SecurityTermsConfig` e nos contratos entregues pela Fase 1b; o comportamento "quando a versão sobe" vem dos guardiões `TermsAcceptanceGuardianIT` e `SignupTermsGuardianIT`.

## O que o produto ganha ao ligar?

- O **cadastro** passa a exigir o aceite dos termos na versão vigente.
- O **login** devolve `termsAcceptanceRequired: true` quando o usuário ainda não aceitou a versão vigente, e o front mostra o aceite de novo (reaceite).
- Cada aceite fica gravado (tabela `sg_terms_acceptance`, **um registro por usuário e versão**, com o instante, o IP e o *user-agent*).
- Padrão: **desligado**. Quem não configura nada continua sem termos.

## Quais propriedades configuro?

```properties
seedgrid.security.terms.required=true
seedgrid.security.terms.version=2026-10
seedgrid.security.terms.documents.terms=https://www.exemplo.com.br/termos
seedgrid.security.terms.documents.privacy=https://www.exemplo.com.br/privacidade
```

| Propriedade | Tipo | Padrão | Efeito |
|---|---|---|---|
| `seedgrid.security.terms.required` | boolean | `false` | Exige o aceite no cadastro e no login. |
| `seedgrid.security.terms.version` | texto | `1` | Versão vigente. **Subir a versão exige novo aceite de todos.** |
| `seedgrid.security.terms.documents.<nome>` | URL | vazio | Documentos públicos, por nome. Os nomes são livres; use `terms` e `privacy`. |

## Onde publico os documentos?

Em qualquer endereço **público** (sem login) que abra no navegador do usuário:

- uma página do seu site (`https://www.exemplo.com.br/termos`), ou
- uma página servida pelo próprio produto, ou
- um arquivo num repositório público do GitHub (use o endereço da página renderizada, não do arquivo bruto, para o usuário ler formatado).

O SeedGrid **não hospeda nem guarda o texto**: guarda só a URL e a versão aceita. `GET /public/terms` devolve a versão e os links, e `GET /public/signup/config` traz `termsRequired`, `termsVersion` e `termsDocuments` para o front montar o aviso. Não coloque credenciais nem dados de cliente nos documentos.

## Como subo a versão?

1. Publique o texto novo na mesma URL (ou numa nova) antes de subir a versão.
2. Mude `seedgrid.security.terms.version` (ex.: de `2026-10` para `2027-01`) e reinicie o produto.
3. No próximo login, quem tem aceite só da versão antiga recebe `termsAcceptanceRequired: true`. O front mostra os documentos e chama `POST /me/terms/accept` com `{version}`.

Escolha um formato de versão que você consiga comparar a olho (data, número). O SeedGrid só compara se é **igual** à vigente.

## O que o usuário vê?

| Momento | O que acontece |
|---|---|
| Cadastro (empresa ou pessoa) | O formulário exige marcar o aceite; o envio leva `acceptedTerms` e `termsVersion`. Sem aceite da versão vigente: **400 `TERMS_NOT_ACCEPTED`**. O aceite fica guardado até a confirmação do e-mail. |
| Login depois que a versão subiu | A resposta traz `termsAcceptanceRequired: true`; o front leva o usuário à tela de reaceite. |
| Login social | Se o usuário ainda não aceitou, o fluxo volta com `status=TERMS_REQUIRED`; o front mostra o aceite e reinicia o fluxo com `acceptedTerms` e `termsVersion`. |
| Empresa em somente leitura | `POST /me/terms/accept` está na lista de exceções do modo `READ_ONLY`: o usuário consegue aceitar mesmo assim. |

## Endpoints

| Rota | Quem | Resposta |
|---|---|---|
| `GET /public/terms` | público | versão vigente e links dos documentos |
| `POST /me/terms/accept` `{version}` | usuário logado | registra o aceite; versão diferente da vigente: **409 `TERMS_VERSION_MISMATCH`** |
| `GET /public/signup/config` | público | `termsRequired`, `termsVersion`, `termsDocuments` |

## Perguntas rápidas

**Preciso de aceite separado para termos e privacidade?** Não. É um aceite por versão; os dois documentos aparecem juntos. Para versões independentes seria preciso outra propriedade, que não existe.

**Dá para ter termos diferentes por cliente?** Não: a versão e os documentos são do produto.

**Os usuários antigos precisam aceitar?** Sim, no primeiro login depois de ligar `required=true`, porque não há aceite da versão vigente.

**Posso consultar quem aceitou?** Os registros ficam em `sg_terms_acceptance`. Os insumos não listam endpoint de consulta ou relatório de aceites **[não verificado]**; o produto lê pelo banco.
