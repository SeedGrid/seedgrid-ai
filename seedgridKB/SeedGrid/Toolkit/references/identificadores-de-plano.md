---
description: "Identificadores falantes de plano, fase, tarefa e decisão (P111.F2.T3, P111.F2.D1): formato, exemplos, como pesquisar e como citar para o dono."
---
# Identificadores de plano, fase, tarefa e decisão

Todo item de um plano novo tem um **identificador falante**: dá para saber de qual plano e de qual fase ele é sem abrir o arquivo.

| Item | Formato | Exemplo | Leitura |
| --- | --- | --- | --- |
| Tarefa | `P<plano>.F<fase>.T<tarefa>` | `P111.F2.T3` | plano 111, fase 2, tarefa 3 |
| Decisão do dono | `P<plano>.F<fase>.D<n>` | `P111.F2.D1` | plano 111, fase 2, decisão 1 |
| Fase com letra | idem | `P24.F3b.T6` | plano 24, fase 3b, tarefa 6 |
| Plano inteiro | `F0` | `P111.F0.T1`, `P111.F0.D2` | tarefa ou decisão que vale para o plano todo |
| Fase final | `FIM` | `P111.FIM.T1` | tarefa da fase de E2E e fechamento |

`<plano>` é o campo `numero:` do cabeçalho do plano. Num projeto sem esse campo, é o número do plano em `docs/ai/plans/`. O template (`.ai/skills/sg-plan-goal/assets/plano-de-tarefas.md`) usa `P000`: troque pelo número do plano.

## Como pesquisar

- Um item: `grep -rn "P111.F2.T3" docs/ai/ .` (no work: `grep -rn "P111.F2.T3" planos/ arquivo/ handoff/`).
- Tudo de um plano: `grep -rn "P111\." planos/ arquivo/`.
- Tudo de uma fase: `grep -rn "P111.F2\." planos/`.
- Só as decisões do dono do plano: `grep -rn "P111\.F[0-9A-Za-z]*\.D" planos/`.
- Perguntas abertas ao dono: `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> pendencias` (lista cada tarefa `[?]` com seu identificador).
- Tarefas que podem rodar agora: `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> proximas`.

O identificador também aparece em `depende-de:` das tarefas, na linha `Evidencia:` e nos commits, então a busca acha o item, quem depende dele e a prova de que foi feito.

## Regras

- **Planos novos** usam este formato. Planos antigos mantêm os ids de antes (`T3b.6`, `TP.5`, `PUB.1`); não renomeie plano em andamento sem combinar com quem o executa.
- **Nunca reaproveite** um identificador: se uma tarefa sai do plano, o número dela fica vago.
- **Ao falar com o dono**, cite sempre plano, fase, tarefa e o **título** ("P111.F2.T1, faixa, migration, runner e entidade"). O identificador sozinho não basta em conversa.
- O `controle.mjs` lê o identificador como texto; não há outro formato obrigatório além de começar com letra e ter pontos (`P111.F2.T3`).

Veja também [[SeedGrid/Toolkit/references/fluxo-de-trabalho|Fluxo de trabalho]] e a skill `sg-plan-goal`.
