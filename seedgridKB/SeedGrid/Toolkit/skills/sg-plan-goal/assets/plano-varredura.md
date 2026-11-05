<!--
Modelo de PLANO DE VARREDURA DE COMPONENTES SeedGrid (React e Flutter): use quando o plano precisa resolver ou verificar algo em
TODOS os componentes e sempre fica um ou outro de fora. Cole este bloco no plano (formato de plano-de-tarefas.md), troque os
<...> e apague este comentário. A tabela não é digitada: ela é GERADA por `varredura-componentes.mjs` a partir de uma fonte
única do repositório de código, e o mesmo script reprova o plano enquanto algum componente da fonte não tiver linha ou marca.
(O mesmo modelo serve para varrer extensions ou telas: troque a fonte da lista; as regras de marca e evidência são as mesmas.)
-->

## Varredura: <o que se resolve ou verifica em cada componente>

**O que a checagem de cada componente significa:** <uma frase objetiva: por exemplo "o showcase tem os mesmos exemplos do React" ou
"a prop X existe e está documentada">. Sem essa frase, "feito" fica vago.

**Fonte da lista (única e atual):** gerada de `<raiz do seedgrid-platform>`, não digitada. Escolha **uma**:

- `paridade` (padrão): `front/seedgrid-fe-flutter/docs/paridade.json`, todos os componentes públicos do pacote React e o estado de cada
  um no Flutter (gerado do código por `tools/parity_table`). Use quando a checagem é sobre o componente em si.
- `showcase`: as páginas de componente dos dois showcases (pastas `sg-*` do React e `sg_*_page.dart` do Flutter). Use quando a
  checagem é sobre as páginas de exemplo.

**Gerar a tabela e acrescentar os componentes novos** (rode de novo quando a fonte mudar; as linhas já marcadas não são tocadas):

```
node .ai/skills/sg-plan-goal/scripts/varredura-componentes.mjs gerar --plataforma <raiz do seedgrid-platform>
node .ai/skills/sg-plan-goal/scripts/varredura-componentes.mjs atualizar <plano> --plataforma <raiz do seedgrid-platform>
```

**Como marcar:** a tabela tem uma linha por componente. `React` e `Flutter` dizem se o componente existe em cada plataforma (`sim` ou
`nao`); a checagem é por plataforma em `Feito React` e `Feito Flutter`: `[ ]` aberto, `[~]` em andamento, `[x]` feito e conferido,
`n/a` quando o componente não existe naquela plataforma. `Quem conferiu` é a sessão ou a pessoa que rodou o verificador e
`Evidencia` é o comando ou o hash que mostra o resultado (curto). **Todo `[x]` exige as duas colunas preenchidas.**

**Verificador do assunto:** `<comando que mede a checagem em todos os componentes e sai 1 se divergir>`. **Critério de "feito":** o
componente só vira `[x]` na plataforma quando o verificador concorda para ele; marcar à mão sem rodar o verificador não vale.

<!-- varredura:comp:inicio -->
| Componente | React | Flutter | Feito React | Feito Flutter | Quem conferiu | Evidencia |
|---|---|---|---|---|---|---|
| <SgComponenteUm> | sim | sim | [ ] | [ ] |  |  |
| <SgComponenteDois> | sim | nao | [ ] | n/a |  |  |
<!-- varredura:comp:fim -->

**Conferência da varredura inteira** (entra no `/goal` do plano; os dois comandos precisam sair com 0 problema(s), com a saída
visível):

```
node .ai/skills/sg-plan-goal/scripts/varredura-componentes.mjs conferir <plano> --completa --plataforma <raiz do seedgrid-platform>
<comando do verificador do assunto>
```

A varredura só está pronta quando **todo componente da fonte** tem linha e todas as marcas estão `[x]` (ou `n/a`), cada uma com quem
conferiu e a evidência.
