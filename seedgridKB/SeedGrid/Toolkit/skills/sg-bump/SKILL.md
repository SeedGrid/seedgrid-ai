---
name: sg-bump
description: Sobe a versão do projeto inteiro de uma vez, mantendo a mesma versão no back (pom.xml) e em todos os apps de front (package.json), e no que mais a exibir. Use quando pedirem bump, nova versão ou release do projeto (patch, minor, major ou uma versão informada). Não altera dependências.
metadata:
  toolkit: seedgrid-ai
---

# Bump de versão do projeto

Regra: **o projeto inteiro tem uma única versão**. Back e todos os fronts (por exemplo `backend/`, `admin/`, `frontend/`) saem sempre com o mesmo número. Esta skill muda **a versão do próprio projeto**; não sobe versões de dependências nem de extensions SeedGrid.

## Passos

1. **Descobrir a versão atual e onde ela está.** Leia a versão do `pom.xml` do back (a do projeto, não a de `<dependency>` nem `<parent>`) e o campo `version` de cada `package.json` de aplicação (ignore `node_modules` e pacotes que não sejam do projeto). Procure também onde a versão aparece como texto: `application.properties` (`app.build.version=${APP_VERSION:dev}` lê da variável de ambiente `APP_VERSION`, então não é editado), `Dockerfile`, `docker-compose`, README e changelog. Se as versões atuais já divergem entre si, **pare e mostre a divergência** antes de seguir.
2. **Definir a nova versão** `X.Y.Z` (semver) a partir do pedido: `patch` (correção), `minor` (funcionalidade compatível), `major` (quebra de compatibilidade) ou um número informado. Sem indicação, sugira com base nas mudanças desde a última versão e confirme com o usuário.
3. **Mostrar o plano** (arquivo: versão atual → nova) e só então alterar.
4. **Aplicar** a mesma `X.Y.Z` em todos os arquivos encontrados: `pom.xml` do back (sem sufixo `-SNAPSHOT` em release; se o projeto usa `-SNAPSHOT` no desenvolvimento, pergunte se quer voltar para o próximo `-SNAPSHOT` depois), cada `package.json` de aplicação e os textos que repetem a versão. Mantenha a formatação dos arquivos; mude só a versão. Em `package.json` com lockfile, atualize também o campo de versão do próprio projeto no lockfile quando existir.
5. **Verificar.** Rode build e testes de cada parte (`mvn -q verify` ou o comando do projeto, e `build`/`lint`/testes dos fronts) e confirme que nenhuma versão ficou para trás com uma busca pela versão antiga.
6. **Registrar.** Atualize o changelog se o projeto tiver um, com o que mudou desde a versão anterior.
7. **Entregar.** Liste os arquivos alterados e os resultados dos comandos. Commit, tag e push **só se o usuário pedir**; sugira a mensagem e a tag (`vX.Y.Z`).

## Regras

- Nunca altere versões de `<dependency>`, `<parent>`, BOMs, extensions SeedGrid ou pacotes `@seedgrid/*`; atualização de dependências é outra tarefa.
- Não publique artefatos, não faça deploy e não envie nada a serviços externos.
- Se houver mudanças não commitadas no repositório, avise antes de alterar.
