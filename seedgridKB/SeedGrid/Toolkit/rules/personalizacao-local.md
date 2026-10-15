---
description: "Como personalizar o toolkit sem gerar conflito: usar .ai/local/, que nunca é alterado pelo seedgrid-ai. Leia antes de editar qualquer arquivo de .ai/."
---
# Personalização local

O conteúdo em `.ai/agents/`, `.ai/rules/`, `.ai/templates/` e `.ai/references/` é gerenciado pelo `seedgrid-ai` e pode ser substituído em atualizações. Não edite esses arquivos: alterações locais geram conflito no próximo `update`.

Personalize em `.ai/local/`, que o toolkit nunca cria, altera ou remove:

| Arquivo sugerido | Uso |
| --- | --- |
| `.ai/local/projeto.md` | Stack, comandos de build/teste, convenções e arquitetura do projeto |
| `.ai/local/fluxos.md` | Fluxos obrigatórios (ex.: revisão antes de merge) |
| `.ai/local/papeis/<id>.md` | Complementos a um papel do catálogo (mesmo id) |

Precedência ao ler instruções:

1. Pedido explícito do usuário na sessão.
2. `.ai/local/` (específico do projeto).
3. Regras compartilhadas em `.ai/rules/` e papéis em `.ai/agents/`.

Se `.ai/local/` não existir, siga apenas as regras compartilhadas. Ao ler um papel, verifique se existe `.ai/local/papeis/<id>.md` e aplique o complemento.
