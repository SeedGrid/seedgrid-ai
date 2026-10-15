# Arquitetura

## Visão geral

```text
seedgridKB/ (vault) ──loadContent──►  ContentBundle (validado)
                                         │
                       adapters/ (shared, claude, codex)
                                         ▼
                                   DesiredState  (arquivos + blocos)
                                         │
              lock + disco ──planInstall/planRemove──►  Plan (ops, conflitos)
                                         │   sem conflitos e sem --dry-run
                                         ▼
                                     applyPlan  (backup → escrita → rollback)
```

Cada etapa é pura até `applyPlan`: carregar, validar e planejar só leem o disco. Por isso `--dry-run` é garantidamente sem escrita.

## Módulos

| Caminho | Responsabilidade |
| --- | --- |
| `src/cli.ts` | Parsing de argumentos (`node:util.parseArgs`), saída texto/JSON, códigos de saída |
| `src/commands/` | `init`, `update` (fluxo comum em `install.ts`), `status`, `doctor`, `remove`, `validate`, `review` (única que chama o modelo: executa a skill `seedgrid-review` via `claude -p` ou `codex exec`, somente leitura) |
| `src/core/content.ts` | Leitura do manifesto (vault) e validação de schema, nomes, IDs, arquivos, links, referências e da KB (wikilinks, caminhos locais, segredos) |
| `src/core/plan.ts` | Comparação entre estado desejado, lock e disco; classifica cada item e detecta conflitos |
| `src/core/apply.ts` | Revalidação, backup, escrita via temporário + renomeação, rollback, limpeza de pastas vazias |
| `src/core/blocks.ts` | Localização, inserção, substituição e remoção do bloco gerenciado |
| `src/core/lock.ts` | Schema, leitura defensiva e serialização do lock |
| `src/core/paths.ts` | Caminhos relativos seguros e verificação de links simbólicos |
| `src/core/inspect.ts` | Comparação disco × lock para `status` e `doctor` |
| `src/core/tools.ts` | Detecção de versões instaladas e sondas locais |
| `src/adapters/shared.ts` | Arquivos `.ai/`, índices gerados (papéis, rules, skills, templates e references) e bloco do `AGENTS.md` |
| `src/adapters/claude.ts` | Skills em `.claude/skills/`, bloco do `CLAUDE.md`, subagentes `.claude/agents/*.md` |
| `src/adapters/codex.ts` | Skills em `.agents/skills/`, agentes `.codex/agents/*.toml` |

Dependências de execução: `yaml` (frontmatter) e `smol-toml` (validação de TOML). Sem dependências nativas.

## Classificação do plano

Para cada arquivo desejado:

| Disco | Lock | Resultado |
| --- | --- | --- |
| ausente | qualquer | criar |
| igual ao desejado | presente / ausente | sem mudança / adotar |
| igual ao hash do lock | presente | atualizar |
| diferente de ambos | presente | **conflito** (modificado localmente) |
| diferente do desejado | ausente | **conflito** (arquivo não gerenciado) |

Arquivos no lock que saíram do estado desejado (troca de target/modo, item removido do conteúdo) são apagados se intactos; se modificados, geram conflito.

Blocos seguem a mesma lógica sobre o **conteúdo interno** dos marcadores. Marcadores duplicados ou incompletos geram conflito. Se o usuário removeu o bloco inteiro, ele é reinserido no final com aviso.

Hashes são SHA-256 do texto com finais de linha normalizados para LF, para que checkouts com `core.autocrlf` não pareçam customizações.

## Escrita

1. **Revalidação**: o hash de cada alvo é relido; se mudou desde o planejamento, nada é escrito.
2. **Backup**: arquivos existentes que serão modificados ou apagados são copiados para `.ai/backups/<operação>/`, com `operation.json`.
3. **Execução**: cada escrita vai para `<arquivo>.seedgrid-tmp-<operação>` e é renomeada sobre o destino (atômico por arquivo onde o sistema suporta). O lock é sempre o último passo.
4. **Rollback**: em falha, os passos executados são desfeitos em ordem reversa (restauração do backup ou remoção do arquivo criado). Falhas no rollback são relatadas individualmente.

Não há atomicidade global entre vários arquivos.

## Lock

`.ai/toolkit-lock.json` registra `cliVersion`, `contentVersion`, `contentSchemaVersion`, `targets`, `mode`, `source` (`bundled` ou `local`, com caminho apenas se a fonte estiver dentro do projeto), a última operação, e listas de arquivos (`path`, `sha256`, `component`) e blocos (`file`, `sha256`, `createdFile`). Só há caminhos relativos com `/`.

Ao ler, o lock é validado como dado não confiável: caminhos devem ser relativos, sem `..`, e estar sob `.ai/` (exceto `.ai/local/` e `.ai/backups/`), `.claude/skills/`, `.claude/agents/`, `.agents/skills/` ou `.codex/agents/`. Blocos só podem estar em `AGENTS.md` ou `CLAUDE.md`.

O lock só é reescrito quando seu conteúdo muda (a última operação e a versão do CLI não contam), o que mantém a reinstalação sem alterações.

## Shared x native nos adaptadores

O modo shared é o núcleo; native apenas acrescenta arquivos gerados a partir dos mesmos papéis:

- Claude Code: frontmatter `name`, `description` e `tools` (traduzido de `capabilities`: `read-files` → Read, Grep, Glob; `edit-files` → Edit, Write; `run-checks` → Bash; `Skill` quando há `preferred_skills`). Sem `capabilities`, o subagente herda as ferramentas da sessão.
- Codex: `name`, `description` e `developer_instructions`. `capabilities` não são traduzidas (veja [compatibilidade](compatibilidade.md)). `.codex/config.toml` nunca é alterado.
