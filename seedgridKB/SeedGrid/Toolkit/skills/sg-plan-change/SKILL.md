---
name: sg-plan-change
description: Planeja uma mudança de código antes de implementar - entende o objetivo, lê o código afetado, define critérios de aceite, divide em tarefas e identifica riscos. Use quando a tarefa atravessa vários arquivos ou camadas, é ambígua ou envolve decisão de arquitetura.
metadata:
  toolkit: seedgrid-ai
---

# Planejar mudança

Produza um plano curto e verificável antes de alterar código não trivial.

## Passos

1. **Objetivo.** Reescreva o pedido em uma frase e liste as restrições explícitas. Se faltar informação indispensável, pergunte antes de seguir.
2. **Reconhecimento.** Leia os arquivos que serão afetados e o código que os chama. Anote convenções do projeto (estrutura, testes, nomes). Não presuma estrutura que não viu.
3. **Critérios de aceite.** Escreva de 2 a 6 critérios verificáveis (comportamento observável, testes, comandos).
4. **Abordagem.** Descreva a solução escolhida e, se houver escolha relevante, ao menos uma alternativa e por que foi descartada.
5. **Tarefas.** Divida em tarefas pequenas com: papel responsável, arquivos prováveis (`escreve`), dependências (`depende-de`) e ordem, no mesmo formato de tarefa da skill `sg-plan-goal`. Marque o que pode ser paralelo; nunca coloque dois responsáveis escrevendo no mesmo arquivo ao mesmo tempo. Se o plano ganhar várias fases ou for executado por vários agentes, passe para o formato completo da `sg-plan-goal` (o plano muda de tamanho, não de estrutura).
6. **Riscos e verificação.** Liste riscos (dados, segurança, contratos, desempenho, migração) e o nível de revisão e validação proporcional.

## Saída

Use o modelo [assets/especificacao-tarefa.md](assets/especificacao-tarefa.md) para cada tarefa delegada. O plano segue **sempre o formato fixo de tarefas da `sg-plan-goal`**, para o `controle.mjs` poder lê-lo: copie `.ai/skills/sg-plan-goal/assets/plano-de-tarefas.md` e preencha. Uma tarefa pequena é uma fase com poucas tarefas, não outro formato (nada de tabela de tarefas). Estrutura mínima:

```markdown
## Objetivo
## Critérios de aceite
## Abordagem
## Fase 1 — <nome>
- [ ] **P<plano>.F1.T1 Título** (`depende-de`: nada; `escreve`: caminhos)
  - Aceite: ...
  - Evidencia: <ao concluir>
(um bloco /goal por fase, como no template)
## Riscos e verificação
## Dúvidas
```

## Cuidados

- Tarefas triviais não precisam de plano formal: implemente direto e diga isso.
- O plano é uma saída do projeto; não o salve dentro das pastas gerenciadas pelo toolkit (`.ai/templates/`, `.ai/rules/`, `.ai/agents/`).
