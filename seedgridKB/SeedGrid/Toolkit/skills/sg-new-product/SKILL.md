---
name: sg-new-product
description: Cria um produto SeedGrid novo na pasta corrente - entrevista fixa (matriz determinística), script que gera backend, frontend, admin, dev.env, docker-compose, Dockerfile e workflow, e depois plano, ADRs e documentos em docs/ai/. Use SEMPRE, como primeira ação, quando pedirem produto novo, projeto novo, sistema novo ou "começar um produto" SeedGrid, antes de acionar o arquiteto, de explorar outras pastas ou de escrever código.
metadata:
  toolkit: seedgrid-ai
---

# Produto novo SeedGrid

Esta skill transforma um pedido de produto novo em uma pasta pronta para subir. A parte que decide (perguntas, extensions, propriedades, serviços) é **determinística**: vem da matriz e do catálogo desta skill, não da sua memória. A sua parte é conduzir a entrevista e, depois do script, escrever o plano e os documentos do produto.

## Pré-condições

- A pasta corrente é a do produto e o `seedgrid-ai init` já rodou nela (existem `.ai/` e `.ai/boilerplates/`). Sem isso, peça ao usuário para rodar `seedgrid-ai init` e pare.
- Não existe `produto.json` nem `backend/` na pasta. Se existir, o produto já foi criado: **não rode a geração de novo**. Pedido para adicionar ou remover um módulo ou trocar uma escolha segue a seção 4 (`--reconfigurar`); pedido de funcionalidade de negócio é do `arquiteto`.
- Tudo o que esta skill escreve fica **dentro da pasta do produto**. Produto novo nunca escreve nem lê fora dela, e nunca altera extension da plataforma (veja `.ai/rules/limites-do-host.md`).

## Arquivos da skill

- `data/matriz-produto.json`: as perguntas, na ordem, com opções, condições (`se`) e o efeito de cada resposta.
- `data/catalogo.json`: extensions (dependências, o que cada modelo traz e o que não traz).
- `scripts/scaffold-produto.mjs`: valida as respostas contra a matriz e gera o produto.
- `scripts/readme-produto.mjs`: esqueleto do `README.md` (C4 até C3 em Mermaid) e guardião dos marcadores.
- `scripts/verificar-subida.mjs`: sobe o produto e verifica (seção 3b).
- `.ai/boilerplates/`: os modelos (`login-tenancy-b2b`, `login-tenancy-b2c`, `modular`, `subdomain-tenancy`) que o script copia.

## 1. Entrevista

Leia `data/matriz-produto.json` e percorra `perguntas` na ordem de `ordem`.

1. **Uma pergunta por vez.** Mostre o texto de `pergunta`, as opções (`rotulo`) e a sua **recomendação** (`recomendacao`). Pergunta de `campos` pede os campos juntos; os que têm `padrao` podem ser aceitos com Enter.
2. **Só pergunte o que se aplica.** Uma pergunta com `se` só aparece quando a condição vale: `modelo` (a resposta da pergunta 2 está na lista), `extensao` (alguma das extensions está presente: as que o modelo traz, as escolhidas e as trazidas por dependência) e `resposta` (uma resposta anterior tem o valor indicado). Para saber o que o modelo traz, use `efeito.extensions` da opção escolhida na pergunta 2.
3. **Opção desligada** (`disponivel: false`, como o B2C) aparece na lista com o `motivo`; não pode ser escolhida.
4. **Modelo "modular" (3b):** quem escolhe as extensions uma a uma recebe também as dependências (`depende_de` no catálogo). Diga isso: "escolher `apikeys` traz o `security` junto".
5. **Nada fora da matriz.** Não invente pergunta nem opção. Se o usuário pedir algo que a matriz não cobre, registre como demanda em `docs/ai/demands/AAAA-MM-DD-assunto.md` (o que falta, por que o produto precisa) e siga; não prometa nem improvise.
6. **Repita cada decisão em uma frase** ao registrá-la, como nas outras skills de plano.

As respostas formam um JSON plano, uma chave por pergunta (`chave` da pergunta, ou o `id` de cada campo). Exemplo para o modelo `login-tenancy-b2b`:

```json
{
  "nome": "Portal de Chaves", "slug": "portal-chaves", "pacote": "br.com.acme.portal",
  "modelo": "login-tenancy-b2b", "extensoes": ["exchange"],
  "selfEnter": "sim", "selfEnterModo": "convite",
  "auditoria": "postgres", "armazenamentoAvatar": "filesystem", "armazenamentoBackup": "filesystem", "apikeysUso": "Integrações internas",
  "billingProvider": "stripe", "trialDias": 14, "planos": "Básico,Pro",
  "dominioFront": "app.acme.com.br", "dominioAdmin": "admin.acme.com.br",
  "emailRemetente": "noreply@acme.com.br", "emailAdmin": "dono@acme.com.br"
}
```

Salve em `docs/ai/plans/respostas-produto.json` (sem segredos: o script gera os segredos). Mostre o resumo das respostas ao usuário e **peça confirmação antes de gerar**.

## 2. Gerar o produto

```
node .ai/skills/sg-new-product/scripts/scaffold-produto.mjs --respostas docs/ai/plans/respostas-produto.json
```

- Resposta inválida ou fora da matriz: o script **recusa com a lista de problemas e não grava nada**. Corrija só o que ele apontou e rode de novo.
- Sucesso: ele cria `backend/`, `frontend/`, `admin/`, `produto.json`, `docker-compose.yml`, `.env` e `.env.example`, `backend/dev.env` e `backend/dev.env.example`, `.github/workflows/publicar.yml`, `.gitignore` e `docs/ai/{plans,decisions,handoffs,reports,demands}/`. As mesmas respostas geram sempre a mesma árvore versionada.
- **Siga a matriz; não invente.** O produto é exatamente o que a entrevista e a matriz determinam. Não acrescente módulo, dependência, tela, camada de autenticação ou configuração que a matriz não prevê, e não "melhore" o gerado à mão; se o usuário pedir algo fora da matriz, registre como demanda em `docs/ai/demands/` e pergunte antes. Autenticação, permissões e auditoria vêm da `seedgrid-security` que a matriz já inclui.
- **Como rodar (mostre ao usuário ao terminar):** o script imprime, no fim, o quadro de comandos e de portas lido do `docker-compose.yml` gerado (PostgreSQL, Mailpit, MinIO e console, Mongo, Redis e Mockoon (porta 3100, sem UI web) quando existirem; backend 8080, frontend 3000, admin 3001) e grava o mesmo quadro em `docs/COMO-RODAR.md`; `--json` traz em `portas`. Repasse o quadro ao usuário com os comandos de subida; não o escreva de memória.
- **Back falso para o front (Mockoon):** o produto traz `mocks/<slug>.mockoon.json` (rotas de autenticação, perfil, 2FA e, com tenancy, usuários e perfis, com dados fictícios em pt-BR e ids fixos) e o serviço `mockoon` no `docker-compose.yml` (imagem `mockoon/cli:9.9.0`, porta 3100, perfil `mock`, sem UI web). Quem for fazer só o front roda `docker compose --profile mock up -d` e `SEEDGRID_APP_API_BASE_URL=http://127.0.0.1:3100 pnpm dev` (PowerShell: `$env:SEEDGRID_APP_API_BASE_URL="http://127.0.0.1:3100"; pnpm dev`); não precisa de banco nem de backend. Para editar rotas e dados, abra o JSON no aplicativo desktop do Mockoon. **Cobertura inicial**: os módulos de negócio (audit, backup, apikeys, billing…) ainda não têm rota no mock; avise o usuário. Os caminhos espelham `lib/security-paths.ts` e `lib/login-tenancy-paths.ts` do front; as rotas ficam em `data/mock-rotas.json`.
- **E-mail em desenvolvimento:** o `docker-compose.yml` sobe o **Mailpit** local (SMTP sem autenticação; interface em `http://localhost:8025`, ou `8026` no subdomain-tenancy). O `dev.env` já aponta para ele, com um remetente por extension (`security@`, `backup@`, `subdomain.tenancy@` em `eu-dev.com.br`). Diga ao usuário que convites, confirmações e redefinições de senha chegam nessa interface, qualquer que seja o destinatário.
- Os **segredos são gerados por produto** (senhas, chaves, par RSA do JWT) e ficam só em `backend/dev.env`, `.env` e `backend/src/main/resources/keys/*.pem`, que o `.gitignore` já ignora. **Nunca** mostre, copie nem cole esses valores no chat, no plano, em ADR ou em commit. O que vai ao git é o `.example`, com `change-me`.
- Leia a saída: as linhas `PENDENTE` são coisas que o script não resolve (por exemplo cache e Pulse, que o dono precisa fornecer; chaves do Stripe). Elas viram a seção "Pendências" do plano.

## 3. Documentos do produto (em `docs/ai/`)

Depois do script, siga `sg-plan-goal` para o plano do produto e escreva **apenas dentro de `docs/ai/`**:

1. **Plano** em `docs/ai/plans/`: objetivo do produto (pelo `nome`), modelo e extensions escolhidos (`produto.json`), como as chaves de API serão usadas (`apikeysUso`), billing (provider, trial e planos de `produto.json`; o prazo e a cota do trial são dados do plano, num seed/migration do produto), telas do admin a criar, e as **Pendências** da saída do script.
2. **ADRs** em `docs/ai/decisions/` com `sg-adr`: modelo do projeto, onde gravar a auditoria, armazenamento, self-enter (e como se entra) e billing. Uma decisão por ADR, com a data e a alternativa descartada.
3. **Handoff** em `docs/ai/handoffs/`: como subir (`docker compose up -d`, depois o backend com `backend/run.sh`, depois `frontend` e `admin` com `pnpm install && pnpm dev`), o que está pronto, o que falta e quem fornece cada pendência.
4. **Demandas** em `docs/ai/demands/`: o que o produto precisa e a extension ou a KB não entrega (nunca alterar a extension).
5. **README.md** na raiz do produto (o script já gera o esqueleto): preencha **todos** os marcadores `<!-- sg:preencher: ... -->` com o **domínio do host** (o que o produto faz, como funciona, nomes dos componentes do domínio em C3, sistemas externos do domínio em C1, e `sequenceDiagram` dos fluxos que valem a pena). Só o domínio do host: não repita o que cada extension faz (isso está na KB, `.ai/brain/`); cite a extension pelo nome. C1, C2 e C3 em Mermaid (`C4Context`, `C4Container`, `C4Component`). Ao terminar não pode sobrar marcador (`marcadoresPendentes` em `scripts/readme-produto.mjs`).

Depois acione o `arquiteto` com o plano do produto para a primeira feature de negócio; o resto do fluxo segue `.ai/rules/coordenacao.md`.

## 3b. Subir e verificar (obrigatório antes de dar o produto por entregue)

Depois da configuração e dos documentos, **suba o produto de verdade**. A entrega só vale se subir:

```bash
node .ai/skills/sg-new-product/scripts/verificar-subida.mjs --destino . [--runtime docker|podman] [--sem-front] [--timeout 240]
```

Passos: (1) dependências do `docker-compose.yml` (banco, Mailpit...; o perfil `mock` fica de fora) e suas portas; (2) `backend/run.sh` responde o health do Quarkus (`q/health/ready`, HTTP 200) e o **log do boot não tem `ERROR`**; (3) login do primeiro administrador (do `dev.env`) e rota protegida (200 com token, 401 sem); (4) `frontend` e `admin`, quando existirem, respondem na porta (precisa de `pnpm`; sem ele o passo fica "não verificado"). Ele para só o que subiu e mostra o passo que falhou, com o trecho do log. Segredo nunca aparece no relato.

- **Quem sobe é você (a IA), sem pedir ao usuário.** Subir backend, front e `verificar-subida.mjs` no ambiente de desenvolvimento faz parte da entrega e não é "subir infraestrutura": execute os comandos (`bash backend/run.sh`, `pnpm dev`) em segundo plano, espere o health e siga o roteiro. Se a ferramenta negar o comando, diga qual comando precisa de liberação, uma vez, e continue pelo que não depende dele; não repita o pedido.
- **Portas e processos alheios:** antes de subir, veja as portas (`netstat`). Porta ocupada por processo ou contêiner que não é seu: não pare nem remova; suba o seu em porta livre (`HTTP_PORT=8180` no backend, `pnpm dev -p 3100` no front, apontando o front para esse backend) e relate qual usou. Serviços de apoio já no ar (Postgres, Mailpit do compose do produto) podem ser usados como estão, com banco próprio da prova (`CREATE DATABASE`), sem tocar nos dados do usuário.
- **Prova do fluxo de negócio (além do health):** com o produto no ar, exercite pelas rotas reais o roteiro das demandas (login com e-mail confirmado pelo Mailpit, cadastros, o fluxo principal e as recusas) e grave o resultado em `docs/ai/reports/` com o que passou, o que falhou e o que **não** foi provado (por exemplo cliques no navegador).
- **Limpeza ao terminar:** pare só o que você subiu, **incluindo os processos filhos** (parar o processo-pai deixa o Quarkus/Next escutando: ache o PID pela porta com `netstat -ano` e encerre-o), apague o banco e os contêineres e volumes que você criou para a prova (inclusive os criados com `podman run` ou `docker run`, não só os do compose) e deixe tudo dentro da pasta do produto. **Confira no fim**: `podman ps -a` ou `docker ps -a` sem nenhum contêiner seu e `netstat -ano` sem as portas que você usou; só então diga que limpou. Liste no relatório o que ficou de pé e de quem é.
- **Falhou:** relate o passo e o trecho do log ao usuário e **não conserte por conta própria** nem marque o produto como entregue; registre em `docs/ai/reports/` e siga `coordenacao.md` (o conserto é uma demanda, e a causa pode estar na matriz ou no boilerplate, não no produto).
- **"Não verificado"** (sem docker/podman, sem pnpm) aparece como tal no relato final; não vira "ok".

## 4. Mudar depois: adicionar ou remover um módulo, trocar uma escolha

A qualquer momento o usuário pode pedir para **adicionar ou remover um módulo opcional**, em **qual escopo ele vale** (backend, front, admin) ou **trocar uma escolha** (armazenamento, auditoria, self-enter...). Isso é a mesma matriz com respostas novas, não uma edição à mão.

1. Leia as respostas atuais em `.seedgrid/manifesto.json` (campo `respostas`). Mude **só** o que o usuário pediu, com a mesma entrevista da seção 1 para a pergunta afetada (inclusive o escopo, quando houver), e grave o JSON inteiro em `docs/ai/plans/respostas-produto.json`.
2. Veja a diferença **sem gravar**:
   ```
   node .ai/skills/sg-new-product/scripts/scaffold-produto.mjs --reconfigurar --respostas docs/ai/plans/respostas-produto.json
   ```
   A saída lista os arquivos que seriam criados, atualizados ou removidos, as variáveis do `dev.env` (só os nomes, nunca os valores) e os **conflitos**.
3. Mostre ao usuário o que vai mudar e **peça confirmação**; depois rode o mesmo comando com `--aplicar`.

Como funciona e o que esperar:
- Os **segredos não mudam**: a nova geração reusa os do `dev.env`, do `.env` e das chaves do JWT.
- Só a diferença é aplicada. O que o usuário editou **não é sobrescrito**: arquivo ou variável alterados por ele e que a matriz também muda aparecem como **conflito** e ficam como estão. Relate cada conflito e diga o que ele precisa ajustar à mão.
- É **reversível**: voltar a resposta anterior e aplicar restaura o estado de quem nunca mudou.
- Remover um módulo apaga as telas do front ou do admin e as linhas do menu (receita provada em `data/modulos-front.json`); dependências entre extensions seguem a seção 1 (remover `security` exige remover o que depende dele). Módulo sem receita provada **não** é removido do front: a saída avisa, e o pedido vira demanda em `docs/ai/demands/`.
- Sem `.seedgrid/manifesto.json` (produto criado antes desta função), não há reconfiguração: trate como mudança pelo `arquiteto`.
- Depois de aplicar, atualize o plano e os ADRs afetados em `docs/ai/` (seção 3) e rode `pnpm install` onde o `package.json` mudou.

## Limites

- **Fique na pasta do produto.** Não leia outros projetos nem as fontes das extensions (a KB em `.ai/brain/` é a fonte), e não crie arquivos auxiliares ou scripts temporários fora da pasta do produto: escreva os documentos direto com a ferramenta de escrita.
- **Termine afirmando, não perguntando.** Depois dos documentos, relate o que foi feito e as pendências e diga o próximo passo em uma frase afirmativa ("o próximo passo é acionar o `arquiteto`..."); perguntas de negócio ficam para o `arquiteto`.
- Publicar é decisão do usuário: não faça `git push`, tag nem deploy sem ele pedir. Subir o produto localmente para provar (seção 3b) não precisa de pedido.
- **"Outra sessão editando"**: não existe como você saber isso. Se um arquivo mudou sem você ter mexido, releia-o e siga; só pare se o `git status` mostrar alteração que conflita com a sua e, então, relate o arquivo, sem oferecer três opções.
- **Tela ou regra fora do que a extension entrega** (prefixo de chave, chave por produto, limite por usuário, consentimento): faça na camada do produto (host), registre a escolha em ADR e a falta da extension em `docs/ai/demands/`; não altere a extension nem pare para perguntar.
- Não edite `backend/dev.env` nem `.env` à mão para "consertar" um valor gerado sem explicar; para trocar uma resposta use a reconfiguração (seção 4).
- Modelo "modular" TEM boilerplate proprio (`boilerplates/modular`): backend com security e audit, front com login, Meu perfil, Temas, Usuarios, Perfis, Auditoria (e API Keys/convites conforme a escolha) e sem admin web. So os opcionais ainda indisponiveis na pergunta 3b ficam de fora.
- Remover as telas de um módulo do front ou do admin só é automático para as receitas de `data/modulos-front.json`, todas provadas com `pnpm build` (hoje: `self-enter`, `api-keys`, `audit`, `backup`, `ai-pricing` e `exchange`, cada uma nos escopos em que tem tela). Billing, realtime e whatsapp não têm receita (estão entrelaçados em código das telas): para eles os flags do `.env` ligam e desligam o comportamento no backend, e a remoção das telas vira demanda em `docs/ai/demands/`.
- Remover as telas **não** desliga o backend do módulo, e o painel inicial do admin pode mostrar a seção vazia (auditoria) ou "cotação indisponível" (exchange) sem o módulo: avise o usuário.
