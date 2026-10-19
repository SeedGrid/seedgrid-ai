---
name: sg-componente
description: Escolhe o componente React SeedGrid certo para uma necessidade de tela (CPF, tabela, aviso, data, lista dupla…) e confere as props contra o tipo real antes de escrever o código. Use ao montar ou revisar tela com `@seedgrid/fe-components`; evita prop inventada e leitura de notas grandes.
metadata:
  toolkit: seedgrid-ai
---

# Escolher componente e validar props

Faz o papel do MCP de componentes com poucos tokens. Regra: **nunca invente prop**; confira antes de usar.

## Passos

1. **Escolher.** Leia `SeedGrid/SeedGrid-components/Preciso-de.md` (curta, um componente por linha, com sinônimos e "não serve? use outro"). Se ainda houver dúvida entre parecidos, `Grep` pelo nome em `SeedGrid/SeedGrid-components/Catalogo.md`.
2. **Ver as props.** `node .ai/skills/sg-componente/scripts/validate-props.mjs <Componente> --list` lista nome, tipo, obrigatória (`*`) e valores aceitos de enum. Para exemplo e detalhes (a11y, ref, RHF), `Grep "^## <Componente>"` no `API.md` do grupo (grupo no `Indice.md`) e leia só essa faixa com `offset`/`limit`. Nunca leia o `API.md` inteiro.
3. **Escrever** o código com o `Exemplos.md` do grupo como base (mesma seção por `Grep`).
4. **Validar antes de entregar:** `node .ai/skills/sg-componente/scripts/validate-props.mjs <Componente> --jsx '<Componente id="x" ... />'` (ou `--json '{...}'`, ou `--props a,b,c`). Corrija tudo que ele apontar: prop inexistente (com sugestão de parecidas), obrigatória ausente, valor fora do enum, tipo errado. Saída 0 = ok. `--find <texto>` procura componente pelo nome.

## Limites

- Os dados (`data/props.json`) vêm dos tipos TypeScript da versão documentada (ver `SeedGrid/Versoes.md`); se o projeto usa outra versão, confira no pacote instalado.
- O validador confere nomes, obrigatoriedade, enums e tipos simples; expressão (`{algo}`) só tem a presença conferida. Comportamento e regras de negócio continuam no `API.md`.
- Hooks e funções (`toast`, `useSgTime`…) não têm props de componente: use o `API.md` do grupo.
