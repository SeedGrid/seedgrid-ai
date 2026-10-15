---
description: "Diferença entre skill e agente e entre os modos shared e native, e onde cada um fica instalado."
---
# Modos shared e native

## Skill x agente

- **Skill:** procedimento reutilizável (`SKILL.md` + recursos) que a ferramenta consulta quando a tarefa combina com a descrição.
- **Agente (papel):** especialização com objetivo, entradas, responsabilidades, limites e formato de entrega. Um Markdown citado no `AGENTS.md` **não** é um subagente registrado com contexto isolado.

## shared (padrão)

- Papéis em `.ai/agents/`, catálogo em `.ai/agents/index.md`, regras em `.ai/rules/`.
- O coordenador lê o catálogo, escolhe papéis e delega usando o mecanismo disponível na ferramenta, passando a definição do papel.
- Sem subagentes disponíveis, os papéis são aplicados na sessão principal e isso é informado ao usuário.

## native (opcional)

- Os mesmos papéis são gerados como subagentes nativos, a partir da mesma fonte (sem autoria duplicada):
  - Claude Code: `.claude/agents/<id>.md`.
  - Codex: `.codex/agents/<id>.toml` (o Codex só carrega `.codex/` em projetos confiáveis).
- `capabilities` são intenções portáveis. O adaptador traduz apenas o que a ferramenta suporta; restrições em prompt não são mecanismos de segurança.
- Se a ferramenta não reconhecer os agentes, o modo shared continua valendo.

## Garantias

Seleção de papéis, delegação e passagem de contexto são comportamentos orientados por instruções. O instalador garante arquivos e formatos; não garante que o modelo escolha um papel específico.
