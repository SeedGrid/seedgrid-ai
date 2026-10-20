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
- Não existe `produto.json` nem `backend/` na pasta. Se existir, o produto já foi criado: **não rode o script de novo**; trate o pedido como mudança (`arquiteto`).
- Tudo o que esta skill escreve fica **dentro da pasta do produto**. Produto novo nunca escreve nem lê fora dela, e nunca altera extension da plataforma (veja `.ai/rules/limites-do-host.md`).

## Arquivos da skill

- `data/matriz-produto.json`: as perguntas, na ordem, com opções, condições (`se`) e o efeito de cada resposta.
- `data/catalogo.json`: extensions (dependências, o que cada modelo traz e o que não traz).
- `scripts/scaffold-produto.mjs`: valida as respostas contra a matriz e gera o produto.
- `.ai/boilerplates/`: os modelos (`login-tenancy`, `subdomain-tenancy`) que o script copia.

## 1. Entrevista

Leia `data/matriz-produto.json` e percorra `perguntas` na ordem de `ordem`.

1. **Uma pergunta por vez.** Mostre o texto de `pergunta`, as opções (`rotulo`) e a sua **recomendação** (`recomendacao`). Pergunta de `campos` pede os campos juntos; os que têm `padrao` podem ser aceitos com Enter.
2. **Só pergunte o que se aplica.** Uma pergunta com `se` só aparece quando a condição vale: `modelo` (a resposta da pergunta 2 está na lista), `extensao` (alguma das extensions está presente: as que o modelo traz, as escolhidas e as trazidas por dependência) e `resposta` (uma resposta anterior tem o valor indicado). Para saber o que o modelo traz, use `efeito.extensions` da opção escolhida na pergunta 2.
3. **Opção desligada** (`disponivel: false`, como o B2C) aparece na lista com o `motivo`; não pode ser escolhida.
4. **Modelo "outro" (3b):** quem escolhe as extensions uma a uma recebe também as dependências (`depende_de` no catálogo). Diga isso: "escolher `apikeys` traz o `security` junto".
5. **Nada fora da matriz.** Não invente pergunta nem opção. Se o usuário pedir algo que a matriz não cobre, registre como demanda em `docs/ai/demands/AAAA-MM-DD-assunto.md` (o que falta, por que o produto precisa) e siga; não prometa nem improvise.
6. **Repita cada decisão em uma frase** ao registrá-la, como nas outras skills de plano.

As respostas formam um JSON plano, uma chave por pergunta (`chave` da pergunta, ou o `id` de cada campo). Exemplo para o modelo `login-tenancy-b2b`:

```json
{
  "nome": "Portal de Chaves", "slug": "portal-chaves", "pacote": "br.com.acme.portal",
  "modelo": "login-tenancy-b2b", "extensoes": ["exchange"],
  "selfEnter": "sim", "selfEnterModo": "convite",
  "auditoria": "postgres", "armazenamento": "filesystem", "apikeysUso": "Integrações internas",
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
- Os **segredos são gerados por produto** (senhas, chaves, par RSA do JWT) e ficam só em `backend/dev.env`, `.env` e `backend/src/main/resources/keys/*.pem`, que o `.gitignore` já ignora. **Nunca** mostre, copie nem cole esses valores no chat, no plano, em ADR ou em commit. O que vai ao git é o `.example`, com `change-me`.
- Leia a saída: as linhas `PENDENTE` são coisas que o script não resolve (por exemplo cache e Pulse, que o dono precisa fornecer; chaves do Stripe). Elas viram a seção "Pendências" do plano.

## 3. Documentos do produto (em `docs/ai/`)

Depois do script, siga `sg-plan-goal` para o plano do produto e escreva **apenas dentro de `docs/ai/`**:

1. **Plano** em `docs/ai/plans/`: objetivo do produto (pelo `nome`), modelo e extensions escolhidos (`produto.json`), como as chaves de API serão usadas (`apikeysUso`), billing (provider, trial e planos de `produto.json`; o prazo e a cota do trial são dados do plano, num seed/migration do produto), telas do admin a criar, e as **Pendências** da saída do script.
2. **ADRs** em `docs/ai/decisions/` com `sg-adr`: modelo do projeto, onde gravar a auditoria, armazenamento, self-enter (e como se entra) e billing. Uma decisão por ADR, com a data e a alternativa descartada.
3. **Handoff** em `docs/ai/handoffs/`: como subir (`docker compose up -d`, depois o backend com `backend/run.sh`, depois `frontend` e `admin` com `pnpm install && pnpm dev`), o que está pronto, o que falta e quem fornece cada pendência.
4. **Demandas** em `docs/ai/demands/`: o que o produto precisa e a extension ou a KB não entrega (nunca alterar a extension).

Depois acione o `arquiteto` com o plano do produto para a primeira feature de negócio; o resto do fluxo segue `.ai/rules/coordenacao.md`.

## Limites

- **Fique na pasta do produto.** Não leia outros projetos nem as fontes das extensions (a KB em `.ai/brain/` é a fonte), e não crie arquivos auxiliares ou scripts temporários fora da pasta do produto: escreva os documentos direto com a ferramenta de escrita.
- **Termine afirmando, não perguntando.** Depois dos documentos, relate o que foi feito e as pendências e diga o próximo passo em uma frase afirmativa ("o próximo passo é acionar o `arquiteto`..."); perguntas de negócio ficam para o `arquiteto`.
- Não suba a infraestrutura nem publique nada sem o usuário pedir. `git push` e deploy são decisão dele.
- Não edite `backend/dev.env` nem `.env` à mão para "consertar" um valor gerado sem explicar; para trocar uma resposta, rode a skill de novo numa pasta limpa.
- Modelo "outro" não tem boilerplate: o script gera os arquivos de configuração e deixa `backend/`, `frontend/` e `admin/` sem esqueleto; isso aparece como `PENDENTE`.
- Remover um módulo do front (por exemplo `self-enter` ou `api-keys`) ainda é manual: veja a nota de composição do admin na KB (`SeedGrid/SeedGrid-components/modulos/Composicao-do-admin`). Os flags do `.env` já ligam e desligam o comportamento.
