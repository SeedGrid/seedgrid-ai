---
description: "Fluxo de coordenação da sessão principal: quando coordenar, escolher papéis, delegar e consolidar. Leia antes de qualquer tarefa não trivial."
---
# Coordenação de tarefas

Regras para a sessão principal (o coordenador) no Claude Code ou no Codex. Elas orientam o comportamento; não são garantias técnicas do instalador.

## Quando coordenar

- Tarefas triviais (ajuste pontual, pergunta, mudança de uma linha) podem ser feitas diretamente, sem papéis.
- Todas as outras seguem o fluxo abaixo. O diagrama e a divisão de papéis estão em [fluxo de trabalho](../references/fluxo-de-trabalho.md).

## Fluxo

1. **Acionar o `arquiteto` primeiro.** Passe o pedido do usuário como foi escrito. Ele classifica a tarefa (`feature`, `bug`, `hotfix`, `refactor` ou `chore`), lê o código e a KB e devolve **dúvidas** ou o **plano**.
2. **Resolver as dúvidas.** O arquiteto não fala com o usuário: faça as perguntas dele ao usuário e devolva as respostas, até não restar dúvida relevante. Dúvida pequena vira premissa declarada.
3. **Aprovar o plano.** Em feature e refactor, mostre o plano (tarefas, paralelismo, critérios de aceite) e só implemente depois da aprovação do usuário. Em hotfix e bug claros, o plano é mínimo e segue direto.
4. **Delegar com contexto completo.** Para cada tarefa do plano, acione o papel indicado (`backend-java`, `backend-rust`, `frontend-react`) com: objetivo, contexto, arquivos envolvidos, limites, critérios de aceite e resultado esperado. Use o [template de especificação de tarefa](../templates/especificacao-tarefa.md) quando ajudar. Consulte o [índice de papéis](../agents/index.md) e leia a definição completa apenas dos papéis acionados.
5. **Paralelizar com cuidado.** Rode em paralelo somente o que o plano marcou como independente. Nunca atribua escrita nos mesmos arquivos a dois papéis ao mesmo tempo; contrato de API antes da tela que o consome.
6. **Receber e encaminhar.** Confira cada entrega (ver [formato de entrega](formato-entrega.md)), verifique pendências e repasse o contexto necessário ao próximo papel.
7. **Revisar e testar.** Depois da implementação, o `revisor` examina o diff e o `qa` cria e executa os testes e valida os critérios de aceite. Achados e falhas voltam ao implementador responsável. O rigor cresce com o risco: dados, segurança, contratos públicos e migrações exigem mais.
8. **Consolidar.** Responda ao usuário com o que foi feito, as verificações executadas e as pendências. Publicar, fazer deploy ou dar push continua sendo decisão do usuário.

### Hotfix

Triagem rápida do `arquiteto` (causa, menor correção segura, risco), correção mínima, teste de regressão do `qa` e revisão enxuta. Sem refactor: o que aparecer no caminho vira pendência.

## Delegação disponível

- **Modo shared:** use o mecanismo de subagentes da ferramenta (quando houver), passando a definição do papel como instrução. Se não houver subagentes, aplique o papel na própria sessão, um de cada vez, e **informe ao usuário** que a delegação não estava disponível.
- **Modo native:** os papéis também estão registrados como subagentes nativos com os mesmos ids. Prefira-os. Se a ferramenta não os reconhecer, siga o modo shared e informe isso.

## Fluxos obrigatórios

Se o projeto exigir um fluxo obrigatório (por exemplo, revisão antes de todo commit), declare-o em `.ai/local/` (veja [personalização local](personalizacao-local.md)). Sem declaração explícita, o fluxo acima é uma recomendação.

## Artefatos

Os templates em `.ai/templates/` são modelos distribuídos pelo toolkit. Planos, handoffs, decisões, especificações e relatórios produzidos em tarefas reais são salvos em `.ai/docs/<tipo>/`, conforme [documentos](documentos.md), nunca dentro de `.ai/templates/`, `.ai/agents/` ou `.ai/rules/`, que são gerenciados e podem ser atualizados.
