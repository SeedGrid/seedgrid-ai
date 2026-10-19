# Plano — Eventos em tempo real com o SeedGrid Pulse (fim do polling)

Data: 2026-10-03, revisado em 2026-10-04 (token curto) e em 2026-10-08 (realtime vira peça da plataforma, em Java
**e** Rust; evento neutro; front no fe-components). **Fases 1 a 6 feitas e tudo publicado (2026-10-08)**; sobram os cenários extras do E2E e as duas decisões abertas. Vale para os dois boilerplates
(`login-tenancy` e `subdomain-tenancy`); cópia idêntica nos dois `docs/`.

Legenda: `[ ]` pendente · `[x]` feito · `[?]` decisão do usuário.

**Depende de:** `seedgrid-products/seedgrid-pulse/docs/plano-chave-de-projeto-e-token-de-conexao.md` — **feito e em
produção** (2026-10-07): chave `project` publica e emite token; token `pct_` curto vale **só para entrar**; a conexão
segue até cair ou a credencial ser revogada (fechamento `4403`, terminal).

## Problema

A tela de exports do admin (`admin/app/exports/export_list/page.tsx`) busca a lista inteira a cada 4 s
(`setInterval`) para descobrir quando o backup terminou. Cada tela nova com processo demorado (relatórios,
importações...) repetiria isso.

## As peças (e o que cada uma faz)

| Peça | Onde | Papel |
|---|---|---|
| Pulse (backend + UI) | `seedgrid-products/seedgrid-pulse` | entrega as mensagens; contas e chaves |
| SDK publisher (Java, Rust, ...) | `seedgrid-pulse/components/publishers` | falar com o Pulse: publicar, emitir token |
| SDK subscriber (React, ...) | `seedgrid-pulse/components/subscribers` | conectar com token, receber, reconectar |
| `seedgrid-quarkus-ext-realtime` | `seedgrid-platform/java` | **novo.** Cola entre a sessão da plataforma e o publisher Java |
| `seedgrid-rust-crate-realtime` | `seedgrid-platform/rust` | **novo.** O mesmo, em Rust, com o mesmo contrato |
| `SgRealtimeProvider` + `useSgRealtimeEvent` | `seedgrid-platform/front/seedgrid-fe-components` | **novo.** Front genérico em cima do subscriber React |

`seedgrid-pulse/integration/seedgrid-pulse-sdk-it` **não** é peça do produto: é a bancada de testes do Pulse.

A extension de realtime faz três coisas no backend do produto:

1. **`POST /realtime/connect`** (autenticado; o backend do boilerplate não tem prefixo REST — a BFF expõe
   `/api/realtime/connect` e repassa): o usuário logado pede o token dele. O `subject` sai da sessão
   (`publicId`), nunca do request; a chave de projeto fica no env do backend. Devolve
   `{ enabled: true, token, expiresAt, connectUrl, channels }` ou `{ enabled: false }`.
2. **`RealtimePublisher.publishToUser(channel, event, userPublicId, data)`** pronto para injetar; no-op quando
   desligado; nunca propaga erro do Pulse.
3. **Escuta o evento neutro** "terminou o processo X para o usuário Y" e publica.

## Desenho

```
pedir token (a cada conexão/reconexão):
  front (SgRealtimeProvider) ──POST /api/realtime/connect (sessão)──▶ ext-realtime ──(chave do projeto)──▶ Pulse
                             ◀──────────── { token, connectUrl } ──────────────

receber (WebSocket aberto, direto no Pulse):
  front ◀════════ wss://pulse/.../connect?access_token=<token> ════════ Pulse

publicar (quando o backup termina, depois do commit):
  ext-backup ──(evento neutro)──▶ ext-realtime ──(chave do projeto)──▶ Pulse ──▶ só as conexões do usuário
```

- **Chave do projeto:** uma por boilerplate (conta "SeedGrid" no Pulse; chaves `project` "Boilerplate login-tenancy"
  e "Boilerplate subdomain-tenancy"). Só no env do backend. Nunca no front, nas BFFs ou na extension.
- **Token de conexão:** curto, de um usuário, só para receber; vale só para entrar. Fica em memória no cliente.
- **Clientes sem BFF** (Flutter, Angular) chamam o mesmo `POST /api/realtime/connect` direto no backend. Os apps
  Next chegam nele pela BFF, como em toda rota `/api`.
- **Não há conexão Pulse na BFF:** o cliente conecta direto no Pulse.

## Contrato no Pulse

| Conceito | Uso aqui |
|---|---|
| conta | o dono ("SeedGrid") |
| chave `project` | o boilerplate; publica e emite tokens só dentro da conta |
| token de conexão | um usuário (`subject` = `publicId`, UUID global; vale também no subdomain-tenancy) |
| channel | o assunto: `backup` (depois `report`, `import`...) |
| event | `backup.finished.success` · `backup.finished.error` |
| target | `user` = `publicId` de quem pediu o export (`export_jobs.create_user_public_id`) |
| data | só identificadores: `{ "exportPublicId": "...", "status": "DONE" \| "FAILED" }` |

**O evento só avisa; não carrega dados.** A tela busca o registro pela API REST de sempre: a permissão continua
sendo checada no backend e não existe uma segunda fonte de verdade.

## Regras

1. **O `subject` do token vem da sessão**, nunca de parâmetro do request.
2. **A extension de backup não depende do Pulse nem da de realtime.** Ela só emite o evento neutro.
3. **A extension de realtime é genérica:** não conhece nenhuma extension de negócio.
4. **Polling continua como reserva.** Realtime desligado, Pulse fora do ar ou conexão caída → a tela volta ao
   polling, mais espaçado.
5. **Publicar depois do commit.** O evento só sai com `DONE`/`FAILED` já gravado.
6. **Falha ao publicar não derruba o processo de negócio.** Loga e segue; a reserva de polling cobre.
7. **Java é a fonte da verdade; Rust tem o mesmo contrato** (rota, corpo, config, eventos).

---

## Fase 1 — Evento neutro e disparo no backup

O evento é genérico ("algo terminou para o usuário Y"), não `ExportFinishedEvent`: assim relatório, importação etc.
ganham realtime só emitindo o mesmo evento, sem código no host.

- [x] **Java:** `br.com.seedgrid.commons.events.SgUserEvent(userPublicId, channel, event, data)` no
      `seedgrid-commons` **2026.10.08** (instalado só local). O `ExportService` do backup (que passou a usar essa
      versão) o dispara DENTRO das transações que gravam `DONE` e `FAILED`; job sem dono não avisa ninguém.
- [x] **Rust:** `seedgrid_runtime::events::{SgUserEvent, UserEventSink, NoopUserEventSink}`. O `ExportService` da
      crate de backup recebe o sink por `with_user_event_sink` (Noop por padrão; `new` não mudou) e
      `BackupOverrides.user_events`; avisa depois do `update` que grava `DONE`/`FAILED`. O orquestrador do
      `subdomain-tenancy` repassa o sink (`PlatformOverrides.user_events`), como o Java faz sozinho pelo CDI.
- [x] Não mexe no aviso por e-mail atual: os dois avisos convivem.
- [x] Testes: Java `ExportUserEventIT` (2) — o observer `AFTER_SUCCESS` lê o banco por JDBC e já vê
      `DONE`/`FAILED`; backup 39/39. Rust `user_event_it` (3, inclui job sem dono) — o sink lê o banco no aviso;
      ITs do backup 27/27. Nos dois, tirar o disparo derruba o teste.

## Fase 2 — `seedgrid-quarkus-ext-realtime` e `seedgrid-rust-crate-realtime`

- [x] Dependem do SDK publisher da linguagem: `br.com.seedgrid:seedgrid-pulse-publisher` **2026.10.0** (subiu de
      2026.09.0 com a API nova; instalado só local) / `seedgrid-pulse-publisher-rust` por path.
- [x] `seedgrid-quarkus-ext-realtime` **2026.10.08** (repo git novo, sem remote; instalada só local) e
      `seedgrid-rust-crate-realtime` (membro do workspace Rust).
- [x] Config (env), a mesma nos dois (o Rust aceita a duração como o Quarkus: `PT5M`, `300`, `5m`):
  - `SEEDGRID_REALTIME_ENABLED` (padrão `false`)
  - `SEEDGRID_REALTIME_PULSE_BASE_URL` — URL do Pulse vista pelo backend
  - `SEEDGRID_REALTIME_PULSE_PROJECT_KEY` — **segredo**; a chave `project`
  - `SEEDGRID_REALTIME_TOKEN_TTL` (padrão `PT5M`)
  - `SEEDGRID_REALTIME_CHANNELS` (padrão: todos) · `SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE` (padrão `30`)
- [x] `POST /realtime/connect` (o host põe o prefixo: `/api/realtime/connect`), autenticado, `subject` da sessão
      (Java: `CurrentUserProvider`; Rust: `RealtimeIdentityResolver` do host, como no backup), limite por usuário
      (429 + `Retry-After`), 503 com o Pulse fora. `expiresAt` em **segundos desde a época**, como o Pulse — é o que
      os 5 SDKs subscriber leem (a primeira versão devolvia ISO e quebraria todos eles).
- [x] `RealtimePublisher.publishToUser(...)`; no-op desligado; nunca propaga erro do Pulse (publica assíncrono).
- [x] Java: observer `@Observes(during = AFTER_SUCCESS) SgUserEvent`. Rust: `RealtimePublisher` é o `UserEventSink`.
- [x] Testes. Java 9/9 (WireMock no papel do Pulse; desligado num perfil à parte). Rust 13/13 (`wiremock`) + **e2e
      contra o Pulse real** (`tests/pulse_e2e_it.rs`): o SDK subscriber pega o token no `connect` da crate, conecta,
      e o aviso chega a quem pediu e não a outro usuário da mesma conta. Mutações derrubam os testes nos dois.
- [x] Docs: README nos dois.

## Fase 3 — Host dos boilerplates

- [x] Cascata local (regra do `backend/pom.xml`: não pinar lib da fundação no host): backup **2026.10.08** →
      `seedgrid-quarkus-ext-login-tenancy` **2026.10.08** (backup e commons 2026.10.08; testes 24 + 11 verdes; leva
      junto o WIP que estava no repo dela) → boilerplate com `seedgrid.login-tenancy.version` 2026.10.08. Tudo
      `mvn install` local.
- [x] `seedgrid-realtime` 2026.10.08 no `backend/pom.xml`. **Nenhum código no host.**
- [x] `dev.env.example` com `SEEDGRID_REALTIME_*` (desligado; chave como `TROQUE-ME`).
- [x] Verificado com o backend de verdade (`run.sh`, banco descartável `seedgrid_app_realtime_e2e`, Pulse do
      `run.sh` do seedgrid-pulse, conta "SeedGrid" + chave `project` "Boilerplate login-tenancy"): feature
      `seedgrid-realtime` instalada; `/realtime/connect` → 401 sem login e token `pct_` logado; `POST /exports` →
      job DONE → o Pulse recebeu `backup.finished.success` para `user` = `sub` do JWT, com `exportPublicId`/`status`.

## Fase 4 — Front genérico no `seedgrid-fe-components`

- [x] Dependência `@seedgrid/pulse-subscriber-react` (só o `/core`), por `link:` local até publicar; embutida no
      bundle do playground (`tsup.sandbox.config.ts`), porque não está no npm.
- [x] `SgRealtimeProvider` (`src/realtime`): pede o token a `tokenEndpoint` (padrão `/api/realtime/connect`); com
      `{enabled:false}` nem abre o WebSocket; conecta, assina os `channels`, reconecta (token novo a cada conexão),
      para no `4403`, desconecta ao desmontar/`enabled=false`. Token só em memória. Status: `idle`, `disabled`,
      `connecting`, `connected`, `reconnecting`, `unavailable`, `auth-error`.
- [x] Hooks `useSgRealtimeEvent(channel, events, handler)` (nome, lista, `prefixo.*`, `*`) e `useSgRealtimeStatus()`
      (`{ status, connected }`; fora do provider, `disabled`).
- [x] Showcase: páginas do provider (simulador ao vivo com WebSocket de demonstração, layout com BFF, polling de
      reserva, `SgPlayground`) e dos dois hooks; menu, 5 idiomas, `.meta.ts` no manifesto de IA. Aberto no
      navegador: conecta e os cliques viram exatamente os avisos esperados.
- [x] Testes (`tests/realtime-dom.test.mjs`, WebSocket fingido): conecta com o token na query e entrega só o
      channel/evento pedidos; desligado não conecta; token falhando → `unavailable`; `4403` → `auth-error` sem
      reconectar nem pedir token; sem provider → `disabled`. Pacote 260/260; showcase com tipagem, snippets e
      contratos verdes. Tirar o filtro de channel derruba o teste.
- [x] Rota BFF `app/api/realtime/connect` → backend `POST /realtime/connect`, no `admin` e no `frontend`.

## Fase 5 — Primeiro caso: exports (admin)

- [x] `export_list`: `useSgRealtimeEvent("backup", "backup.finished.*")` → recarrega a lista e mostra aviso
      ("Backup pronto para download" / "O backup falhou").
- [x] Polling **só** quando o realtime não está conectado **e** há job em andamento; reserva de 15 s (antes: 4 s,
      sempre). `SgRealtimeProvider` no `Providers.tsx` do admin, channel `backup`, só com sessão válida.
- [ ] [?] Aviso também fora da tela de exports (toast global).

## Fase 6 — Replicar, documentar, verificar

- [x] Mesmas mudanças no `subdomain-tenancy`: extension `seedgrid-subdomain-tenancy` 2026.10.08 (backup e commons
      2026.10.08), `seedgrid-realtime` no `backend/pom.xml`, `SEEDGRID_REALTIME_*` no `dev.env.example`, BFF
      `/api/realtime/connect` no admin e no frontend, Fase 5 no admin.
- [ ] [?] Pulse no compose de dev ou à parte, do repo do Pulse.
- [x] Doc `docs/eventos-em-tempo-real.md`: emitir um evento novo no backend e reagir a ele numa tela.
- [x] E2E do caminho feliz (login-tenancy, versões publicadas, Pulse local, Playwright): login → `/realtime/connect`
      → WebSocket assinado em `backup` → `POST /exports` → `backup.finished.success` chega pelo WebSocket em ~1 s →
      toast "Backup pronto" e a linha vira "Pronto" sem polling.
- [ ] E2E, cenários que faltam: outro usuário logado não recebe (coberto hoje só pelo e2e da crate Rust); Pulse
      desligado → polling de reserva; backup com erro → `backup.finished.error`; chave revogada → `4403` e volta ao
      polling (o `4403` está coberto no teste do `SgRealtimeProvider`, não ponta a ponta).

## Distribuição dos SDKs

**Publicado em 2026-10-08**, na ordem das dependências: `seedgrid-pulse-publisher` 2026.10.0 (Maven Central) →
`@seedgrid/pulse-subscriber-react` 3.0.0 (npm; a 2.0.0 nunca foi publicada) → commons, backup, `seedgrid-realtime`,
login-tenancy e subdomain-tenancy 2026.10.08 (Maven Central) → `@seedgrid/fe-components` 2026.10.0 (npm, pelo GHA) →
boilerplates nas versões publicadas. Nada depende mais de `mvn install` ou de `link:` local.

## Decisões abertas

1. Aviso global de "backup pronto" fora da tela de exports.
2. Pulse no compose de dev ou à parte.

## Ordem

Fase 1 → 2 → 3 → 4 → 5 → 6.
