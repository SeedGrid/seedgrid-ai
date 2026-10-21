---
description: "Como usar o Mailpit local de um produto SeedGrid: ver o e-mail que o produto mandou, apontar o SMTP (mailers security, subdomaintenancy e backup), consultar pela API em teste automatizado (Awaitility), diagnosticar e-mail que não chega. Só desenvolvimento e teste. Leia ao testar convite, confirmação de cadastro ou recuperação de senha."
tags: [seedgrid, host, mailpit, e-mail, teste, produto-novo]
analisado-em: 2026-10-21
---

# Usar o Mailpit no desenvolvimento e nos testes

O serviço (imagem, portas e variáveis) está em [[SeedGrid/Extensions/Servicos-de-apoio|Serviços de apoio]]. Esta nota é o **uso**.

Como foi conferido: cada comando, propriedade e trecho de código abaixo foi executado contra `axllent/mailpit:v1.31.6` (Podman) com Quarkus 3.30.6, num projeto descartável com o mailer nomeado `security`. O que não deu para provar está marcado **[não verificado]**. Fontes no código: `seedgrid-quarkus-ext-security` (`SecurityMailerConfig`, `DefaultEmailService`, `EmailDeliveryAlertService`, `META-INF/microprofile-config.properties`, `docs/EMAIL_CONFIGURATION.md`), `seedgrid-quarkus-ext-subdomain-tenancy` (`MailerNotificationService`, `microprofile-config.properties`) e `seedgrid-quarkus-ext-backup` (`microprofile-config.properties`).

> **Mailpit é só para desenvolvimento e teste. Nunca em produção.** Ele aceita qualquer usuário e senha (inclusive nenhum), não usa TLS e guarda tudo na memória do container. Em produção o SMTP é de verdade: `START_TLS=REQUIRED`, remetente de domínio verificado e a senha vem de segredo do ambiente, nunca de arquivo versionado.

## Como vejo o e-mail que o produto mandou?

Abra a interface do Mailpit no navegador:

| Modelo do produto | Interface e API | SMTP (do host da máquina) |
|---|---|---|
| login-tenancy | http://127.0.0.1:8025 | `localhost:1025` |
| subdomain-tenancy | http://127.0.0.1:8026 | `localhost:1026` |

- As portas só escutam em `127.0.0.1` (o compose publica assim). A interface e a API são a mesma porta.
- A caixa é **única**: todo e-mail enviado aparece, qualquer que seja o destinatário. Pode cadastrar `joao@lck-demo.com.br` ou `qualquer@coisa.com`; nada sai para a internet.
- O que o produto manda (**Confirmado** em `DefaultEmailService` e `docs/EMAIL_CONFIGURATION.md`): confirmação de e-mail do cadastro, boas-vindas com senha temporária, recuperação de senha, código de 2FA por e-mail e convite de self-enter. O subdomain-tenancy manda também a confirmação de e-mail do tenant (`MailerNotificationService`).
- Os links dentro do e-mail apontam para `seedgrid.security.frontend.base-url` (padrão `http://localhost:3000`); para abrir o link, o front precisa estar nesse endereço.
- Recriar o container (`down` e `up`) esvazia a caixa: o banco do Mailpit fica em `/tmp` dentro do container (**Confirmado** em `/api/v1/info`). Se um simples `stop` e `start` também esvazia: **[não verificado]**.

## Como aponto o SMTP do host para o Mailpit?

O `dev.env` que a skill `sg-new-product` gera já faz isso. Para o login-tenancy:

```properties
# backend/dev.env (login-tenancy): o boilerplate lê SECURITY_MAILER_* e repassa para seedgrid.security.mailer.*
SECURITY_MAILER_FROM=Meu Produto <security@eu-dev.com.br>
SECURITY_MAILER_HOST=localhost
SECURITY_MAILER_PORT=1025
SECURITY_MAILER_START_TLS=DISABLED
SECURITY_MAILER_USERNAME=security@eu-dev.com.br
SECURITY_MAILER_PASSWORD=<qualquer valor; o Mailpit não confere>
```

No subdomain-tenancy a porta é `1026`. O produto tem até **três mailers nomeados**, cada um com o seu bloco; o e-mail só sai pelo mailer que a extension usa:

| Extension | Mailer nomeado (`@MailerName`) | Propriedades da extension | Variável de ambiente da extension |
|---|---|---|---|
| security | `security` | `seedgrid.security.mailer.*` | `SEEDGRID_SECURITY_MAILER_*` |
| subdomain-tenancy | `subdomaintenancy` | `seedgrid.subdomain-tenancy.mailer.*` | `SEEDGRID_SUBDOMAIN_TENANCY_MAILER_*` |
| backup | `backup` | `seedgrid.backup.mailer.*` | `SEEDGRID_BACKUP_MAILER_*` |

Cada extension faz a ponte `quarkus.mailer."<nome>".<campo>=${seedgrid.<extension>.mailer.<campo>}` para `from`, `host`, `port`, `start-tls`, `username`, `password` e `auth-methods`. O mailer padrão (`quarkus.mailer.*`, sem nome) **não** é usado pelas extensions. Se o host definir `quarkus.mailer."security".<campo>` direto, esse valor vence a ponte.

**Por que `START_TLS=DISABLED`.** O padrão das extensions é `REQUIRED`. Contra o Mailpit isso falha na hora, com `STARTTLS required but not supported by server` (executado). Também não precisa de usuário e senha: o Mailpit do compose sobe com `MP_SMTP_AUTH_ACCEPT_ANY=1` e `MP_SMTP_AUTH_ALLOW_INSECURE=1`; o `dev.env` traz `username`/`password` só para o código que os lê continuar igual ao de produção.

**Por que `mock=false` nos testes.** O Quarkus tem o modo mock (`quarkus.mailer.mock`): com ele ligado o e-mail não sai pelo SMTP e fica numa caixa em memória (`MockMailbox`). Medido no Quarkus 3.30.6:

| Mailer | `mock` não definido | `mock=true` |
|---|---|---|
| sem nome (`quarkus.mailer.*`) | em teste: **não envia** (mock ligado sozinho) | não envia |
| nomeado `security` | em teste, em `quarkus:dev` e em JAR: **envia** pelo SMTP | **não envia**, sem erro nenhum |

Ou seja, o mailer `security` só deixa de usar o SMTP se alguém ligar o mock de propósito. Isso acontece de verdade: os testes unitários da `login-tenancy` fixam `quarkus.mailer.mock=true` e `quarkus.mailer."security".mock=true`. Então, em um teste que lê o Mailpit, declare `quarkus.mailer."security".mock=false` explicitamente (o teste de integração da `notification` faz o mesmo), para que um `mock=true` herdado de um `application.properties` de teste não esconda o e-mail. O mock ligado por padrão em dev e teste vale, portanto, para o mailer sem nome, e **não** foi observado no mailer nomeado na versão 3.30.6. Em outras versões do Quarkus: **[não verificado]**.

## Como consulto o e-mail num teste automatizado?

A API do Mailpit (v1), na mesma porta da interface (todos os comandos foram executados):

| Para quê | Comando |
|---|---|
| Listar | `curl -s http://127.0.0.1:8025/api/v1/messages` (campos: `total`, `messages[]` com `ID`, `Subject`, `From`, `To`, `Snippet`, `Created`) |
| Ler a mensagem mais recente | `curl -s http://127.0.0.1:8025/api/v1/message/latest` (campos: `Subject`, `From`, `To`, `HTML`, `Text`) |
| Ler uma mensagem | `curl -s http://127.0.0.1:8025/api/v1/message/<ID>` |
| Buscar por destinatário | `curl -s -G http://127.0.0.1:8025/api/v1/search --data-urlencode "query=to:joao@lck-demo.com.br"` |
| Apagar tudo (entre testes) | `curl -s -X DELETE http://127.0.0.1:8025/api/v1/messages` (resposta `ok`) |

No subdomain-tenancy troque `8025` por `8026`. Atenção: a leitura é `/api/v1/message/<ID>` (singular); a lista e a exclusão são `/api/v1/messages` (plural).

Dependência de teste (sem versão: o BOM do Quarkus gerencia o Awaitility):

```xml
<dependency>
    <groupId>org.awaitility</groupId>
    <artifactId>awaitility</artifactId>
    <scope>test</scope>
</dependency>
```

Cliente mínimo (usa `java.net.http` e o Jackson que o Quarkus já traz):

```java
public class MailpitClient {
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();
    private final String base;

    public MailpitClient(String base) { this.base = base; }

    private JsonNode get(String caminho) throws Exception {
        HttpResponse<String> r = http.send(
                HttpRequest.newBuilder(URI.create(base + caminho)).GET().build(), HttpResponse.BodyHandlers.ofString());
        if (r.statusCode() != 200) throw new IllegalStateException("Mailpit " + r.statusCode() + " em " + caminho);
        return json.readTree(r.body());
    }

    public int total() throws Exception { return get("/api/v1/messages").get("total").asInt(); }

    public JsonNode buscar(String consulta) throws Exception {
        return get("/api/v1/search?query=" + URLEncoder.encode(consulta, StandardCharsets.UTF_8)).get("messages");
    }

    public JsonNode ler(String id) throws Exception { return get("/api/v1/message/" + id); }

    public void apagarTudo() throws Exception {
        http.send(HttpRequest.newBuilder(URI.create(base + "/api/v1/messages")).DELETE().build(), HttpResponse.BodyHandlers.discarding());
    }
}
```

Teste: esvazie a caixa antes, dispare a ação e **espere pela condição**, nunca por um tempo fixo:

```java
@QuarkusTest
@TestProfile(EmailRealTest.SmtpReal.class)
class EmailRealTest {
    public static class SmtpReal implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of("quarkus.mailer.\"security\".mock", "false");
        }
    }

    final MailpitClient mailpit = new MailpitClient("http://127.0.0.1:8025");

    @BeforeEach
    void limparCaixa() throws Exception { mailpit.apagarTudo(); }

    @Test
    void conviteChegaNoMailpit() throws Exception {
        // ...dispare a ação do produto que manda o e-mail (ex.: o convite de self-enter)...

        await().atMost(Duration.ofSeconds(10)).pollInterval(Duration.ofMillis(200))
                .until(() -> mailpit.total() == 1);

        JsonNode resumo = mailpit.buscar("to:alguem@lck-demo.com.br").get(0);
        JsonNode msg = mailpit.ler(resumo.get("ID").asText());
        assertEquals("Convite", msg.get("Subject").asText());
        assertTrue(msg.get("HTML").asText().contains("token="));
    }
}
```

- Esvaziar a caixa em cada teste evita contar e-mail de teste anterior. Se os testes rodarem em paralelo, filtre por destinatário único (`to:`) em vez de contar o total.
- `Thread.sleep` só serve para provar **ausência** (teste negativo), em que não existe condição a esperar.
- O Mailpit precisa estar de pé antes do teste (`docker compose up -d mailpit`; no Podman, `podman compose up -d mailpit`). Subir o Mailpit pelo Testcontainers (`GenericContainer("axllent/mailpit:v1.31.6")` expondo 1025 e 8025) **[não verificado]**. O teste de integração da própria extension `notification` ainda usa MailHog (`mailhog/mailhog:v1.0.1`, API `/api/v2/messages`); o formato da API é outro, não copie dali.
- Estes exemplos (cliente, `@TestProfile` com `mock=false`, Awaitility e leitura da mensagem) rodaram como teste `@QuarkusTest` contra o Mailpit real e passaram.

## O e-mail não chegou. O que olho?

| Sintoma | Causa provável | Como conferir |
|---|---|---|
| Erro `Connection refused ... localhost/127.0.0.1:1026` (ou `:1025`) ao enviar | Porta errada para o modelo (1025 é login-tenancy, 1026 é subdomain-tenancy) ou container parado | `podman ps` / `docker ps` mostra `mailpit`? A porta do `dev.env` é a do compose? (os dois casos foram executados e dão a mesma mensagem) |
| Nenhum erro, mas a caixa fica vazia | `quarkus.mailer."security".mock=true` ligado em algum `application.properties` (de teste ou de perfil) | Procure `mock=true`. No teste, force `mock=false` (seção acima) |
| `STARTTLS required but not supported by server` | `START_TLS` ficou no padrão `REQUIRED` | `SECURITY_MAILER_START_TLS=DISABLED` (e o equivalente do subdomain-tenancy/backup) |
| Chega e-mail de um fluxo e não de outro | Mailer nomeado diferente: security, subdomaintenancy e backup têm blocos separados | Confira o bloco do mailer da extension que envia (tabela acima). O que acontece com um mailer nomeado sem `host` configurado: **[não verificado]** |
| Enviou, mas a interface não mostra | Interface errada (8025 x 8026) ou caixa esvaziada por um teste que chamou `DELETE` | Abra a porta do seu modelo; `curl http://127.0.0.1:<porta>/api/v1/info` mostra `Messages` e `SMTPAccepted` |
| A aplicação lança erro ao enviar | A falha vira log e **também** um evento `platform.email-delivery-failed` pelo `seedgrid-notification-api` (destinatário mascarado, um alerta por janela de `PT15M`, ajustável em `seedgrid.app.email-alert.window`); depois a exceção sobe | **Confirmado** em `DefaultEmailService` e `EmailDeliveryAlertService`. O alerta só sai de verdade se o motor `seedgrid-notification` estiver no produto |

## Em produção

Troque tudo, não só o host: SMTP real, `START_TLS=REQUIRED` (padrão), remetente de domínio verificado e a senha por segredo do ambiente (nunca no repositório). Os remetentes `@eu-dev.com.br` e a senha de demonstração do `dev.env` são só de desenvolvimento.
