---
description: "O calendário do business-days em camadas (2026.10.22, não publicado), em perguntas e respostas: feriados nacionais prontos e o estadual de SP já semeados com base legal, feriados móveis (Carnaval, Sexta-feira Santa, Corpus Christi) que o tenant ou a empresa desmarca, 'vai trabalhar', UF por empresa (BusinessDaysRegionProvider), company-required e o 403 COMPANY_REQUIRED, rotas e as telas do front."
tags: [seedgrid, extension, business-days, feriados, calendario, host, front, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Calendário em camadas: feriados prontos, móveis e "vai trabalhar"

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-quarkus-ext-business-days` **2026.10.22** (migrations `V1102` a `V1104`); exige `seedgrid-security` 2026.10.22 para o 403 `COMPANY_REQUIRED` com várias empresas. A extension ainda não tem repositório publicado ([[SeedGrid/Mapa-dos-repositorios|Mapa dos repositórios]]). Base: [[SeedGrid/Extensions/business-days/Visao-geral|Visão geral]] e [[SeedGrid/Extensions/business-days/Configuracao|Configuração]].

## O calendário já traz os feriados do Brasil?

Parcialmente, e só o que a lei fixa:

- **Nove nacionais fixos**, semeados na tabela `business_day_reference_holidays` (somente leitura, sem `company_id`): `NEW_YEAR` (01/01), `TIRADENTES` (21/04), `LABOUR_DAY` (01/05), `INDEPENDENCE` (07/09), `OUR_LADY_APARECIDA` (12/10), `ALL_SOULS` (02/11), `REPUBLIC_DAY` (15/11), `BLACK_CONSCIOUSNESS` (20/11, **a partir de 2024**) e `CHRISTMAS` (25/12). Cada linha guarda a base legal em `legal_basis`.
- **Um único estadual: `SP_REVOLUCAO_1932`** (SP, 09/07, Lei estadual 9.497/1997). **Outros estados não têm feriado estadual semeado.**
- **Três móveis**, calculados a partir da Páscoa (testados de 2020 a 2050): `CARNIVAL` (terça, Páscoa − 47), `GOOD_FRIDAY` (Páscoa − 2) e `CORPUS_CHRISTI` (Páscoa + 60).

Para estados que não estão semeados, o host cadastra o feriado próprio pelo CRUD `/business-days/holidays` (já existia).

## Como o calendário decide se um dia é feriado?

Resolve **em camadas**; vence o mais específico: **empresa > tenant > estadual > nacional fixo > móvel**. Em cada nível, "vai trabalhar" vence o feriado. O front não calcula nada disso: usa `origin`, `enabled`, `holidaySource` e `worksOnHoliday` como vêm.

## Os feriados móveis valem para todo mundo?

Por padrão **sim, em todo o país** (Carnaval, Sexta-feira Santa e Corpus Christi ligados). O tenant ou a empresa **desmarca cada um de forma permanente** (vale todo ano), na tabela `business_day_movable_settings` (`V1103`). Prioridade: empresa > tenant > padrão ligado. `enabled: null` remove a configuração do escopo e volta a herdar.

```bash
# desmarcar o Carnaval para a empresa/tenant corrente (permanente, todo ano)
curl -X PUT /business-days/movable-holidays -d '{"code":"CARNIVAL","enabled":false}'
# voltar a herdar
curl -X PUT /business-days/movable-holidays -d '{"code":"CARNIVAL","enabled":null}'
```

## Como a empresa trabalha num dia que seria feriado?

Cadastra um **"vai trabalhar"** (`V1102`, `business_day_work_overrides`): exceção por **data concreta**, com `weight` opcional entre 0 e 1 e motivo (até 200 caracteres).

```bash
curl -X POST /business-days/work-overrides -d '{"date":"2026-11-20","reason":"plantão"}'
```

Peso vazio = o peso do dia da semana. Para um dia que se repete todo ano (móvel), desmarque o móvel em vez de cadastrar "vai trabalhar".

## De qual estado é o calendário? (`BusinessDaysRegionProvider`)

O SPI `br.com.seedgrid.businessdays.spis.BusinessDaysRegionProvider` diz a UF do calendário:

```java
public interface BusinessDaysRegionProvider {
    Optional<String> currentUf();                       // UF (2 letras maiúsculas) da empresa da requisição
    default Optional<String> ufOf(Long companyId) { return Optional.empty(); } // jobs, fora de requisição
}
```

- Sem UF, valem só os nacionais e os móveis.
- Com o `security` no classpath, `SecurityBusinessDaysRegionProvider` usa o estado do endereço da empresa (`Company.address.state`). Sem a security, `GlobalBusinessDaysRegionProvider` (sem UF). **Conta de pessoa física sem endereço = sem UF = sem feriado estadual.**
- O host troca fornecendo o próprio bean CDI:

```java
@ApplicationScoped @Alternative @Priority(1)
class MeuRegionProvider implements BusinessDaysRegionProvider {
    public Optional<String> currentUf() { return Optional.of("SP"); }
}
```

- Fora de requisição (job) `currentUf()` devolve vazio: use `ufOf(companyId)`.

## Posso exigir que haja empresa para ler o calendário?

Sim, com `company-required`:

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.business-days.company-required` | `false` | `true` exige empresa corrente em **toda** rota `/business-days/**`; sem ela, **403 `COMPANY_REQUIRED`** (falha fechada; sem token continua 401). |
| `seedgrid.login-tenancy.modules.business-days.company-required` | `true` | O `login-tenancy` liga por padrão (alimenta a propriedade acima). |
| `seedgrid.business-days.enabled` | `true` | Desligado = sem migrations e rotas 404. |
| `seedgrid.business-days.max-range-days` | `36600` | Máximo de dias em consultas de intervalo. |

Quem tem várias empresas e ainda não escolheu nenhuma recebe `COMPANY_REQUIRED` (e não o 400 genérico "Header X-Company-Id obrigatório"): o `BusinessDaysCompanyRequiredDeferFilter` marca a requisição com `CompanyContextFilter.COMPANY_REQUIRED_HANDLED_BY_MODULE`, o `CompanyContextFilter` do security cede, e o módulo responde 403. A marca só é posta quando o módulo realmente rejeitaria, então nunca deixa a rota aberta. Outros módulos que exijam empresa podem usar a mesma propriedade e responder com código próprio. **Com a security anterior à 2026.10.22 o 400 permanece** (não quebra, só não chega ao 403).

`seedgrid.login-tenancy.modules.business-days.company-required` é uma chave do `microprofile-config.properties` da extension, não do `@ConfigMapping`: funciona como propriedade comum.

## Quais são as rotas?

Base `/business-days`, permissões `BUSINESS_DAY_READ`, `BUSINESS_DAY_CREATE`, `BUSINESS_DAY_UPDATE`, `BUSINESS_DAY_DELETE`. O `company_id` **nunca** vem do corpo.

| Rota | Permissão | Contrato |
|---|---|---|
| `GET /holidays/reference?year=` | READ | `{ code, name, date, source, legalBasis, enabled, uf }`: nacionais + estaduais da UF + móveis (com `enabled`). Sem rota de escrita. |
| `GET\|PUT /movable-holidays` | READ / UPDATE | `{ code, name, enabled, origin (COMPANY/TENANT/DEFAULT), legalBasis }`; PUT `{ code: CARNIVAL\|GOOD_FRIDAY\|CORPUS_CHRISTI, enabled: true\|false\|null }`; código desconhecido = erro de validação. |
| `GET\|POST\|PUT\|DELETE /work-overrides[/{id}]` | READ/CREATE/UPDATE/DELETE | `WorkOverrideRequest { date, weight?, reason?, active? }`. |
| `/holidays[/{id}]` (CRUD) | idem | feriados próprios do tenant ou da empresa. |
| `GET\|PUT\|DELETE /week-profile` | READ / UPDATE | perfil da semana (peso 0, 0,5 ou 1). |
| `GET /calendar`, `/check`, `/count`, `/add` | READ | `DayResponse` ganhou `holidaySource`, `worksOnHoliday`, `legalBasis` (aditivos). |

## O que muda de padrão ou quebra?

- **Comportamento:** o calendário passa a considerar os nacionais semeados e os móveis **automaticamente** (antes só valiam os cadastrados). Quem cadastrava Natal, Tiradentes etc. à mão pode apagar o cadastro (manter não faz mal). Para trabalhar num desses dias, use "vai trabalhar" ou desmarque o móvel.
- `BusinessDayService` ganhou dependências no construtor (repositórios de exceções e de referência, `MovableHolidayService`, `BusinessDaysRegionProvider`); por CDI nada muda, quem o instancia à mão ajusta. `BusinessCalendar.of(weights, holidays)` segue valendo (feriados como do tenant, sem referência nem móveis); o completo é `BusinessCalendar.builder()`.
- Migrations aditivas `V1102` a `V1104` (faixa 1100–1199); a `V1100` não foi reescrita (preserva o checksum do Flyway).
- Pacote `spis` (rename): [[SeedGrid/Extensions/security/Isolamento-spis-e-migracao|Isolamento, spis e migração]].
- Com `company-required=true` (padrão no `login-tenancy`), quem não tem empresa corrente deixa de ler o calendário do tenant.

## E o front? (boilerplates `login-tenancy-b2b` e `subdomain-tenancy`)

Telas em `app/dias-uteis/*`, chamando o BFF `/api/business-days/*` (catch-all `app/api/business-days/[...path]`, sem rota nova):

| Tela | Rota do app | Chamadas |
|---|---|---|
| Feriados | `holiday_list`, `holiday_edit` | `holidays[/{id}]` |
| Semana de trabalho | `week_profile` | `week-profile` |
| Lista de referência (nova) | `holiday_reference` | `holidays/reference?year=`, `movable-holidays` (GET e PUT) |
| Vai trabalhar (nova) | `work_override_list`, `work_override_edit` | `work-overrides` |
| Calendário (ajustada) | `calendar` | `calendar?year=&month=` |

- Lista de referência: carrega o ano (corrente) e os móveis em paralelo; linhas `MOVABLE` trazem o interruptor "Considerar como feriado", a origem (Empresa, Conta (tenant), Padrão) e "Voltar a herdar" (só com origem COMPANY ou TENANT); ativos só com `BUSINESS_DAY_UPDATE`; depois do `PUT` recarrega. Linha com `enabled=false` fica esmaecida ("Considerado dia útil").
- Calendário: cada feriado mostra nome, selo da origem (Empresa, Conta, Estadual, Nacional, Móvel) e base legal; `worksOnHoliday=true` vira "Feriado trabalhado".
- Exceção "vai trabalhar" definida no tenant e vista por quem tem empresa não mostra editar nem excluir (`editable=false`): a permissão `BUSINESS_DAY_UPDATE` sozinha não basta.
- Armadilhas: `JSON.stringify({ enabled: undefined })` **omite** a chave, então para voltar a herdar tem de ir `enabled: null` explícito; não use `new Date("yyyy-MM-dd")` para exibir datas (o fuso desloca um dia); a chave da tabela de referência é `code|date|uf` (repete por UF); backend antigo não traz `holidaySource`, `worksOnHoliday` e `legalBasis` (o front assume `null`/`false`/`null`). A lógica pura está em `lib/business-days.ts`.

## Guardiões

`CalendarIsolationGuardianIT` (o calendário de uma empresa nunca vaza para outra; o do tenant vale para todas e a empresa sobrepõe), `CompanyRequiredTest`, `ReferenceHolidayResourceTest`, `WorkOverrideResourceTest`, `MovableHolidayResourceTest`, `BusinessDaysMigrationTest` (sementes, lei em toda linha, 20/11 desde 2024, móveis não semeados), `MovableHolidayTest`, `BusinessCalendarLayersTest`, `MovableHolidayServiceTest`, `BusinessDayServiceTest`, `BusinessDaysCompanyRequiredDefaultGuardianTest`.

## Não verificado

- A leitura real de `Company.address.state` pelo `SecurityBusinessDaysRegionProvider` não foi provada com a security subindo (os ITs usam um provider de teste por cabeçalho `X-Uf`).
- A base legal veio de resultados de busca em Planalto, Senado, Câmara e ALESP (2026-10-21); a leitura do texto integral das leis no Planalto falhou (`ECONNRESET`). Confirme o texto antes de citar a lei a um cliente.
- Regra de data repetida em "vai trabalhar": não verificada no README da extension; o erro do backend aparece como toast.
- O `lckfiscal` não usa esta extension.
