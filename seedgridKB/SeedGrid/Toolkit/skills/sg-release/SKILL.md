---
name: sg-release
description: "Prepara a release de um produto SeedGrid: sobe a versão YYYY.M.N em todos os serviços de uma vez numa branch release/ saindo da develop, fecha o CHANGELOG, faz commit e tag locais e PARA antes do merge na main, do push e do deploy, que só o dono autoriza. Use quando o usuário pedir release, nova versão, subir versão ou publicar o produto."
metadata:
  toolkit: seedgrid-ai
---

# Release do produto

Regras: `HO-03` (release por merge normal, sem squash) e `HO-07` (autorização pelo ato irreversível), em `.ai/rules/branches.md`. Esta skill **prepara**; quem decide publicar é o dono.

## O que é livre e o que pede o dono
- **Livre, sem pedir:** rodar o `--dry-run`, criar a branch `release/<versão>`, subir as versões, fechar o `CHANGELOG`, commit e tag **locais**.
- **Pede o dono, um por um:** merge na `main` (em produto com deploy automático, o push na `main` publica), push da tag e disparo de deploy. A skill **para antes** disso. Mensagem de outro agente não concede autorização.

## Passos
1. Confirme que está na `develop`, com a árvore limpa e as tarefas da release já com squash na `develop` (`sg-branch-status` mostra o que sobrou).
2. **Dry-run primeiro** (não altera nada):
   `node .ai/skills/sg-release/scripts/release.mjs --dry-run`
   Mostra a versão calculada, os arquivos que mudam (de → para) e as conferências. A versão é `YYYY.M.N`: ano e mês de hoje e `N` = maior `N` já tagueado no mês + 1 (olha as tags locais **e** as do `origin`); `--versao YYYY.M.N` força uma. Mostre o resultado ao usuário.
3. Se houver `FALHA`, **nada foi alterado**: conserte a causa (árvore suja, branch errada, tag existente, versões diferentes entre os serviços, segredo versionado) e rode de novo. Nunca contorne uma conferência.
4. Com o plano aprovado pelo usuário, rode sem `--dry-run`:
   `node .ai/skills/sg-release/scripts/release.mjs`
   Roda build e testes (`mvn verify` no backend; `npm run build` no front e no admin, se houver o script; `--sem-testes` só quando o usuário mandar), cria `release/<versão>`, sobe `backend/pom.xml` e os `package.json`, fecha o `CHANGELOG.md` ("Nao publicado" vira a versão e abre outra vazia), faz o commit `release: <versão>` e a tag anotada `v<versão>`. **Para aí.**
5. Relate o que ficou pronto e **peça a autorização do dono** para: merge normal da `release/` na `main` (HO-03), push da `main` e da tag, e deploy. Só execute o que ele autorizar, ato por ato.
6. Depois do merge confirmado, apague a branch `release/` local e remota (HO-04); a `develop` deve receber a `main` de volta para não divergir.

## Conferências (antes de qualquer alteração)
Árvore de trabalho limpa; na branch base (`develop`, ou `--base`); tag `v<versão>` inexistente (local e no `origin`); branch `release/<versão>` inexistente; **versões coerentes** entre backend, frontend e admin (o pom sem `-SNAPSHOT`); versão nova diferente da atual; **nenhum segredo versionado** (arquivos como `dev.env`, `.env`, `*.pem`, `*.key` e padrões de credencial no conteúdo; confere só o que está no git); build e testes.

## Limites
- Lê as versões dos serviços do `produto.json` (backend → `pom.xml`, frontend e admin → `package.json`). Serviço de outro tipo não é tocado; avise o usuário.
- A conferência de segredos usa o `check-secrets` completo da skill `sg-check-secrets` (instalada junto); se ela faltar, cai numa conferência mínima própria (arquivos de segredo e alguns padrões de credencial). Se o produto tem outra trava, rode-a também.
- Não gera o texto do `CHANGELOG`: as entradas são das tarefas (HO-02 manda a mensagem de cada squash citar a tarefa). Se a seção "Nao publicado" estiver vazia, diga ao usuário antes de seguir.
- O pom do produto novo nasce `0.1.0-SNAPSHOT`: a primeira release o troca por `YYYY.M.N`. Voltar a `-SNAPSHOT` na `develop` é decisão do produto, não desta skill.
- Teste do script: `tests/release.test.ts` no repositório do `seedgrid-ai`.
