---
tags: [seedgrid, front, pacote, fe-commons]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-commons
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# `@seedgrid/fe-commons`

Utilitários leves: cliente HTTP mínimo (`createHttpClient`), consulta de CEP (ViaCEP) e de CNPJ (Publica CNPJ).

Relacionados: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]] · cliente HTTP mais completo em [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]] (`createApiClient`).

## Pacote

| Campo | Valor (Confirmado em `package.json`) |
|---|---|
| Nome / versão | `@seedgrid/fe-commons` `0.2.0` |
| `exports` | só `.` |
| `dependencies` | `@seedgrid/fe-core` (`workspace:*`) — **nenhum import de `@seedgrid/fe-core` em `src/`** (grep) |
| `peerDependencies` | `react ^18.2.0 \|\| ^19.0.0` (o código não importa React) |
| Build | `tsc -p tsconfig.json && node scripts/build-ai-manifest.mjs` |
| Testes | nenhum |

## API (`src/index.ts`)

| Export | Tipo | Fonte | Comportamento |
|---|---|---|---|
| `createHttpClient(opts)` | função | `src/http/httpClient.ts` | retorna `{ request<T>(path, init?) }`; URL = `baseUrl + path` (concatenação simples); define `Content-Type: application/json` se ausente; `Authorization: Bearer` se `getAccessToken()` (síncrono) retornar valor; status não-OK → `Error("HTTP <status> <statusText>: <corpo>")`; 204 → `undefined` |
| `HttpClientOptions` | tipo | idem | `{ baseUrl: string; getAccessToken?: () => string \| null }` |
| `buscarCep(cep, options?)` | função async | `src/cep/viacep.ts` | normaliza para dígitos; ≠ 8 → `Error("CEP deve ter 8 dígitos.")`; `GET https://viacep.com.br/ws/<cep>/json/`; não-OK → `Error("Falha ao consultar CEP (<status>).")`; `erro: true` → `Error("CEP não encontrado.")` |
| `ViaCepResponse` | tipo | idem | `cep, logradouro, complemento, bairro, localidade, uf, ibge, gia, ddd, siafi, erro?` |
| `CepLookupOptions` | tipo | idem | `{ signal?: AbortSignal }` |
| `buscarCnpj(cnpj, options?)` | função async | `src/cnpj/publica.ts` | normaliza para dígitos; ≠ 14 → **lança** `Error("CNPJ deve ter 14 dígitos.")`; `GET https://publica.cnpj.ws/cnpj/<cnpj>`; não-OK **ou** erro de rede → `null` |
| `PublicaCnpjResponse` | tipo | idem | estrutura da API Publica (razão social, porte, natureza jurídica, sócios, simples, estabelecimento com endereço/atividades/inscrições estaduais) |
| `CnpjLookupOptions` | tipo | idem | `{ signal?: AbortSignal }` |

Metadados de IA: `src/cep/viacep.meta.ts`, `src/cnpj/publica.meta.ts`, `src/http/httpClient.meta.ts` (componentIds `hook.cep-lookup`, `hook.cnpj-lookup`, …).

## Pontos de atenção (Confirmado)
- `buscarCnpj` remove letras (`\D`), portanto **não suporta CNPJ alfanumérico**, ao contrário de `isValidCnpj`/`maskCnpj` do `@seedgrid/fe-components`.
- Serviços externos fixos (ViaCEP e publica.cnpj.ws) — não há configuração de URL nem variável de ambiente.
- O `aiHints` de `publica.meta.ts` diz "Returns null on network error or non-2xx" — coerente com o código; mas a entrada com tamanho inválido **lança** erro.

## Exemplo
Fonte: `packages/seedgrid-fe-commons/README.md`.

```ts
import { createHttpClient, buscarCep, buscarCnpj } from "@seedgrid/fe-commons";

const apiClient = createHttpClient({
  baseUrl: "https://api.exemplo.com",
  getAccessToken: () => localStorage.getItem("sg:session-token")
});

const cep = await buscarCep("01001-000");     // cep.localidade, cep.uf
const empresa = await buscarCnpj("10404812000100"); // empresa?.razao_social
const dados = await apiClient.request("/v1/dashboard");
```
(Base URL substituída por placeholder.)
