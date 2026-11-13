---
name: sg-custo
description: "Calcula o custo de um plano em tokens (entrada, saída, cache lido, cache criado) e em valor, por tarefa, por fase e no total, somando as ferramentas de IA usadas no projeto (Claude Code, Codex e outras LLMs por arquivo JSON ou CSV), cada modelo com o seu preço. Use ao fechar cada fase, ao consolidar a entrega ou quando o dono perguntar quanto um plano custou."
metadata:
  toolkit: seedgrid-ai
---

# Custo por tarefa, fase e plano

O script `scripts/custo.mjs` (Node, sem dependência; os leitores estão em `scripts/leitores.mjs`) soma o uso gravado pelas ferramentas de IA e aplica uma tabela de preços local. Lê **só os campos de uso** (modelo, data e tokens) e, para ligar a tarefa, a marca `P<plano>.F<fase>.T<tarefa>`; nunca lê nem grava conteúdo de conversa e não toca em credenciais. Um projeto pode usar mais de uma ferramenta (parte no Claude Code, parte no Codex): o custo da tarefa, da fase e do plano **soma as ferramentas**, e o relatório mostra a ferramenta e o modelo de cada linha.

## Como usar
```
node .ai/skills/sg-custo/scripts/custo.mjs <plano> resumo
node .ai/skills/sg-custo/scripts/custo.mjs <plano> fase <fase> --gravar
```
`<plano>` é o número (`163`) ou o caminho do arquivo do plano. Sem `--fonte`, o script detecta o Claude Code e o Codex pelo que existe na máquina. Opções:

| Opção | Efeito |
|---|---|
| `--fonte <fonte>` | Repetível. `claude-code`, `codex`, `json:<arquivo>` ou `csv:<arquivo>`. Quando informada, só as fontes citadas são lidas. |
| `--transcritos <pasta>` | Pasta dos transcritos do Claude Code. Padrão: `~/.claude/projects/<pasta atual com tudo que não é letra ou número trocado por ->`. |
| `--codex <pasta>` | Pasta das sessões do Codex. Padrão: `~/.codex/sessions`. |
| `--projeto <pasta>` | Repetível. Pastas do projeto para filtrar as sessões do Codex (que ficam todas juntas, sem pasta por projeto). Padrão: a pasta atual. Entram as sessões cujo `cwd` é a pasta ou uma subpasta; informe também as worktrees, se o Codex rodou nelas. |
| `--precos <arquivo>` | Tabela de preços. Padrão: `.ai/local/precos-de-modelo.json`. |
| `--sessao <id>` | Só o uso dessa sessão (e dos subagentes dela); aceita o começo do id. Na prática obrigatória quando há várias sessões e você usa `--janela`. |
| `--janela P<plano>.F<fase>.T<tarefa>=<início>,<fim>` | Repetível. Atribui à tarefa o uso **sem marca e que não é de subagente** (sessão principal do Claude, sessão do Codex sem marca no título, linhas genéricas sem `tarefa`) entre dois instantes ISO. Use os instantes dos marcos (commit, registro de status). **Filtra só por horário, não por sessão:** sem `--sessao` (ou `--fonte`), entra o uso de tudo o que caiu no intervalo. |
| `--gravar` | Grava o relatório em `docs/ai/custos/P<plano>[-F<fase>]-custo-AAAA-MM-DD.md`. |
| `--json` | Saída em JSON. |

## Como o uso é ligado à tarefa
Cada ferramenta tem o seu jeito; o script usa o que a ferramenta grava.

| Ferramenta | Marca da tarefa | Sem marca |
|---|---|---|
| Claude Code, subagente | `description` do Agent **começa** com `P<plano>.F<fase>.T<tarefa>` (exemplo: `P163.F1.T4 ux-design: especificação da tela de pedidos`); o script lê o `meta.json` do subagente. O coordenador precisa escrevê-la ao acionar o papel. | Linha "Subagentes sem marca" (sinal de que a marca foi esquecida), fora das somas. |
| Claude Code, sessão principal | Não há campo. Use `--janela` (e `--sessao`). | Linha "Uso sem tarefa atribuída", fora das somas. |
| Codex | **Título da sessão** com `P<plano>.F<fase>.T<tarefa>` em qualquer posição (o Codex não tem `description` de subagente). O título vem do `session_index.jsonl`; dê o título ao abrir ou renomear a sessão. Para uma sessão já feita sem marca, use `--sessao <id>` com `--janela`. | Linha "Uso sem tarefa atribuída". |
| Genérico (JSON ou CSV) | Coluna `tarefa` (`P<plano>.F<fase>.T<tarefa>`). | Linha "Uso sem tarefa atribuída". |

Regra para o coordenador: **uma tarefa, uma sessão ou subagente, com a marca no nome**. Uma sessão do Codex que toca várias tarefas precisa de `--janela` por tarefa.

## Como cada ferramenta é lida
- **Claude Code:** o transcrito repete a linha de uma resposta uma vez por bloco de conteúdo; o script **deduplica por `message.id`**, inclusive entre arquivos (sessão retomada), e a cópia do subagente vence a do pai. O uso do subagente fica no transcrito dele; o do pai não o soma.
- **Codex:** as sessões ficam em `~/.codex/sessions/AAAA/MM/DD/rollout-*.jsonl.zst` (zstd) ou `.jsonl`. O formato mais comum só traz o total **acumulado** (`token_count`), repetido várias vezes; o script usa a **diferença entre totais consecutivos** (somar o campo `last_token_usage` conta o mesmo uso várias vezes; na amostra, 36,7 M contra 26,0 M de saída). Total que diminui é reinício do contador e conta como uso novo. O formato novo, `token_usage_record` por resposta, é deduplicado por `response_id`. O modelo é o do último `turn_context` (a sessão pode trocar de modelo). No Codex, `input_tokens` **inclui** o cache lido: a entrada do relatório é `input − cache lido`, e a saída já inclui o raciocínio.
  - Descompactar `.zst` exige **Node 22.15 ou mais novo**; sem isso, o script tenta o programa `zstd` no PATH; sem nenhum dos dois, avisa e ignora as sessões do Codex (o resto do relatório sai).
- **Genérico (outras LLMs e APIs):** um arquivo JSON (lista, ou `{ "registros": [...] }`) ou CSV (cabeçalho na primeira linha, vírgula ou ponto e vírgula). Colunas: `modelo`, `timestamp` (ou `data`), `entrada`, `saida`, `cache_lido`, `cache_criado_5m`, `cache_criado_1h` (as ausentes valem 0); opcionais: `ferramenta` (padrão `generico`), `tarefa`, `papel`, `sessao`, `valor` e `moeda`. Se a API já informa o custo (`valor`), o script usa esse valor com a `moeda` da linha e não consulta a tabela.

## Tabela de preços (`.ai/local/precos-de-modelo.json`)
Local ao projeto, **não** vem no toolkit e o preço **nunca** é fixo no código. O dono preenche com os preços que valem. Cada modelo, de qualquer ferramenta, tem a sua linha; **a moeda pode vir por linha** (`moeda`), e a do arquivo vale para as linhas que não a trazem. Não há conversão e moedas diferentes não se somam: o relatório mostra uma parcela por moeda (`BRL 2,00 + USD 1,50`).
```json
{
  "moeda": "USD",
  "fonte": "onde o dono leu o preço",
  "precos": [
    { "modelo": "<id do modelo, igual ao do registro>", "vigente_desde": "AAAA-MM-DD", "moeda": "(opcional)",
      "por_milhao": { "entrada": 0, "saida": 0, "cache_lido": 0, "cache_criado_5m": 0, "cache_criado_1h": 0 } }
  ]
}
```
Para cada requisição vale a linha do mesmo `modelo` com a maior `vigente_desde` menor ou igual à data da requisição. Campos que a LLM não tem (por exemplo `cache_criado_1h`) ficam em zero ou ausentes. Os zeros acima são só o formato; não são preços.

**Preço ausente** (sem arquivo, modelo sem linha ou data anterior à primeira vigência): o relatório mostra os tokens, deixa o valor em branco (`— (sem preço)`), imprime um `Aviso: sem preço para <modelo>` por modelo (com o período) e marca o total como **parcial**. O script nunca inventa valor e nunca aborta por isso.

## O que o relatório traz
Uma linha por tarefa, ferramenta, papel e modelo (entrada, saída, cache lido, cache criado, valor); o subtotal por fase com a coluna **Consultas ao fonte** (quantidade de demandas `docs/ai/demands/P<plano>.F<fase>.DEM*` da fase, HO-08); a tabela **Por ferramenta e modelo** quando há mais de uma; e o total do plano. Quem ler: tarefa com muito cache criado repetido costuma ser contexto reaberto; fase com consultas ao fonte indica lacuna da KB.

## Limites
- O valor é estimativa pela tabela local, não a fatura.
- Codex: não há subagente com `description`; subagentes do Codex, se existirem, não são ligados a tarefa (a confirmar). O campo de escrita de cache (`cache_write_input_tokens`) foi sempre 0 na amostra e é lido como cache criado de 5 minutos. Ler as sessões é lento (cerca de 12 s para 465 arquivos).
- Sessão que toca vários planos precisa de `--janela` por tarefa.
- Outras ferramentas só entram pelo arquivo genérico; o toolkit não lê o histórico de outras ferramentas.
