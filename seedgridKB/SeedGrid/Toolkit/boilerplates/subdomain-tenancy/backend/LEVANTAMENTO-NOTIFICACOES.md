# Notificações nos boilerplates

Atualizado em 2026-09-29 após a integração com `seedgrid-notification`.

## Responsabilidades

`seedgrid-notification` é o runtime operacional: mantém regras, eventos aceitos,
entregas/outbox, tentativas, canais e os endpoints administrativos. `seedgrid-notification-api`
é o contrato transitivo usado pelos produtores. As entidades e migrations do notification não são
copiadas para os hosts.

O host declara somente os eventos de seu domínio e publica `NotificationEvent`. Hoje os dois
boilerplates registram ciclo de billing, falha de cotação e falha de entrega de e-mail. AI pricing
registra seus próprios eventos pela extensão produtora. Eventos de acesso ao usuário, confirmação
de e-mail, recuperação de senha e autenticação continuam em seus fluxos transacionais individuais.

## Integração e armazenamento

Os dois backends dependem do artefato instalado `seedgrid-notification` e importam o
BOM `seedgrid-notification-parent`. O host executa a migration embarcada da extensão em um histórico
dedicado `sg_flyway_schema_history_notification`, separado do histórico das migrations da aplicação.
No subdomain-tenancy, o bootstrap usa a conexão master e as entidades de notification são incluídas
na persistence unit master. No login-tenancy, usa-se a datasource única da aplicação.

Os endpoints expostos pela extensão são:

- `GET /admin/notifications/events`
- `PUT /admin/notifications/events/{code}`
- `GET /admin/notifications/deliveries`

O host semeia as permissões RBAC `NOTIFICATION_READ` e `NOTIFICATION_UPDATE` e associa ambas ao
papel `ADMIN`.

## UI administrativa

Os dois admins apresentam `/configuracao/notificacoes`. A página carrega o catálogo efetivamente
registrado no CDI; um evento ausente das extensões instaladas não aparece. Para cada evento, permite
habilitar/desabilitar e escolher EMAIL ou WHATSAPP, informando endereços, telefones em E.164 e o
identificador do canal WhatsApp. O BFF encaminha GET e PUT para os endpoints da extensão.

## Transição da configuração antiga

As migrations existentes `V1000..V1005` e `V2000..V2005` não foram reescritas: os checksums de
bancos já inicializados precisam continuar válidos. Elas ainda criam a tabela de billing antiga em
bancos novos. Depois de aplicar as migrations da aplicação e do notification, o bootstrap importa
somente configurações legadas editadas (`updated_at` preenchido), convertendo telefones domésticos
para E.164. Configurações apenas semeadas pelas migrations, incluindo destinatários de exemplo, não
são importadas. Em ambos os casos a inicialização remove a tabela antiga e as permissões
`BILLING_NOTIFY_*`.

## Verificação realizada

Os dois backends compilaram e empacotaram com `mvn -DskipTests package`; `TenantAuditScopeProviderTest`
passou no subdomain-tenancy. O TypeScript dos dois admins passou após regenerar os route types. Os
testes de integração que iniciam PostgreSQL via Testcontainers não foram executados, seguindo a
instrução de não iniciar serviços Podman.
