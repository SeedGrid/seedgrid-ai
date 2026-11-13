---
name: sg-custo
description: "Calcula o custo de um plano em tokens (entrada, saída, cache lido, cache criado) e em valor, por tarefa, por fase e no total, lendo os transcritos do Claude Code. Use ao fechar cada fase, ao consolidar a entrega ou quando o dono perguntar quanto um plano custou."
metadata:
  toolkit: seedgrid-ai
---

# Custo por tarefa, fase e plano

O script `scripts/custo.mjs` (Node, sem dependência) soma o uso gravado nos transcritos do Claude Code e aplica uma tabela de preços local. Lê **só os campos de uso** (modelo, data e tokens); nunca lê nem grava conteúdo de conversa.

## Como usar
```
node .ai/skills/sg-custo/scripts/custo.mjs <plano> resumo
node .ai/skills/sg-custo/scripts/custo.mjs <plano> fase <fase> --gravar
```
`<plano>` é o número (`163`) ou o caminho do arquivo do plano. Opções:

| Opção | Efeito |
|---|---|
| `--transcritos <pasta>` | Pasta dos transcritos. Padrão: `~/.claude/projects/<pasta atual com tudo que não é letra ou número trocado por ->`. |
| `--precos <arquivo>` | Tabela de preços. Padrão: `.ai/local/precos-de-modelo.json`. |
| `--sessao <id>` | Só o uso dessa sessão e dos subagentes dela (aceita o começo do id). Obrigatória na prática quando a pasta de transcritos tem várias sessões e você usa `--janela`. |
| `--janela P<plano>.F<fase>.T<tarefa>=<início>,<fim>` | Atribui à tarefa o uso da **sessão principal** entre dois instantes ISO (repetível). Use os instantes dos marcos (commit, registro de status). **Filtra só por horário, não por sessão:** sem `--sessao`, entra o uso de todas as sessões da pasta que caíram no intervalo. |
| `--gravar` | Grava o relatório em `docs/ai/custos/P<plano>[-F<fase>]-custo-AAAA-MM-DD.md`. |
| `--json` | Saída em JSON. |

## Como o uso é ligado à tarefa
- **Subagente:** o `description` do Agent começa com `P<plano>.F<fase>.T<tarefa>` (exemplo: `P163.F1.T4 ux-design: especificação da tela de pedidos`). O script lê esse texto no `meta.json` do subagente. **Sem a marca, o uso do subagente não entra em nenhuma tarefa.** O coordenador precisa escrevê-la ao acionar o papel.
- **Sessão principal:** só com `--janela` (e `--sessao`). Sem janela, o uso aparece numa linha à parte ("Sessão principal sem tarefa atribuída") e fica fora das somas.
- **Subagente sem marca:** aparece em outra linha ("Subagentes sem marca"), também fora das somas. Essa linha é o sinal de que o coordenador esqueceu de pôr `P<plano>.F<fase>.T<tarefa>` no `description`.
- O transcrito repete a linha de uma resposta uma vez por bloco de conteúdo; o script **deduplica por `message.id`** (sem isso, a soma vem inflada, mais que o dobro na amostra do spike).
- O uso do subagente fica no transcrito dele; o transcrito do pai não o soma.

## Tabela de preços (`.ai/local/precos-de-modelo.json`)
Local ao projeto, **não** vem no toolkit e o preço **nunca** é fixo no código. O dono preenche com os preços que valem, na moeda que quiser (não há conversão):
```json
{
  "moeda": "USD",
  "fonte": "onde o dono leu o preço",
  "precos": [
    { "modelo": "<id do modelo, igual ao do transcrito>", "vigente_desde": "AAAA-MM-DD",
      "por_milhao": { "entrada": 0, "saida": 0, "cache_lido": 0, "cache_criado_5m": 0, "cache_criado_1h": 0 } }
  ]
}
```
Para cada requisição vale a linha do mesmo `modelo` com a maior `vigente_desde` menor ou igual à data da requisição. Os zeros acima são só o formato; não são preços.

**Preço ausente** (sem arquivo, modelo sem linha ou data anterior à primeira vigência): o relatório mostra os tokens, deixa o valor em branco (`— (sem preço)`), imprime `Aviso: sem preço para <modelo> em <data>` e marca o total como **parcial**. O script nunca inventa valor e nunca aborta por isso.

## O que o relatório traz
Uma linha por tarefa, papel e modelo (entrada, saída, cache lido, cache criado, valor), o subtotal por fase com a coluna **Consultas ao fonte** (quantidade de demandas `docs/ai/demands/P<plano>.F<fase>.DEM*` da fase, HO-08) e o total do plano. Quem ler: tarefa com muito cache criado repetido costuma ser contexto reaberto; fase com consultas ao fonte indica lacuna da KB.

## Limites
- Só Claude Code. O Codex grava o uso em outro formato e não é lido.
- O valor é estimativa pela tabela local, não a fatura.
- Sessão que toca vários planos precisa de `--janela` por tarefa.
- A mesma resposta pode aparecer em mais de um transcrito (sessão retomada); o script conta uma vez, e a cópia do subagente vence a do pai.
