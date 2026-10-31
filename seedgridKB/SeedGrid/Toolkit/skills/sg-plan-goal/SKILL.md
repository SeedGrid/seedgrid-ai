---
name: sg-plan-goal
description: Leva uma tarefa não trivial de um pedido solto até um plano de tarefas pronto para execução autônoma (por exemplo /goal), no formato fixo do toolkit - princípios, reconhecimento somente leitura, hipóteses provadas por testes, perguntas ao dono, contratos, tarefas com depende-de, escreve, aceite e evidência, bloco /goal por fase e execução em paralelo. Use para toda tarefa não trivial; o plano muda de tamanho, não de estrutura. Use também quando pedirem para criar, analisar ou revisar um plano (quem executa o método é o arquiteto).
metadata:
  toolkit: seedgrid-ai
---

# Do pedido ao plano pronto para o /goal

**Quem executa o método é o `arquiteto`** (o coordenador não monta o plano: aciona o `arquiteto`, repassa as perguntas dele ao dono e grava o arquivo). Método de 12 etapas, o mesmo para toda tarefa não trivial: **não há critério de "mudança grande"**. Uma tarefa pequena percorre as mesmas etapas com artefatos curtos (uma fase, poucas tarefas); o que muda é o tamanho do plano, não a estrutura. Cada etapa deixa um artefato. O plano e as tarefas ficam em `docs/ai/plans/` (veja `.ai/rules/documentos.md`); as decisões viram ADR com a skill `sg-adr`. Tarefa trivial (uma linha, correção óbvia) não precisa de plano: o coordenador faz direto. A `sg-plan-change` é a versão curta para tarefas pequenas e usa o mesmo formato de tarefa.

## Etapas

1. **Princípios e restrições do dono**, escritos no topo do plano: fonte da verdade, falhar fechado, o que é agnóstico, KB e documentação atualizadas ao fim de cada passo. Tudo abaixo respeita esses princípios.
2. **Reconhecimento somente leitura.** Leia o código e as migrations do próprio produto e a documentação; o contrato das extensions SeedGrid vem só da KB (`.ai/brain/`), e dúvida que a KB não responde vira demanda (HO-08), não leitura do fonte da extension; levante o "estado atual" e liste **hipóteses numeradas** (H1..Hn). Não altere nada em produção.
3. **Prove as hipóteses com testes reais** (banco real via Testcontainers, HTTP real): um "livro de regras" que descreve como o sistema funciona **hoje**. Isso acha o que a leitura de código não acha. Resultado inesperado é um **achado**, não um teste a consertar.
4. **Rodadas curtas de perguntas ao dono** (3 a 6 por vez), cada uma com a **sua recomendação** e uma decisão por pergunta. O dono responde, corrige ou diz que não entendeu (explique de novo). Cada decisão entra no plano na hora, com a data, **repetida em uma frase**.
5. **Investigue antes de perguntar.** Tudo o que dá para verificar (código, documentação oficial, contagem de consumidores, spike descartável fora do projeto, trabalho longo delegado a um agente) você verifica. Só vão ao dono as dúvidas que são decisão dele.
6. **Limpezas sucessivas do plano.** Fica só o que está decidido; raciocínio e versões antigas vão para o arquivo. Seções fixas: princípios, estado atual, decisões por módulo, contratos, testes e governança, ordem de execução, em aberto.
7. **Cruzamento entre módulos** depois de fechar cada um: tabela de conflitos X1..Xn, com proposta e decisão para cada.
8. **Contratos fechados antes de codar:** DTOs, códigos de erro estáveis, chaves de cache, campos novos e inventário do front (arquivo e linha).
9. **Divisão em tarefas.** Fases com dependência explícita. Paralelo (trilhas por repositório, no máximo 4 agentes) só onde não há dependência e **nunca dois escrevendo no mesmo arquivo**; série onde há. Cada tarefa tem: passos em checklist, **critério de aceite**, testes unitários e de integração, e o repositório. Termine com uma fase de E2E e uma de publicação.
10. **Testes-guardiões.** O livro de regras vira guardião quando a regra é permanente (a expectativa se inverte no mesmo commit, citando a decisão). Convenção `*GuardianIT`/`*GuardianTest` com aviso no topo (BE-42). Liste os guardiões previstos por fase.
11. **Governança de execução.** Uma definição de pronto única (testes verdes, commit, registro no controle, documentação e KB). Use o `controle.mjs` desta skill (status, checklist, proximas); ele só lê o plano, então compare sempre com o **git real**; nunca confie só no arquivo. Commits iniciais separando o que era de terceiros do que é da sessão. Push e merge só com autorização do dono.
12. **Preparar o /goal.** O avaliador da condição **não lê arquivos**: a condição precisa exigir **evidência visível** na saída. Marque a tarefa como feita só com uma linha `Evidencia:`; use um verificador de checklist cuja saída entra na condição; defina limite de turnos; um comando `/goal` por fase; regras de retomada por limite de uso e de crédito.

## Modo "adequar plano"

Quando o plano **já existe** em outro formato (briefing, plano de produto em prosa), não replaneje do zero: use a skill `sg-diagnostico` (diagnóstico, esqueleto no formato ao lado do original e conferência com o `controle.mjs`). As decisões do dono que o plano já traz entram como `[x]` com a origem; o original fica intacto.

## Formato fixo do plano de tarefas

Copie [assets/plano-de-tarefas.md](assets/plano-de-tarefas.md) e preencha, **inclusive o `aidlc:` do cabeçalho com o `contentVersion` de `.ai/toolkit-lock.json`** (o `controle.mjs status` avisa se faltar). O formato é o mesmo em todo plano, porque o `controle.mjs` lê esse formato:

- **Identificador falante (planos novos):** `P<plano>.F<fase>.T<tarefa>` e, para decisão do dono, `P<plano>.F<fase>.D<n>`. Exemplos: `P24.F3b.T6` = plano 24, fase 3b, tarefa 6; `P111.F2.D1` = decisão 1 da fase 2; `F0` = plano inteiro (`P111.F0.D2`); fase final `P111.FIM.T1`. O dono não precisa perguntar "o que é a T3b.6": o número já diz o plano. Planos antigos mantêm `T3b.6`; ao citar, diga sempre plano, fase, tarefa e o título.
- **Fases** (`## Fase N — nome`) com dependência explícita e aceite da fase.
- **Cada tarefa** é uma linha `- [ ] **P111.F1.T1 Título** (`depende-de`: P111.F0.T1, P111.F0.T2; `escreve`: caminhos)` seguida de `Aceite`, `Testes` e, ao concluir, `Evidencia`.
- `[ ]` vira `[x]` **somente** com a linha `  - Evidencia: <comando, teste ou hash>` embaixo. Sem evidência, a tarefa não está feita.
- **`depende-de` e `escreve` são obrigatórios**: sem eles o executor não pode provar o que roda em paralelo. `escreve` lista os arquivos, pastas ou módulos que a tarefa grava.
- **Um bloco `/goal` por fase** e **um `/goal` do plano inteiro** (seção "Goal do plano inteiro" do template), com limite de turnos e condição que exige evidência visível na saída (etapa 12).
- **Decisão do dono no goal geral:** o executor não decide sozinho. Marca a tarefa `[?]` com `Pergunta:` e `Recomendacao:`, faz todas as tarefas que não dependem dela e, ao final, pergunta tudo de uma vez ao dono. Só é `[?]` o que é decisão do dono (produto, custo, dependência nova, algo irreversível); dúvida técnica se resolve com teste ou spike.
- **Uma definição de pronto única** no topo do plano.

## Execução em paralelo

Ao começar uma fase, monte o grafo das tarefas e **lance em paralelo tudo o que não depende de tarefa aberta**, em vez de seguir a ordem do documento. O comando `proximas` do `controle.mjs` faz essa conta:

- no máximo **4 agentes** ao mesmo tempo (limite de subagentes e de custo);
- **nunca dois escrevendo no mesmo caminho**: tarefas com `escreve` em comum esperam;
- **mais de 4 só em worktrees**: cada agente além do quarto roda no próprio worktree e branch, e os merges voltam **em série** para a branch do plano; o teto acima de 4 é definido no plano da fase;
- **ao fazer o merge, apague a branch (local e remota), remova o worktree e o diretório** criado; worktree com mudança não mergeada não some sozinho: reporte e pergunte ao dono (`sg-branch-status` lista os sem dono).

## Controle do plano

`node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano.md> <comando>`:

- `status`: progresso por fase.
- `checklist <fase> [--completa [--exceto-decisoes]]`: toda tarefa `[x]` precisa de `Evidencia:`; com `--completa`, falha se sobrou tarefa aberta; com `--exceto-decisoes`, tarefa aberta que depende (direta ou indiretamente) de uma `[?]` não conta, porque está esperando o dono. É a saída que entra na condição do `/goal`.
- `pendencias`: lista as perguntas ao dono (cada tarefa `[?]` com `Pergunta:` e `Recomendacao:`) e as tarefas que ela bloqueia; sai 0. Entra na condição do goal geral, para a lista aparecer na saída.
- `proximas [--max 4] [--json]`: o que pode rodar em paralelo agora, o que espera (conflito de escrita, acima do limite) e o que está bloqueado.

O script só lê o plano; compare sempre com o git real (commits, testes), nunca confie só no arquivo.

## Regras que nasceram de erros

- **Afirmação sobre comportamento = teste, não só leitura.** Uma conclusão tirada da documentação de um framework estava errada; um spike mostrou o contrário.
- **Nunca `git add -A` em diretório compartilhado:** varreu arquivos de outra sessão. Adicione arquivo por arquivo, ou trabalhe em um worktree próprio.
- **Nunca `taskkill` geral nem porta padrão de teste:** mate só o PID do teste e aponte o cliente HTTP para a porta do app.
- **Decisão registrada invertida** só apareceu quando o dono releu. Por isso a decisão é repetida em uma frase ao registrar.

## Saída

Plano (etapas 1 a 8), tarefas (etapas 9 a 12) e a lista das ADRs a registrar (`sg-adr`). Pare e peça aprovação do dono antes de iniciar a execução.
