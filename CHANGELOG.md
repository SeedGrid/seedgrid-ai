# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). A versão do pacote (`package.json`) é a mesma do conteúdo (`seedgridKB/manifest.json`). Atualize este arquivo no mesmo commit do bump.

## [Não publicado]

### Adicionado
- Skill `sg-branch-status`: lista branches e worktrees já mergeados (inclusive por squash, comparando conteúdo) ou sem dono e limpa, com confirmação, branch local, remota e worktree das mergeadas; recusa `main`, `develop` e branch não mergeada. A `coordenacao.md` manda rodá-la no início de toda tarefa não trivial. Versão do pacote inalterada: a release é única e adiada.
- Regra `branches.md` (HO-01 a HO-07): `main` e `develop`, uma branch por tarefa, squash na `develop`, release por merge normal, limpeza de branch e worktree e autorização pelo ato irreversível; o `sg-review` reporta como HO-04 a branch ou o worktree que sobrou depois do merge.
- Modelos de publicação de produto novo em `seedgridKB/SeedGrid/Toolkit/skills/sg-new-product/assets/` (T1.3): Dockerfile de backend (Quarkus), frontend e admin (Next.js) e workflow GitHub Actions de publicação no EasyPanel (webhook em secret), parametrizados por `produto.json` via `render.mjs` (placeholders `{{nome}}`, sem dependências). Registrados com a skill `sg-new-product`; versão inalterada.

- KB: notas `Extensions/Propriedades-para-subir.md` (variáveis do `dev.env` e geração de segredos), `Extensions/Servicos-de-apoio.md` (serviços do compose) e `SeedGrid-components/modulos/Composicao-do-admin.md` (módulos do front: o que adicionar e remover).

- Trava de credenciais no empacotamento: `scripts/check-secrets.mjs` (copiado do boilerplate, com `--dir` e `--kb-dir` repetíveis) confere nome e conteúdo de `seedgridKB/SeedGrid/Toolkit/boilerplates/` e de `seedgridKB/` inteiro; falha com arquivo de ambiente, backup ou segredo sob qualquer nome (`_dev.env`, `dev.env.bak`, `.pem`) e com token ou atribuição literal. Roda em `npm run check-secrets`, no `prepack` (antes do build) e no `npm test`. Única folga, só em `--kb-dir` e só em `*.md`: atribuição e valor longo (as notas citam variáveis) e marcador de chave privada citado entre crases; `.env`, `.txt`, `.ts`, `.json` e demais tipos não são relaxados. Pasta de boilerplates ainda inexistente: aviso e segue. Versão do pacote inalterada.
- Boilerplates embutidos (T1.1 do fluxo de produto novo): novo tipo de componente `boilerplates` no manifesto (`names`: `login-tenancy`, `subdomain-tenancy`). O `init` e o `update` copiam `seedgridKB/SeedGrid/Toolkit/boilerplates/<modelo>/` para `.ai/boilerplates/<modelo>/` (gerenciado, no lock); o `update` troca só o modelo e nunca toca a pasta de um produto já criado; o `remove` retira o que o `init` instalou. Fonte: `origin/main` do repositório `boilerplate` (via `git archive`), 795 arquivos, **3,93 MB** (login-tenancy 2,06 MB, subdomain-tenancy 1,86 MB; abaixo de ~10 MB, então cópia direta, sem `.tgz`). `check-secrets.mjs` do boilerplate (`--dir`) passou limpo. O `validate` recusa arquivo de ambiente, chave, backup, `node_modules`, `target`, `.git`, `infra`, pasta fora de `names` e `.gitignore` literal; `.gitignore`/`.gitattributes` entram como `*.template` e o PNG do logo como `*.png.b64` (o pacote só carrega texto UTF-8). O detector de chave Stripe passa a aceitar o valor-modelo `sk_test_placeholder`.

- Regra `limites-do-host.md` (HO-08, HO-09): host nunca altera extension da plataforma, lacuna vira demanda em `docs/ai/demands/` e documentos do produto ficam no produto; o `sg-review` reporta a violação. O bloco do `AGENTS.md` passa a dizer que a sessão principal é o coordenador.

- Skill `sg-new-product` (T2.1 a T2.4 do fluxo de produto novo): cria um produto SeedGrid na pasta corrente. `data/matriz-produto.json` (11 perguntas em ordem fixa, com condições e o efeito de cada opção), `data/catalogo.json` (extensions, o que cada modelo traz e dependências) e o schema; `scripts/scaffold-produto.mjs` valida as respostas contra a matriz (recusa o que está fora dela, sem gravar nada), copia o boilerplate (`login-tenancy` ou `subdomain-tenancy`), renomeia o pacote Java, ajusta o `pom.xml` às extensions escolhidas e gera `produto.json`, `backend/dev.env` (segredos novos por produto, par RSA do JWT em `keys/*.pem`), `dev.env.example`, `.env`/`.env.example` do compose, `docker-compose.yml` modular (postgres, mailhog, minio, mongodb), `.env.example` do frontend e do admin, o workflow do EasyPanel e `docs/ai/{plans,decisions,handoffs,reports,demands}/`. A mesma resposta gera sempre a mesma árvore versionada. O `AGENTS.md`, `coordenacao.md` e o `arquiteto` mandam acionar a skill antes do arquiteto em pedido de produto novo. B2C aparece desligado até existir o boilerplate; o modelo "outro" gera só a configuração, sem esqueleto. Guardiões em `tests/guardioes-produto-novo.test.ts`. Não verificado aqui: build do backend gerado (Maven) e `docker build`/`docker compose config` (sem Docker nesta máquina).

### Alterado
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
