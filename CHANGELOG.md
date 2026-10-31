# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). A versão do pacote (`package.json`) é a mesma do conteúdo (`seedgridKB/manifest.json`). Atualize este arquivo no mesmo commit do bump.

## [Não publicado]

### Adicionado
- Skill `sg-diagnostico` (modo “adequar plano”, P114.F1.T1): `diagnostico.mjs` diagnostica um plano livre contra o formato da `sg-plan-goal` e grava o esqueleto ao lado do original (ids `P<plano>.F<fase>.T<tarefa>`, `aidlc:` do lock, hipóteses viradas em tarefas de prova, decisões do dono como `.D<n>` com `Pergunta:`/`Recomendacao:`, decisões já resolvidas como `[x]`, blocos `/goal`), sem nunca sobrescrever. A `sg-plan-goal` ganha a seção “Modo adequar plano”. Testes com plano de exemplo. Cobre o caso do briefing escrito em outra ferramenta: o `arquiteto` classifica cada item (ecossistema já oferece, adaptar, domínio, componente novo) citando a nota da KB, e a divergência do briefing vira decisão do dono. `coordenacao.md`: o coordenador lê o plano entregue e roda o `controle.mjs status` antes de apresentá-lo.
- Atalho `sgr` para o `seedgrid-ai` (mesmo executável; o nome longo continua). Teste do `bin`.
- `scripts/e2e-goal-geral.mjs`: teste com agente real do goal do plano inteiro (`sg-plan-goal`): plano pronto com 3 tarefas independentes, uma decisão do dono não marcada de antemão e uma tarefa dependente; confere que o executor faz o que dá, marca `[?]` com `Pergunta:`/`Recomendacao:`, não inventa a política e pergunta no fim (P114.F1.T2).

### Alterado
- HO-10 (decisão do dono, 2026-10-31): componente SeedGrid que não existe é criado **local** no produto, no padrão SeedGrid; no fim do plano o `arquiteto` só **sugere** a promoção à suíte de componentes, sem mover nada. `controle.mjs status` avisa tarefas com `<definir>` ainda por preencher (o coordenador precisa ler e completar o plano antes de apresentá-lo).
- Nome dos planos do produto: `P<n>-AAAA-MM-DD-assunto.md`, com `<n>` = próximo número livre de `docs/ai/plans/` e `numero: <n>` no cabeçalho (o mesmo `<n>` dos ids `P<n>.F<f>.T<t>`); handoff `H<n>-...`. Regra em `documentos.md` e no `arquiteto`.
- `sg-plan-goal`: o fluxo passa a ser único para toda tarefa não trivial (sem critério de "mudança grande"). Ganha o formato fixo do plano de tarefas (template `assets/plano-de-tarefas.md`; `depende-de` e `escreve` por tarefa, aceite, testes, `Evidencia:` e bloco `/goal` por fase), as regras de execução em paralelo (até 4 agentes, nunca dois no mesmo caminho, acima disso só em worktrees com merge em série e limpeza) e o script `scripts/controle.mjs` (`status`, `checklist <fase> [--completa]`, `proximas`). O `arquiteto`, a `sg-plan-change` e o fluxo de trabalho apontam para o mesmo formato.

### Corrigido
- Fluxo do AIDLC (achado do agente `display`, 2026-10-31): o `AGENTS.md` não manda mais “confirmar no código-fonte, no jar ou no pacote” da extension; vale HO-08 (extension só pela KB, lacuna vira demanda em `docs/ai/demands/`, e só se diz “a KB não responde” depois de esgotar a pasta da extension). `coordenacao.md`, `arquiteto` e `sg-plan-goal` dizem que **quem cria o plano é o `arquiteto`**, inclusive no pedido de “criar ou analisar um plano”; sem subagentes, o aviso ao usuário vem antes de começar; pedido só de plano de produto novo aciona `sg-new-product` ou pergunta. Testes com agente real: `scripts/e2e-kb-extension.mjs` (5/5, US$ 0,23) e `e2e-arquiteto-plano.mjs --pedido-analise` (US$ 0,49).
- `sg-new-product` (subdomain-tenancy): o boilerplate passa os pacotes `cities.embeddables`, `commons.persistence.embeddables` e `privacy` às duas unidades de persistência, e o `verificar-subida` deixa de reprovar o aviso do Hibernate quando só lista as bases abstratas do Panache e os listeners do commons (achado do E2E da T3b.6, PUB.2b item 6 do plano 51).
- KB `filemanagement`: a tabela de SPIs lista `AttachmentRegistry` e `StorageCredentialSource`.

### Adicionado
- Regra `documentos`, modelos (ADR, especificação, relatório), plano de tarefas e `sg-plan-goal`: todo documento gerado leva `aidlc: <contentVersion de .ai/toolkit-lock.json>` no cabeçalho, para saber com que versão do AIDLC foi escrito. O `controle.mjs status` avisa quando o plano não tem o campo e o `adr-index.mjs` valida o formato.
- `sg-new-product`: auditoria em PostgreSQL desliga o health do cliente MongoDB no produto gerado (efeito `props_acrescentar` da matriz), achado do E2E.
- KB dos componentes: `SeedGrid-components/flutter/` com Visão geral, API e Exemplos por grupo (89 componentes), `Plataformas.md` e Índice e Catálogo com seções React e Flutter.
- `sg-plan-goal` e `sg-plan-change`: **identificador falante** nos planos novos: `P<plano>.F<fase>.T<tarefa>` (tarefa) e `P<plano>.F<fase>.D<n>` (decisão do dono), por exemplo `P24.F3b.T6` e `P111.F2.D1`; `F0` = plano inteiro, `FIM` = fase final. O dono sabe de qual plano e fase é cada item sem perguntar; o template usa `P000.*`, que o `controle.mjs` já lê. Planos antigos mantêm `T3b.6`.
- Referência `identificadores-de-plano` (e verbete no glossário e na regra `documentos`): formato do identificador, como pesquisar por plano, fase, tarefa e decisão, e como citar para o dono.
- `sg-plan-goal`: **goal do plano inteiro** no template, com a regra de decisão (o executor não decide pelo dono: marca `[?]` com `Pergunta:` e `Recomendacao:`, faz tudo o que não depende dela e pergunta tudo de uma vez ao final). O `controle.mjs` ganha `pendencias` e `checklist --completa --exceto-decisoes`.

## [0.6.1] — 2026-10-29

### Corrigido
- A tag v0.6.0 não foi publicada no npm: o CI do release falhou nos testes (clone do teste do `sg-release` sem `init.defaultBranch` e `check-pack` reprovando `.env.example` dos boilerplates). O conteúdo é o mesmo da 0.6.0; esta versão traz só as correções.

## [0.6.0] — 2026-10-29

### Adicionado
- `init` e `update` registram o MCP de componentes (`seedgrid-components`, `/mcp/all`) em `.mcp.json` (Claude Code) e `.codex/config.toml` (Codex), de forma aditiva e idempotente, e o bloco do `AGENTS.md`/`CLAUDE.md` manda passar `platform` (`react` ou `flutter`); `SEEDGRID_AI_SKIP_MCP=1` desliga.
- Skill `sg-release` (versão `YYYY.M.N` em todos os serviços, branch `release/`, commit e tag locais; para antes do merge, push e deploy) e skill `sg-check-secrets`; o `init` cria o hook de pre-commit de credenciais e o CI do produto confere segredos antes de publicar.
- Skill `sg-new-product`: opção **cities (cidades e estados do Brasil)** na pergunta de extensions opcionais dos modelos login-tenancy-b2b, subdomain-tenancy e modular, e entrada `cities` no `data/catalogo.json`. Declara a dependência direta `seedgrid-cities` (2026.10.22) no `pom.xml` do produto; a security já a traz de forma transitiva (`Address.city`), e a extension migra sozinha ao subir, então o host não copia migration. Provado com `mvn test-compile` em produtos gerados dos três modelos, com a cadeia instalada localmente (a cities ainda não está no Maven Central); teste de scaffold por modelo e de determinismo em `tests/scaffold-produto.test.ts`.
- Skill `sg-new-product`: modelo **modular** (boilerplate `modular`): base `seedgrid-security` + `seedgrid-audit-postgresql`, sem tenancy, billing nem admin web, com opcionais escolhidos na pergunta 3b. Front com as telas da base (Usuários, Perfis, Auditoria, Meu perfil com foto, senha e 2FA, Temas), menu do usuário com Meu perfil, Temas e Sair, e telas de API Keys e de convite (self-enter, config do security) só quando escolhidos. `apikeys`, `privacy` e `resilience` já liberados (os demais opcionais seguem indisponíveis até provar a subida). O `apikeys` traz um perfil de integração de exemplo (migrations V3001/V3002), necessário para criar chaves.
- Skill `sg-new-product`: efeito `hibernate_packages` na matriz (acrescenta pacotes a `quarkus.hibernate-orm.packages`; o pacote `privacy` entra sempre no modular). Sem isso a subida avisava "Could not find a suitable persistence unit".
- Skill `sg-new-product`: `verificar-subida.mjs` usa projeto de compose próprio (`sgv-<slug>-<hash>`), recusa portas já ocupadas e só derruba o que subiu; trata o aviso de persistence unit como erro.
- Skill `sg-new-product`: a IA sobe o produto e prova o fluxo de negócio sozinha (portas livres quando as padrão estão ocupadas, banco próprio da prova, sem tocar em processos ou contêineres alheios), registra o que passou, falhou e não foi provado em `docs/ai/reports/`, e limpa processos filhos, contêineres e volumes ao final, conferindo `ps` e `netstat`. Lacuna da extension (prefixo de chave, chave por produto, consentimento) vira ADR e demanda, sem alterar a extension. A pergunta do uso de apikeys cobre a organização das chaves (por conta, por usuário ou por usuário e produto) e o prefixo.
- Script `scripts/e2e-aidlc-app.mjs` (só para quem desenvolve o seedgrid-ai): conduz uma sessão `claude -p` com o AIDLC instalado até uma aplicação completa a partir de um requisito, responde como o dono, registra lacunas e custo; pedido e respostas em `scripts/e2e/`.
- Skill `sg-new-product`: reconfiguração a qualquer tempo (`--reconfigurar`, depois `--aplicar`). O scaffold grava `.seedgrid/manifesto.json` (respostas e hash de cada arquivo versionado, sem segredo); a reconfiguração regera a árvore numa pasta temporária com os mesmos segredos e aplica só a diferença em três vias (arquivo ou variável que o dev editou vira conflito e é preservado). Adicionar, remover e trocar escopo ou provider deixam a árvore idêntica à de criar já assim.
- Skill `sg-new-product`: escopo por módulo. Self-enter pergunta em quais telas vale (front, admin ou ambos); receitas de remoção das telas (`data/modulos-front.json`, cada uma provada com `pnpm build` nos dois boilerplates) para self-enter, api-keys, audit, backup, ai-pricing e exchange; extension ausente tira as telas do admin; pergunta opcional de telas dispensadas. Billing, realtime e whatsapp não têm receita (entrelaçados em código das telas).
- Skill `sg-new-product`: armazenamento por finalidade, avatar e backup separados, com os sete providers (filesystem, minio, s3, azure-blob, gcs, google-drive, onedrive); credencial externa vira pendência com guia (`assets/guia-credenciais.md`, procedimento do fornecedor); a dependência e o serviço do MinIO só entram se alguém o usa.
- Skill `sg-new-product`: subdomain-tenancy pergunta os tenants de exemplo (padrão acme,beta) e gera `tenants-exemplo.hosts` e a pendência com os endereços (`http://acme.localhost:3000`); a skill não altera o `hosts` do sistema.
- Skill `sg-new-product`: o `pom.xml` do produto declara o SDK do provider de nuvem escolhido para avatar e backup (S3, Azure Blob, GCS, Google Drive, OneDrive), porque a `seedgrid-filemanagement` os deixa `optional`; antes só compilava e faltaria a classe em execução. Efeito novo da matriz `pom_adicionar` (`grupo:artefato:versão`, versões da lib). Provado com `mvn test-compile` e `quarkus:build` em produtos gerados.
- KB: nota `Extensions/Mailpit-uso.md`, o uso do Mailpit local em perguntas e respostas: ver o e-mail (8025/8026), apontar o SMTP dos mailers `security`, `subdomaintenancy` e `backup`, por que `START_TLS=DISABLED` e `mock=false`, consulta pela API v1 em teste automatizado (cliente Java e Awaitility), diagnóstico de e-mail que não chega e aviso de que é só desenvolvimento. Exemplos executados contra `axllent/mailpit:v1.31.6`; o que não foi provado está marcado `[não verificado]`.
- Script `scripts/e2e-gatilho-skill.mjs` (só para quem desenvolve o seedgrid-ai): mede se pedidos de produto novo acionam a skill, só o primeiro turno. E2E de produto novo cobre manifesto, idempotência da reconfiguração, Mailpit e mudança depois de pronto.
- Skill `sg-new-product`: o compose gerado sobe o Mailpit local (`axllent/mailpit:v1.31.6`, SMTP sem autenticação) no lugar do Mailhog; o `dev.env` traz um remetente por extension em `eu-dev.com.br` (security, backup, subdomain.tenancy).
- Skill `sg-branch-status`: lista branches e worktrees já mergeados (inclusive por squash, comparando conteúdo) ou sem dono e limpa, com confirmação, branch local, remota e worktree das mergeadas; recusa `main`, `develop` e branch não mergeada. A `coordenacao.md` manda rodá-la no início de toda tarefa não trivial. Versão do pacote inalterada: a release é única e adiada.
- Regra `branches.md` (HO-01 a HO-07): `main` e `develop`, uma branch por tarefa, squash na `develop`, release por merge normal, limpeza de branch e worktree e autorização pelo ato irreversível; o `sg-review` reporta como HO-04 a branch ou o worktree que sobrou depois do merge.
- Modelos de publicação de produto novo em `seedgridKB/SeedGrid/Toolkit/skills/sg-new-product/assets/` (T1.3): Dockerfile de backend (Quarkus), frontend e admin (Next.js) e workflow GitHub Actions de publicação no EasyPanel (webhook em secret), parametrizados por `produto.json` via `render.mjs` (placeholders `{{nome}}`, sem dependências). Registrados com a skill `sg-new-product`; versão inalterada.

- KB: notas `Extensions/Propriedades-para-subir.md` (variáveis do `dev.env` e geração de segredos), `Extensions/Servicos-de-apoio.md` (serviços do compose) e `SeedGrid-components/modulos/Composicao-do-admin.md` (módulos do front: o que adicionar e remover).

- Trava de credenciais no empacotamento: `scripts/check-secrets.mjs` (copiado do boilerplate, com `--dir` e `--kb-dir` repetíveis) confere nome e conteúdo de `seedgridKB/SeedGrid/Toolkit/boilerplates/` e de `seedgridKB/` inteiro; falha com arquivo de ambiente, backup ou segredo sob qualquer nome (`_dev.env`, `dev.env.bak`, `.pem`) e com token ou atribuição literal. Roda em `npm run check-secrets`, no `prepack` (antes do build) e no `npm test`. Única folga, só em `--kb-dir` e só em `*.md`: atribuição e valor longo (as notas citam variáveis) e marcador de chave privada citado entre crases; `.env`, `.txt`, `.ts`, `.json` e demais tipos não são relaxados. Pasta de boilerplates ainda inexistente: aviso e segue. Versão do pacote inalterada.
- Boilerplates embutidos (T1.1 do fluxo de produto novo): novo tipo de componente `boilerplates` no manifesto (`names`: `login-tenancy`, `subdomain-tenancy`). O `init` e o `update` copiam `seedgridKB/SeedGrid/Toolkit/boilerplates/<modelo>/` para `.ai/boilerplates/<modelo>/` (gerenciado, no lock); o `update` troca só o modelo e nunca toca a pasta de um produto já criado; o `remove` retira o que o `init` instalou. Fonte: `origin/main` do repositório `boilerplate` (via `git archive`), 795 arquivos, **3,93 MB** (login-tenancy 2,06 MB, subdomain-tenancy 1,86 MB; abaixo de ~10 MB, então cópia direta, sem `.tgz`). `check-secrets.mjs` do boilerplate (`--dir`) passou limpo. O `validate` recusa arquivo de ambiente, chave, backup, `node_modules`, `target`, `.git`, `infra`, pasta fora de `names` e `.gitignore` literal; `.gitignore`/`.gitattributes` entram como `*.template` e o PNG do logo como `*.png.b64` (o pacote só carrega texto UTF-8). O detector de chave Stripe passa a aceitar o valor-modelo `sk_test_placeholder`.

- Regra `limites-do-host.md` (HO-08, HO-09): host nunca altera extension da plataforma, lacuna vira demanda em `docs/ai/demands/` e documentos do produto ficam no produto; o `sg-review` reporta a violação. O bloco do `AGENTS.md` passa a dizer que a sessão principal é o coordenador.

- Skill `sg-new-product` (T2.1 a T2.4 do fluxo de produto novo): cria um produto SeedGrid na pasta corrente. `data/matriz-produto.json` (11 perguntas em ordem fixa, com condições e o efeito de cada opção), `data/catalogo.json` (extensions, o que cada modelo traz e dependências) e o schema; `scripts/scaffold-produto.mjs` valida as respostas contra a matriz (recusa o que está fora dela, sem gravar nada), copia o boilerplate (`login-tenancy` ou `subdomain-tenancy`), renomeia o pacote Java, ajusta o `pom.xml` às extensions escolhidas e gera `produto.json`, `backend/dev.env` (segredos novos por produto, par RSA do JWT em `keys/*.pem`), `dev.env.example`, `.env`/`.env.example` do compose, `docker-compose.yml` modular (postgres, mailhog, minio, mongodb), `.env.example` do frontend e do admin, o workflow do EasyPanel e `docs/ai/{plans,decisions,handoffs,reports,demands}/`. A mesma resposta gera sempre a mesma árvore versionada. O `AGENTS.md`, `coordenacao.md` e o `arquiteto` mandam acionar a skill antes do arquiteto em pedido de produto novo. B2C aparece desligado até existir o boilerplate; o modelo "outro" gera só a configuração, sem esqueleto. Guardiões em `tests/guardioes-produto-novo.test.ts`. Não verificado aqui: build do backend gerado (Maven) e `docker build`/`docker compose config` (sem Docker nesta máquina).

- Ferramenta de quem desenvolve o `seedgrid-ai` (fora do pacote e do conteúdo instalado): `npm run sync-boilerplates` (ou `make sync`) copia do `origin/main` do repositório `boilerplate` só o que está versionado (binário vira `.b64`, `.gitignore`/`.gitattributes` viram `.template`), registra a origem em `scripts/boilerplates-origem.json` e roda a trava de credenciais; `npm run check-boilerplates` (no `prepack`) reprova a publicação se a cópia estiver atrás do `origin/main` e só avisa se o repositório não estiver acessível. `make publicar` sincroniza, testa e mostra o que falta comitar, sem commit nem push.

### Alterado
- Boilerplates renomeados: `login-tenancy` vira `login-tenancy-b2b` (empresas) e `login-tenancy-b2c` (pessoa física, ainda indisponível na matriz até provar a subida); o modelo `outro` vira `modular`. Matriz, catálogo, manifesto e testes seguem os novos nomes. `subdomain-tenancy` não terá versão pessoa física.
- A saída do `init`/`update` mostra cada modelo de boilerplate em uma linha (`.ai/boilerplates/<modelo>/ (N arquivo(s))`) em vez de uma por arquivo.
- O commit inicial do `init` passa a enviar os caminhos ao `git add` por stdin (`--pathspec-from-file`): com os boilerplates a lista estoura o limite da linha de comando do Windows.
- `init` em pasta que ainda não é repositório faz `git init -b main`, um commit inicial só com o que instalou e cria a `develop` (branch atual). Em repositório existente não altera branches. `--no-develop` cria só a `main` (o `seedgrid-ai-plt` a passa sempre, sem opção própria); `SEEDGRID_AI_SKIP_GIT=1` desliga.

## [0.5.0] — 2026-10-19

### Adicionado
- Skill `sg-componente`: escolhe o componente pela nota `Preciso-de.md` ("preciso de X, use Y", gerada dos manifestos de IA, ~12 KB) e valida props com `scripts/validate-props.mjs` contra os tipos reais (`data/props.json`): prop inexistente com sugestão, obrigatória ausente, valor fora do enum, tipo errado. Substitui `find_by_semantic`/`suggest_for_field`/`validate_props` do MCP com poucos tokens.

## [0.4.4] — 2026-10-19

### Alterado
- Economia de tokens: `SeedGrid-components/Indice.md` cai de 38 KB para ~10 KB (nomes por grupo); o resumo de cada símbolo foi para a nova nota `Catalogo.md`, lida só quando preciso escolher. O índice ensina a abrir só a seção do componente (`Grep "^## SgNome"` + faixa). As notas grandes (catálogos de propriedades e de enums) avisam para usar `Grep`.
- `scripts/kb-catalogs.mjs`: novo alvo `catalogo`.

## [0.4.3] — 2026-10-19

### Alterado
- Regra `documentos.md`: exceção para o aviso de modo de trabalho no `AGENTS.md` (ex. `MODO PLATAFORMA`), que passa a prevalecer sobre `docs/ai/` e elimina a contradição no `seedgrid-ai-plt`.

## [0.4.2] — 2026-10-18

### Adicionado
- Manifesto: `agentsNotes` (opcional), até 10 linhas curtas que o bloco do `AGENTS.md` mostra no topo. Serve para uma camada adicional (como a de plataforma) avisar o modo de trabalho a quem abre a sessão.

## [0.4.1] — 2026-10-18

### Adicionado
- ADR: campo `numero` (sequencial, dado na criação, nunca alterado) no cabeçalho e no índice, para falar de "a ADR #7"; o script valida unicidade e ausência de lacunas e ganhou `--proximo` e `--numerar` (numera só as ADRs sem número).
- ADR: status `implementada` (confirmada pelo dono e já no código); o que já foi implementado não fica `proposta`.

## [0.4.0] — 2026-10-18

### Adicionado
- Skill `sg-adr`: registra decisões como ADR em `docs/ai/decisions/` (cabeçalho com `decidido-por`, `data`, `consultados`, `dominio`, `status`), com índice gerado da mais nova para a mais antiga (`scripts/adr-index.mjs`) e domínios controlados por `dominios.txt`.
- Skill `sg-plan-goal`: método de 12 etapas do pedido solto até o plano pronto para execução autônoma (hipóteses provadas por testes, rodadas de perguntas ao dono, contratos, tarefas com critério de aceite, guardiões, governança de execução, preparação do `/goal`).

### Alterado
- **Pasta dos documentos da IA: `.ai/docs/<tipo>/` passa a ser `docs/ai/<tipo>/`** (fixa, visível e versionada; `docs/ai/decisions/` sempre versionada). A rule `documentos.md` proíbe `.md` de trabalho fora dela. Projetos com documentos em `.ai/docs/` devem movê-los (`git mv .ai/docs docs/ai`).
- `arquiteto`: só entrega o plano com **zero dúvida aberta** e premissas aprovadas; indica as ADRs e onde o plano é salvo. `revisor` confere onde os documentos foram parar e se há ADR para decisão que mudou comportamento.
- Modelo `decisao-arquitetura.md` passa a ser o modelo de ADR.
- BE-21: usar ou não o Panache em hosts é opcional (a `sg-crud-back` acompanha).

## [0.3.4] — 2026-10-18

### Adicionado
- Rule `backend-seedgrid.md` com o que vale em qualquer linguagem de back-end: BE-11, 22, 24, 25, 30, 32, 40, 42, 50 e 60 a 65.
- BE-42: testes-guardiões (classe `...GuardianIT`/`...GuardianTest`, aviso no topo, cobertura de todos os caminhos; se falhar, o defeito é do código de produção).

### Alterado
- `backend-java-seedgrid.md` ficou só com o que é do Java; BE-21: usar ou não o Panache em hosts é opcional; BE-23: `BaseEntityPanache` ou `BaseEntity` conforme o host.
- `backend-java`, `backend-rust`, `qa`, `sg-review` e `sg-crud-back` apontam para as regras comuns.

### Removido
- Do texto público saíram as regras de quem constrói extensions/libs (BE-06 e as partes de lib de BE-11, BE-20, BE-21 e BE-23), que passam para a KB de plataforma (`seedgrid-ai-dev`).

## [0.3.3] — 2026-10-16

### Adicionado
- BE-05: DTOs com sufixo `DTOReq`/`DTORes` (Req só com chaves estrangeiras por `publicId`; Res plano).
- `Toolkit-mapa.md` na raiz do vault, ligando papéis, regras, skills e modelos no grafo do Obsidian.
- KB do Pulse: exemplos de publisher (Dart, Rust, Delphi), `deliveryPolicy` campo a campo, TTL, DLQ, as duas funções (mensagens e tarefas) e o prazo de execução `resultTimeoutSeconds` (Pulse 0.3.0).

### Alterado
- `sg-new-skill` passa a criar **e alterar** skills.
- Arquivos de referência das skills renomeados com o nome da skill (`crud-front-*`, `new-screen-*`, `code-review-checklist`).
- A configuração local do Obsidian deixou de ser versionada.

## [0.3.2] — 2026-10-15

### Adicionado
- Skills com prefixo `sg-` (do toolkit, sobrescritas no `update`), cópia canônica em `.ai/skills` e a skill `sg-new-skill`.
- Regra `documentos.md`: documentos gerados pela IA ficam em `.ai/docs/<tipo>/`.

## [0.3.1] — 2026-10-15

### Adicionado
- Comando `install` (`npm install -g`) para usar `seedgrid-ai` sem `npx`.

### Corrigido
- Testes tolerantes a checkout com CRLF (CI no Windows).

## [0.3.0] — 2026-10-15

### Adicionado
- Primeira versão do CLI `seedgrid-ai` (`init`, `update`, `status`, `doctor`, `remove`, `validate`, `review`), do conteúdo (papéis, regras, skills, modelos) e da base de conhecimento SeedGrid.
