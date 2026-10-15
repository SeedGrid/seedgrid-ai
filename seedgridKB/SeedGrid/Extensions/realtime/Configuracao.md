---
tags: [seedgrid, extension, realtime, configuracao]
fonte: java/seedgrid-quarkus-ext-realtime
branch: main
commit: 8f13639b3c
analisado-em: 2026-10-14
---

# Realtime (Quarkus) — configuração

Voltar: [[SeedGrid/Extensions/realtime/Visao-geral|Visão geral do realtime]] · [[SeedGrid/Extensions/realtime/Exemplos|Exemplos]] · [[SeedGrid/Extensions/realtime/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.realtime` |
| Classe de config | `java/seedgrid-quarkus-ext-realtime/runtime/src/main/java/br/com/seedgrid/realtime/configs/RealtimeConfig.java` → `RealtimeConfig` (grupo aninhado `RealtimeConfig.Pulse`) |
| Mecanismo | SmallRye `@ConfigMapping(prefix = "seedgrid.realtime")` + `@StaticInitSafe`; registrado também por `SeedgridRealtimeProcessor#config()` (`ConfigMappingBuildItem`) |
| Fase | Runtime (ConfigMapping no módulo runtime). Na prática os valores são lidos uma vez, quando o bean `RealtimePublisher`/`ConnectRateLimiter` é criado. |
| Outras fontes | Não há `microprofile-config.properties` no runtime nem `@ConfigProperty`/`ConfigProvider` adicionais. |

Variáveis de ambiente: a regra MicroProfile se aplica sem ambiguidade a todas as chaves abaixo, e os nomes `SEEDGRID_REALTIME_*` estão confirmados no README e na mensagem de log de `RealtimePublisher#connect`.

## 2. Propriedades da extension

### Ativação e conexão com o Pulse

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.realtime.enabled` (env `SEEDGRID_REALTIME_ENABLED`) | `boolean` | `true`/`false` | `false` | Não | Liga o realtime. Desligado: `/realtime/connect` responde `200 {enabled:false}`, `publishToUser` é no-op e nada fala com o Pulse. | Liga a integração com o Pulse | Ligado exige `pulse.base-url` e `pulse.project-key`; se faltar algum, o realtime fica desligado e é logado ERROR (a aplicação sobe) | Runtime | Decl.: `RealtimeConfig#enabled()`. Consumo: `RealtimePublisher#connect(RealtimeConfig)` |
| `seedgrid.realtime.pulse.base-url` (env `SEEDGRID_REALTIME_PULSE_BASE_URL`) | `Optional<String>` | URL do Pulse visível pelo backend (pode ser endereço interno) | — | Condicional: necessária quando `enabled=true` | Valor em branco é tratado como ausente (`filter(!isBlank)`). Passado a `PulsePublisher.builder().baseUrl(...)`. | Endereço do Pulse | Com `enabled=true` e sem valor → realtime desligado + log ERROR | Runtime | Decl.: `RealtimeConfig.Pulse#baseUrl()`. Consumo: `RealtimePublisher#connect` |
| 🔒 `seedgrid.realtime.pulse.project-key` (env `SEEDGRID_REALTIME_PULSE_PROJECT_KEY`) | `Optional<String>` | chave `project` da conta no Pulse | — | Condicional: necessária quando `enabled=true` | Segredo; fica só no backend. Em branco = ausente. Enviada pelo SDK ao Pulse (header `x-api-key` nos testes). | Autenticar o backend no Pulse | Idem `base-url` | Runtime | Decl.: `RealtimeConfig.Pulse#projectKey()`. Consumo: `RealtimePublisher#connect` |

### Token de conexão e limites

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.realtime.token-ttl` (env `SEEDGRID_REALTIME_TOKEN_TTL`) | `Duration` | ISO-8601 (`PT5M`) ou formatos aceitos pelo conversor de `Duration` do SmallRye | `PT5M` | Não | Janela para **conectar**; a conexão aberta segue depois do vencimento. Repassado ao Pulse em `IssueConnectTokenInput` (o teste com `PT2M` confirma o envio de `ttlSeconds: 120`). Sem validação local de faixa. | Validade do token | Só tem efeito com o realtime ligado | Runtime | Decl.: `RealtimeConfig#tokenTtl()`. Consumo: `RealtimePublisher#issueConnectToken` |
| `seedgrid.realtime.channels` (env `SEEDGRID_REALTIME_CHANNELS`) | `Optional<List<String>>` | lista separada por vírgula | — (ausente = todos os channels da conta) | Não | Restringe os channels que o token deixa assinar; também é devolvido no corpo do `/realtime/connect`. | Escopo de assinatura | — | Runtime | Decl.: `RealtimeConfig#channels()`. Consumo: `RealtimePublisher#issueConnectToken`, `RealtimeController#connect` |
| `seedgrid.realtime.connect-rate-per-minute` (env `SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE`) | `int` | inteiro; `<= 0` desliga | `30` | Não | Pedidos de token por minuto **por usuário**, janela fixa de 60 s, em memória por instância. Excedido → `429` com `Retry-After` (segundos, mínimo 1). | Proteger a cota de emissões da project key | Só é consultado com o realtime ligado (o controller responde `enabled:false` antes) | Runtime | Decl.: `RealtimeConfig#connectRatePerMinute()`. Consumo: `ConnectRateLimiter(RealtimeConfig)` / `#tryAcquire` |

Total: **6 propriedades públicas**.

## 3. Propriedades de frameworks/bibliotecas

A extension não define nem exige propriedades `quarkus.*`, `mp.*` ou `smallrye.*` (não há `microprofile-config.properties` nem `RunTimeConfigurationDefaultBuildItem`). Indiretamente, `@Authenticated` depende do mecanismo de autenticação configurado no host (ex.: JWT do `seedgrid-security`). (Inferência)

## 4. Propriedades usadas só em testes

Arquivo `runtime/src/test/resources/application.properties` e `FakePulse`:

| Propriedade | Valor no teste | Observação |
|---|---|---|
| `quarkus.http.test-port` | `0` | porta aleatória |
| `seedgrid.realtime.enabled` | `true` | `RealtimeDisabledTest` sobrescreve para `false` via `QuarkusTestProfile` |
| `seedgrid.realtime.pulse.project-key` | `<SEGREDO:pulse-project-key-de-teste>` | valor fictício de teste (não copiado) |
| `seedgrid.realtime.token-ttl` | `PT2M` | — |
| `seedgrid.realtime.connect-rate-per-minute` | `1000` | evita 429 nos testes |
| `seedgrid.realtime.pulse.base-url` | URL do WireMock | injetada por `FakePulse#start()` |

## 5. Aliases, obsoletas, renomeações

Nenhum alias encontrado. O README declara que a crate Rust usa "mesmo contrato: rota, corpo, config, eventos" — detalhes em [[SeedGrid/Extensions/realtime/Rust|Porte Rust]].

## 6. Configuração mínima

```properties
seedgrid.realtime.enabled=true
seedgrid.realtime.pulse.base-url=<URL-DO-PULSE-VISTA-PELO-BACKEND>
seedgrid.realtime.pulse.project-key=${SEEDGRID_REALTIME_PULSE_PROJECT_KEY}
```

Sem nenhuma configuração a extension fica desligada (padrão `enabled=false`) e o endpoint responde `{enabled:false}`.

## 7. Configuração completa comentada

```properties
# Liga o realtime (padrão: false)
seedgrid.realtime.enabled=true
# Pulse visto pelo backend (pode ser endereço interno)
seedgrid.realtime.pulse.base-url=<URL-DO-PULSE>
# SEGREDO: chave "project" da conta no Pulse. Use variável de ambiente.
seedgrid.realtime.pulse.project-key=<SEGREDO:pulse-project-key>
# Janela para conectar (padrão: PT5M)
seedgrid.realtime.token-ttl=PT5M
# Channels permitidos no token (ausente = todos os da conta)
seedgrid.realtime.channels=backup,report
# Pedidos de token por minuto, por usuário e por instância (padrão: 30; 0 desliga)
seedgrid.realtime.connect-rate-per-minute=30
```

## 8. Receitas

- **Desligar em um ambiente**: `SEEDGRID_REALTIME_ENABLED=false` (ou não definir). A tela recebe `{enabled:false}` e fica no polling.
- **Restringir assinaturas a poucos channels**: `SEEDGRID_REALTIME_CHANNELS=backup,report`.
- **Remover o limite de emissão** (ex.: testes de carga): `SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE=0`.
- **Pulse em rede interna**: aponte `pulse.base-url` para o endereço interno; o front usa o `connectUrl` devolvido pelo Pulse (não configurado aqui).

## 9. Dúvidas e lacunas

- O formato aceito de `Duration` além do ISO-8601 depende do conversor do SmallRye/Quarkus (Não confirmado neste repositório).
- Não há validação local de `token-ttl` (negativo/zero); o comportamento fica a cargo do Pulse (Não confirmado).
- Com várias réplicas, o limite de `connect-rate-per-minute` é por instância (Inferência).
