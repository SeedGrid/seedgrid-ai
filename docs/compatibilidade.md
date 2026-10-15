# Compatibilidade e limitações

Validação feita em 2026-10-14 (KB incluída em 2026-10-14), Windows 11, Node.js 22.16.0.

## Versões testadas

| Ferramenta | Versão | shared | native |
| --- | --- | --- | --- |
| Claude Code | 2.1.299 | validado em sessão real | validado em sessão real |
| Codex CLI | 0.160.1 | validado em sessão real e com `doctor --probe` | validado em sessão real, **somente com projeto confiável** |

As listas de versões validadas ficam em `src/adapters/claude.ts` e `src/adapters/codex.ts` (`validatedVersions`). O `doctor` avisa quando a versão instalada não consta da lista. Repita o smoke test a cada nova versão das ferramentas antes de ampliar a lista.

## Caminhos validados

| Recurso | Claude Code | Codex |
| --- | --- | --- |
| Instruções | `CLAUDE.md` com `@AGENTS.md` | `AGENTS.md` |
| Skills de projeto | `.claude/skills/<nome>/SKILL.md` | `.agents/skills/<nome>/SKILL.md` |
| Agentes nativos | `.claude/agents/<id>.md` (frontmatter `name`, `description`, `tools`) | `.codex/agents/<id>.toml` (`name`, `description`, `developer_instructions`) |

Fontes consultadas: [Claude Code skills](https://code.claude.com/docs/en/skills), [Claude Code subagentes](https://code.claude.com/docs/en/sub-agents), [Codex skills](https://developers.openai.com/codex/skills), [Codex subagentes](https://developers.openai.com/codex/multi-agent) (as duas últimas redirecionam para learn.chatgpt.com), [Agent Skills](https://agentskills.io/specification).

## Resultado do smoke test (pasta descartável `proj teste ção`, modo native)

- **Claude Code 2.1.299** (`claude -p`): listou as 3 skills de projeto, os 5 subagentes (`arquiteto`, `backend-java`, `frontend-react`, `revisor`, `validador`) e citou o bloco do `AGENTS.md` recebido via `@AGENTS.md` no `CLAUDE.md`.
- **Codex 0.160.1** (`codex exec`, sandbox somente leitura):
  - sem confiança no projeto: listou as 3 skills e o bloco do `AGENTS.md`; **nenhum** agente personalizado;
  - com `-c "projects={'<caminho>'={trust_level=\"trusted\"}}"`: listou os 5 agentes como `agent_type` e um subagente `revisor` iniciado respondeu.
  - `codex debug prompt-input` (usado por `doctor --probe`) confirmou `AGENTS.md` e skills sem chamar o modelo.

- **Base de conhecimento** (Claude Code 2.1.299, `claude -p`, projeto vazio com `.ai/brain/` instalada): perguntado pelo valor padrão, tipo e classe de `seedgrid.app.ai-pricing.timezone`, respondeu `America/Sao_Paulo`, `String`, `AiPricingScheduler`, citando as notas consultadas; perguntado por uma propriedade inexistente, respondeu que não a encontrou e se recusou a inventar o padrão.

- **`seedgrid-ai review`** (Claude Code 2.1.300 via `claude -p`; Codex 0.160.1 via `codex exec --sandbox read-only`): em projeto descartável com violações plantadas (telefone e CPF em `SgInputText`, `<input>` cru, `window.confirm`, `@Inject` em atributo, `RuntimeException`, pacote no singular), as duas ferramentas executaram a skill `sg-review`, apontaram essas violações com arquivo e linha e fecharam com o bloco `seedgrid-review-json`; o CLI saiu com código 3. Tempos: cerca de 27 s (Claude Code) e 80 s (Codex). Os itens de julgamento divergiram entre as duas ferramentas.

Nenhuma tarefa publicou ou modificou serviços externos.

## Limitações conhecidas

- **Descoberta real**: o `doctor` valida sintaxe e consistência. Só o Codex oferece uma sonda local (`doctor --probe`, para instruções e skills; agentes não aparecem nessa saída). Para o Claude Code e para os agentes do Codex, a confirmação exige abrir uma sessão (veja o smoke test em [manutencao.md](manutencao.md#smoke-test-manual)).
- **`doctor --probe`** inicia o Codex com a configuração do usuário (por exemplo, servidores MCP configurados podem ser iniciados), embora não chame o modelo.
- **Codex native exige projeto confiável**: em projeto não confiável, `.codex/agents/` é ignorado silenciosamente e o modo shared continua valendo.
- **capabilities no Codex não são traduzidas**: a leitura de arquivos no Codex usa o shell, e `sandbox_mode`/`approval_policy` em arquivos de agente não sobrescrevem a sessão principal. Os limites do papel ficam apenas como instrução.
- **`tools` no Claude Code** limita as ferramentas do subagente, mas não substitui permissões nem sandbox.
- **Recarga**: o Claude Code observa `.claude/skills/` e `.claude/agents/` apenas se a pasta existia no início da sessão; o Codex detecta skills novas, mas mudanças de configuração exigem reinício. Recomende sempre uma nova sessão.
- **Escopo de descoberta**: ambas as ferramentas procuram a partir da pasta atual até a raiz do repositório. Sessões abertas fora do projeto não veem a instalação.
- **Outros produtos**: Claude Desktop, Cowork, Claude web e ChatGPT usam mecanismos próprios. Escrever arquivos no projeto **não** registra skills ou agentes nesses produtos.
- **Atomicidade**: cada arquivo é escrito por renomeação; não há transação entre vários arquivos. Em falha, há rollback com relato de qualquer item não restaurado.
- **Instalação global** (`~/.claude`, `~/.agents`, `~/.codex`) não é suportada no MVP.
- **Seleção e delegação** dependem do modelo seguir as instruções; não são garantias do instalador.
