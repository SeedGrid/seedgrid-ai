---
status: proposto
data: AAAA-MM-DD
---

# Tarefas: <assunto>

**Identificador (número falante):** `P<plano>.F<fase>.T<tarefa>` para tarefa e `P<plano>.F<fase>.D<n>` para decisão do dono. Exemplos: `P111.F2.T3` (plano 111, fase 2, tarefa 3), `P24.F3b.T6`, `P111.F2.D1`; `F0` vale para o plano inteiro (`P111.F0.T1`, `P111.F0.D2`) e a fase final é `P111.FIM.T1`. `<plano>` é o `numero:` do cabeçalho (ou o número do plano em `docs/ai/plans/`). Troque `P000` abaixo pelo número do plano. Quem fala com o dono cita sempre plano, fase, tarefa **e o título**.


Legenda: `[ ]` aberta · `[~]` em andamento · `[x]` feita (só com linha `Evidencia:`) · `[>]` adiada · `[?]` decisão do dono.

## Princípios e restrições do dono

- <fonte da verdade, falhar fechado, o que é agnóstico, KB e documentação atualizadas ao fim de cada passo>

## Definição de pronto (vale para toda tarefa)

Testes verdes, commit, linha `Evidencia:` preenchida, documentação e KB atualizadas. Push e merge só com autorização do dono.

## Goal do plano inteiro

Para executar tudo de uma vez. Ordem das fases e paralelismo do `proximas` (até 4 agentes, nunca dois escrevendo no mesmo caminho). Se o limite de turnos acabar, rode de novo: o `controle.mjs` retoma de onde parou.

**Regra de decisão:** se precisar do dono para uma decisão (produto, custo, dependência nova, algo irreversível), **não decida sozinho**. Marque a tarefa como `[?]`, escreva embaixo `Pergunta:` e `Recomendacao:`, siga com **todas** as tarefas que não dependem dela e, **ao final, faça todas as perguntas de uma vez** ao dono. Dúvida técnica não é decisão do dono: resolva com teste ou spike.

```
/goal Plano completo de <caminho do plano>: para cada fase, rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist <fase> --completa --exceto-decisoes` e mostre cada saída com 0 problema(s); depois rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> pendencias` e mostre a saída. Se houver pergunta ao dono, liste todas numa mensagem só, com a sua recomendação, e pare. Máximo de 150 turnos. A condição só vale com essas saídas visíveis.
```

## Fase 1 — <nome>

Aceite da fase: <condição verificável>.

```
/goal Fase 1 de <caminho do plano>: rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist 1 --completa` e mostre a saída com 0 problema(s). Máximo de 20 turnos. A condição só vale com essa saída visível.
```

- [ ] **P000.F1.T1 <Título curto>** (`depende-de`: nada; `escreve`: src/exemplo/, tests/exemplo.test.ts)
  - Passos: <checklist curto>
  - Aceite: <critério observável>
  - Testes: <unitários e de integração>
  - Evidencia: <comando, teste ou hash; preencha só ao marcar [x]>

- [ ] **P000.F1.T2 <Título curto>** (`depende-de`: P000.F1.T1; `escreve`: docs/)
  - Aceite: <critério observável>

## Fase 2 — <nome>

- [ ] **P000.F2.T1 <Título curto>** (`depende-de`: P000.F1.T1, P000.F1.T2; `escreve`: src/outro/)
  - Aceite: <critério observável>

## Fase FIM — E2E e publicação

- [ ] **P000.FIM.T1 Fechar o plano** (`depende-de`: P000.F2.T1; `escreve`: este plano)
  - Aceite: `status: concluido`, `fechado-por` preenchido e plano arquivado.

## Como o executor usa este plano

- `controle.mjs <plano> proximas` lista o que pode rodar **em paralelo agora**: tarefas abertas com todo `depende-de` feito e sem caminho de `escreve` em comum, até 4 por vez.
- Tarefa sem `escreve` declarado não prova paralelismo: declare os arquivos ou módulos que ela grava.
- Acima de 4 agentes, só em worktrees próprios (um por agente), com merge em série; ao terminar, apague a branch e remova o worktree **e o diretório**.
