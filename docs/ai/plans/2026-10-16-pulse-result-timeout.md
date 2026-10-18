---
titulo: "Plano: prazo de execução (resultTimeoutSeconds) no Pulse"
status: concluido
data: 2026-10-16
autor: sessão seedgrid-ai
modulos: [pulse]
adrs: []
---

# Plano: prazo de execução (`resultTimeoutSeconds`) no Pulse

Status: **IMPLEMENTADO** no Pulse 0.3.0 (commit `9dcbdad`) e documentado na KB. Diferenças em relação a este plano: padrão `0` (sem prazo), coluna `NOT NULL DEFAULT 0` (e não nullable), log de tentativa `execution_retryable` com detalhe `result_timeout` (sem outcome próprio) e `result` tardio ignorado só enquanto a mensagem está `pending` com `lastExecutionError = "result_timeout"`. Texto original abaixo, mantido como histórico.

Status original: proposta, não implementada. Repositório alvo: `seedgrid-products/seedgrid-pulse` (analisado em `862d936`, versão 0.2.1). Quem implementa: sessão `correcao-pulse`, com aprovação do dono desse repositório (commit/push dispara deploy). A KB (`seedgridKB/SeedGrid/Produtos/Pulse`) descreve o item como **planejado** até existir o commit.

## 1. Problema

Tarefa `processed` que o consumidor recebeu (`ack` ⇒ `delivered`) e nunca respondeu com `result` fica `delivered` para sempre:

- `list_due_messages` (`delivery/repo.rs`, versão em memória e SQL do Postgres) só considera `status = 'pending'`, então o TTL não a expira.
- A DLQ só recebe por `result` (`permanent`, ou `retryable` com `attemptCount > maxAttempts`), que nunca chegou.
- Saída hoje: descarte manual em Pendências (`POST /backlog/discard`).

## 2. Comportamento desejado

Novo prazo, só para `deliveryMode: processed`, contado a partir de `delivered_at` (momento do `ack`):

1. Se passar `resultTimeoutSeconds` sem `result`, o servidor trata como `result: retryable` com `reason = "result_timeout"`:
   - incrementa `attempt_count` e agenda a próxima tentativa com o backoff da `deliveryPolicy` (volta a `pending`);
   - se `attempt_count > max_attempts` ⇒ `dead_letter` com `last_execution_error = "result_timeout"`.
2. Registrar no log de tentativas (`execution_retryable` com detail `result_timeout`, ver D5) e numa métrica (`delivery_result_timeout_total`).
3. `notification` e `acknowledged` não são afetados (não há `result`).

## 3. Mudanças (por camada)

**Protocolo e modelo**
- `src/models.rs`: `DeliveryPolicyInput.result_timeout_seconds: Option<u64>` (`resultTimeoutSeconds`); `validate()` rejeita `0` (422 `INVALID_MESSAGE_REQUEST`, mesma regra dos outros campos).
- `src/delivery/model.rs`: `DeliveryPolicy.result_timeout_secs`; `RetryPolicy.resolve` aplica padrão e teto (`min(cap)`, como `ttl_secs`); método `is_result_overdue(delivered_at, now)`.
- `PROTOCOL.md` e `openapi.yaml`: campo novo e a regra acima.

**Configuração**
- `src/config.rs` e `src/settings/model.rs`: `DELIVERY_RESULT_TIMEOUT_SECONDS` e `DELIVERY_RESULT_TIMEOUT_SECONDS_CAP` (editáveis em runtime, categoria `delivery`, como `DELIVERY_TTL_SECONDS`). Ver decisão D1 sobre o padrão.
- `RuntimeSettings`/`from_runtime_settings` e o JSON de `app.rs` (~linhas 423-437) incluem o campo novo (default e cap).

**Persistência**
- Nova migration `backend/migrations/tenant/0013_*.sql` (a pasta `migrations/` só tem `tenant/`; a última é a `0012_seed_pulse_trash_permissions.sql`): `ALTER TABLE notification_messages ADD COLUMN delivery_result_timeout_secs BIGINT` **nullable** (linhas existentes ficam `NULL` = sem prazo, preservando o comportamento atual).
- `delivery/repo.rs`: gravar/ler a coluna (memória e Postgres).

**Verificador**
- `delivered_at` é TEXT (epoch em segundos como string): no SQL use `CAST(delivered_at AS BIGINT) + delivery_result_timeout_secs <= $1`, protegendo vazio/não numérico como já é feito com `next_attempt_at`.
- **Separar "due para entrega" de "delivered vencida"** em `delivery/repo.rs` (trait ~linha 49, memória ~260, Postgres ~881; hoje o filtro é `status='pending'`): um método novo (ex.: `list_overdue_results(now)`) para as `delivered` vencidas. Elas **não** podem ser enfileiradas como `Work`, porque `process_once` tentaria reentregar uma mensagem já entregue.
- `delivery/service.rs`, em `poll_retries` (~linha 712): para cada `delivered` vencida, chamar **direto** `record_execution_result(id, None, RetryableFailure { reason: "result_timeout", retry_after_secs: None })`. Esse método já incrementa via `schedule_retry`, registra a tentativa e manda à DLQ via `mark_execution_dead_letter` quando `new_count > max_attempts`. O log sai com outcome `execution_retryable` e detail `result_timeout`; um outcome próprio `result_timeout` exigiria ramo novo (decidir, D5).
- `mark_delivered` reescreve `delivered_at` a cada `ack` (memória e Postgres), então o prazo reinicia a cada nova tentativa, como desejado.

**SDKs publisher (6)**: Java, Next, Dart, PHP, Rust, Delphi. Adicionar `resultTimeoutSeconds` ao tipo `DeliveryPolicy`/`TDeliveryPolicy` (Delphi: `0` = omitir), serialização, teste de serialização e README/CONFIGURATION de cada um.

**UI** (`frontend/seedgrid-pulse-ui`): mostrar o motivo `result_timeout` na tela da DLQ/mensagens e expor as duas configurações novas em Configurações.

## 4. Decisões que dependem do dono do produto

- **D1. Padrão.** Recomendação: **desligado por padrão na primeira versão** (`DELIVERY_RESULT_TIMEOUT_SECONDS=0` ou ausente = sem prazo), para não mudar o comportamento de tarefas longas já em uso; o operador liga e define o teto. Alternativa: padrão generoso (ex.: 3600 s). Um padrão curto reentrega tarefa ainda em execução e a executa duas vezes.
- **D2. `result` tardio** (chega depois do timeout). **Risco maior do que parece:** `record_execution_result` (`service.rs:607`) só tem guarda de estado terminal (~linha 624). Hoje um `result` que chega com a mensagem de volta em `pending` (retry agendado) é **aplicado como se fosse da tentativa atual**: um `success` tardio conclui a tarefa; um `retryable` conta de novo. Para ignorar o tardio é preciso uma guarda nova (ex.: só aplicar se `status == delivered`), e verificar que ela não quebra o fluxo atual em que o `result` pode chegar sem `ack` prévio (autoAck, ordem das mensagens). Exige teste dedicado. Recomendação: ignorar com erro idempotente **se** a guarda se mostrar segura; senão, manter o comportamento atual e documentar.
- **D3. Mensagens `delivered` já existentes** na migração: recomendação `NULL` (sem prazo) para as antigas; operador usa o descarte manual.
- **D4. Nome dos campos e variáveis**: os acima são sugestão.
- **D5. Outcome do log de tentativas**: reaproveitar `execution_retryable` (detail `result_timeout`, sem código novo) ou criar o outcome `result_timeout` (ramo próprio). Recomendação: reaproveitar.

## 5. Testes mínimos

- Unidade (`delivery/mod.rs`, estilo dos cenários existentes): timeout com tentativas sobrando ⇒ `pending` + `attempt_count` +1 + `next_attempt_at`; timeout com tentativas esgotadas ⇒ `dead_letter` com `result_timeout`; `notification`/`acknowledged` ignorados; `result` tardio (D2); `0` e acima do teto (validação 422 e redução ao teto).
- Postgres: migration aplica; linha antiga (`NULL`) não expira; `list_due_messages` retorna a `delivered` vencida.
- SDKs: serialização do campo novo (omitido quando ausente).
- Integração (`integration/seedgrid-pulse-sdk-it`): publicar `processed` com `resultTimeoutSeconds` pequeno, receber sem responder, ver a DLQ com `result_timeout`.

## 6. Entrega e KB

- Versão minor do Pulse (campo novo, migration).
- Ao commitar, enviar à sessão `seedgrid-ia-d9`: hash, nomes finais, decisões D1 a D4. Ela confere no código e troca na KB o item "planejado" pelo comportamento real (`Protocolo-e-API`, `SDKs`, `Servidor/Configuracao`, `Operacao`) e depois publica no `seedgrid-ai`.
