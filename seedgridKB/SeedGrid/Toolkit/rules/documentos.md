---
description: "Onde salvar os documentos que a IA gera (planos, handoff, decisões/ADR, relatórios, especificações): sempre em docs/ai/<tipo>/ do projeto. Leia antes de criar qualquer arquivo .md de trabalho."
---
# Documentos gerados pela IA

Todo documento de trabalho que a IA produzir (plano, handoff, decisão, especificação, relatório, análise, anotações de sessão) é salvo em **`docs/ai/<tipo>/`** do projeto: uma pasta fixa, visível e **versionada**. Nunca na raiz do projeto, em outra pasta de `docs/` nem dentro de `.ai/`, que o toolkit gerencia e reescreve no `update`.

**Exceção — modo de trabalho avisado no `AGENTS.md`:** se o bloco do `AGENTS.md` trouxer um aviso de modo (por exemplo `MODO PLATAFORMA`, do `seedgrid-ai-plt`) que define outro lugar para planos, handoffs, relatórios e ADR, siga o aviso; o que está abaixo vale para projeto host.

**Não crie arquivo `.md` fora de `docs/ai/`**, exceto o que o pedido nomeou (por exemplo um README) e os documentos permanentes do próprio projeto. Rascunho e saída de comando não são documentos: não os grave no projeto.

## Pastas por tipo

| Tipo | Pasta | Quando |
| --- | --- | --- |
| Plano | `docs/ai/plans/` | Plano de uma mudança, antes de implementar e enquanto estiver em execução |
| Handoff | `docs/ai/handoffs/` | Estado e próximos passos para outra sessão, papel ou pessoa continuar (a pasta no singular, `handoff/`, também é lida) |
| Demanda | `docs/ai/demands/` | Pedido do produto à plataforma quando a KB não responde (HO-08); termina quando respondida |
| Decisão (ADR) | `docs/ai/decisions/` | Decisão que muda comportamento, propriedade, contrato ou arquitetura, e o porquê (skill `sg-adr`, modelo `decisao-arquitetura.md`) |
| Especificação | `docs/ai/specs/` | Especificação de tarefa (modelo: `especificacao-tarefa.md`) |
| Validação | `docs/ai/reports/` | Relatórios de validação, revisão e testes (modelo: `relatorio-validacao.md`) |
| Outros | `docs/ai/<assunto>/` | Qualquer outro documento; crie a pasta com um nome curto no plural |

## Convenções

- Crie a pasta quando precisar. O toolkit não a cria nem a altera: o conteúdo é do projeto e sobrevive ao `update` e ao `remove`.
- Nome do arquivo de **plano**: `P<n>-AAAA-MM-DD-assunto-curto.md` (minúsculas, hífens, sem acentos), por exemplo `P3-2026-10-15-crud-clientes.md`. `<n>` é o número do plano e vai também em `numero: <n>` no cabeçalho: o **próximo número livre** da pasta `docs/ai/plans/` (maior número existente mais um; o primeiro plano é `P1`), sem zeros à esquerda. É o mesmo `<n>` dos identificadores `P<n>.F<f>.T<t>`, então o nome do arquivo e o id da tarefa batem. Handoff: `H<n>-...`. Os demais documentos (decisões, demandas) mantêm `AAAA-MM-DD-assunto.md`.
- Nome do arquivo de **demanda**: `P<plano>.F<fase>.DEM<n>-AAAA-MM-DD-assunto.md` em `docs/ai/demands/`, com `plano:` e `fase:` no cabeçalho (`F0` = demanda do plano todo). Todo arquivo que a IA grava a partir de um plano leva `P<plano>.F<fase>` no início do nome.
- Plano e handoff começam com um cabeçalho de estado (`status`: `proposto`, `em-andamento`, `vigente`, `concluido` ou `abandonado`, e `data`).
- **Todo documento gerado (plano, handoff, ADR, especificação, relatório) leva no cabeçalho `aidlc: <versão>`**, a versão do AIDLC com que foi escrito: copie o `contentVersion` de `.ai/toolkit-lock.json` (exemplo: `aidlc: 0.6.1`). Quem gera o documento não adivinha nem inventa: lê o lock. Serve para saber, depois, se um documento fora do padrão foi escrito por um toolkit antigo ou não obedeceu a regra. O `update` não reescreve documentos do projeto, então o campo registra a versão **da criação**; ao revisar um plano com um toolkit mais novo, atualize o campo junto com o conteúdo. Documento sem o campo é de antes desta regra. Ao concluir, marque `concluido`: **plano concluído é histórico e não serve de fonte para decidir nada**; a fonte é o código, a documentação do projeto e as ADRs.
- Itens de plano novo usam o **identificador falante** `P<plano>.F<fase>.T<tarefa>` (decisão do dono: `.D<n>`); formato e como pesquisar em `.ai/references/identificadores-de-plano.md`. Ao falar com o dono, cite plano, fase, tarefa e título.
- As **decisões** que nasceram do plano viram ADR (`docs/ai/decisions/`), com índice gerado (`INDEX.md`, da mais nova para a mais antiga). Nome do arquivo de **ADR**: `ADR<n>-AAAA-MM-DD-slug.md`, com `<n>` igual ao `numero:` do cabeçalho (o mesmo número com que se fala da ADR); ADRs antigas sem o prefixo migram com `adr-index.mjs --renomear`.
- **Índice geral:** `docs/ai/INDEX.md` lista todos os documentos, com as demandas abertas no topo, e é **gerado** pela skill `sg-docs-index`. Sempre que criar, renomear, apagar ou mudar o `status:` de um documento em `docs/ai/`, rode o script da skill; nunca edite o `INDEX.md` à mão. O `--check` roda ao fechar uma mudança (`sg-validate-change`).
- Não grave segredos, tokens nem dados pessoais.
- Antes de criar, veja se já existe documento do mesmo assunto na pasta e atualize-o em vez de duplicar.
- Ao citar um documento em outro, use caminho relativo.
- Versionar `docs/ai/decisions/` é obrigatório (é a memória das decisões); o restante, o projeto decide.
