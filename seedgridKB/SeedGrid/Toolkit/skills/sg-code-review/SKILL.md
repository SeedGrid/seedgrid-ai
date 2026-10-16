---
name: sg-code-review
description: Revisa um diff ou conjunto de arquivos alterados procurando defeitos de lógica, segurança, tratamento de erros, compatibilidade e testes ausentes, com achados priorizados e cenário concreto de falha. Use após implementar uma mudança substancial ou quando pedirem revisão de código.
metadata:
  toolkit: seedgrid-ai
---

# Revisar código

Encontre problemas reais e verificáveis; evite comentários de estilo sem impacto.

## Passos

1. **Escopo.** Obtenha o diff (por exemplo, `git diff` ou `git diff <base>...HEAD`) e o objetivo da mudança. Sem diff disponível, peça a lista de arquivos alterados.
2. **Contexto.** Leia o código ao redor de cada trecho alterado e os pontos que o chamam.
3. **Análise.** Percorra o [checklist](references/code-review-checklist.md). Para cada suspeita, construa um cenário concreto: entrada/estado → comportamento errado.
4. **Filtro.** Descarte suspeitas que não sustentam um cenário concreto. Não reporte preferências pessoais como defeitos.
5. **Verificações somente leitura.** Se útil, rode testes ou lint existentes para confirmar um achado. Não altere arquivos.

## Saída

```markdown
## Achados
### [bloqueante|importante|sugestão] Título curto
- Local: caminho/arquivo:linha
- Cenário: entrada/estado → resultado incorreto
- Correção sugerida: uma ou duas frases

## Sem achados em
Áreas revisadas sem problemas relevantes.
```

Se não houver achados bloqueantes, diga isso explicitamente.
