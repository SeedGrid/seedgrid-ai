---
description: "Fluxo de coordenação da sessão principal: quando coordenar, escolher papéis, delegar e consolidar. Leia antes de qualquer tarefa não trivial."
---
# Coordenação de tarefas

Regras para a sessão principal (o coordenador) no Claude Code ou no Codex. Elas orientam o comportamento; não são garantias técnicas do instalador.

## Quando coordenar

- Tarefas triviais (ajuste pontual, pergunta, mudança de uma linha) podem ser feitas diretamente, sem papéis.
- Todas as outras seguem o fluxo abaixo. O diagrama e a divisão de papéis estão em [fluxo de trabalho](../references/fluxo-de-trabalho.md).

## Fluxo

0. **Conferir as sobras.** No início de toda tarefa não trivial, aplique a skill `sg-branch-status`: ela lista branches e worktrees já mergeados ou sem dono. Reporte ao usuário o que sobrou e proponha a limpeza; nunca apague o que não está mergeado sem perguntar.
0b. **Produto novo.** Se o pedido é criar um produto SeedGrid do zero (a pasta não tem `produto.json`), acione a skill `sg-new-product` **antes** do `arquiteto`: ela conduz a entrevista fixa, roda o script que gera o produto e escreve o plano e os documentos em `docs/ai/`. Depois disso o `arquiteto` recebe o plano do produto para a primeira feature. Se o pedido parece só “crie o plano” de um produto novo, não o trate como consultoria: acione a skill ou pergunte ao usuário antes.
1. **Acionar o `arquiteto` primeiro.** Passe o pedido do usuário como foi escrito. Ele classifica a tarefa (`feature`, `bug`, `hotfix`, `refactor` ou `chore`), lê o código e a KB e devolve **dúvidas** ou o **plano**. **Quem cria o plano (as etapas da `sg-plan-goal`) é o `arquiteto`, nunca o coordenador**: o coordenador só repassa as perguntas ao usuário, grava o arquivo em `docs/ai/plans/` e obtém a aprovação. Isto vale também para o pedido de “criar ou analisar um plano”, que não é consultoria solta. Se o pedido for planejar, não pule o `arquiteto` nem monte o plano na sessão principal.
2. **Resolver as dúvidas.** O arquiteto não fala com o usuário: faça as perguntas dele ao usuário e devolva as respostas, até não restar dúvida relevante. Dúvida pequena, **que um padrão já existente no projeto resolve**, vira premissa declarada com o padrão citado; dúvida sem padrão, ou que mude comportamento combinado, vai ao usuário.
3. **Aprovar o plano.** Antes de mostrar, **leia o plano inteiro que o `arquiteto` entregou**, gravado em `docs/ai/plans/` (o resumo dele não basta, e plano fora do projeto não vale) e rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> status`; só apresente com a saída sem aviso. Em feature e refactor, mostre o plano (fases e tarefas no formato fixo da skill `sg-plan-goal`, com `depende-de`, `escreve` e critérios de aceite) e só implemente depois da aprovação do usuário. Em hotfix e bug claros, o plano é mínimo e segue direto.
4. **Delegar com contexto completo.** Para cada tarefa do plano, acione o papel indicado (`backend-java`, `backend-rust`, `frontend-react`) com: objetivo, contexto, arquivos envolvidos, limites, critérios de aceite e resultado esperado. Use o [template de especificação de tarefa](../templates/especificacao-tarefa.md) quando ajudar. Consulte o [índice de papéis](../agents/index.md) e leia a definição completa apenas dos papéis acionados.
5. **Paralelizar com cuidado.** Rode em paralelo somente o que o plano marcou como independente. Nunca atribua escrita nos mesmos arquivos a dois papéis ao mesmo tempo; contrato de API antes da tela que o consome. **Com o plano em `docs/ai/plans/`, rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> proximas` antes de cada rodada e acione, na mesma mensagem, um papel (subagente) para cada tarefa que ele liberar, até 4; não execute em série o que ele marcou como paralelo.** Marque a tarefa `[x]` só com a linha `Evidencia:` e confira a fase com `controle.mjs <plano> checklist <fase>`.
6. **Receber e encaminhar.** Confira cada entrega (ver [formato de entrega](formato-entrega.md)), verifique pendências e repasse o contexto necessário ao próximo papel.
7. **Revisar e testar.** Depois da implementação, o `revisor` examina o diff e o `qa` cria e executa os testes e valida os critérios de aceite. Achados e falhas voltam ao implementador responsável. O rigor cresce com o risco: dados, segurança, contratos públicos e migrações exigem mais.
8. **Consolidar.** Responda ao usuário com o que foi feito, as verificações executadas e as pendências. Publicar, fazer deploy ou dar push continua sendo decisão do usuário.

### Siga o combinado; não invente

Vale para a sessão principal e para todos os papéis, em qualquer tarefa (incluindo a criação de um produto novo).

1. **O combinado manda.** Pedido do usuário, plano aprovado, decisão registrada, regra do toolkit e matriz do `sg-new-product` são o combinado. Entregue exatamente isso: nem a mais (módulo, dependência, tela, propriedade, configuração, camada de segurança), nem a menos.
2. **Onde o combinado é omisso, copie o padrão do projeto.** Procure primeiro uma implementação equivalente no próprio código (outra tela, outro CRUD, outro módulo, o boilerplate) e siga-a. Cite no relato qual padrão seguiu.
3. **Sem padrão, pergunte.** Uma pergunta por vez, com a sua recomendação e o que fará se não houver resposta. Não escreva solução própria no lugar da pergunta.
4. **Divergência não é sua para decidir.** Tirar algo previsto, mudar um comportamento combinado, trocar um formato ou acrescentar uma dependência fora do plano: pare aquela tarefa, registre a pergunta (o que foi combinado, o que o código pede, opções e recomendação) e siga com as independentes. Registrar depois de ter feito não basta.
5. **O host não reinventa a plataforma.** Autenticação, permissões e auditoria vêm da `seedgrid-security` e das extensions já no projeto; não crie outra. O host não altera extension (`limites-do-host.md`).

### Hotfix

Triagem rápida do `arquiteto` (causa, menor correção segura, risco), correção mínima, teste de regressão do `qa` e revisão enxuta. Sem refactor: o que aparecer no caminho vira pendência.

## Delegação disponível

- **Modo shared:** use o mecanismo de subagentes da ferramenta (quando houver), passando a definição do papel como instrução. Se não houver subagentes, aplique o papel na própria sessão, um de cada vez, e **informe ao usuário** que a delegação não estava disponível.
- **Modo native:** os papéis também estão registrados como subagentes nativos com os mesmos ids. Prefira-os. Se a ferramenta não os reconhecer, siga o modo shared e informe isso.

## Branches

Toda tarefa não trivial trabalha em uma branch própria, criada a partir da `develop` e integrada por squash; a limpeza e as autorizações estão em [branches](branches.md). Para criar a branch, siga o tipo que o `arquiteto` classificou (`feature/`, `bugfix/`, `refactor/`, `chore/`, `hotfix/`).

## Fluxos obrigatórios

Se o projeto exigir um fluxo obrigatório (por exemplo, revisão antes de todo commit), declare-o em `.ai/local/` (veja [personalização local](personalizacao-local.md)). Sem declaração explícita, o fluxo acima é uma recomendação.

## Artefatos

Os templates em `.ai/templates/` são modelos distribuídos pelo toolkit. Planos, handoffs, decisões, especificações e relatórios produzidos em tarefas reais são salvos em `docs/ai/<tipo>/`, conforme [documentos](documentos.md), nunca dentro de `.ai/templates/`, `.ai/agents/` ou `.ai/rules/`, que são gerenciados e podem ser atualizados.
