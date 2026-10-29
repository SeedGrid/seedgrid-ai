---
tags: [seedgrid, toolkit, indice]
---

# Toolkit de IA (seedgrid-ai): mapa

Conteúdo distribuído pelo `seedgrid-ai` e instalado nos projetos (`.ai/`, `.claude/`, `.agents/`). Fica em `SeedGrid/Toolkit/` e **não contêm wikilinks de propósito**: os arquivos são copiados como estão, e links para o vault quebrariam nos projetos. Esta nota fica na raiz do vault, fora de `SeedGrid/`, porque a base `SeedGrid/` também é instalada nos projetos (sem o `Toolkit/`) e links daqui para lá quebrariam. Ela é o ponto de ligação com o resto da base.

Fluxo geral: [[SeedGrid/Toolkit/references/fluxo-de-trabalho|Fluxo de trabalho]] · [[SeedGrid/Toolkit/rules/coordenacao|Coordenação]] · [[SeedGrid/Toolkit/references/glossario|Glossário]] · [[SeedGrid/Toolkit/references/modos-shared-native|Modos shared/native]].

## Papéis (agents)

| Papel | Para que serve | Documentação relacionada |
|---|---|---|
| [[SeedGrid/Toolkit/agents/arquiteto\|arquiteto]] | Porta de entrada: classifica, tira dúvidas e planeja. | [[SeedGrid/Visao-geral\|Visão geral]] · [[SeedGrid/Mapa-dos-repositorios\|Mapa dos repositórios]] |
| [[SeedGrid/Toolkit/agents/backend-java\|backend-java]] | APIs, regras de negócio e persistência em Java. | [[SeedGrid/Extensions/Indice\|Extensions]] · [[SeedGrid/Extensions/Catalogo-de-propriedades\|Catálogo de propriedades]] · [[SeedGrid/Extensions/Catalogo-de-enums\|Catálogo de enums]] |
| [[SeedGrid/Toolkit/agents/backend-rust\|backend-rust]] | O mesmo em Rust, com os crates SeedGrid. | [[SeedGrid/Extensions/Indice\|Extensions]] (notas `Rust` de cada extension) |
| [[SeedGrid/Toolkit/agents/frontend-react\|frontend-react]] | Telas e componentes em React. | [[SeedGrid/SeedGrid-components/Indice\|Componentes]] · [[SeedGrid/SeedGrid-components/inputs-texto/API\|Inputs de texto (SgInputPhone, SgInputCPF…)]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral\|Fundamentos]] |
| [[SeedGrid/Toolkit/agents/qa\|qa]] | Testes a partir dos critérios de aceite. | |
| [[SeedGrid/Toolkit/agents/revisor\|revisor]] | Revisão de defeitos, segurança e convenções. | |

## Regras

[[SeedGrid/Toolkit/rules/frontend-seedgrid|Front-end SeedGrid]] · [[SeedGrid/Toolkit/rules/backend-seedgrid|Back-end SeedGrid (comum)]] · [[SeedGrid/Toolkit/rules/backend-java-seedgrid|Back-end Java SeedGrid]] · [[SeedGrid/Toolkit/rules/formato-entrega|Formato da entrega]] · [[SeedGrid/Toolkit/rules/documentos|Documentos gerados]] · [[SeedGrid/Toolkit/rules/personalizacao-local|Personalização local]]

## Skills

| Skill | Uso |
|---|---|
| [[SeedGrid/Toolkit/skills/sg-plan-change/SKILL\|sg-plan-change]] | Planejar uma mudança antes de implementar. |
| [[SeedGrid/Toolkit/skills/sg-validate-change/SKILL\|sg-validate-change]] | Validar com build, testes e evidências. |
| [[SeedGrid/Toolkit/skills/sg-review/SKILL\|sg-review]] | Conferir se o código segue os padrões SeedGrid. |
| [[SeedGrid/Toolkit/skills/sg-code-review/SKILL\|sg-code-review]] | Revisar um diff. Apoio: [[SeedGrid/Toolkit/skills/sg-code-review/references/code-review-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-crud-back/SKILL\|sg-crud-back]] | CRUD de back-end Java com as extensions. |
| [[SeedGrid/Toolkit/skills/sg-crud-front/SKILL\|sg-crud-front]] | CRUD de front-end (Next.js, boilerplate SeedGrid). Apoio: [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-patterns\|patterns]] · [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-routing\|routing]] · [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-dev-env/SKILL\|sg-dev-env]] | Gera o `dev.env` de qualquer projeto a partir do `dev.env.example`/`.env.example`: segredos novos do tipo certo (senha, chave de criptografia, par RSA do JWT), credencial de fornecedor externo em branco como pendência, nunca imprime segredo. |
| [[SeedGrid/Toolkit/skills/sg-crud-front-flutter/SKILL\|sg-crud-front-flutter]] | CRUD de front-end em Flutter (`seedgrid_components`): lista com `SgInputTextSearch` + `SgDatatable`, formulário com `SgForm`, exclusão com confirmação. |
| [[SeedGrid/Toolkit/skills/sg-new-screen/SKILL\|sg-new-screen]] | Registrar tela, menu ou permissão. Apoio: [[SeedGrid/Toolkit/skills/sg-new-screen/references/new-screen-steps\|steps]] · [[SeedGrid/Toolkit/skills/sg-new-screen/references/new-screen-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-new-skill/SKILL\|sg-new-skill]] | Criar ou alterar skills do projeto. |
| [[SeedGrid/Toolkit/skills/sg-bump/SKILL\|sg-bump]] | Subir a versão do projeto inteiro. |

## Modelos

[[SeedGrid/Toolkit/templates/especificacao-tarefa|Especificação de tarefa]] · [[SeedGrid/Toolkit/templates/decisao-arquitetura|Decisão de arquitetura (ADR)]] · [[SeedGrid/Toolkit/templates/relatorio-validacao|Relatório de validação]]
