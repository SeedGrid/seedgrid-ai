---
description: "Como ler o relatório de custo por tarefa, fase e plano (skill sg-custo): colunas, a linha opcional Custo: do plano, a pasta docs/ai/custos/, projeto com mais de uma LLM e os limites do número."
---
# Custo por fase

O custo de um plano é medido **depois** do trabalho, pela skill `sg-custo`, a partir do uso que as ferramentas de IA gravam (tokens por resposta). Quem mede é o coordenador, ao fechar cada fase; a execução das tarefas não muda por causa disso.

## Quando usar
- Ao fechar uma fase e na consolidação do plano: o coordenador roda o `sg-custo`, anexa o resumo à entrega e grava o relatório.
- Quando o dono perguntar quanto um plano ou uma fase custou.
- Para achar tarefa fora do esperado (muito cache criado, muitas consultas ao fonte) antes de repetir o padrão no próximo plano.

## Como pedir
```
node .ai/skills/sg-custo/scripts/custo.mjs <plano> resumo
node .ai/skills/sg-custo/scripts/custo.mjs <plano> fase <fase> --gravar
```
`--gravar` salva o relatório em `docs/ai/custos/P<plano>[-F<fase>]-custo-AAAA-MM-DD.md`. As opções (`--fonte`, `--sessao`, `--janela`, `--precos`, `--json`) estão na skill `sg-custo`.

## Para o custo aparecer na tarefa certa
O script liga o uso à tarefa pela marca `P<plano>.F<fase>.T<tarefa>` no **nome** de quem trabalhou:

| Ferramenta | Onde a marca vai |
|---|---|
| Claude Code, subagente | No começo do `description` do Agent (exemplo: `P163.F1.T4 ux-design: especificação da tela de pedidos`). |
| Codex | No título da sessão, em qualquer posição. |
| Outra LLM ou API | Coluna `tarefa` do arquivo JSON ou CSV. |
| Claude Code, sessão principal | Não há campo: use `--janela` com `--sessao`. |

Regra: **uma tarefa, uma sessão ou subagente, com a marca no nome**. Sem marca, o uso aparece nas linhas "sem tarefa atribuída", **fora das somas**; o aviso de "subagentes sem marca" quer dizer que alguém esqueceu de nomear.

## Como ler o relatório
| Coluna | O que é |
|---|---|
| Tarefa, Papel | A tarefa (`P<plano>.F<fase>.T<tarefa>`) e o papel que a fez (por exemplo `backend-java`). |
| Ferramenta, Modelo | Quem gerou o uso. Um projeto pode usar mais de uma ferramenta (parte no Claude Code, parte no Codex): o custo soma as duas, e a tabela **Por ferramenta e modelo** mostra a divisão. |
| Entrada | Tokens de entrada **sem** o cache lido. |
| Saída | Tokens gerados, já com o raciocínio. |
| Cache lido | Contexto reaproveitado, bem mais barato que a entrada. |
| Cache criado | Contexto gravado para reaproveitar depois. Muito cache criado repetido numa tarefa costuma ser contexto reaberto. |
| Valor | Tokens vezes o preço do modelo. Sem preço, fica `— (sem preço)` e o total é marcado **parcial**. |
| Consultas ao fonte (por fase) | Quantas demandas `docs/ai/demands/P<plano>.F<fase>.DEM*` a fase abriu (HO-08). Muitas indicam lacuna da KB. |

## A linha opcional `Custo:` no plano
Ao fechar uma tarefa, o coordenador pode resumir o custo numa linha **abaixo de `Evidencia:`**:
```
  - Custo: 632 entrada · 73.651 saída · 1,2 M cache lido · 57 mil cache criado · USD 1,84 (docs/ai/custos/P163-F1-custo-2026-11-13.md)
```
A linha é **opcional**: plano sem ela continua válido e o `controle.mjs` não reprova a ausência. Planos antigos não mudam. O relatório completo fica em `docs/ai/custos/`; a linha só aponta para ele.

## Tabela de preços
O preço **não** vem no toolkit nem fica fixo em código: está em `.ai/local/precos-de-modelo.json`, preenchido pelo dono do projeto, com uma linha por modelo (de qualquer LLM), a data de vigência e, se preciso, a moeda por linha. Moedas diferentes não se somam: o relatório mostra uma parcela por moeda. A fonte do preço (a página oficial do fornecedor) fica registrada no campo `fonte`.

## O que o número não é
- É **estimativa** pela tabela local, não a fatura do fornecedor.
- Uma sessão que toca vários planos ou várias tarefas precisa de `--janela` por tarefa; sem isso, o uso fica sem tarefa.
- Subagentes do Codex, se existirem, não são ligados à tarefa (a confirmar). A escrita de cache do Codex foi sempre zero na amostra.
- O relatório lê só os **campos de uso** (modelo, data e tokens); nunca lê nem grava conteúdo de conversa.

Skill: `SeedGrid/Toolkit/skills/sg-custo/SKILL.md`. Pasta dos documentos: `SeedGrid/Toolkit/rules/documentos.md`.
