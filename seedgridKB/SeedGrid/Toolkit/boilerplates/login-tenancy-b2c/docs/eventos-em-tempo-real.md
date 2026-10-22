# Eventos em tempo real

Como avisar o usuário, na hora, que um processo demorado terminou — sem a tela ficar perguntando
de tempos em tempos. Cópia idêntica nos dois boilerplates (`login-tenancy` e `subdomain-tenancy`).

O primeiro caso pronto é a tela de exports do admin: quando o backup termina, a lista se atualiza
e aparece "Backup pronto para download". Este guia mostra como fazer o mesmo para um processo novo.

## Como funciona, em uma figura

```
backend do produto                                      SeedGrid Pulse              tela (admin/frontend)
──────────────────                                      ──────────────              ─────────────────────
seu serviço grava o resultado
  └─ dispara SgUserEvent ─▶ seedgrid-realtime ─(chave project)─▶ publica ─────▶ WebSocket do usuário
                            (depois do commit)                                     └─ useSgRealtimeEvent
                                                                                       └─ relê pela API REST

a tela, ao abrir:  SgRealtimeProvider ─▶ /api/realtime/connect (BFF) ─▶ backend /realtime/connect
                                       ◀─ token curto (pct_…) ◀───────────── emitido com a chave project
                   conecta direto no Pulse com esse token
```

Três ideias guiam tudo:

- **O aviso só avisa.** Ele leva identificadores (`exportPublicId`, `status`), nunca o conteúdo. A
  tela busca o registro pela API de sempre, onde a permissão continua sendo checada.
- **O processo de negócio não conhece o Pulse.** Ele dispara um evento CDI neutro
  (`SgUserEvent`); quem repassa ao Pulse é a extension `seedgrid-realtime`. Sem ela instalada ou
  com ela desligada, o evento simplesmente não vai a lugar nenhum.
- **O polling continua como reserva.** Realtime desligado, Pulse fora do ar ou conexão caída: a
  tela volta a consultar, mais espaçado.

## Ligar em desenvolvimento

Desligado, nada muda: o `/realtime/connect` responde `{ "enabled": false }`, o front nem abre o
WebSocket e as telas ficam no polling.

Para ligar:

1. Suba um Pulse (o `run.sh` do repositório `seedgrid-products/seedgrid-pulse`).
2. Na UI do Pulse, na conta do produto, crie uma chave do tipo **`project`** para este
   boilerplate. Ela é **segredo**: fica só no backend, nunca no front nem nas BFFs.
3. No `backend/dev.env`:

   ```
   SEEDGRID_REALTIME_ENABLED=true
   SEEDGRID_REALTIME_PULSE_BASE_URL=http://127.0.0.1:18080
   SEEDGRID_REALTIME_PULSE_PROJECT_KEY=<a chave project>
   SEEDGRID_REALTIME_TOKEN_TTL=PT5M
   ```

   Use `127.0.0.1`, não `localhost`, para o Pulse local. Opcionais:
   `SEEDGRID_REALTIME_CHANNELS` (channels que o token deixa assinar; padrão: todos) e
   `SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE` (padrão `30`).

4. Suba o backend e abra o admin. Na tela de exports, peça um backup: a linha passa para "Pronto"
   sozinha e aparece o aviso.

## Emitir um evento novo (backend)

Exemplo: um relatório que é gerado em segundo plano e precisa avisar quem pediu.

```java
import br.com.seedgrid.commons.events.SgUserEvent;
import jakarta.enterprise.event.Event;

@ApplicationScoped
public class ReportService {

    static final String CHANNEL = "report";

    private final Event<SgUserEvent> userEvents;

    public ReportService(Event<SgUserEvent> userEvents) {
        this.userEvents = userEvents;
    }

    @Transactional
    public void finish(ReportJob job) {
        job.markDone();                       // grava o resultado...
        userEvents.fire(new SgUserEvent(      // ...e avisa DENTRO da mesma transação
                job.getRequesterPublicId(),
                CHANNEL,
                "report.finished.success",
                Map.of("reportPublicId", job.getPublicId())));
    }
}
```

Regras:

- **Dispare dentro da transação que grava o resultado.** A extension observa com
  `AFTER_SUCCESS`: o aviso só sai depois do commit, quando a API já devolve o estado novo. Se a
  transação fizer rollback, nada é enviado.
- **`userPublicId` é o `publicId` de quem deve ser avisado** — normalmente quem pediu o processo.
  Processo sem dono (disparado pelo sistema) não avisa ninguém: não dispare.
- **`data` leva só identificadores.** Nada de nome de cliente, valor, link de download.
- **Nome do evento:** `<channel>.<o que aconteceu>.<resultado>`, por exemplo
  `report.finished.success` e `report.finished.error`. A tela pode ouvir `report.finished.*`.
- **Falhar ao publicar não derruba o processo.** A extension publica de forma assíncrona e só
  registra o erro; o polling de reserva cobre.

Nenhuma configuração extra no host: instalar a `seedgrid-realtime` (já está no `backend/pom.xml`)
basta para qualquer `SgUserEvent` chegar ao Pulse.

## Reagir na tela (front)

### 1. Assinar o channel

O provider fica no `app/components/Providers.tsx`. Acrescente o channel novo na lista:

```tsx
const REALTIME_CHANNELS = ["backup", "report"];
```

A conexão só abre com sessão válida; na tela de login ela fica fechada.

### 2. Ouvir o evento na tela

```tsx
import { useSgRealtimeEvent, useSgRealtimeStatus } from "@seedgrid/fe-components";

const FALLBACK_POLL_MS = 15000;

const { connected: realtimeConnected } = useSgRealtimeStatus();

useSgRealtimeEvent("report", "report.finished.*", (event) => {
  if (event.event === "report.finished.success") {
    toast.success("Relatório pronto.");
  } else {
    toast.error("O relatório falhou.");
  }
  void load(); // relê pela API de sempre
});

// Polling só como reserva: realtime fora do ar e algum job em andamento.
useEffect(() => {
  if (realtimeConnected || !jobs.some((job) => isActive(job.status))) {
    return;
  }
  const timer = window.setInterval(() => void load(), FALLBACK_POLL_MS);
  return () => window.clearInterval(timer);
}, [jobs, load, realtimeConnected]);
```

- `useSgRealtimeEvent(channel, events, handler)`: `events` aceita um nome, uma lista,
  `prefixo.*` ou `*`. O `handler` recebe `{ channel, event, data, messageId, publishedAt }`.
- `useSgRealtimeStatus()` devolve `{ status, connected }`. `connected` é `false` com o realtime
  desligado, conectando, caído ou com a credencial revogada — é o sinal para cair no polling.

O exemplo completo é a tela `admin/app/exports/export_list/page.tsx`. As páginas
`SgRealtimeProvider`, `useSgRealtimeEvent` e `useSgRealtimeStatus` do showcase do fe-components
têm um simulador que roda sem Pulse.

### Clientes sem BFF (Flutter, Angular)

Chamam `POST /realtime/connect` direto no backend, com a sessão do usuário, e conectam no Pulse
com o SDK subscriber da linguagem usando o `token` e o `connectUrl` da resposta. O contrato da
resposta está no README da `seedgrid-quarkus-ext-realtime`.

## Testar

- **Backend:** teste de integração que executa o processo e observa o `SgUserEvent` com
  `@Observes(during = TransactionPhase.AFTER_SUCCESS)`, conferindo no banco que o estado já está
  gravado quando o aviso chega. Modelo: `ExportUserEventIT` na extension de backup. Tire o
  `fire(...)` e veja o teste falhar.
- **Ponta a ponta:** com o Pulse local ligado, peça o processo na tela e confira que a lista se
  atualiza sem requisições repetidas na aba de rede e que o aviso aparece. Desligue o Pulse e
  confirme que a tela volta ao polling.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `/api/realtime/connect` devolve `{ "enabled": false }` | `SEEDGRID_REALTIME_ENABLED` não está `true` no backend. |
| `/api/realtime/connect` dá 503 | O backend não alcança o Pulse em `SEEDGRID_REALTIME_PULSE_BASE_URL`. |
| `/api/realtime/connect` dá 429 | Limite de pedidos de token por usuário (`SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE`). |
| Conecta, mas o aviso nunca chega | Channel fora de `REALTIME_CHANNELS` (front) ou de `SEEDGRID_REALTIME_CHANNELS` (backend); ou o `userPublicId` do evento não é o do usuário logado. |
| A conexão fecha com `4403` e não volta | A chave `project`, a conta ou a credencial foi revogada no Pulse. É definitivo: gere outra chave. A tela fica no polling. |
