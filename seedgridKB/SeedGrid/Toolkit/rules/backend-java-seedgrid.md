---
description: "Padrões obrigatórios do back-end Java SeedGrid (complementam backend-seedgrid.md): estrutura de pastas, injeção por construtor, exceptions tipadas, Flyway, Panache e BaseEntity, RestControllerPath, DTOs, assertAll, LGPD (privacy) e auditoria em Java. Leia antes de criar ou alterar código Java."
---
# Padrões do back-end Java SeedGrid

Regras **obrigatórias** para projetos Java que usam o SeedGrid. Cada regra tem um id (`BE-nn`) para citar em revisões (`sg-review`). Leia junto com `.ai/rules/backend-seedgrid.md`, que traz o que vale em qualquer linguagem (dados, API, testes, guardiões, LGPD, auditoria); os ids são os mesmos, e esta rule acrescenta o **como** em Java. Para as extensions existentes (propriedades, enums, exemplos), consulte a KB: comece por `.ai/brain/SeedGrid/Extensions/Indice.md`.

## Estrutura e nomes

- **BE-01.** Quando aplicável, use as pastas `configs/`, `controllers/`, `dtos/`, `exceptions/`, `filters/`, `entities/`, `repositories/`, `services/`, `utils/` (com parcimônia) e `spis/`. Não crie pasta sem propósito claro.
- **BE-02.** Toda pasta (pacote) no **plural**.
- **BE-03.** Resources REST terminam em `Controller`, não `Resource` (`ClienteController`).
- **BE-04.** Use sempre a biblioteca `seedgrid-commons` nos projetos.
- **BE-05.** DTOs: sufixo `DTOReq` para entrada (request) e `DTORes` para saída (response): `ClienteDTOReq`, `ClienteDTORes`.
  - O **Req** leva só as propriedades necessárias (um update não precisa do `id`) e, para relacionamentos, **somente a chave estrangeira** pelo `publicId` (`cidadePublicId`), nunca campos nem objeto da entidade relacionada. Validações (`@NotNull`, `@Size`...) ficam no próprio record; para exigir os obrigatórios só no POST/PUT, use um grupo `Full extends Default` dentro do record.
  - O **Res** é **plano** ("plain"): tudo no mesmo nível, sem objetos aninhados. Traz o `publicId` (nunca o `id` interno) e, para cada relacionamento, o `publicId` e a descrição (`cidadePublicId`, `cidadeDescricao`), inclusive os de mais de um nível (`paisPublicId`, `paisDescricao`). Pode existir mais de um Res para a mesma entidade, com menos campos, conforme o uso (por exemplo uma listagem enxuta).
  - **O service valida as chaves estrangeiras do Req.** Cada `...PublicId` recebido é buscado no banco (repositório da entidade relacionada, pelo `publicId`); se não existir, o service lança `EntityNotFoundException` (`seedgrid-commons`, BE-11) com mensagem que nomeia o relacionamento ("Cidade não encontrada."), **antes** de gravar qualquer coisa. Vale para **POST, PUT e PATCH**: o usuário nunca consegue gravar um id inválido. Nunca confie no id recebido nem deixe a violação de FK do banco virar 500. No `PATCH`, valida só os ids enviados (campo ausente não muda).
  - O **Req** espelha a entidade: os campos próprios dela mais um `...PublicId` por `@ManyToOne` (`cidade` vira `cidadePublicId`); o **Res** é plano e traz o que o Req recebe, mais a descrição de cada relação.
  - Records Java, na pasta `dtos/` (BE-01).

```java
public record ClienteDTOReq(
        @NotNull(groups = ClienteDTOReq.Full.class, message = "Informe o nome.")
        @Pattern(regexp = ".*\\S.*", message = "Informe o nome.")
        @Size(max = 255) String nome,
        @NotNull(groups = ClienteDTOReq.Full.class) String cidadePublicId,
        @NotNull(groups = ClienteDTOReq.Full.class) String categoriaPublicId
) {
    /** Grupo do POST/PUT: exige os obrigatórios. Estende Default para manter @Size e @Pattern. */
    public interface Full extends Default {}
}

public record ClienteDTORes(
        String publicId,
        String nome,
        String cidadePublicId, String cidadeDescricao,
        String paisPublicId, String paisDescricao,
        String categoriaPublicId, String categoriaDescricao
) {}
```

## Injeção e exceptions

- **BE-10.** Injeção **somente por construtor**, dependências `private final`. Nunca `@Inject` em atributo (só é permitido quando houver mais de um construtor).
- **BE-11.** Exceptions **tipadas** que reflitam o objetivo; nunca lance `RuntimeException` direto. Todas estendem `BusinessException` (`br.com.seedgrid.commons.core.exceptions`: `userMessage` para o cliente e `devMessage` para o desenvolvedor), que o `ApiExceptionHandler` do `seedgrid-commons` já converte em Problem Details; **extensions novas também criam as exceptions delas a partir dela**. O `commons` já traz duas prontas: `EntityNotFoundException` (buscar uma entidade que não existe, inclusive o id de chave estrangeira recebido no Req, BE-05) e `EntityInUseException` (apagar algo em uso por um relacionamento, quebra de integridade referencial: verifique antes e lance, em vez de deixar a violação de FK do banco virar 500). A `BusinessException` leva um **status 4xx** (`Response.Status`, padrão 400 `ERRO_NEGOCIO`): `EntityNotFoundException` responde 404 e `EntityInUseException` 409; para outro status, passe-o no construtor (`new BusinessException(user, dev, Response.Status.PAYMENT_REQUIRED)`). Status que o `Response.Status` não tem (422) exige `ApiExceptionExtension` (nota `Extensions/commons/Exemplos`). *Não publicado (commons 2026.10.22); até lá, 400 nas duas.*

## Persistência

- **BE-20.** Flyway, com migrations separadas por projeto: `src/main/resources/db/migration/<project-name>` e `src/test/resources/db/migration/<project-name>`. **Host:** `quarkus.flyway.locations` aponta para a pasta do host (ex.: `classpath:db/migration/app`), nunca para o padrão `db/migration`, que varre as subpastas das extensions e as migra de novo na `flyway_schema_history` do host (a migração da extension depois falha com "tabela já existe"). **Não mantenha cópia das migrations de uma extension em `src/test/resources`:** o Flyway enxerga as duas pastas do classpath e acusa versão duplicada.
- **BE-21.** Em hosts, usar ou não o Panache é **opcional**: a escolha é do host.
- **BE-23.** Toda entidade JPA estende uma base de `br.com.seedgrid.commons.persistence` (traz `id`, `publicId`, datas e usuário de criação/alteração): `BaseEntityPanache` (estende `PanacheEntityBase`, sem `active`) em hosts que usam Panache (BE-21), ou `BaseEntity` (JPA puro, inclui `active`) em hosts que não usam. Os relacionamentos usam o `id`; o `publicId` é só para busca externa.

## API REST

- **BE-31.** Os paths ficam centralizados em uma classe `RestControllerPath` no pacote `configs` (`final`, construtor privado), usada na API **e** nos testes de integração. O `@Path` do controller **e o de cada método** usam constante; **nenhuma string literal de path** em controller, e o teste nunca escreve o texto do path. Padrão: constante do nome do parâmetro (`PUBLIC_ID_PARAM = "publicId"`), uma seção por recurso com a base (`USERS = "/users"`), os sub-paths (`USERS_BY_PUBLIC_ID = "/{" + PUBLIC_ID_PARAM + "}"`) e os caminhos completos com sufixo `_FULL` (`USERS_BY_PUBLIC_ID_FULL = USERS + USERS_BY_PUBLIC_ID`). O controller usa a base e os sub-paths; o teste usa os `_FULL`.
- **BE-33.** **Criar e alterar parcialmente usam um DTO de entrada só** (nunca `CriarXReq` e `AtualizarXReq`). O `POST` valida tudo e o `PATCH` só o que veio:
  - Os requisitos de preenchimento (`@NotNull`, `@NotBlank`) do POST ficam no grupo `Full` (`public interface Full extends Default`) dentro do DTO; o `POST` usa `@Valid @ConvertGroup(to = XReq.Full.class)` e o `PATCH` usa `@Valid` simples. Restrições de formato e tamanho (`@Size`, `@Pattern`) não têm grupo e valem nos dois.
  - Semântica do `PATCH`: campo **não enviado** não muda; campo **enviado com valor** atualiza; campo **enviado como `null`** passa a `null`, **mas só se o campo for opcional**: `null` explícito num campo obrigatório (o que tem requisito no grupo `Full`) responde 400.
  - Isso exige distinguir "ausente" de "`null`", o que um `record` comum não faz (o padrão `if (valor != null) setter(valor)` ignora o `null` e nunca limpa um campo). **Mecanismo decidido pelo dono (2026-10-24): `JsonNullable<T>`** (`openapi-jackson-nullable`) nos campos do DTO: `isPresent()` diz se foi enviado e `get()` traz o valor (ou `null`). Fluxo do `PATCH`: ausente, ignora; presente com valor, valida formato (`@Size`, `@Pattern`) e atualiza; presente com `null`, confere se o campo é opcional e então zera, senão 400. **A implementação (suporte no `commons` e padrão de validação do `null` em campo obrigatório) é a TX.C, ainda não feita**; até lá, não use o padrão `if (valor != null)` em campo que o usuário precise limpar.
- **BE-34.** Listagens paginadas recebem os filtros por um **objeto de filtro** com `@BeanParam`, nunca por uma lista de `@QueryParam` no método: `XFilter extends PageFilter` (`filters/`), com um campo `@QueryParam` por filtro, `defaultSortField()` e `sortableFields()` (mapa nome da API → campo da entidade; campo de ordenação fora do mapa cai no padrão, para o nome nunca vir cru da requisição). `PageFilter` (`page`, `size` com teto de 100, `sortField`, `sortOrder`, `toSort()`, `toPageReq()`) vem do `seedgrid-commons` (**a criar**, 2026.10.22, não publicado).
- **BE-35.** O `where` das listagens é montado com `QueryFilter` e `QueryConditions` do `seedgrid-commons` (**a criar**, não publicados; origem: `FiltroQuery` e `FiltroHelper` do lckfiscal), e os **nomes de campo vêm do metamodelo gerado** (`Pessoa_.RAZAO_SOCIAL`, `Pessoa_.ENDERECO + "." + Endereco_.CEP`), nunca de texto digitado. `QueryConditions.applyEqual`, `applyRange` e `applyText` só acrescentam a condição quando o filtro veio preenchido; o valor entra sempre como parâmetro nomeado, nunca concatenado (BE-32 vale para o texto: a primeira palavra por prefixo). O repositório faz `find(query.where(), filter.toSort(), query.params())`. Campo cifrado (BE-62) filtra pelo hash de busca, não pelo valor.

## Testes

- **BE-41.** Teste com mais de um `assert` agrupa-os com `assertAll`.

## LGPD e auditoria em Java

- **BE-61.** Dado pessoal (lista e regras no BE-67) usa o `seedgrid-privacy`: campo `String` com `@Convert(converter = EncryptedFieldAttributeConverter.class)` e `@SgEncryptedField`, coluna `length = 512`, **sempre** com `@SgEncryptedField(searchField = "<campo>Hash", normalize = ...)` e a coluna irmã `<campo>_hash` (`length = 64`); a busca por igualdade é feita pelo hash (`EncryptedFieldSearch#hashForSearch`, com a **mesma** normalização da anotação). Entidade com campo cifrado leva `@EntityListeners(EncryptedFieldListener.class)`.
- **BE-62.** O host liga `seedgrid.privacy.encryption.enabled=true` e fornece `seedgrid.privacy.crypto.key` e `seedgrid.privacy.search.key` (Base64, 32 bytes) por segredo/variável de ambiente, nunca em arquivo versionado.
- **BE-63.** Use `@SgPersonalData`/`@SgMaskRule` para mascarar dado pessoal em auditoria, log, exportação e resposta de erro (e `remove = true` para senha e segredos). Os gabaritos dos dados da lista do BE-67 estão lá.
- **BE-64.** **Todo método público de service é auditado com `@SgAudit`** (`entityFqcn`, `operation`, `description`), inclusive as consultas, para saber quem leu: `CREATE`, `UPDATE` e `DELETE` nas escritas (dentro de `@Transactional`), `READ` nas leituras e `OTHER` nas demais operações. Em alteração e exclusão, o `publicId` é o **primeiro argumento** do método (o `@SgAudit` o usa para achar o estado anterior).
- **BE-67.** **Dado pessoal segue a LGPD, pelo que o campo representa (não pelo nome).** Todo campo que guarda CPF, CNPJ, inscrição estadual, e-mail, telefone, WhatsApp ou logradouro (`fone`, `celular`, `endereco.rua` valem) tem **sempre**: (1) **cifra** em repouso; (2) **hash de busca**, em todo campo cifrado (BE-61), consultado pelo `QueryFilter` (BE-35); (3) **máscara** em log, auditoria, exportação e resposta de erro, com `@SgMaskRule`; **nunca vai em claro** para esses destinos. A máscara usa `MaskingStrategy.TEMPLATE` (e `MaskingStrategy.EMAIL` para e-mail) (`#` mostra o caractere da mesma posição, `*` mascara, o resto é literal; o resultado tem o tamanho do gabarito, então um gabarito mais largo que a coluna esconde o tamanho real). Gabaritos (valor guardado **sem pontuação**):
  | Dado | Gabarito | Resultado |
  |---|---|---|
  | CPF (11 dígitos) | `###***###**` | `058***698**` |
  | CNPJ (14 dígitos) | `#####***####**` | `05952***0001**` |
  | Telefone/WhatsApp celular (11 dígitos) | `####*****##` | `1698*****53` |
  | Telefone fixo (10 dígitos) | `####****##` | `1633****53` |
  | Inscrição estadual (tamanho varia por estado) | `###***********` | `111***********` |
  | E-mail | estratégia `MaskingStrategy.EMAIL` (sem gabarito) | `luck*******@gm***.com` (`luck*******@gm***.com.br`) |
  | Logradouro | `######**************` | `AV. E.**************` |
  O gabarito é posicional: IE e logradouro têm tamanho variável, então só o **começo** pode ser mostrado (um "últimos N" cairia em posição errada). O e-mail não usa gabarito, porque o `@` muda de posição: `EMAIL` mostra 4 caracteres do usuário e 2 do domínio, com asteriscos fixos. O logradouro mostra no máximo 6 caracteres para o número não aparecer em endereço curto ("AV. E. 293"). Se o valor for guardado **com** pontuação, use o gabarito com os mesmos literais (CPF `###.***.###-**`).
- **BE-65.** Endpoints protegidos com as anotações de segurança do Quarkus (`@Authenticated`, `@RolesAllowed`, `@PermissionsAllowed`) e permissões registradas conforme a extension `security`.
- **BE-66.** Cadastros novos seguem a skill `sg-crud-back`.
