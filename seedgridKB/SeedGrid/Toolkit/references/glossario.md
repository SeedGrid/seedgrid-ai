---
description: "Glossário dos termos do toolkit (coordenador, papel, skill, catálogo, modo shared/native)."
---
# Glossário

| Termo | Significado |
| --- | --- |
| Coordenador | Sessão principal da ferramenta de IA; seleciona papéis, delega e consolida a resposta. |
| Papel | Definição de agente em `.ai/agents/<id>.md` (objetivo, entradas, responsabilidades, limites, entrega). São 13: `arquiteto`, `ux-design`, `backend-java`, `backend-rust`, `frontend-react`, `frontend-flutter`, `dados-migracao`, `seguranca`, `a11y-i18n`, `qa`, `frontend-tester`, `revisor` e `documentador`. O coordenador não é um deles. |
| `ux-design` | Papel que especifica a tela antes do front, quando a tarefa cria ou muda uma tela. |
| `frontend-flutter` | Papel de telas em Flutter com `seedgrid_components`; o `frontend-react` cuida só do React. |
| `frontend-tester` | Papel que testa o front do produto em navegador real e emulador e só reporta, sem corrigir. |
| `dados-migracao` | Papel que cuida de migrations, convergência de schema e conversão de dados do produto. |
| `seguranca` | Papel que revisa autenticação, permissões, LGPD, dependências e segredos. |
| `a11y-i18n` | Papel que confere acessibilidade e a varredura dos cinco idiomas. |
| `documentador` | Papel que escreve o `docs/` do produto e mantém os documentos de `docs/ai/`; não escreve código. |
| Especificação de tela | Documento do `ux-design` (modelo `templates/especificacao-de-tela.md`): objetivo, estados, componentes SeedGrid, textos e i18n, acessibilidade. O dono aprova antes do front. |
| `docs/ai/designs/` | Pasta das especificações de tela, com o nome `P<plano>.F<fase>.T<tarefa>-AAAA-MM-DD-assunto.md`. |
| Catálogo | Tabela curta de papéis gerada em `.ai/agents/index.md` para seleção sem carregar todos os prompts. |
| Skill | Procedimento no padrão Agent Skills (`SKILL.md`), instalado em `.claude/skills/` e `.agents/skills/`. |
| Identificador de plano | `P<plano>.F<fase>.T<tarefa>` (tarefa), `.D<n>` (decisão do dono) ou `.DEM<n>` (demanda à plataforma ou à KB), por exemplo `P111.F2.T3`; `F0` = plano inteiro, `FIM` = fase final. Veja `references/identificadores-de-plano.md`. |
| Entrega | Resposta final de um papel: resultado, arquivos alterados, verificações, pendências e contexto. |
| Critério de aceite | Condição verificável que define quando a tarefa está pronta. |
| Personalização local | Conteúdo do projeto em `.ai/local/`, nunca alterado pelo toolkit. |
| Bloco gerenciado | Trecho entre `BEGIN/END SEEDGRID AI TOOLKIT` em `AGENTS.md` e `CLAUDE.md`; o resto do arquivo é do projeto. |
