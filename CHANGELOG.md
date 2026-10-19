# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). A versão do pacote (`package.json`) é a mesma do conteúdo (`seedgridKB/manifest.json`). Atualize este arquivo no mesmo commit do bump.

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
