---
description: "Glossário dos termos do toolkit (coordenador, papel, skill, catálogo, modo shared/native)."
---
# Glossário

| Termo | Significado |
| --- | --- |
| Coordenador | Sessão principal da ferramenta de IA; seleciona papéis, delega e consolida a resposta. |
| Papel | Definição de agente em `.ai/agents/<id>.md` (objetivo, entradas, responsabilidades, limites, entrega). |
| Catálogo | Tabela curta de papéis gerada em `.ai/agents/index.md` para seleção sem carregar todos os prompts. |
| Skill | Procedimento no padrão Agent Skills (`SKILL.md`), instalado em `.claude/skills/` e `.agents/skills/`. |
| Entrega | Resposta final de um papel: resultado, arquivos alterados, verificações, pendências e contexto. |
| Critério de aceite | Condição verificável que define quando a tarefa está pronta. |
| Personalização local | Conteúdo do projeto em `.ai/local/`, nunca alterado pelo toolkit. |
| Bloco gerenciado | Trecho entre `BEGIN/END SEEDGRID AI TOOLKIT` em `AGENTS.md` e `CLAUDE.md`; o resto do arquivo é do projeto. |
