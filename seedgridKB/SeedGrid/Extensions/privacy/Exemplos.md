---
tags: [seedgrid, library, privacy, exemplos]
fonte: java/seedgrid-quarkus-lib-privacy, platform-examples/examples/seedgrid-privacy-example
branch: main
commit: 79f8b03eeb
analisado-em: 2026-10-14
---

# SeedGrid Privacy — Exemplos

Voltar: [[SeedGrid/Extensions/privacy/Visao-geral|Visão geral do privacy]] · [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]]

## Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-privacy</artifactId>
    <version>2026.07.27</version>
</dependency>
```

## Entidade com campos cifrados e pesquisáveis (exemplo real)

Fonte: `platform-examples/examples/seedgrid-privacy-example/src/main/java/br/com/seedgrid/privacyexample/entity/Customer.java` (Lombok `@Getter/@Setter/@NoArgsConstructor` omitidos).

```java
@Entity
@Table(name = "customers")
@EntityListeners(EncryptedFieldListener.class)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // cifrado, NÃO pesquisável (sem searchField)
    @Convert(converter = EncryptedFieldAttributeConverter.class)
    @EncryptedField
    @Column(nullable = false, length = 512)
    private String name;

    @Convert(converter = EncryptedFieldAttributeConverter.class)
    @EncryptedField(searchField = "emailHash", normalize = SearchNormalization.EMAIL)
    @Column(nullable = false, length = 512)
    private String email;

    @Column(name = "email_hash", length = 64)
    private String emailHash;

    @Convert(converter = EncryptedFieldAttributeConverter.class)
    @EncryptedField(searchField = "cpfHash", normalize = SearchNormalization.CANONICAL)
    @Column(nullable = false, length = 512)
    private String cpf;

    @Column(name = "cpf_hash", length = 64)
    private String cpfHash;

    @Convert(converter = EncryptedFieldAttributeConverter.class)
    @EncryptedField
    @Column(length = 512)
    private String phone;
}
```

## Busca por hash e mascaramento (exemplo real)

Fonte: `.../privacyexample/service/CustomerService.java` (trecho).

```java
public Optional<Customer> findByEmail(String email) {
    EncryptedFieldSearch search = CryptoProvider.getSecureSearch();
    String hash = search.hashForSearch(email, SearchNormalization.EMAIL);
    return repository.findByEmailHash(hash);      // find("emailHash", hash).firstResultOptional()
}

public Optional<Customer> findByCpf(String cpf) {
    EncryptedFieldSearch search = CryptoProvider.getSecureSearch();
    String hash = search.hashForSearch(cpf, SearchNormalization.CANONICAL);
    return repository.findByCpfHash(hash);
}

public CustomerResponse mask(CustomerResponse response) {
    return sanitizer.sanitize(response, CustomerResponse.class);  // PersonalDataSanitizer injetado
}
```

DTO de saída com regras de masking (fonte: `.../dto/CustomerResponse.java`):

```java
public class CustomerResponse {
    public Long id;

    @PersonalData(type = MaskingStrategy.PARTIAL, maskWith = "4")
    public String name;

    @PersonalData(type = MaskingStrategy.FULL)
    public String email;

    @PersonalData(type = MaskingStrategy.FORMAT, maskWith = "***.***.***-**")
    public String cpf;

    @PersonalData(type = MaskingStrategy.PARTIAL, maskWith = "4")
    public String phone;
}
```

## Busca bimodal (cifra opcional)

Fonte: `README.md`.

```java
if (CryptoProvider.isEncryptionEnabled()) {
    String hash = new EncryptedFieldSearch().hashForSearch(cpf);   // CANONICAL por padrão
    return repository.find("cpfHash", hash).firstResult();
}
return repository.find("cpf", cpf).firstResult();
```

> `new EncryptedFieldSearch()` exige `seedgrid.privacy.search.key` — por isso fica dentro do `if`.

## Campo cifrado dentro de `@Embeddable`

Fonte: `README.md` (comportamento confirmado em `EncryptedFieldListener#applyTo`).

```java
@Embeddable
public class Contato {
    @EncryptedField(searchField = "cpfHash", normalize = SearchNormalization.CANONICAL)
    @Convert(converter = EncryptedFieldAttributeConverter.class)
    private String cpf;

    private String cpfHash;          // irmão, no MESMO embeddable
}

@Entity
@EntityListeners(EncryptedFieldListener.class)
public class Empresa {
    @Embedded
    private Contato representante;
}
```

Os embeddables `Address`/`Contact` do commons seguem esse padrão — ver [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]].

## Masking de valores soltos

Fonte: `README.md` + assinaturas de `PersonalDataMasker`.

```java
String cpf  = PersonalDataMasker.cpf("12345678900");     // ***.***.***-00
String cnpj = PersonalDataMasker.cnpj("12345678000190");
String cep  = PersonalDataMasker.cep("01310100");        // 01310-***
String x    = PersonalDataMasker.mask("12345678900", MaskingStrategy.PARTIAL, "3"); // ********900

@Override
public String toString() {
    return "Contact [cpf=" + PersonalDataMasker.cpf(cpf)
            + ", email=" + PersonalDataMasker.mask(email, MaskingStrategy.FULL, null) + "]";
}
```

## Configuração

```properties
seedgrid.privacy.encryption.enabled=true
seedgrid.privacy.crypto.key=<SEGREDO:privacy-crypto-key>
seedgrid.privacy.search.key=<SEGREDO:privacy-search-key>
quarkus.hibernate-orm.packages=<pacote.das.entidades>,br.com.seedgrid.privacy
```

Detalhes: [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]].
