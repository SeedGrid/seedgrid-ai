# SeedGrid AI Toolkit

Fonte versionada de **agentes (papéis), skills, regras, templates, referências e a base de conhecimento SeedGrid (KB)** para assistentes de código, independente de provedor, e um CLI (`seedgrid-ai`) que instala esse conteúdo em projetos locais para o **Claude Code** e o **Codex**, pelos mecanismos nativos de cada ferramenta.

O toolkit **não** é um orquestrador de modelos: não chama APIs da OpenAI ou da Anthropic, não guarda credenciais e não escolhe fornecedores. Ele instala instruções e configurações; a ferramenta de IA executa e coordena o trabalho.

> Pacote público no npm como `@seedgrid/ai-toolkit` (licença MIT); código em https://github.com/SeedGrid/seedgrid-ai. A versão do pacote e a do conteúdo instalado são a mesma.

## Instalação rápida

```bash
npx @seedgrid/ai-toolkit@latest install   # uma vez por máquina: instala o comando seedgrid-ai (npm install -g)
cd /caminho/do/projeto
seedgrid-ai init                          # instala o toolkit no projeto
```

Depois é só `seedgrid-ai update`, `seedgrid-ai status`, `seedgrid-ai doctor`, `seedgrid-ai review` etc. (`seedgrid-ai --help` lista tudo). Sem instalar o comando, qualquer comando também funciona com `npx @seedgrid/ai-toolkit <comando>`. Abra uma **sessão nova** do Claude Code ou do Codex depois de instalar no projeto.

## O que é instalado

Cada pasta de `.ai/` (`rules`, `agents`, `skills`, `templates`, `references`) tem um `index.md` **gerado** a partir do frontmatter dos arquivos. O bloco do `AGENTS.md` aponta para as pastas e manda começar pelo `index.md`; ele não lista arquivos, então não cresce quando entram novas rules, skills ou templates.

| Destino | Conteúdo |
| --- | --- |
| `.ai/agents/` | Papéis (`arquiteto`, `backend-java`, `backend-rust`, `frontend-react`, `qa`, `revisor`) e `index.md` gerado |
| `.ai/rules/` | Coordenação, formato de entrega, personalização local e os **padrões SeedGrid obrigatórios** (`frontend-seedgrid`, `backend-seedgrid`, `backend-java-seedgrid`) |
| `.ai/templates/` | Especificação de tarefa, decisão de arquitetura, relatório de validação |
| `.ai/references/` | Modos shared/native e glossário |
| `.ai/skills/index.md` | Índice gerado das skills (o que faz e quando usar) |
| `.ai/brain/SeedGrid/` | **Base de conhecimento SeedGrid** (extensions Quarkus, componentes React, propriedades, enums): ~157 notas Markdown, somente leitura |
| `.ai/toolkit-lock.json` | Versões, opções e hashes SHA-256 dos arquivos e blocos gerenciados |
| `.ai/backups/` | Backups locais por operação (ignorados pelo Git via `.ai/backups/.gitignore`) |
| `.claude/skills/<nome>/` | Skills para o Claude Code |
| `.agents/skills/<nome>/` | Skills para o Codex |
| `AGENTS.md` | Bloco gerenciado que referencia o toolkit (lido pelo Codex) |
| `CLAUDE.md` | Bloco gerenciado com `@AGENTS.md` (o Claude Code lê CLAUDE.md, não AGENTS.md) |
| `.claude/agents/<id>.md` | Somente `--mode native`: subagentes do Claude Code |
| `.codex/agents/<id>.toml` | Somente `--mode native`: agentes personalizados do Codex |

Skills: `sg-plan-change`, `sg-code-review`, `sg-validate-change` (genéricas) e `sg-crud-front`, `sg-crud-front-flutter`, `sg-dev-env`, `sg-new-screen`, `sg-review` (padrões SeedGrid). Toda instalação recebe todas as skills.

## A base de conhecimento (seedgridKB)

O repositório é, ao mesmo tempo, um **vault do Obsidian**: abra a pasta `seedgridKB/` no Obsidian para navegar, buscar e editar tudo (KB, skills, agentes e regras) com grafo e backlinks. O mesmo vault é a fonte do que o CLI distribui:

- `seedgridKB/SeedGrid/` (documentação das extensions e dos componentes) vira `.ai/brain/SeedGrid/` nos projetos;
- `seedgridKB/SeedGrid/Toolkit/` (agents, rules, templates, references, skills) vira `.ai/`, `.claude/skills/` e `.agents/skills/`.

O bloco que o CLI grava no `AGENTS.md` do projeto manda o Claude/Codex consultar a KB pelos índices antes de usar ou configurar qualquer extension ou componente SeedGrid, e não inventar o que a KB não traz. Veja [docs/formato.md](docs/formato.md#o-vault).

Em `AGENTS.md` e `CLAUDE.md`, o toolkit altera **somente** o trecho entre `<!-- BEGIN SEEDGRID AI TOOLKIT -->` e `<!-- END SEEDGRID AI TOOLKIT -->`. Personalizações do projeto ficam em `.ai/local/`, que o toolkit nunca toca.

## Uso local (sem npm público)

Requisitos: Node.js 22.12 ou superior (LTS).

```bash
# na pasta do toolkit
npm install
npm run build
npm test            # opcional: 34 testes em diretórios temporários

# executar o JavaScript compilado contra um projeto
node dist/cli.js init --project "C:/caminho/do/projeto" --target both --mode shared
```

Opcionalmente, registre o comando `seedgrid-ai` globalmente via link (aponta para esta pasta; recompile após mudanças):

```bash
npm link
cd /caminho/do/projeto
seedgrid-ai init --target both --mode shared
# para desfazer: npm unlink -g @seedgrid/ai-toolkit
```

## Comandos

```bash
seedgrid-ai install                              # instala o comando seedgrid-ai na máquina (npm install -g)
seedgrid-ai init --target both --mode shared     # padrão; idempotente
seedgrid-ai init --target both --mode native     # também registra subagentes nativos
seedgrid-ai init --source ./seedgridKB --dry-run    # fonte local (desenvolvimento), só o plano
seedgrid-ai status                               # versões, opções e divergências
seedgrid-ai doctor                               # diagnóstico de sintaxe, consistência e limitações
seedgrid-ai doctor --probe                       # + confirma descoberta real no Codex (sem chamar o modelo)
seedgrid-ai update --dry-run                     # plano da atualização
seedgrid-ai update                               # aplica o conteúdo empacotado no CLI em execução
seedgrid-ai remove --dry-run
seedgrid-ai remove
seedgrid-ai validate --source ./seedgridKB          # valida uma fonte de conteúdo
seedgrid-ai review                               # confere o código contra os padrões SeedGrid (front e back, só os arquivos alterados)
seedgrid-ai review front --full                  # só o front-end, projeto inteiro
seedgrid-ai review back --tool codex             # só o back-end, usando o Codex
```

- `--target`: `claude`, `codex` ou `both` (padrão `both`). `--mode`: `shared` (padrão) ou `native`.
- `--project <caminho>`: projeto alvo (padrão: pasta atual). Caminhos com espaços e Unicode são suportados.
- `--source <pasta>`: fonte de conteúdo local, relativa à pasta atual. Sem ela, usa o conteúdo empacotado no CLI.
- `--dry-run`: gera o plano e não escreve nenhum arquivo. `--json`: saída para scripts.
- Códigos de saída: `0` sucesso, `1` erro, `2` conflito (nada foi alterado), `3` (`review`) revisão concluída com violações.

### `seedgrid-ai review`

Executa a skill `sg-review` na ferramenta de IA instalada, em modo não interativo e somente leitura (Claude Code: `claude -p` com ferramentas de leitura; Codex: `codex exec --sandbox read-only`). A skill confere o código contra as regras `FE-nn` e `BE-nn` (`.ai/rules/frontend-seedgrid.md`, `backend-seedgrid.md` e `backend-java-seedgrid.md`) e o CLI mostra o relatório e devolve o código de saída.

- **Escopo:** `front`, `back` ou nenhum (os dois). Por padrão revisa os arquivos alterados (diff); `--full` revisa o projeto inteiro.
- **Ferramenta:** `--tool claude|codex`. Sem a opção, usa a primeira disponível nesta ordem: Claude Code, Codex. Considera só os targets instalados no projeto que tenham a skill e o executável no `PATH`. O CLI não detecta em qual ferramenta você está trabalhando.
- **Custo e login:** chama o modelo com o seu login na ferramenta e **consome tokens**. É o único comando que faz isso. Nenhum token é lido nem gravado pelo CLI.
- **Resultado não determinístico:** a revisão é feita por um modelo; execuções repetidas podem apontar itens um pouco diferentes (nos testes, as duas ferramentas acharam as violações óbvias e divergiram nos itens de julgamento). Trate o resultado como revisão, não como prova.
- **Saída estruturada:** a skill termina com um bloco `seedgrid-review-json`. Se a ferramenta falhar, esgotar o tempo (15 min) ou responder sem o bloco, o comando sai com `1` e mostra o texto bruto; nunca conta como "sem violações".
- Exige o toolkit instalado (`init`) com a skill `sg-review` (`update` leva as skills novas a projetos já instalados).

Depois de instalar ou atualizar, **abra uma nova sessão** do Claude Code ou do Codex. Não há recarga garantida em todas as ferramentas.

## Conflitos e segurança

- Arquivo gerenciado modificado localmente, arquivo preexistente diferente ou bloco editado → **conflito**: a operação inteira é abortada antes de qualquer escrita. Não existe opção que force sobrescrita de customizações.
- Antes de alterar ou apagar arquivos existentes, o CLI guarda cópias em `.ai/backups/<operação>/`. Se uma escrita falhar, tenta desfazer tudo e informa se o rollback foi incompleto.
- `remove` apaga apenas arquivos gerenciados intactos e blocos intactos; pastas com conteúdo de terceiros permanecem.
- O lock é tratado como entrada não confiável: caminhos fora das áreas gerenciadas, absolutos ou com `..` são rejeitados, assim como destinos que passem por links simbólicos para fora do projeto.
- Scripts de skills nunca são executados na instalação. Nenhum token é gravado e nenhuma permissão das ferramentas de IA é alterada.

## shared x native

- **shared** (padrão): catálogo e papéis em `.ai/`. A sessão principal lê o catálogo, escolhe papéis e delega pelo mecanismo disponível; sem subagentes, aplica o papel na própria sessão e informa isso.
- **native**: além do shared, gera `.claude/agents/` e `.codex/agents/` a partir dos mesmos papéis (sem duplicar autoria). Validado no Claude Code 2.1.299 e no Codex 0.160.1 (veja [docs/compatibilidade.md](docs/compatibilidade.md)). No Codex, os agentes de projeto **só carregam se o projeto for confiável** (trusted).

Seleção de papéis e delegação são comportamentos orientados por instruções, não garantias do instalador.

## Uso via npm

```bash
npx @seedgrid/ai-toolkit@latest install     # instala o comando seedgrid-ai nesta máquina (uma vez; repita para atualizar o comando)
cd /caminho/do/projeto
seedgrid-ai init --target both              # primeira instalação no projeto
seedgrid-ai update                          # leva o projeto ao conteúdo da versão do comando instalado
npx @seedgrid/ai-toolkit@latest update      # ou: usa a versão mais recente sem instalar nada
```

`install` executa `npm install -g @seedgrid/ai-toolkit@<versão deste CLI>` e confere se `seedgrid-ai` ficou no PATH; não toca em nenhum projeto (`--dry-run` mostra o comando). Se der erro de permissão, configure um prefixo global do npm para o seu usuário ou continue usando `npx`. Se houver versão mais nova publicada, `init`, `update` e `status` avisam e, no terminal, perguntam se devem usá-la (`[Y/n]`); desative com `--no-update-check`. Detalhes em [docs/instalacao.md](docs/instalacao.md#aviso-de-versão-nova). O pacote leva o CLI compilado e o conteúdo; a versão do pacote identifica o conteúdo instalado, e `update` nunca baixa conteúdo por conta própria. Faça commit do resultado no projeto: o restante da equipe recebe tudo pelo Git, sem rodar o CLI.

## Repositório e publicação

O código-fonte fica no GitHub; usuários não precisam cloná-lo. Para criar o repositório:

```bash
git init
git add .
git commit -m "SeedGrid AI Toolkit 0.2.0"
git branch -M main
git remote add origin git@github.com:SeedGrid/seedgrid-ai.git
git push -u origin main
```

O `.gitignore` já exclui `node_modules/`, `dist/`, `build-test/`, `*.tgz` e arquivos `.env`. O CI (`.github/workflows/ci.yml`) testa cada push e pull request; o workflow `release.yml` publica no npm a cada tag `vX.Y.Z`. Passo a passo da primeira publicação e do lançamento de versões: [docs/manutencao.md](docs/manutencao.md#publicação-no-npm).

## Documentação

- [docs/arquitetura.md](docs/arquitetura.md) — módulos, fluxo de planejamento e escrita, lock.
- [docs/instalacao.md](docs/instalacao.md) — instalação, atualização, remoção e recuperação em projetos.
- [docs/formato.md](docs/formato.md) — autoria de conteúdo: manifesto, papéis, skills, templates.
- [docs/manutencao.md](docs/manutencao.md) — versões, testes, empacotamento, publicação e smoke test.
- [docs/compatibilidade.md](docs/compatibilidade.md) — versões testadas, caminhos validados e limitações reais.
