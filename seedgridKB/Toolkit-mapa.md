---
tags: [seedgrid, toolkit, indice]
---

# Toolkit de IA (seedgrid-ai): mapa

Conteúdo distribuído pelo `seedgrid-ai` e instalado nos projetos (`.ai/`, `.claude/`, `.agents/`). Fica em `SeedGrid/Toolkit/` e **não contêm wikilinks de propósito**: os arquivos são copiados como estão, e links para o vault quebrariam nos projetos. Esta nota fica na raiz do vault, fora de `SeedGrid/`, porque a base `SeedGrid/` também é instalada nos projetos (sem o `Toolkit/`) e links daqui para lá quebrariam. Ela é o ponto de ligação com o resto da base.

Fluxo geral: [[SeedGrid/Toolkit/references/fluxo-de-trabalho|Fluxo de trabalho]] · [[SeedGrid/Toolkit/rules/coordenacao|Coordenação]] · [[SeedGrid/Toolkit/references/glossario|Glossário]] · [[SeedGrid/Toolkit/references/modos-shared-native|Modos shared/native]].

## Papéis (agents)

São 13 papéis, um arquivo para cada em `SeedGrid/Toolkit/agents/`. O coordenador não é um papel: é a sessão principal com quem o dono fala.

| Papel | Para que serve | Documentação relacionada |
|---|---|---|
| [[SeedGrid/Toolkit/agents/arquiteto\|arquiteto]] | Porta de entrada: classifica, tira dúvidas e planeja. | [[SeedGrid/Visao-geral\|Visão geral]] · [[SeedGrid/Mapa-dos-repositorios\|Mapa dos repositórios]] |
| [[SeedGrid/Toolkit/agents/backend-java\|backend-java]] | APIs, regras de negócio e persistência em Java. | [[SeedGrid/Extensions/Indice\|Extensions]] · [[SeedGrid/Extensions/Catalogo-de-propriedades\|Catálogo de propriedades]] · [[SeedGrid/Extensions/Catalogo-de-enums\|Catálogo de enums]] |
| [[SeedGrid/Toolkit/agents/backend-rust\|backend-rust]] | O mesmo em Rust, com os crates SeedGrid. | [[SeedGrid/Extensions/Indice\|Extensions]] (notas `Rust` de cada extension) |
| [[SeedGrid/Toolkit/agents/frontend-react\|frontend-react]] | Telas e componentes em React. | [[SeedGrid/SeedGrid-components/Indice\|Componentes]] · [[SeedGrid/SeedGrid-components/inputs-texto/API\|Inputs de texto (SgInputPhone, SgInputCPF…)]] · [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral\|Fundamentos]] |
| [[SeedGrid/Toolkit/agents/frontend-flutter\|frontend-flutter]] | Telas e componentes em Flutter (`seedgrid_components`), com paridade com o React. | [[SeedGrid/SeedGrid-components/Indice\|Componentes]] |
| [[SeedGrid/Toolkit/agents/ux-design\|ux-design]] | Especificação da tela antes do front (`docs/ai/designs/`), quando há tela nova ou mudança de tela. | [[SeedGrid/Toolkit/templates/especificacao-de-tela\|Especificação de tela]] |
| [[SeedGrid/Toolkit/agents/dados-migracao\|dados-migracao]] | Migrations, convergência de schema e conversão de dados do produto. |  |
| [[SeedGrid/Toolkit/agents/seguranca\|seguranca]] | Autenticação, permissões, LGPD, dependências e segredos. |  |
| [[SeedGrid/Toolkit/agents/a11y-i18n\|a11y-i18n]] | Acessibilidade e varredura dos cinco idiomas. |  |
| [[SeedGrid/Toolkit/agents/frontend-tester\|frontend-tester]] | Teste do front do produto em navegador real e emulador; só reporta. |  |
| [[SeedGrid/Toolkit/agents/documentador\|documentador]] | Escreve o `docs/` do produto e mantém `docs/ai/`; não escreve código. |  |
| [[SeedGrid/Toolkit/agents/qa\|qa]] | Testes a partir dos critérios de aceite. | |
| [[SeedGrid/Toolkit/agents/revisor\|revisor]] | Revisão de defeitos, segurança e convenções. | |

## Regras

[[SeedGrid/Toolkit/rules/frontend-seedgrid|Front-end SeedGrid]] · [[SeedGrid/Toolkit/rules/backend-seedgrid|Back-end SeedGrid (comum)]] · [[SeedGrid/Toolkit/rules/backend-java-seedgrid|Back-end Java SeedGrid]] · [[SeedGrid/Toolkit/rules/formato-entrega|Formato da entrega]] · [[SeedGrid/Toolkit/rules/documentos|Documentos gerados]] · [[SeedGrid/Toolkit/rules/personalizacao-local|Personalização local]]

## Skills

São 20 skills, uma pasta para cada em `SeedGrid/Toolkit/skills/` (não existe `skills/index.md`; esta tabela é a lista).

| Skill | Uso |
|---|---|
| [[SeedGrid/Toolkit/skills/sg-new-product/SKILL\|sg-new-product]] | Cria um produto SeedGrid novo (entrevista fixa e script gerador); é a primeira ação, antes do `arquiteto`. |
| [[SeedGrid/Toolkit/skills/sg-plan-goal/SKILL\|sg-plan-goal]] | Leva uma tarefa não trivial a um plano de tarefas no formato fixo do toolkit. |
| [[SeedGrid/Toolkit/skills/sg-diagnostico/SKILL\|sg-diagnostico]] | Diagnostica um plano ou briefing livre contra o formato da `sg-plan-goal`. |
| [[SeedGrid/Toolkit/skills/sg-componente/SKILL\|sg-componente]] | Escolhe o componente React certo e confere as props contra o tipo real. |
| [[SeedGrid/Toolkit/skills/sg-adr/SKILL\|sg-adr]] | Registra uma decisão de arquitetura ou de comportamento como ADR. |
| [[SeedGrid/Toolkit/skills/sg-docs-index/SKILL\|sg-docs-index]] | Gera e confere o índice geral de `docs/ai/`. |
| [[SeedGrid/Toolkit/skills/sg-branch-status/SKILL\|sg-branch-status]] | Lista e limpa branches e worktrees já mergeados ou sem dono. |
| [[SeedGrid/Toolkit/skills/sg-plan-change/SKILL\|sg-plan-change]] | Planejar uma mudança antes de implementar. |
| [[SeedGrid/Toolkit/skills/sg-validate-change/SKILL\|sg-validate-change]] | Validar com build, testes e evidências. |
| [[SeedGrid/Toolkit/skills/sg-review/SKILL\|sg-review]] | Conferir se o código segue os padrões SeedGrid. |
| [[SeedGrid/Toolkit/skills/sg-code-review/SKILL\|sg-code-review]] | Revisar um diff. Apoio: [[SeedGrid/Toolkit/skills/sg-code-review/references/code-review-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-crud-back/SKILL\|sg-crud-back]] | CRUD de back-end Java com as extensions. |
| [[SeedGrid/Toolkit/skills/sg-crud-front/SKILL\|sg-crud-front]] | CRUD de front-end (Next.js, boilerplate SeedGrid). Apoio: [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-patterns\|patterns]] · [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-routing\|routing]] · [[SeedGrid/Toolkit/skills/sg-crud-front/references/crud-front-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-dev-env/SKILL\|sg-dev-env]] | Gera o `dev.env` de qualquer projeto a partir do `dev.env.example`/`.env.example`: segredos novos do tipo certo (senha, chave de criptografia, par RSA do JWT), credencial de fornecedor externo em branco como pendência, nunca imprime segredo. |
| [[SeedGrid/Toolkit/skills/sg-check-secrets/SKILL\|sg-check-secrets]] | Trava de credenciais: confere nome e conteúdo do que vai para o git (`--staged`, arquivos versionados, `--history`). O hook de pre-commit é criado pelo `init` numa pasta nova; a `sg-release` e o CI do produto também a rodam. |
| [[SeedGrid/Toolkit/skills/sg-release/SKILL\|sg-release]] | Prepara a release do produto: sobe a versão `YYYY.M.N` em todos os serviços numa branch `release/`, fecha o `CHANGELOG`, commit e tag locais, e PARA antes do merge na `main`, do push e do deploy (só o dono autoriza, HO-07). `--dry-run` primeiro. |
| [[SeedGrid/Toolkit/skills/sg-crud-front-flutter/SKILL\|sg-crud-front-flutter]] | CRUD de front-end em Flutter (`seedgrid_components`): lista com `SgInputTextSearch` + `SgDatatable`, formulário com `SgForm`, exclusão com confirmação. |
| [[SeedGrid/Toolkit/skills/sg-new-screen/SKILL\|sg-new-screen]] | Registrar tela, menu ou permissão. Apoio: [[SeedGrid/Toolkit/skills/sg-new-screen/references/new-screen-steps\|steps]] · [[SeedGrid/Toolkit/skills/sg-new-screen/references/new-screen-checklist\|checklist]]. |
| [[SeedGrid/Toolkit/skills/sg-new-skill/SKILL\|sg-new-skill]] | Criar ou alterar skills do projeto. |
| [[SeedGrid/Toolkit/skills/sg-bump/SKILL\|sg-bump]] | Subir a versão do projeto inteiro. |

## Modelos

[[SeedGrid/Toolkit/templates/especificacao-tarefa|Especificação de tarefa]] · [[SeedGrid/Toolkit/templates/especificacao-de-tela|Especificação de tela]] · [[SeedGrid/Toolkit/templates/demanda|Demanda]] · [[SeedGrid/Toolkit/templates/decisao-arquitetura|Decisão de arquitetura (ADR)]] · [[SeedGrid/Toolkit/templates/relatorio-validacao|Relatório de validação]]
