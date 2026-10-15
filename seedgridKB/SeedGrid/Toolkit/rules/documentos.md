---
description: "Onde salvar os documentos que a IA gera (planos, handoff, decisões, relatórios, especificações): sempre em .ai/docs/<tipo>/. Leia antes de criar qualquer arquivo .md de trabalho."
---
# Documentos gerados pela IA

Todo documento de trabalho que a IA produzir (plano, handoff, decisão, especificação, relatório, análise, anotações de sessão) é salvo em **`.ai/docs/<tipo>/`**, nunca na raiz do projeto, em `docs/` do projeto ou dentro de `.ai/rules/`, `.ai/agents/`, `.ai/templates/` e `.ai/skills/`, que o toolkit gerencia e reescreve no `update`.

## Pastas por tipo

| Tipo | Pasta | Quando |
| --- | --- | --- |
| Plano | `.ai/docs/plans/` | Plano de uma mudança, aprovado ou não, antes de implementar |
| Handoff | `.ai/docs/handoff/` | Estado e próximos passos para outra sessão, papel ou pessoa continuar |
| Decisão | `.ai/docs/decisions/` | Decisão de arquitetura e o porquê (modelo: `decisao-arquitetura.md`) |
| Especificação | `.ai/docs/specs/` | Especificação de tarefa (modelo: `especificacao-tarefa.md`) |
| Validação | `.ai/docs/reports/` | Relatórios de validação, revisão e testes (modelo: `relatorio-validacao.md`) |
| Outros | `.ai/docs/<assunto>/` | Qualquer outro documento; crie a pasta com um nome curto no plural |

## Convenções

- Crie a pasta quando precisar. O toolkit não a cria nem a altera: o conteúdo é do projeto e sobrevive ao `update` e ao `remove`.
- Nome do arquivo: `AAAA-MM-DD-assunto-curto.md` (minúsculas, hífens, sem acentos), por exemplo `2026-10-15-crud-clientes.md`.
- Comece com um título e uma linha de contexto (tarefa, autor/papel, data). Não grave segredos, tokens nem dados pessoais.
- Antes de criar, veja se já existe documento do mesmo assunto na pasta e atualize-o em vez de duplicar.
- Ao citar um documento em outro, use caminho relativo.
- Versionar ou não é decisão do projeto: se o time não quiser versionar, ele ignora `.ai/docs/` no Git.
