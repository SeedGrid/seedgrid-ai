---
numero: 0
aidlc: 0.0.0   # contentVersion de .ai/toolkit-lock.json (regra documentos)
titulo: "<assunto, uma frase>"
status: proposto
data: AAAA-MM-DD
autor: "<quem escreveu>"
modulos: []
adrs: []
origem: "<quem pediu, quando e por quê; citação curta do pedido>"
goal: |
  /goal Plano completo de <caminho do plano>: para cada fase, rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist <fase> --completa --exceto-decisoes` e mostre cada saída com 0 problema(s); depois rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> varredura --completa --exceto-decisoes` (se o plano tem varredura) e a conferência final da Fase FIM, e mostre as saídas com 0 problema(s). Itens com `Pendencia:` (motivo e quem resolve) são repassados ao dono e não contam como problema. Não pare entre fases nem lotes para perguntar: vá até o fim e entregue no fim as perguntas que sobraram. Durante o plano só commit; push só no fim e só com o "pode" do dono. Máximo de <N> turnos. A condição só vale com essas saídas visíveis.
---

# Tarefas: <assunto>

**Identificador (número falante):** `P<plano>.F<fase>.T<tarefa>` para tarefa e `P<plano>.F<fase>.D<n>` para decisão do dono. Exemplos: `P111.F2.T3` (plano 111, fase 2, tarefa 3), `P24.F3b.T6`, `P111.F2.D1`; `F0` vale para o plano inteiro (`P111.F0.T1`, `P111.F0.D2`). Ao falar com o dono, cite plano, fase, tarefa **e o título**.

Legenda: `[ ]` aberta · `[~]` em andamento · `[x]` feita (só com linha `Evidencia:`) · `[>]` adiada · `[?]` decisão do dono · `n/a` não se aplica.

## Goal do plano (o /goal está no campo goal do cabeçalho, logo abaixo de origem)

Ordem das fases, série e paralelo vêm da seção "Ordem de execução" abaixo: **o que é paralelo vira agentes em paralelo (até 4, nunca dois escrevendo no mesmo caminho); o que é série espera**. Se o limite de turnos acabar, rode de novo: o `controle.mjs` retoma de onde parou.

**Regra de decisão:** se precisar do dono para uma decisão (produto, custo, dependência nova, algo irreversível), **não decida sozinho**. Marque a tarefa como `[?]`, escreva embaixo `Pergunta:` e `Recomendacao:`, siga com **todas** as tarefas que não dependem dela e **liste as perguntas** no fim.

**Regra de pendência:** tarefa ou item que não terminou ganha `Pendencia:` com **Motivo**, **Quem resolve** e **Desde**. Sem `Pendencia:`, o item não terminou por esquecimento e **volta ao ciclo** na conferência final.

(O `/goal` do plano inteiro está **no quadro do topo, no campo `goal` logo abaixo de `origem`**.)

## Princípios e restrições do dono

- <fonte da verdade, falhar fechado, o que é agnóstico, KB e documentação atualizadas ao fim de cada passo>

## Definição de pronto (vale para toda tarefa)

Testes verdes, commit, linha `Evidencia:` preenchida, documentação e KB atualizadas, checklist da tarefa todo `[x]` (ou `n/a` com motivo). **Durante o plano só commit.** Push e merge só no fim e só com autorização do dono (exceção já autorizada: as KBs e o work).

## Como o goal corre (vale para o plano inteiro)

- **Vá até o fim.** Não pare ao terminar uma fase, um lote ou um grupo para perguntar nem para pedir revisão: siga para o próximo item possível.
- **Pergunta ao dono** vira tarefa `[?]` com `Pergunta:` e `Recomendacao:`; o que não depende dela continua. As perguntas que realmente sobrarem são entregues **no fim** (P<n>.FIM.T2), numa lista só.
- **Revisão do dono** (visual ou de conteúdo) não trava a fase seguinte: o que ele apontar volta como correção.
- **Commit a cada tarefa, push só no fim.** O push de repositório que publica algo (npm, showcase, Maven) exige o "pode" do dono; sem ele, a tarefa de publicação fica com `Pendencia:` (Quem resolve: dono).
- **Agentes em paralelo** sempre que a onda for paralela e os `escreve` não se cruzarem.

## Ferramentas (consultar o índice antes de criar)

O índice é `Toolkit/references/indice-de-ferramentas.md` (no produto: `.ai/references/indice-de-ferramentas.md`). **Preencha esta tabela antes de planejar as tarefas**: para cada ferramenta que o plano usa, diga se já existe no índice. Se não existe, a primeira tarefa da Fase 1 é criá-la, **com as definições** (o que faz, entrada, saída, código de saída, teste) e a linha no índice.

| Ferramenta | Para quê neste plano | No índice? | Onde está / tarefa que cria |
|---|---|---|---|
| `controle.mjs` | status, checklist, proximas, varredura | sim | `.ai/skills/sg-plan-goal/scripts/controle.mjs` |
| <ferramenta nova> | <o que mede ou gera> | não | P000.F1.T1 |

## Ordem de execução: série e paralelo (Gantt)

O plano já nasce com o que é série e o que é paralelo. Cada onda só começa quando a anterior termina. Dentro de uma onda **paralela**, o executor lança um agente por tarefa (até 4); em **série**, uma por vez, na ordem. O `controle.mjs <plano> proximas` confere: tarefas abertas com `depende-de` feito e sem `escreve` em comum.

| Onda | Tarefas | Modo | Agentes | Depende de | Escreve (sem sobreposição) |
|---|---|---|---|---|---|
| 1 | P000.F1.T1 | série | 1 | nada | scripts/ |
| 2 | P000.F1.T2, P000.F1.T3 | paralelo | 2 | onda 1 | docs/a/, docs/b/ |
| 3 | P000.F2.T1 | série | 1 | onda 2 | src/outro/ |
| FIM | P000.FIM.T1 a P000.FIM.T3 | série | 1 | todas | este plano |

## Varredura (obrigatória quando o plano percorre componentes, extensions ou telas)

Tudo que é transversal nasce com **uma linha por item**, para não haver como esquecer um. Veja o modelo `plano-varredura.md` (tabela gerada por `varredura-componentes.mjs` a partir da fonte única do código). Cada coluna da tabela é um item do **checklist por tarefa**.

## Checklist por tarefa (o que conferir em cada item)

Cada tarefa que percorre os itens da varredura carrega, no próprio corpo, a lista do que conferir em **cada** item, e o item só vira `[x]` com todos os pontos verdadeiros. A tarefa repete a lista (não remete a outra seção) para o executor ver sem procurar.

- [ ] ponto 1: <o que conferir, verificável>
- [ ] ponto 2: <...>

## Fase 1 — <nome>

Aceite da fase: <condição verificável>.

```
/goal Fase 1 de <caminho do plano>: rode `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist 1 --completa` e mostre a saída com 0 problema(s). Não pare entre fases nem lotes para perguntar: vá até o fim e entregue no fim as perguntas que sobraram. Durante o plano só commit; push só no fim e só com o "pode" do dono. Máximo de 20 turnos. A condição só vale com essa saída visível.
```

- [ ] **P000.F1.T1 <Título curto>** (`depende-de`: nada; `escreve`: src/exemplo/, tests/exemplo.test.ts)
  - Modo: série (onda 1)
  - Passos: <checklist curto>
  - Checklist por item: [ ] ponto 1 · [ ] ponto 2 (para tarefa que percorre a varredura)
  - Aceite: <critério observável>
  - Testes: <unitários e de integração>
  - Evidencia: <comando, teste ou hash; preencha só ao marcar [x]>
  - Pendencia: <só se não terminou. Motivo: ...; Quem resolve: ...; Desde: AAAA-MM-DD>

- [ ] **P000.F1.T2 <Título curto>** (`depende-de`: P000.F1.T1; `escreve`: docs/)
  - Modo: paralelo (onda 2)
  - Aceite: <critério observável>

## Fase 2 — <nome>

- [ ] **P000.F2.T1 <Título curto>** (`depende-de`: P000.F1.T1, P000.F1.T2; `escreve`: src/outro/)
  - Modo: série (onda 3)
  - Aceite: <critério observável>

## Fase FIM — Conferência e fechamento

Aceite da fase: todos os checklists conferidos; só ficam abertos itens com `Pendencia:` (motivo e quem resolve); o resto está `[x]` ou `n/a`.

- [ ] **P000.FIM.T1 Conferir todos os checklists** (`depende-de`: P000.F1.T1, P000.F1.T2, P000.F2.T1; `escreve`: este plano)
  - Rodar `controle.mjs <plano> checklist <fase> --completa` em **todas** as fases e `varredura --completa` na varredura; ler cada tarefa e cada linha da varredura.
  - Item `[ ]` ou `[~]` **sem** `Pendencia:` foi pulado: **volta ao ciclo** (reabrir a tarefa, executar, conferir de novo). Repetir até não restar item pulado.
  - Item `[x]` sem `Evidencia:` ou sem "Quem conferiu" volta para `[ ]`.
  - Aceite: nenhuma tarefa nem linha da varredura em `[ ]`/`[~]` sem `Pendencia:`; as saídas dos comandos coladas na evidência.

- [ ] **P000.FIM.T2 Repassar as pendências ao dono** (`depende-de`: P000.FIM.T1; `escreve`: este plano)
  - Listar, em tabela (Item | Motivo da pendência | Quem resolve | O que destrava), tudo que ficou com `Pendencia:`, mais as perguntas `[?]` (`controle.mjs <plano> pendencias`). Entregar ao dono no chat.
  - Aceite: tabela entregue; cada pendência tem motivo e responsável; nada pendente sem constar.

- [ ] **P000.FIM.T3 Fechar o plano** (`depende-de`: P000.FIM.T2; `escreve`: este plano)
  - Com tudo resolvido: `status: concluido`, `fechado-por` preenchido, plano arquivado, índice regerado. Com pendências do dono: o plano fica `em-andamento` **só com os itens pendentes abertos** (todo o resto resolvido) ou, por decisão do dono, as pendências vão para plano novo (`[>]` com o destino).
  - Aceite: `status` coerente com a situação; `INDEX.md` conferido.

## Como o executor usa este plano

- **Retomar pelo plano, não pela memória:** ler este arquivo, achar a primeira tarefa `[ ]`/`[~]` da onda em curso, rodar o verificador do assunto para ver o estado real, só então editar.
- `controle.mjs <plano> proximas` lista o que pode rodar **em paralelo agora**: tarefas abertas com todo `depende-de` feito e sem caminho de `escreve` em comum, até 4 por vez. Em onda paralela, **lance um agente por tarefa**; em onda série, uma por vez.
- Tarefa sem `escreve` declarado não prova paralelismo: declare os arquivos ou módulos que ela grava.
- Acima de 4 agentes, só em worktrees próprios (um por agente), com merge em série; ao terminar, apague a branch e remova o worktree **e o diretório**.
- **Não inventar:** dado de um item vem do código ou do manifesto, não da memória; sem achar, anotar "não encontrado" na evidência e deixar `[ ]` com `Pendencia:`.
- **Parar e perguntar** (não decidir sozinho): decisão do dono, divergência que parece bug, mudança irreversível.
