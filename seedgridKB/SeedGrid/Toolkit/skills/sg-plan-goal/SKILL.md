---
name: sg-plan-goal
description: Leva uma mudança grande de um pedido solto até um plano pronto para execução autônoma (por exemplo /goal) - princípios, reconhecimento somente leitura, hipóteses provadas por testes, rodadas de perguntas ao dono, contratos, tarefas com critério de aceite, guardiões e governança de execução. Use quando a mudança atravessa vários módulos, tem regras de negócio ou segurança críticas, ou vai ser executada por vários agentes. Para uma mudança pequena use sg-plan-change.
metadata:
  toolkit: seedgrid-ai
---

# Do pedido ao plano pronto para o /goal

Método de 12 etapas para mudanças grandes. Cada etapa deixa um artefato. O plano e as tarefas ficam em `docs/ai/plans/` (veja `.ai/rules/documentos.md`); as decisões viram ADR com a skill `sg-adr`. Para mudança pequena, use `sg-plan-change`.

## Etapas

1. **Princípios e restrições do dono**, escritos no topo do plano: fonte da verdade, falhar fechado, o que é agnóstico, KB e documentação atualizadas ao fim de cada passo. Tudo abaixo respeita esses princípios.
2. **Reconhecimento somente leitura.** Leia código, migrations e documentação; levante o "estado atual" e liste **hipóteses numeradas** (H1..Hn). Não altere nada em produção.
3. **Prove as hipóteses com testes reais** (banco real via Testcontainers, HTTP real): um "livro de regras" que descreve como o sistema funciona **hoje**. Isso acha o que a leitura de código não acha. Resultado inesperado é um **achado**, não um teste a consertar.
4. **Rodadas curtas de perguntas ao dono** (3 a 6 por vez), cada uma com a **sua recomendação** e uma decisão por pergunta. O dono responde, corrige ou diz que não entendeu (explique de novo). Cada decisão entra no plano na hora, com a data, **repetida em uma frase**.
5. **Investigue antes de perguntar.** Tudo o que dá para verificar (código, documentação oficial, contagem de consumidores, spike descartável fora do projeto, trabalho longo delegado a um agente) você verifica. Só vão ao dono as dúvidas que são decisão dele.
6. **Limpezas sucessivas do plano.** Fica só o que está decidido; raciocínio e versões antigas vão para o arquivo. Seções fixas: princípios, estado atual, decisões por módulo, contratos, testes e governança, ordem de execução, em aberto.
7. **Cruzamento entre módulos** depois de fechar cada um: tabela de conflitos X1..Xn, com proposta e decisão para cada.
8. **Contratos fechados antes de codar:** DTOs, códigos de erro estáveis, chaves de cache, campos novos e inventário do front (arquivo e linha).
9. **Divisão em tarefas.** Fases com dependência explícita. Paralelo (trilhas por repositório, no máximo 4 agentes) só onde não há dependência e **nunca dois escrevendo no mesmo arquivo**; série onde há. Cada tarefa tem: passos em checklist, **critério de aceite**, testes unitários e de integração, e o repositório. Termine com uma fase de E2E e uma de publicação.
10. **Testes-guardiões.** O livro de regras vira guardião quando a regra é permanente (a expectativa se inverte no mesmo commit, citando a decisão). Convenção `*GuardianIT`/`*GuardianTest` com aviso no topo (BE-42). Liste os guardiões previstos por fase.
11. **Governança de execução.** Uma definição de pronto única (testes verdes, commit, registro no controle, documentação e KB). Um script de controle (status, iniciar, registrar, verificar, relatório) que compara o registro com o **git real**; nunca confie só no arquivo. Commits iniciais separando o que era de terceiros do que é da sessão. Push e merge só com autorização do dono.
12. **Preparar o /goal.** O avaliador da condição **não lê arquivos**: a condição precisa exigir **evidência visível** na saída. Marque a tarefa como feita só com uma linha `Evidencia:`; use um verificador de checklist cuja saída entra na condição; defina limite de turnos; um comando `/goal` por fase; regras de retomada por limite de uso e de crédito.

## Regras que nasceram de erros

- **Afirmação sobre comportamento = teste, não só leitura.** Uma conclusão tirada da documentação de um framework estava errada; um spike mostrou o contrário.
- **Nunca `git add -A` em diretório compartilhado:** varreu arquivos de outra sessão. Adicione arquivo por arquivo, ou trabalhe em um worktree próprio.
- **Nunca `taskkill` geral nem porta padrão de teste:** mate só o PID do teste e aponte o cliente HTTP para a porta do app.
- **Decisão registrada invertida** só apareceu quando o dono releu. Por isso a decisão é repetida em uma frase ao registrar.

## Saída

Plano (etapas 1 a 8), tarefas (etapas 9 a 12) e a lista das ADRs a registrar (`sg-adr`). Pare e peça aprovação do dono antes de iniciar a execução.
