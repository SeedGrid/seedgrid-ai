---
name: sg-review
description: Verifica se o código-fonte de um projeto segue os padrões SeedGrid (front React com @seedgrid/fe-components e back Java), citando cada violação por id de regra, arquivo e linha. Use quando pedirem para revisar, auditar ou conferir o padrão SeedGrid, depois de implementar uma tela ou serviço, ou antes de abrir um PR. Aceita o escopo "front", "back" ou nenhum (os dois).
metadata:
  toolkit: seedgrid-ai
---

# Revisar o padrão SeedGrid

Confere o código contra as regras do toolkit e devolve uma lista objetiva de violações. **Somente leitura**: não edite arquivos, a menos que o usuário peça as correções depois.

## Escopo

- `front`: revisa só o front-end (regras `FE-nn`, arquivo `.ai/rules/frontend-seedgrid.md`).
- `back`: revisa só o back-end Java (regras `BE-nn`, arquivos `.ai/rules/backend-seedgrid.md` e `.ai/rules/backend-java-seedgrid.md`).
- Sem argumento: revisa os dois. Se o projeto só tiver um lado (sem `pom.xml`/`*.java` ou sem `package.json`/`*.tsx`), diga isso e revise apenas o que existe.

Alvo: por padrão, os arquivos alterados (`git diff --name-only <base>...HEAD` mais os não commitados). Se o usuário pedir "o projeto inteiro" ou não houver diff, varra `src/` (back) e `app/`, `components/` (front).

## Passos

1. Leia **apenas** a rule do escopo (`.ai/rules/frontend-seedgrid.md` e/ou `.ai/rules/backend-seedgrid.md` com `.ai/rules/backend-java-seedgrid.md`). Para dúvida sobre um componente ou extension, abra pelo índice da KB (`.ai/brain/SeedGrid/SeedGrid-components/Indice.md`, `.ai/brain/SeedGrid/Extensions/Indice.md`) e só a nota do grupo; nunca varra `.ai/brain/` inteira.
2. Faça primeiro as buscas mecânicas, sem abrir arquivo por arquivo. Exemplos:
   - Front: `<input`, `<button`, `<select`, `<textarea`, `<table` em `*.tsx`; `window.confirm`, `alert(`; `SgInputText` em campo cujo nome/label indique telefone, whatsapp, cpf, cnpj, e-mail, cep, senha, valor, data (FE-10 a FE-19).
   - Back: `@Inject` em atributo; `throw new RuntimeException`; `Resource` no nome de classe; `UPDATE ` em JPQL/SQL de código; endpoint que devolve `id` em vez de `publicId`; `"%" +` em `LIKE`; pacote no singular.
3. Abra só os arquivos com suspeita e confirme no contexto. Descarte falsos positivos (por exemplo, `<input>` dentro do próprio pacote de componentes, ou comentário que justifica a exceção da FE-01).
4. Para regras que exigem julgamento (FE-02, BE-05, BE-11, BE-40), reporte só o que você consegue sustentar com o trecho de código. Diga o que **não** conseguiu verificar.

## Saída

```markdown
## Padrão SeedGrid: <front|back|front e back>
Escopo revisado: <arquivos ou pastas>

### Violações
| Regra | Local | Problema | Correção |
| --- | --- | --- | --- |
| FE-10 | app/clientes/cliente_edit/page.tsx:84 | telefone com SgInputText | trocar por SgInputPhone |

### Não verificado
- itens que dependem de execução ou de contexto que você não tinha

### Resumo
N violações (X bloqueantes). Conformes: <regras checadas sem achados>.
```

Classifique como **bloqueante** o que afeta segurança ou contrato (BE-10, BE-25, BE-30, FE-32) e como **ajuste** o resto. Sem violações, diga isso e liste o que foi checado, sem inventar achados.

## Bloco final para automação

O `seedgrid-ai review` lê o resultado desta skill. Por isso, **termine sempre a resposta** com exatamente um bloco assim (JSON válido, sem comentários), depois do relatório:

````markdown
```seedgrid-review-json
{"scope": "front", "violations": 1, "blocking": 0, "notVerified": 0}
```
````

- `scope`: `front`, `back` ou `both`.
- `violations`: total de violações do relatório; `blocking`: quantas são bloqueantes.
- `notVerified`: quantos itens ficaram em "Não verificado".
