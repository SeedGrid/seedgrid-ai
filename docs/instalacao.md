# Instalação em projetos

Os exemplos usam o comando `seedgrid-ai`. Para tê-lo na máquina: `npx @seedgrid/ai-toolkit@latest install` (executa `npm install -g`, uma vez; repita para atualizar o comando). Sem instalar, troque `seedgrid-ai` por `npx @seedgrid/ai-toolkit`; em desenvolvimento do toolkit, por `node <pasta-do-toolkit>/dist/cli.js`.

## Primeira instalação

```bash
cd /caminho/do/projeto
seedgrid-ai init --dry-run                 # revise o plano
seedgrid-ai init --target both --mode shared
seedgrid-ai doctor
```

**Projeto novo:** crie a pasta, entre nela e rode `init`. Se a pasta ainda não é um repositório git, o `init` faz `git init -b main`, um commit inicial com tudo o que instalou e cria a `develop` (branch atual). A branch de trabalho (`feature/...`) sai da `develop` e é criada pela IA (veja `.ai/rules/branches.md`). Em pasta que já é repositório, o `init` não altera branches. `--no-develop` cria só a `main` (usado pelo `seedgrid-ai-plt`, que não usa `develop`). `SEEDGRID_AI_SKIP_GIT=1` desliga.

Depois, abra uma **nova sessão** do Claude Code ou do Codex na pasta do projeto.

Versione no Git: `.ai/` (inclusive `.ai/brain/`, cerca de 2 MB de Markdown, e `.ai/boilerplates/`, cerca de 4 MB; exceto `.ai/backups/`, que já se auto-ignora), `.claude/skills/`, `.agents/skills/`, os agentes nativos (se usados), `AGENTS.md`, `CLAUDE.md` e `.ai/toolkit-lock.json`. Assim toda a equipe recebe a mesma versão.

## A base de conhecimento (`.ai/brain/`)

Toda instalação traz as notas de documentação das extensions e dos componentes SeedGrid em `.ai/brain/SeedGrid/`. O bloco do `AGENTS.md` manda a IA consultá-las pelos índices antes de usar ou configurar qualquer extension ou componente, e responder "não encontrei" em vez de inventar. A pasta é gerenciada: edições locais geram conflito no `update`. Anotações do projeto vão em `.ai/local/`.

As notas indicam, no frontmatter, o `commit` e a data (`analisado-em`) do código que descrevem. Se o projeto usa uma versão diferente das extensions, a IA é instruída a confirmar no código, no jar ou no pacote e a avisar.

## Os boilerplates (`.ai/boilerplates/`)

Toda instalação traz os modelos de produto `login-tenancy` e `subdomain-tenancy` (backend, frontend e admin) em `.ai/boilerplates/<modelo>/` — cerca de 3,9 MB em 795 arquivos, copiados direto, sem `.tgz`. A pasta é **gerenciada** como o resto de `.ai/`: o `update` troca o modelo pelo da versão do CLI, o `remove` a retira e edição local gera conflito.

O `update` só mexe em `.ai/boilerplates/`. Um produto criado a partir de um modelo vive **fora** de `.ai/` (por exemplo `backend/`, `frontend/`, `admin/`) e nunca é tocado, nem lido, pelo `init`, `update` ou `remove`.

Regras do conteúdo dos modelos, conferidas pelo `validate` e pelo `npm test`:
- Nenhum arquivo de ambiente, chave ou backup (`dev.env`, `_dev.env`, `.env*`, `*.pem`, `*.bak`...). Só entram modelos `*.example`, `*.sample` e `*.template`. Também não entram `node_modules`, `target`, `.git`, `infra` nem `chave-mvn-central`.
- `.gitignore`, `.gitattributes` e `.npmignore` entram como `<nome>.template` (o npm descarta `.gitignore` do pacote, e um `.gitignore` vivo dentro de `.ai/` afetaria o Git do projeto). Quem cria o produto a partir do modelo remove o sufixo.
- Arquivos binários entram em base64, com o sufixo `.b64` (hoje só `public/logo-seedgrid-email.png.b64`, nos frontends). Quem cria o produto decodifica e remove o sufixo.
- O `init` mostra os modelos em uma linha por modelo (`.ai/boilerplates/login-tenancy/ (N arquivo(s))`), não uma linha por arquivo.

## Escolhendo target e modo

- `--target claude`: instala skills só para o Claude Code e cria o bloco do `CLAUDE.md`. O `AGENTS.md` sempre recebe o bloco, porque é a fonte comum das instruções.
- `--target codex`: instala skills em `.agents/skills/`; não cria `CLAUDE.md`.
- `--mode native`: também gera subagentes nativos. No Codex, marque o projeto como confiável (o Codex pergunta ao abrir o projeto, ou configure `[projects.'<caminho>'] trust_level = "trusted"` em `~/.codex/config.toml`).

`init` repetido sem opções reaproveita as opções do lock. Com opções diferentes, reconfigura a instalação: por exemplo, `init --mode shared` numa instalação native apaga os agentes nativos intactos.

## Personalizando

Não edite arquivos gerenciados. Use `.ai/local/` (veja `.ai/rules/personalizacao-local.md` no projeto):

- `.ai/local/projeto.md`: stack, comandos de build e teste, convenções.
- `.ai/local/fluxos.md`: fluxos obrigatórios.
- `.ai/local/papeis/<id>.md`: complementos a um papel.

Texto fora dos marcadores em `AGENTS.md` e `CLAUDE.md` é seu e é preservado em todas as operações.

## Atualizando

```bash
seedgrid-ai status             # mostra se o CLI traz conteúdo mais novo
seedgrid-ai update --dry-run
seedgrid-ai update
```

`update` aplica o conteúdo empacotado no CLI **em execução** (ou `--source`). O jeito mais simples de sempre pegar o conteúdo mais recente é `npx @seedgrid/ai-toolkit@latest update`.

### Aviso de versão nova

`init`, `update`, `status` e `doctor` consultam o npm (somente leitura) para saber se existe uma versão publicada mais nova que o CLI em execução:

- **Em terminal interativo**, `init`/`update` perguntam `Usar a X.Y.Z neste update? [Y/n]` e `status` pergunta `Atualizar este projeto agora? [Y/n]`. Com "Y", o comando é repassado para `npx @seedgrid/ai-toolkit@X.Y.Z ...` (versão exata). Com "n", segue com o CLI atual.
- **Fora do terminal** (pipes, scripts, `--json`), só aparece um aviso com o comando a rodar; nunca há pergunta nem download.
- Com `CI` definido, `--source`, `--no-update-check` ou `SEEDGRID_AI_NO_UPDATE_CHECK=1`, não há consulta.
- A consulta usa `npm view` (respeita registry, proxy e `.npmrc`), fica em cache por 12 h em `~/.cache/seedgrid-ai/update-check.json` e, se falhar (sem rede, pacote inexistente), é ignorada em silêncio.

A versão nova planeja de novo e continua abortando em conflitos: aceitar a atualização nunca sobrescreve customizações.

## Conflitos

Exemplo:

```text
Conflitos (1):
  ! .ai/rules/coordenacao.md: modificado localmente desde a última instalação

Operação abortada: nada foi alterado.
```

Opções:

1. Mover a personalização para `.ai/local/` e restaurar o arquivo original (`git checkout -- <arquivo>` ou cópia do backup).
2. Se o arquivo preexistente não era do toolkit, renomeá-lo ou removê-lo após conferir o conteúdo.
3. Para blocos editados, devolver o interior dos marcadores ao texto original e levar as mudanças para fora deles.

## Removendo

```bash
seedgrid-ai remove --dry-run
seedgrid-ai remove
```

Remove arquivos gerenciados intactos, os blocos intactos (e `CLAUDE.md`/`AGENTS.md` se o toolkit os criou e ficaram vazios) e o lock. Mantém `.ai/local/`, `.ai/backups/` e qualquer arquivo de terceiros. Pastas só são apagadas se ficarem vazias.

## Recuperação

Cada operação que altera ou apaga arquivos existentes cria `.ai/backups/<operação>/` com:

- cópias dos arquivos, nos mesmos caminhos relativos ao projeto;
- `operation.json` com o tipo de operação e a lista de arquivos.

Para restaurar manualmente, copie de volta para a raiz do projeto os arquivos listados em `operation.json` (não copie o próprio `operation.json`). Exemplo com Git Bash, Linux ou macOS:

```bash
B=.ai/backups/20261014T103812Z-22cd26
(cd "$B" && find . -type f ! -name operation.json) | while read -r f; do cp "$B/$f" "$f"; done
```

O comando restaura também `.ai/toolkit-lock.json` quando a operação o alterou, mantendo lock e arquivos coerentes. Em seguida, rode `seedgrid-ai status`. Apague `.ai/backups/` quando não precisar mais.

Se a mensagem disser "Rollback INCOMPLETO", os arquivos listados não puderam ser restaurados automaticamente: use o backup indicado.
