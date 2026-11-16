---
tags: [seedgrid, library, commons, filtros, paginacao, patch]
fonte: seedgrid-commons 2026.11.2 (jar do Maven; assinaturas lidas com javap, sem ler corpo de método)
analisado-em: 2026-11-16
---

# SeedGrid Commons — Filtros, paginação e PATCH

Voltar: [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]] · [[SeedGrid/Extensions/commons/Exemplos|Exemplos do commons]]

Camada `web` do `seedgrid-commons` usada nas listagens paginadas e no PATCH parcial de um recurso. Esta página traz as **assinaturas públicas** (conferidas no jar `2026.11.2`) e como as classes se combinam. O que depende do comportamento em execução está marcado como **observado** e diz onde foi visto.

## Filtro de página: `PageFilter`

Pacote `br.com.seedgrid.commons.web.filters`.

```java
public abstract class PageFilter {
  public static final int MAX_PAGE_SIZE = 100;
  public int page;            // campos públicos (parâmetros da query)
  public int size;
  public String sortField;
  public String sortOrder;
  protected abstract String defaultSortField();                  // nome na API
  protected abstract Map<String, String> sortableFields();       // nome na API -> campo da entidade
  public io.quarkus.panache.common.Sort toSort();
  public PageReq toPageReq();
}
```

- Cada recurso estende `PageFilter` e implementa `defaultSortField()` e `sortableFields()`.
- `sortableFields()` é a lista permitida de ordenação: mapeia o nome que a API expõe para o campo da entidade.
- **Observado** (piloto "cadastro de clientes", `ClienteControllerE2ETest`): `size` acima de `MAX_PAGE_SIZE` (100) é **limitado a 100**, a resposta é 200 e não erro; um `sortField` fora do mapa cai na ordenação padrão; a ordem padrão é ascendente.

## Condições de consulta: `QueryFilter` e `QueryConditions`

```java
public class QueryFilter {
  public QueryFilter();
  public String where();                       // trecho JPQL/HQL montado
  public Map<String, Object> params();         // parâmetros nomeados
}

public final class QueryConditions {           // métodos estáticos
  static void applyEqual(QueryFilter f, String field, String value);
  static <T> void applyEqual(QueryFilter f, String field, T value);
  static <T extends Comparable<? super T>> void applyRange(QueryFilter f, String field, T from, T to);
  static void applyText(QueryFilter f, String field, String value);
}
```

- Cria-se um `QueryFilter` vazio e aplicam-se condições com `QueryConditions.applyEqual`, `applyRange` e `applyText`; depois usa-se `where()` e `params()` na consulta Panache.
- As condições são combinadas com **AND**; a classe não tem `OR`. Uma busca única com alternativas (por exemplo nome **ou** hash de documento) precisa de um `OR` montado no repositório do próprio projeto, em cima de `where()` e `params()` (**observado** no piloto).

## Paginação: `PageReq` e `PageResult`

Pacote `br.com.seedgrid.commons.core.pagination`.

```java
public final record PageReq(int page, int size);

public class PageResult<T> {
  public List<T> items;
  public long total;
  public int page;
  public int size;
  public PageResult(List<T> items, long total, PageReq req);
}
```

`PageFilter.toPageReq()` produz o `PageReq`; o repositório devolve um `PageResult` com os itens da página e o `total`.

## PATCH parcial: `PatchApplier`

Pacote `br.com.seedgrid.commons.web.patch`.

```java
public final class PatchApplier {
  static void apply(Object dto, Object entity);
  static void apply(Object dto, Object entity, Map<String, String> renames);
  static PatchApplier of(Object dto, Object entity);
  PatchApplier rename(String dtoField, String entityField);
  PatchApplier rename(Map<String, String> renames);
  PatchApplier convert(String dtoField, Function<Object, Object> fn);
  PatchApplier handle(String dtoField, BiConsumer<Object, Object> fn);
  void apply();
}
```

- Forma curta: `PatchApplier.apply(dto, entidade)` copia para a entidade os campos do DTO presentes; a sobrecarga com `renames` cobre nomes diferentes entre DTO e entidade.
- Forma encadeada: `PatchApplier.of(dto, entidade).rename(...).convert(...).handle(...).apply()` para nomes diferentes, conversão de valor e tratamento próprio de um campo.
- Campos opcionais de PATCH costumam usar `JsonNullable<T>` no DTO. **Observado** (piloto): `@ValidEmail` e `@ValidPhone` **não** podem ser aplicados dentro de `JsonNullable<...>` (`annotation ... not applicable in this type context`); a validação desses campos precisa ser feita de outra forma no projeto.

## Limites desta página

- As assinaturas foram conferidas no jar `2026.11.2`; uma versão nova do `seedgrid-commons` pode mudar métodos.
- O que está marcado como **observado** veio do piloto e não foi relido no corpo dos métodos.
- Esta página não documenta os validadores (`@ValidEmail`, `@ValidPhone` e outros): ver a [[SeedGrid/Extensions/commons/Visao-geral|Visão geral]].
