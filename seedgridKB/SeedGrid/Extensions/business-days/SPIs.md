---
tags: [seedgrid, extension, business-days, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-business-days
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# business-days (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/business-days/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-business-days` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#BusinessDaysRegionProvider]] | `GlobalBusinessDaysRegionProvider` | Sem UF: so' feriados nacionais e moveis. Default quando nada mais esta presente. |
| [[#BusinessDaysScopeProvider]] | `GlobalBusinessDaysScopeProvider` | Sem escopo: um unico calendario para a aplicacao toda. Default quando nada mais esta presente. |

## BusinessDaysRegionProvider

Diz de QUAL UF e' o calendario, para os feriados ESTADUAIS. Sem UF (vazio) so' valem os feriados nacionais e os moveis: uma conta de pessoa fisica sem endereco, por exemplo, nunca recebe feriado estadual. Implementacoes entregues: `GlobalBusinessDaysRegionProvider` (default, sem UF) e, quando o seedgrid-security esta presente, `SecurityBusinessDaysRegionProvider` (UF do endereco da empresa).

**Pacote:** `br.com.seedgrid.businessdays.spis`

**Padrão (`@DefaultBean`):**

- `GlobalBusinessDaysRegionProvider` — Sem UF: so' feriados nacionais e moveis. Default quando nada mais esta presente.

**Outras implementações no repositório** (para consultar como exemplo):

- `SecurityBusinessDaysRegionProvider` (`seedgrid-quarkus-ext-business-days/runtime/src/main/java/br/com/seedgrid/businessdays/spis/impl/SecurityBusinessDaysRegionProvider.java`) — UF = a da CIDADE do endereco da empresa (seedgrid-security + cities); sem cidade, o estado em texto do endereco. Conta de pessoa fisica sem endereco => sem UF => sem feriado estadual.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Optional<String> currentUf()` | UF (sigla de 2 letras, maiusculas) da empresa do request corrente. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `Optional<String> ufOf(Long companyId)` | UF de uma empresa explicita (jobs fora de request). Padrao: sem UF. |

**Exemplo de implementação:**

```java
@RequestScoped
public class PorEnderecoBusinessDaysRegionProvider implements BusinessDaysRegionProvider {

    @Inject
    EnderecoRepository enderecos;

    @Override
    public Optional<String> currentUf() {
        // sigla de 2 letras, maiusculas; vazio = so feriados nacionais e moveis
        return enderecos.ufDaEmpresaCorrente();
    }

    @Override
    public Optional<String> ufOf(Long companyId) {
        return enderecos.ufDaEmpresa(companyId); // jobs fora de request
    }
}
```

## BusinessDaysScopeProvider

Diz de QUEM e' o calendario da requisicao corrente. O host pode fornecer a sua implementacao (CDI, `@Alternative`/`@Priority`) para escopar por outra coisa que nao a empresa.

**Pacote:** `br.com.seedgrid.businessdays.spis`

**Padrão (`@DefaultBean`):**

- `GlobalBusinessDaysScopeProvider` — Sem escopo: um unico calendario para a aplicacao toda. Default quando nada mais esta presente.

**Outras implementações no repositório** (para consultar como exemplo):

- `SecurityBusinessDaysScopeProvider` (`seedgrid-quarkus-ext-business-days/runtime/src/main/java/br/com/seedgrid/businessdays/spis/impl/SecurityBusinessDaysScopeProvider.java`) — Escopo = empresa corrente do token (seedgrid-security). Esta classe NAO tem anotacao de escopo de proposito: o seedgrid-security e' dependencia `provided`, e uma classe-bean referenciando um tipo ausente quebraria o build de quem usa a extension sozinha.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Optional<Long> currentCompanyId()` | Empresa dona do calendário da requisição; vazio = calendário global. |

**Exemplo de implementação:**

```java
@RequestScoped
public class PorParceiroBusinessDaysScopeProvider implements BusinessDaysScopeProvider {

    @Inject
    ParceiroLogado parceiro;

    @Override
    public Optional<Long> currentCompanyId() {
        // vazio = calendario global; com id = linhas globais mais as dessa empresa
        return Optional.ofNullable(parceiro.empresaDoCalendario());
    }
}
```
