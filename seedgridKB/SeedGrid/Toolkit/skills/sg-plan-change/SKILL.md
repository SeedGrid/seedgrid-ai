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
5. **Tarefas.** Divida em tarefas pequenas com: papel responsável, arquivos prováveis, dependências e ordem. Marque o que pode ser paralelo; nunca coloque dois responsáveis escrevendo no mesmo arquivo ao mesmo tempo.
6. **Riscos e verificação.** Liste riscos (dados, segurança, contratos, desempenho, migração) e o nível de revisão e validação proporcional.

## Saída

Use o modelo [assets/especificacao-tarefa.md](assets/especificacao-tarefa.md) para cada tarefa delegada. Para o plano geral, responda com:

```markdown
## Objetivo
## Critérios de aceite
## Abordagem
## Tarefas
| # | Tarefa | Papel | Arquivos | Depende de | Paralela? |
## Riscos e verificação
## Dúvidas
```

## Cuidados

- Tarefas triviais não precisam de plano formal: implemente direto e diga isso.
- O plano é uma saída do projeto; não o salve dentro das pastas gerenciadas pelo toolkit (`.ai/templates/`, `.ai/rules/`, `.ai/agents/`).
