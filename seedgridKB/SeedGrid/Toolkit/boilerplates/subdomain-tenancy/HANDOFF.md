# Handoff — subdomain-tenancy

> **Pausa em 2026-09-28:** próximo trabalho é integrar AI pricing à notification.
> A implementação ainda não começou. Estado, commits de referência, pendências e
> roteiro estão em [NOTIFICATION-HANDOFF.md](../NOTIFICATION-HANDOFF.md).

## Pedido e restrições

Construir três projetos: backend, admin e frontend, nessa ordem, copiando a base de
login-tenancy e usando como referência o backend
`D:/empreendedorismo/seedgrid/seedgrid-platform-examples/examples/seedgrid-subdomain-tenancy-example`.

Usar Git Bash, Java 21 e artefatos já instalados no `.m2`. Não alterar extensões nem
reimplementar o que elas fornecem. Não iniciar Podman nem copiar segredos.

## Estado

- Trabalho na branch `main`. A branch `appmod/java-upgrade-20260927110944` foi deixada
  intacta; seus commits de upgrade não foram incorporados.
- Criados os três projetos em `subdomain-tenancy`, com código e recursos versionáveis
  copiados de login-tenancy. Dependências JS e lockfiles preservados.
- Backend usa Java 21, Quarkus 3.30.6 e subdomain-tenancy **2026.09.26**, instalado no
  Maven local. O metadado `release` também apontava 2026.09.25-2; esta versão possui
  billing anterior e não atende ao contrato das telas copiadas. A 2026.09.26 instalada
  foi selecionada com seu próprio BOM, sem upgrade ou alteração de extensões.
- Datasource master, datasource dinâmico de tenants, pacotes Hibernate e migrations
  configurados conforme a extensão. Tabelas administrativas do host ficam no master.
- Dependências transitivas de security, privacy e infraestrutura Quarkus não são
  redeclaradas no POM. Providers concretos de audit, billing e WhatsApp são do host.
- Login, 2FA, refresh, senha, usuários, perfis, permissões e avatar usam o security.
  O host mantém apenas composição de perfil e adaptação dos publicIds de perfis ao
  DTO de escrita de usuário da versão instalada. Os DTOs duplicados de senha e avatar
  inicialmente copiados foram removidos.
- Links de e-mail reutilizam `SecurityLinkBuilder`, alterando somente o domínio de
  destino conforme o tenant. A implementação foi movida para a extensão na continuação
  registrada abaixo.
- Admin encaminha sempre o domínio master; frontend valida e encaminha o domínio do
  cliente. Cookies distintos, HttpOnly e sem compartilhamento entre subdomínios.
- Signup usa `/public/tenants`, confirmação `{subdomain, code}` e reenvio por subdomínio.
  Após confirmação, abre o login no domínio do cliente. A raiz oferece seleção de subdomínio.
- Configurações de exemplo e instruções estão nos READMEs de cada projeto.

## Validação

- Backend: `mvn -o -DskipTests package` passou.
- Admin: `pnpm exec tsc --noEmit` e `pnpm build` passaram.
- Frontend: `pnpm exec tsc --noEmit` e `pnpm build` passaram.
- Dependências JS instaladas com `--frozen-lockfile`, sem atualização das versões.
- Verificação isolada dos helpers dos BFFs com requests/fetch simulados passou:
  dois tenants preservam seus hosts, domínios inválidos são rejeitados, headers
  enviados pelo cliente não selecionam outro tenant e o admin permanece no master.
- Quarkus ainda emite avisos de classes auxiliares de commons/privacy sem persistence
  unit explícita; o empacotamento conclui com sucesso. Não foram alteradas as extensões.

## Validação operacional pendente

Correção após a primeira execução de `run.sh`: removidas as sobrescritas de WhatsApp
do `application.properties`. O valor vazio do host anulava o provider `default` da
extensão e causava `SRCFG00040`. Defaults e override `evolution` foram verificados
isoladamente com SmallRye Config e os JARs instalados, sem iniciar banco ou serviços.

Não foi executado o fluxo integrado com PostgreSQL/SMTP: requer preencher os arquivos
locais de ambiente e gerar chaves próprias. Verificar primeiro boot master, cadastro de
dois tenants, e-mails, login/2FA/refresh e isolamento entre os bancos.
Build bem-sucedido não comprova esses fluxos em runtime.

Nenhum commit ou push foi realizado.

## Continuação — limpeza de paths e exceptions (2026-09-30)

O pedido mais recente foi deixar nos hosts somente caminhos e exceções do domínio
próprio. Foram removidos dos backends de `login-tenancy` e `subdomain-tenancy`:

- `src/main/java/br/com/seedgrid/app/api/common/RestControllerPath.java`;
- todas as classes da pasta `src/main/java/br/com/seedgrid/app/api/common/exceptions`
  (`ApiException`, `AppApiExceptionExtension` e wrappers HTTP genéricos).

Auditoria antes da remoção: nenhum recurso do host declarava rotas locais que usassem
`RestControllerPath`, e busca no código dos dois backends não encontrou referências
às classes de exception. As rotas das extensões seguem definidas nas próprias
extensões; o tratamento genérico de exceções continua em Commons (`ApiExceptionHandler`).
Exceções de uma funcionalidade devem pertencer à extensão correspondente; exceções
específicas do domínio do host podem ser adicionadas junto ao domínio quando necessárias.

Validação após as remoções:

- `mvn -o test` passou nos dois backends; `DomainAuditTest` teve 4 testes ignorados
  em cada host por depender da configuração de integração.
- `mvn -o package -DskipTests` passou em login-tenancy e subdomain-tenancy.
  Para subdomain foi necessário fornecer a propriedade já usada na validação anterior:
  `-Dseedgrid.notification.version=2026.09.28-SNAPSHOT`.
- Busca final não encontrou usos de `RestControllerPath` ou das exceções removidas
  em `src` de nenhum dos backends.
- Um primeiro comando do package de subdomain foi interpretado incorretamente pelo
  PowerShell devido ao `-D...`; foi repetido via Git Bash e concluiu com sucesso.

Também permanece concluída a extração de `ApiKeyAwareCurrentUserProvider` para a
extensão API Keys, removendo suas cópias dos dois hosts. Testes da extensão passaram:
10 testes unitários e a suíte de integração Testcontainers (12 testes Surefire e
1 teste Failsafe). A versão local instalada da extensão foi usada pelos hosts.

Não foram feitas alterações em admin ou frontend nesta continuação. Nenhum serviço
Podman foi iniciado por este trabalho e nenhum commit foi realizado. Ao retomar,
consultar primeiro este handoff e verificar `git status` nos três repositórios antes
de qualquer nova alteração; há trabalho anterior no workspace que não deve ser
revertido incidentalmente.

## Continuação — links de Security por subdomínio (2026-10-01)

`TenantSecurityLinks` foi movida do backend host para
`seedgrid-quarkus-ext-subdomain-tenancy/runtime`, onde substitui o `SecurityLinkBuilder`
somente quando a extensão de subdomínios está instalada. Ela usa
`seedgrid.security.frontend.base-url` como origem raiz: em requisições de tenant troca
o host para `{tenant}.{host-raiz}` e preserva o caminho e a query (inclusive o token);
em master ou sem request mantém a origem configurada. `login-tenancy` não instala a
extensão subdomain-tenancy e continua usando o builder genérico do Security.

Removida a propriedade duplicada `seedgrid.app.frontend.base-url` e a variável
`SEEDGRID_APP_FRONTEND_BASE_URL`. O exemplo do subdomain agora configura apenas
`SEEDGRID_SECURITY_FRONTEND_BASE_URL=http://localhost:3002`, que passa a significar a
origem raiz do frontend usada pelos links de segurança.

Validação: 3 testes unitários novos da extensão passaram (rewrite para tenant,
preservação de path/query e validação do tenant); `mvn -o test` do backend passou
(4 `DomainAuditTest` ignorados pela configuração padrão); `mvn -o package -DskipTests`
concluiu Quarkus augmentation com sucesso, usando a extensão local atualizada
`2026.09.26`. O primeiro package detectou o escopo CDI inadequado; a classe foi
ajustada para `@Singleton`, retestada e o package passou. A instalação local Maven
usou `-Dgpg.skip=true` e não alterou as configurações globais. Nenhum serviço Podman
foi iniciado nesta etapa.

## Continuação — remoção de `MasterAdminFilter` (2026-10-01)

Removido `backend/src/main/java/br/com/seedgrid/app/api/common/security/MasterAdminFilter.java`.
O filtro não participava da resolução do tenant: essa continua sendo feita pela URL
(`crm...` resolve `master`; `{tenant}.crm...` resolve o tenant). Ele aplicava uma
regra independente baseada apenas no prefixo `/admin`, negando todas essas rotas em
qualquer contexto de tenant. A busca não encontrou outros usos do filtro no host.
Assim, os endpoints continuam usando o tenant derivado do host e suas autorizações
normais, sem esta restrição genérica por caminho.

## Continuação — remoção de `SeedgridAppApplication` (2026-10-01)

Removida dos dois backends a classe `SeedgridAppApplication`, que somente declarava
`@ApplicationPath("/")`. Quarkus registra os recursos REST sem uma subclasse JAX-RS
`Application`; o caminho `/` era redundante. `mvn -o package` passou em
login-tenancy e subdomain-tenancy; no segundo foi fornecido
`-Dseedgrid.notification.version=2026.09.28-SNAPSHOT`. Em ambos, os 4 testes de
`DomainAuditTest` foram ignorados pela configuração padrão. Após a correção abaixo,
os packages foram executados novamente.

## Continuação — `StartupBannerLogger` no Commons (2026-10-01)

Movido para `seedgrid-quarkus-lib-commons` o bean `StartupBannerLogger`; o recurso
`banner.txt` pertence a cada host e permanece nos dois backends. Cada host continua
configurando `app.build.version=${APP_VERSION:dev}`, pois essa versão pertence à imagem
que está sendo implantada. README do Commons documenta o logger compartilhado.

Validação: `mvn -o test` passou no Commons (246 testes); `mvn -o install
-DskipTests -Dgpg.skip=true -Dmaven.javadoc.skip=true` instalou a versão existente
2026.09.25 no `.m2`, sem upgrade; `mvn -o clean package` passou nos dois backends
(4 `DomainAuditTest` ignorados em cada build). Conferência dos JARs: cada JAR de host
contém `banner.txt`; o JAR do Commons contém `StartupBannerLogger.class` e não contém
`banner.txt`.
