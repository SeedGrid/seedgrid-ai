# SeedGrid AI Toolkit — especificação e instruções de implementação

## Pedido para a IA que vai implementar

Implemente localmente o projeto descrito neste documento. Trabalhe na pasta que eu indicar. Inspecione os arquivos existentes e preserve alterações e configurações anteriores. Crie o código, conteúdo inicial, documentação e testes necessários; não se limite a apresentar um plano. Eu criarei o repositório GitHub depois. Não crie repositório remoto nem publique no npm nesta etapa.

Antes de implementar adaptadores, confira a documentação oficial atual e as versões instaladas do Claude Code e Codex. Não invente campos de configuração nem prometa funcionalidades que o ambiente não suporta. Registre incompatibilidades no diagnóstico. Use decisões deste documento como padrão e pergunte apenas quando faltar uma informação indispensável.

O alvo é Claude Code e Codex em ambientes locais, incluindo suas integrações com editor quando elas carregarem as mesmas configurações. Claude Desktop, Cowork, Claude web e ChatGPT têm mecanismos distintos: não prometa que escrever arquivos locais registra automaticamente habilidades nesses produtos. Caso eu execute este pedido no Claude Desktop, ele precisará de acesso à pasta e ferramentas de execução para implementar; caso contrário, entregue instruções claras para executar no Claude Code.

## Objetivo

Manter agentes, skills, regras, templates e referências em uma fonte versionada, independente do provedor. Instalar esse conteúdo em projetos locais com um comando e torná-lo disponível para Claude Code e Codex pelos mecanismos nativos suportados.

O toolkit não é um orquestrador de APIs de modelos. Não fará chamadas à OpenAI ou Anthropic, não guardará credenciais de modelos e não escolherá fornecedores durante execução. Ele instala instruções e configurações; a ferramenta de IA executa e coordena o trabalho.

## Tecnologia e distribuição

Usar Node.js LTS suportado na época da implementação e TypeScript. Definir a versão mínima em engines, compilar para JavaScript e expor um executável pelo campo bin do package.json. Nome proposto do pacote: @seedgrid/ai-toolkit; comando local: seedgrid-ai. Confirmar disponibilidade do nome apenas antes da publicação.

npx não é linguagem: é um meio de executar pacotes npm. Um CLI em Rust também poderia ser distribuído com um wrapper npm, mas exigiria binários para Windows, Linux e macOS e suas arquiteturas. Como este projeto manipula Markdown, JSON, YAML, TOML e arquivos, TypeScript é a escolha inicial. Não introduzir Rust no MVP. Reavaliar se surgir uma necessidade concreta de binário independente de Node.

O pacote npm deve incluir o bundle de conteúdo, além do CLI. A instalação padrão usa esse conteúdo empacotado, sem baixar main do GitHub. Para desenvolvimento, aceitar uma pasta local como fonte. Assim, a versão do CLI identifica o conteúdo distribuído e permite reprodução.

## Estrutura do repositório

| Caminho | Responsabilidade |
| --- | --- |
| package.json | Scripts, engines, bin e arquivos distribuídos |
| src/cli.ts | Entrada e parsing de argumentos |
| src/commands/ | init, update, status, doctor, remove |
| src/core/ | Planejamento, validação, hashes, conflitos e escrita |
| src/adapters/ | Integrações específicas de Claude Code e Codex |
| content/manifest.json | Manifesto do conteúdo distribuído |
| content/agents/ | Papéis e catálogo independentes da ferramenta |
| content/skills/ | Skills no padrão aberto Agent Skills |
| content/rules/ | Regras comuns e de coordenação |
| content/templates/ | Modelos reutilizáveis de artefatos |
| content/references/ | Conhecimento estático e referências |
| tests/ | Testes do instalador em diretórios temporários |
| docs/ | Arquitetura, instalação, formato e manutenção |

Uma skill fica em content/skills/<nome>/SKILL.md e pode incluir scripts/, references/ e assets/. Usar inicialmente apenas metadados portáveis, como name e description; extensões específicas ficam no adaptador ou são documentadas como opcionais.

## Agentes e skills são diferentes

Skill: procedimento reutilizável que a IA pode consultar e executar quando relevante.

Agente: papel especializado com responsabilidades, contexto, limites e critérios de entrega. Um Markdown referenciado no AGENTS.md não equivale a um subagente registrado com contexto isolado.

Disponibilizar dois modos:

- shared, padrão: catálogo, papéis e regras compartilhadas; o coordenador lê os papéis e usa delegação disponível na ferramenta. Se não houver subagentes, aplica os papéis na sessão principal e informa isso.
- native, opcional: adaptar os mesmos papéis ao registro nativo de subagentes de cada ferramenta, após validar suporte e formato. Não duplicar a autoria das instruções.

Seleção e passagem de tarefas são comportamentos orientados por instruções, não garantias determinísticas do instalador. Fluxos obrigatórios precisam ser declarados; indisponibilidade de delegação deve ser explícita.

## Destino de uma instalação por projeto

| Destino | Conteúdo |
| --- | --- |
| .ai/agents/ | Papéis e catálogo compartilhados |
| .ai/rules/ | Regras de coordenação |
| .ai/templates/ | Templates |
| .ai/references/ | Referências comuns |
| .ai/toolkit-lock.json | Versão, opções e hashes de arquivos gerenciados |
| .ai/backups/ | Backups locais, ignorados pelo Git |
| .agents/skills/<nome>/ | Skills para Codex |
| .claude/skills/<nome>/ | Skills para Claude Code |
| AGENTS.md | Bloco gerenciado que referencia o toolkit |
| CLAUDE.md | Bloco gerenciado que manda ler AGENTS.md e regras compartilhadas |

No modo native, o adaptador Claude gera definições em .claude/agents/. O adaptador Codex gera configurações no formato oficialmente suportado pela versão instalada, preservando chaves e papéis existentes. Documentar os caminhos concretos validados; não assumir que o formato de Claude funciona no Codex.

Usar cópias de arquivos no MVP para evitar problemas de symlink no Windows. Cada skill deve ser autocontida, com os recursos relativos necessários. Criar cópias a partir da mesma fonte e verificar consistência por hash.

Não copiar conteúdo para uma pasta e assumir que será anunciado automaticamente: doctor deve verificar cada destino de descoberta. Recomendar abrir uma nova sessão após instalação ou atualização; não prometer recarga universal.

## Formato dos papéis

Definir um schema próprio, documentado, para os Markdown de agentes. Exemplo conceitual:

```yaml
---
id: backend-java
description: Implementa APIs Java e persistência quando a tarefa altera o backend.
capabilities: [read-files, edit-files, run-checks]
preferred_skills: [java-api, validate-change]
---
```

O corpo define objetivo, quando usar, entradas necessárias, responsabilidades, limites e formato da entrega. capabilities são intenções portáveis: o adaptador traduz somente o que a ferramenta suporta. Restrições escritas em prompt não são mecanismos de segurança; não alegar que uma instrução de leitura impede tecnicamente escrita.

O catálogo deve ser curto, para seleção sem carregar todos os prompts. A definição completa é lida apenas para papéis relevantes. Não fixar nomes de modelos no conteúdo compartilhado.

## Coordenação inicial

Criar papéis: arquiteto, backend-java, frontend-react, revisor e validador. Manter instruções genéricas e personalizáveis; não assumir detalhes inexistentes dos projetos SeedGrid.

O coordenador deve:

1. Entender o objetivo e avaliar se exige especialização.
2. Selecionar papéis pelo catálogo e ler suas definições.
3. Para delegação, fornecer objetivo, contexto, arquivos envolvidos, limites, critérios de aceite e resultado esperado.
4. Paralelizar somente tarefas independentes; evitar escrita concorrente nos mesmos arquivos.
5. Receber entregas, verificar pendências e encaminhar contexto ao próximo papel.
6. Repassar correções ao implementador e consolidar a resposta final.
7. Para mudanças de código substanciais, exigir revisão e validação proporcionais ao risco; tarefas triviais podem ser diretas.

Formato de entrega dos agentes: resultado, arquivos alterados, verificações executadas, problemas pendentes e contexto para a próxima etapa. Não exigir raciocínio interno privado.

Criar skills iniciais pequenas e úteis: planejar-mudanca, revisar-codigo e validar-mudanca. Criar templates de especificação de tarefa, decisão de arquitetura e relatório de validação. Artefatos produzidos em tarefas reais não devem se tornar parte do toolkit automaticamente: distinguir templates distribuídos de saídas de cada projeto.

## Comandos do MVP

Os comandos abaixo são a interface a implementar, não comandos já publicados.

```bash
seedgrid-ai init --target both --mode shared
seedgrid-ai init --target both --mode native
seedgrid-ai init --source ./content --dry-run
seedgrid-ai status
seedgrid-ai doctor
seedgrid-ai update --dry-run
seedgrid-ai update
seedgrid-ai remove --dry-run
seedgrid-ai remove
```

target aceita claude, codex ou both. A pasta atual é o projeto padrão; oferecer --project <caminho>. Resolver caminhos com espaços e caracteres Unicode. init é idempotente e não cria instalação duplicada. --dry-run gera o plano e não escreve nenhum arquivo. Oferecer --json para diagnóstico e plano consumíveis por scripts.

update aplica a versão de conteúdo incluída no CLI em execução ou uma fonte local explícita. Não fazer atualização remota silenciosa. Uma futura atualização via npm pode ser:

```bash
npx @seedgrid/ai-toolkit@1.0.0 init --target both
npx @seedgrid/ai-toolkit@1.1.0 update
```

Esses exemplos só funcionarão depois de publicar as respectivas versões. Para uso local, documentar build e execução do JavaScript compilado sem depender do npm público, além de npm link como opção.

Deixar instalação global para uma segunda fase: regras de projeto e regras pessoais têm escopos diferentes e não devem ser confundidas.

## Preservação, conflitos e rastreabilidade

- Nunca substituir AGENTS.md ou CLAUDE.md inteiros. Usar marcadores BEGIN/END SEEDGRID AI TOOLKIT e alterar somente esse bloco.
- Registrar hashes SHA-256 dos arquivos instalados e do bloco gerenciado. Se o conteúdo local divergir do último instalado, tratar como conflito.
- Planejar e verificar conflitos antes da escrita. Por padrão, abortar a operação inteira quando houver conflito; --yes não deve autorizar sobrescrita de customizações.
- Guardar backups dos arquivos existentes que serão modificados, com identificador de operação. Documentar recuperação. Tentar rollback se a escrita falhar; relatar qualquer rollback incompleto.
- Usar arquivos temporários e renomeação para escrita segura onde suportado. Não prometer atomicidade global em múltiplos arquivos.
- remove apaga somente arquivos gerenciados sem alterações locais e os blocos intactos. Não apagar pastas com conteúdo de terceiros. Havendo customizações, abortar e apresentar o conflito.
- Manter configurações locais fora da fonte gerenciada, por exemplo .ai/local/, sem sobrescrever. Referenciar essas personalizações nas regras.
- Validar nomes, IDs únicos, schema, referências e existência dos recursos antes de instalar. Rejeitar caminhos que escapem do projeto e symlinks de destino que escrevam fora dele.
- Não executar scripts das skills na instalação. Não escrever tokens em arquivos versionados nem alterar permissões de execução da IA para facilitar tarefas.

## Manifesto e lock

O manifesto deve incluir versão do schema, versão do conteúdo, componentes e arquivos de cada componente. Pode haver perfis futuros, mas não criar um sistema complexo de dependências no MVP.

O lock deve registrar versão do CLI, versão do conteúdo, targets, modo, origem, hashes e arquivos/blocos gerenciados. Usar caminhos relativos portáveis; não registrar caminhos absolutos específicos do computador. Tratar o lock como dado de entrada não confiável antes de usar seus caminhos em remoção.

## Verificação necessária

Testar instalação nova, repetição sem mudanças, atualização de conteúdo intacto, conflito local, preservação de texto anterior/posterior aos marcadores, dry-run sem escritas, remoção, nomes inválidos, referências quebradas, caminhos com espaços e Unicode e falha de escrita com recuperação.

Verificar native separadamente para cada versão disponível. doctor deve distinguir configuração sintaticamente válida de descoberta real pelo produto. Quando uma ferramenta não estiver instalada, relatar que o teste real não foi executado.

Executar smoke test manual numa pasta descartável com Claude Code e Codex: verificar skills disponíveis, instruções carregadas e, em native, agentes registrados. Não usar tarefa que publique ou modifique serviços externos.

Critérios de aceite:

1. O CLI funciona localmente após instalar dependências e compilar.
2. Uma execução instala os dois targets em projeto descartável.
3. As skills têm descrição e recursos completos nos destinos corretos.
4. As instruções compartilham catálogo e coordenação sem duplicar autoria.
5. Reinstalar não altera arquivos nem duplica blocos.
6. Customizações preexistentes são preservadas ou geram conflitos claros.
7. status e doctor explicam instalação, divergências e limitações.
8. README ensina uso local, futura distribuição npm e criação posterior do GitHub.
9. native não é apresentado como funcional sem validação; se indisponível, shared continua utilizável com limitação explícita.

## Entregas e sequência

Implementar primeiro core, modo shared, conteúdo inicial e testes. Depois implementar adaptadores native validados. Entregar README em português, documentação de autoria, comandos executáveis localmente, resumo das verificações e lista de limitações reais.

Preparar package.json para npm pack; inspecionar o tarball para assegurar inclusão de conteúdo e exclusão de backups, credenciais e arquivos temporários. A publicação e criação do repositório serão feitas posteriormente por mim. Não bloquear a implementação local por ausência de GitHub ou npm.

## Documentação oficial para conferir

- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code subagentes: https://code.claude.com/docs/en/sub-agents
- Codex skills: https://developers.openai.com/codex/skills
- Codex subagentes: https://developers.openai.com/codex/multi-agent
- Padrão Agent Skills: https://agentskills.io
- Instalador de skills existente, útil como alternativa parcial: https://github.com/vercel-labs/skills

Os formatos de configuração mudam. Conferir as páginas atuais durante a implementação e documentar as versões testadas, especialmente para configuração nativa de agentes.
