---
description: "Qual endereço do MCP de componentes registrar no .mcp.json: projeto só React, só Flutter ou misto (React e Flutter no mesmo projeto), com o custo fixo de tokens de cada opção."
---
# MCP de componentes: React, Flutter ou os dois

O `seedgrid-components-mcp` serve o catálogo de componentes (busca, props, exemplos, validação) para agentes. A **KB** (`sg-componente`, `Preciso-de.md`, `API.md`) cobre o mesmo papel sem servidor; o MCP custa menos tokens por consulta e a busca semântica é melhor, mas as definições das tools pesam em **toda** sessão em que ele está registrado. Escolha o endereço pelo que o projeto usa.

| Projeto | Registre | Custo fixo das definições das tools (aprox.) |
|---|---|---|
| Só React | `/mcp/react` | ~2.200 tokens |
| Só Flutter | `/mcp/flutter` | ~1.900 tokens |
| Misto (front React e app Flutter) | `/mcp/all` (um registro só) | ~2.200 tokens (cada tool ganha o parâmetro `platform`) |
| Misto, dois registros | `/mcp/react` e `/mcp/flutter` | ~4.100 tokens (a soma) |

Medido em 2026-10-29 (definições das tools, chars/3,6, plano 107; os números de consulta estão no relatório 105 do repositório de trabalho). Tamanho do catálogo e das tools muda: recalcule se a decisão depender da diferença.

## Como registrar

Projeto de uma plataforma (`.mcp.json` na raiz do projeto):

```json
{ "mcpServers": { "seedgrid-components": { "type": "http", "url": "https://<host-do-mcp>/mcp/react" } } }
```

(troque por `/mcp/flutter` no app Flutter).

Projeto misto:

```json
{ "mcpServers": { "seedgrid-components": { "type": "http", "url": "https://<host-do-mcp>/mcp/all" } } }
```

## Regras do `/mcp/all`

- **`platform` é obrigatório em toda tool** (`react` ou `flutter`) e **não tem padrão**. Se faltar ou for inválido, a tool responde erro (`isError`) e **nunca** a resposta da plataforma errada. Passe sempre `platform` conforme o arquivo em que está trabalhando (front React = `react`; app Flutter = `flutter`).
- `get_renderer_mapping` só existe para `react` e dá erro com `flutter`.
- Os endereços fixos `/mcp/react` e `/mcp/flutter` não têm o parâmetro `platform` e respondem só a sua plataforma.
- `/mcp` pelado responde 404 no servidor misto: não use.
- O modo misto é ligado no servidor (`PLATFORM=all`, nunca o padrão); um servidor de uma plataforma só (`PLATFORM=react` ou `flutter`) não tem o manifesto da outra.

## Quando preferir a KB ao MCP

Sem acesso de rede ao servidor, ou para uma tarefa curta em que as definições das tools custariam mais que a consulta: use `.ai/skills/sg-componente/` e `Preciso-de.md`.
