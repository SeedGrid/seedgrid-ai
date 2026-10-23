# Estendendo PlanTerm e User

> Para **cobrar por uso** (franquia e excedente por plano), o caminho é outro: veja
> [contadores de uso](contadores-de-uso.md).

Os exemplos deste boilerplate acrescentam dados de negócio pelo mapa
`additionalAttributes` (`Map<String, JsonNode>` no Java, objeto JSON na API).
As entidades das extensões já persistem esse mapa em JSONB. Para acrescentar uma
chave, implemente a validação no host e adapte os formulários e os mapeamentos do BFF.
Não é necessário herdar de `User` ou `PlanTerm`, copiar controllers, alterar as
extensões ou criar uma migration por campo.

| Entidade | Exemplo do produto | Contrato implementado pelo host |
| --- | --- | --- |
| `PlanTerm` | `supportLevel`: nível de suporte do plano (opcional) | `br.com.seedgrid.billing.spis.PlanTermAdditionalFieldsValidator` |
| `User` | `cargo`: texto opcional de até 100 caracteres | `br.com.seedgrid.security.spis.UserAdditionalFieldsValidator` |

## Como registrar a regra do produto

Declare um bean CDI `@ApplicationScoped` que implemente a interface correspondente.
A extensão fornece um validator padrão com `@DefaultBean`; o bean do host substitui
esse padrão automaticamente. Mantenha um único bean do host por interface, reunindo
nele as regras de todos os campos da entidade.

O método recebe a entidade e o mapa final de atributos, depois dos limites de JSON
da extensão. Valide o argumento do mapa: ele já contém o resultado do merge e,
no Billing, ainda não foi atribuído à entidade. Lance a exceção específica para
rejeitar a operação; a API devolve HTTP 400 e a alteração não é persistida.

## PlanTerm: supportLevel

Implementação completa: [AppPlanTermValidator.java](../backend/src/main/java/br/com/seedgrid/app/api/billing/AppPlanTermValidator.java).

> **Franquia e excedente não são atributo do term.** São condição comercial de cada **contador de uso**,
> nos `meters` do term, com tela própria e cobrança no Stripe. Veja o
> [guia de contadores de uso](contadores-de-uso.md). Os `additionalAttributes` ficam para o que o produto
> guarda no plano e que **não** é contado, como o nível de suporte deste exemplo.

```java
@ApplicationScoped
public class AppPlanTermValidator implements PlanTermAdditionalFieldsValidator {
    private static final Set<String> SUPPORT_LEVELS = Set.of("standard", "priority");

    @Override
    public void validate(PlanTerm term, Map<String, JsonNode> attributes) {
        JsonNode supportLevel = attributes.get("supportLevel");
        if (supportLevel != null
                && (!supportLevel.isTextual() || !SUPPORT_LEVELS.contains(supportLevel.asText()))) {
            throw new InvalidPlanTermAdditionalAttributesException(
                    "supportLevel deve ser um destes: " + SUPPORT_LEVELS + ".");
        }
    }
}
```

Fragmento do corpo de criação/edição de uma vigência:

```json
{"additionalAttributes":{"supportLevel":"priority"}}
```

O campo é opcional: um term sem `supportLevel` continua válido. Valores fora da lista, números e objetos
são rejeitados com HTTP 400. As telas atuais não editam o campo; para expô-lo, acrescente o input em
[vigências](../admin/app/plans/plan_terms/page.tsx) e envie só a chave alterada (merge RFC 7386, abaixo).

## User: cargo

Implementação completa: [AppUserAdditionalFieldsValidator.java](../backend/src/main/java/br/com/seedgrid/app/api/security/AppUserAdditionalFieldsValidator.java).

```java
@ApplicationScoped
public class AppUserAdditionalFieldsValidator implements UserAdditionalFieldsValidator {
    @Override
    public void validate(User user, Map<String, JsonNode> attributes) {
        JsonNode cargo = attributes == null ? null : attributes.get("cargo");
        if (cargo == null || cargo.isNull()) return;
        if (!cargo.isTextual()) {
            throw new InvalidUserAdditionalAttributesException("Cargo deve ser um texto.");
        }
        if (cargo.textValue().length() > 100) {
            throw new InvalidUserAdditionalAttributesException("Cargo deve ter no máximo 100 caracteres.");
        }
    }
}
```

Fragmento do corpo de criação/edição:

```json
{"additionalAttributes":{"cargo":"Analista"}}
```

Cargo é opcional: usuários antigos, cadastro sem cargo e texto vazio continuam
válidos. Números, booleanos, arrays e objetos são rejeitados. As telas removem
espaços das extremidades antes de enviar e transformam o campo vazio em `null`.
O backend valida tipo e tamanho sem normalizar o texto enviado diretamente à API.

O dado pertence ao usuário, não ao vínculo com a empresa ou às roles. No modelo
login-tenancy, o mesmo usuário pode participar de várias empresas e compartilha
esse cargo. No subdomain-tenancy, o usuário pertence ao banco selecionado pelo domínio.

O campo aparece na listagem e na edição do [admin](../admin/app/security/users/user_edit/page.tsx)
e do [frontend](../frontend/app/security/users/user_edit/page.tsx). O BFF deve
preservar `additionalAttributes` tanto no corpo enviado quanto na resposta; copiar
somente os campos fixos de `User` faria o cargo desaparecer.

## Edição e remoção de atributos

Nos fluxos de edição usados pelas telas, a extensão faz merge RFC 7386:

- Chave ausente preserva o valor existente.
- Chave com valor atualiza apenas esse atributo.
- Chave com `null` remove o atributo.
- Objetos são mesclados; arrays são substituídos.
- `additionalAttributes` omitido ou `null` não altera o mapa no merge.

Para limpar o cargo sem apagar outros dados:

```json
{"additionalAttributes":{"cargo":null}}
```

A validação roda sobre o resultado: remover `cargo` ou `supportLevel` é permitido, porque os dois
são opcionais. Um campo obrigatório teria a remoção rejeitada pelo validator.
Na criação, os atributos enviados formam o mapa inicial. Não generalize o merge
para endpoints de substituição completa: estes podem substituir o mapa.

## Acrescentando outro campo

1. Defina a chave, o tipo, o limite e se é obrigatória. Campos novos obrigatórios
   precisam considerar os registros existentes e os fluxos de bootstrap.
2. Acrescente a regra ao validator da entidade, preservando atributos que não são
   responsabilidade dessa regra.
3. Atualize os tipos TypeScript, os mapeamentos do BFF e as telas de leitura/edição.
4. Envie somente as chaves alteradas nos fluxos de merge; use `null` para remover.
5. Verifique criação, edição, limpeza, valores inválidos e preservação de outras chaves.

Adicionar uma chave ao JSONB não exige DDL. Backfill, índices ou consultas por esse
atributo podem exigir trabalho adicional conforme a necessidade do produto.

## Validação disponível

No backend:

```bash
mvn -o -Dtest=AppUserAdditionalFieldsValidatorTest test
```

Os testes de User cobrem ausência, null, texto vazio, limite de 100 caracteres,
excesso de tamanho, tipos inválidos e coexistência com outros atributos.
São testes unitários do validator; não exercitam HTTP nem persistência.

Em cada app (`admin` e `frontend`):

```bash
pnpm exec tsc --noEmit
```

Para conferir o fluxo completo no ambiente em execução, crie um usuário com cargo,
reabra a edição, altere e limpe o campo; confirme a listagem após cada operação.
Envie também um cargo numérico e um texto de 101 caracteres pela API: ambos devem
retornar HTTP 400 sem persistir a alteração.
