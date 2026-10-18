---
description: "Modelo de ADR (registro de decisão): cabeçalho com quem decidiu, data, consultados e domínio, mais contexto, decisão, alternativas e consequências."
---
# <título da decisão>

> Modelo do SeedGrid AI Toolkit. Use a skill `sg-adr`: ela copia este modelo para `docs/ai/decisions/AAAA-MM-DD-slug.md` e atualiza o índice. ADR aceita **não se edita**: se a decisão mudar, crie outra e marque a antiga como `substituida`.

Cabeçalho (obrigatório, no topo do arquivo, entre `---`):

```yaml
---
description: Uma linha com a decisão.
titulo: Título curto da decisão
numero: 1                 # sequencial, dado na criação (--proximo); nunca muda
data: AAAA-MM-DD
status: proposta          # proposta | aceita | implementada | substituida | rejeitada
decidido-por: nome ou papel
consultados: [nomes, quando houver]
dominio: [seguranca]      # lista do projeto (docs/ai/decisions/dominios.txt)
modulos: [modulo-a, modulo-b]
substitui: []             # arquivos de ADR que esta substitui
substituida-por:          # preencha na ADR antiga quando houver outra
origem: plano, commit ou tarefa que gerou a decisão
---
```

Status: `proposta` (a IA propôs; o dono não confirmou); `aceita` (confirmada, ainda não está no código); `implementada` (confirmada e já no código; o que já foi implementado não fica `proposta`).

## Contexto
Problema, forças em jogo e restrições.

## Decisão
O que foi decidido, em termos objetivos (comportamento, propriedade, arquitetura).

## Alternativas consideradas
| Alternativa | Prós | Contras | Motivo da rejeição |
| --- | --- | --- | --- |
| | | | |

## Consequências
- Positivas:
- Negativas e riscos:
- Trabalho decorrente:

## Validação
Como saberemos que a decisão funcionou (métricas, testes, critérios).
