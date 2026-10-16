---
tags: [seedgrid, visao-geral, indice]
fonte: seedgrid-platform
analisado-em: 2026-10-14
---

# SeedGrid — visão geral

Base de documentação técnica do ecossistema SeedGrid, gerada a partir do código em `seedgrid-platform` em **2026-10-14**. Commits analisados por repositório: [[SeedGrid/Mapa-dos-repositorios|Mapa dos repositórios]].

## O ecossistema em uma frase por frente

| Frente | Onde | O que é |
|---|---|---|
| Extensions e libraries Java | `java/seedgrid-quarkus-*` | Blocos reutilizáveis para apps Quarkus 3.30: segurança (JWT/RBAC/2FA), API keys, multitenancy (login e subdomínio), billing, auditoria, backup/export, notificações, realtime, resiliência, WhatsApp, cache, privacidade, storage, câmbio e preços de IA. |
| Crates Rust | `rust/` | Portes 1:1 das extensions para servidores Axum (Java é a fonte da verdade), mais `broker` (mensageria) e `runtime`/`macros` (auto-wiring estilo CDI). |
| Front-end | `front/seedgrid-fe-components` | Biblioteca React `@seedgrid/fe-components` (componentes `Sg*`), tema, core de módulos, playground e módulos de tela `@seedgrid/fe-*` que consomem as APIs das extensions. |

## Produtos

| Produto | O que é | Documentação |
|---|---|---|
| **SeedGrid Pulse** | Hub realtime (REST + WebSocket, replay, retry, DLQ, presença) com SDKs publisher/subscriber em várias linguagens. Pode ser usado por qualquer sistema SeedGrid. | [[SeedGrid/Produtos/Pulse/Visao-geral\|Pulse]] · [[SeedGrid/Produtos/Pulse/Servidor/Instalacao\|servidor]] · [[SeedGrid/Produtos/Pulse/UI/Visao-geral\|UI]] · [[SeedGrid/Produtos/Pulse/SDKs\|SDKs]] |

## Por onde começar

- **Esqueci o nome de uma propriedade** → [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]] (busque com `Ctrl+F` ou pela busca do Obsidian).
- **Quais valores um enum aceita / o que cada valor faz** → [[SeedGrid/Extensions/Catalogo-de-enums|Catálogo de enums]].
- **Quero usar o Pulse (realtime, notificações, WebSocket)** → [[SeedGrid/Produtos/Pulse/Visao-geral|Pulse]].
- **Quero entender uma extension** → [[SeedGrid/Extensions/Indice|Índice das extensions]].
- **Quero usar um componente React** → [[SeedGrid/SeedGrid-components/Indice|Índice dos componentes]].
- **Quero saber o que depende do quê** → [[SeedGrid/Mapa-dos-repositorios|Mapa dos repositórios]].
- **Qual versão do artefato esta documentação descreve** (e se o seu projeto usa outra) → [[SeedGrid/Versoes|Versões documentadas × atuais]].

## Convenções desta base

- Cada nota tem frontmatter com `fonte`, `branch`, `commit` e `analisado-em`.
- Grau de certeza: **Confirmado** (lido no código ou teste), **Inferência** (deduzido, com justificativa), **Não confirmado**.
- 🔒 marca propriedades sensíveis; os valores aparecem sempre como placeholders.
- Caminhos de fonte são relativos a `seedgrid-platform/`.
- Só entra aqui o que funciona: propriedade, prop ou variável declarada e nunca lida não é documentada.
- Regras de manutenção: `AGENTS.md` na raiz do vault.
