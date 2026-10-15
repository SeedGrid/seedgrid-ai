# Manutenção

## Ciclo de desenvolvimento

```bash
npm install
npm run build          # src/ -> dist/
npm test               # compila src/ + tests/ em build-test/ e roda node:test
node dist/cli.js validate
```

Os testes criam projetos em diretórios temporários com espaços e Unicode no caminho e cobrem: instalação nova, repetição sem mudanças, atualização de conteúdo intacto, conflito local, preservação de texto antes e depois dos marcadores, dry-run sem escrita, remoção, nomes inválidos, referências quebradas, links para fora do projeto, lock adulterado, CRLF e falha de escrita com rollback. Eles não dependem de Claude Code ou Codex instalados (`SEEDGRID_AI_SKIP_TOOL_DETECTION=1`).

Para testar conteúdo em edição sem recompilar o pacote:

```bash
node dist/cli.js init --source ./seedgridKB --project ../projeto-descartavel --dry-run
```

## Versionamento

- `package.json` `version`: versão do CLI **e** do pacote distribuído.
- `content/manifest.json` `contentVersion`: versão do conteúdo. Aumente a cada mudança em `content/`.
- `schemaVersion` (manifesto) e `lockVersion` (lock) só mudam com alterações de formato; nesse caso, implemente a leitura do formato anterior ou documente a migração.

Ao mudar conteúdo, aumente `contentVersion` e, para publicar, a versão do pacote.

## Adicionando conteúdo

- Papel: crie `seedgridKB/SeedGrid/Toolkit/agents/<id>.md` seguindo [formato.md](formato.md) e adicione-o ao componente `agents` do manifesto.
- Skill: crie `seedgridKB/SeedGrid/Toolkit/skills/<nome>/SKILL.md` (+ recursos) e um componente `skill:<nome>`.
- Rode `node dist/cli.js validate` e `npm test`.

## Ampliando os adaptadores

Antes de gerar qualquer campo novo para uma ferramenta, confira a documentação oficial atual e a versão instalada, faça o smoke test e registre o resultado em [compatibilidade.md](compatibilidade.md). Não acrescente versões a `validatedVersions` sem esse teste.

## Smoke test manual

Use uma pasta descartável. Nenhum passo publica ou altera serviços externos.

```bash
mkdir "/tmp/proj teste ção" && cd "/tmp/proj teste ção"
node <toolkit>/dist/cli.js init --target both --mode native
node <toolkit>/dist/cli.js doctor --probe

# Claude Code: skills, subagentes e instruções
claude -p "Sem executar ferramentas, liste: (1) skills de projeto disponíveis; (2) tipos de subagente personalizados; (3) a primeira linha do bloco SeedGrid AI Toolkit recebido."

# Codex: skills e instruções (projeto não confiável)
codex exec --skip-git-repo-check --ephemeral -s read-only "Sem executar comandos, liste: (1) skills do projeto; (2) agentes personalizados; (3) a primeira linha do bloco SeedGrid AI Toolkit do AGENTS.md."

# Codex: agentes nativos (confiança só nesta execução; use o caminho absoluto do Windows/Unix)
codex exec --skip-git-repo-check --ephemeral -s read-only \
  -c "projects={'<caminho absoluto>'={trust_level=\"trusted\"}}" \
  "Sem comandos de shell: liste os agent_type personalizados aceitos por spawn_agent e inicie um 'revisor' com a tarefa 'Responda apenas: papel revisor ativo'."
```

Resultado esperado: 3 skills, 5 agentes e o bloco citado em cada ferramenta. Registre versões e resultados em [compatibilidade.md](compatibilidade.md).

## Empacotamento

```bash
npm pack --dry-run      # lista o que entraria no tarball
npm pack                # gera seedgrid-ai-toolkit-<versão>.tgz
```

`prepack` limpa e recompila `dist/`. O campo `files` do `package.json` inclui apenas `dist/`, `docs/`, `README.md`, `LICENSE` e, do vault, `seedgridKB/manifest.json` e `seedgridKB/SeedGrid/`. Confira na listagem que:

- `seedgridKB/manifest.json` e todos os arquivos que o manifesto instala estão presentes, e nada além disso do vault (sem `.obsidian/`, `AGENTS.md` e `CLAUDE.md` de manutenção);
- não há `.ai/backups/`, `build-test/`, `tests/`, `node_modules/`, `.env*`, `*.tgz` nem arquivos `*.seedgrid-tmp-*`.

Teste o tarball sem publicar (o `npx <arquivo.tgz>` não infere o binário de um tarball local; use `npm exec --package`):

```bash
cd ../projeto-descartavel
npm exec --yes --package=../seedgrid-ia/seedgrid-ai-toolkit-0.2.0.tgz -- seedgrid-ai init --dry-run
```

## Publicação no npm

O pacote é público: `@seedgrid/ai-toolkit`, no mesmo escopo de `@seedgrid/fe-components`. O comando instalado é `seedgrid-ai`.

### Versões

O pacote e o conteúdo usam o mesmo número. Para lançar uma versão:

1. Atualize `contentVersion` em `content/manifest.json` (se o conteúdo mudou).
2. `npm version <x.y.z>` atualiza o `package.json`, faz o commit e cria a tag `v<x.y.z>`.
3. `git push --follow-tags` dispara o workflow de publicação.

Versões com sufixo (`0.3.0-beta.1`) são publicadas com a dist-tag `next` e marcadas como pré-release; as demais vão para `latest`.

### Workflows

- `.github/workflows/ci.yml`: em push para `main` e em pull requests, roda testes, build, `validate` e `scripts/check-pack.mjs` no Ubuntu e no Windows, com Node 22 e 24.
- `.github/workflows/release.yml`: em tags `v*`, repete as verificações e exige tag igual à versão e `repository` preenchido. Depois publica no npm com provenance e cria a Release do GitHub com o `.tgz` anexado.

`node scripts/check-pack.mjs` pode ser rodado localmente: confere se todo arquivo do manifesto está no pacote e se não há fonte, testes, backups, `.env`, `.npmrc` ou `.tgz`.

### Primeira publicação (uma vez)

1. Crie o repositório no GitHub e adicione ao `package.json`:
   ```json
   "repository": { "type": "git", "url": "git+https://github.com/<org>/<repo>.git" },
   "homepage": "https://github.com/<org>/<repo>#readme",
   "bugs": { "url": "https://github.com/<org>/<repo>/issues" }
   ```
   A URL precisa ser exatamente a do repositório que publica; o npm a compara ao validar a provenance.
2. No GitHub, crie o environment `npm` (Settings → Environments). Ele permite exigir aprovação antes de publicar.
3. Para a primeira versão, o pacote ainda não existe no npm. Escolha uma opção:
   - **Manual:** com uma conta que publica no escopo `@seedgrid`, rode `npm login` e `npm publish --access public` localmente.
   - **Pelo workflow:** crie um token granular de publicação no npmjs.com e salve-o como segredo `NPM_TOKEN` no environment `npm`.
4. No npmjs.com, abra o pacote → Settings → **Trusted Publisher** e cadastre GitHub Actions: organização, repositório, workflow `release.yml` e environment `npm`.
5. Apague o segredo `NPM_TOKEN` (se criou). Daqui em diante, o workflow publica via OIDC, sem token guardado.
