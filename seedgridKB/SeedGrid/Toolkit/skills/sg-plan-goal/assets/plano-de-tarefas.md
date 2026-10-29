---
status: proposto
data: AAAA-MM-DD
---

# Tarefas: <assunto>

Legenda: `[ ]` aberta · `[~]` em andamento · `[x]` feita (só com linha `Evidencia:`) · `[>]` adiada · `[?]` decisão do dono.

## Princípios e restrições do dono

- <fonte da verdade, falhar fechado, o que é agnóstico, KB e documentação atualizadas ao fim de cada passo>

## Definição de pronto (vale para toda tarefa)

Testes verdes, commit, linha `Evidencia:` preenchida, documentação e KB atualizadas. Push e merge só com autorização do dono.

## Fase 1 — <nome>

Aceite da fase: <condição verificável>.

```
/goal Fase 1 de <caminho do plano>: rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist 1 --completa` e mostre a saída com 0 problema(s). Máximo de 20 turnos. A condição só vale com essa saída visível.
```

- [ ] **T1.1 <Título curto>** (`depende-de`: nada; `escreve`: src/exemplo/, tests/exemplo.test.ts)
  - Passos: <checklist curto>
  - Aceite: <critério observável>
  - Testes: <unitários e de integração>
  - Evidencia: <comando, teste ou hash; preencha só ao marcar [x]>

- [ ] **T1.2 <Título curto>** (`depende-de`: T1.1; `escreve`: docs/)
  - Aceite: <critério observável>

## Fase 2 — <nome>

- [ ] **T2.1 <Título curto>** (`depende-de`: T1.1, T1.2; `escreve`: src/outro/)
  - Aceite: <critério observável>

## Fase FIM — E2E e publicação

- [ ] **TF.1 Fechar o plano** (`depende-de`: T2.1; `escreve`: este plano)
  - Aceite: `status: concluido`, `fechado-por` preenchido e plano arquivado.

## Como o executor usa este plano

- `controle.mjs <plano> proximas` lista o que pode rodar **em paralelo agora**: tarefas abertas com todo `depende-de` feito e sem caminho de `escreve` em comum, até 4 por vez.
- Tarefa sem `escreve` declarado não prova paralelismo: declare os arquivos ou módulos que ela grava.
- Acima de 4 agentes, só em worktrees próprios (um por agente), com merge em série; ao terminar, apague a branch e remova o worktree **e o diretório**.
