---
name: sg-new-skill
description: Cria uma skill nova no projeto - pergunta nome, descrição, quando usar e passos, e grava o SKILL.md em .ai/skills e nas pastas nativas do Claude Code e do Codex, atualizando o índice. Use SEMPRE que pedirem para criar, adicionar ou escrever uma skill, ou para transformar um procedimento repetido em skill.
metadata:
  toolkit: seedgrid-ai
---

# Criar uma skill

Toda skill nova do projeto nasce por aqui, para ficar completa e nos lugares certos. Não crie skill escrevendo arquivos soltos.

## Passos

1. **Levantar os dados.** Pergunte o que faltar (junte as perguntas numa só mensagem e não pergunte o que o pedido já respondeu):
   - **Nome:** minúsculas, números e hífens (`^[a-z0-9]+(-[a-z0-9]+)*$`), curto e específico (`gerar-relatorio-mensal`). Verbo ou tarefa, não "ajuda".
   - **Objetivo:** o que a skill faz e o resultado esperado.
   - **Quando usar:** os pedidos e situações que devem acioná-la (e, se houver, quando **não** usar).
   - **Passos:** o procedimento, as regras e os cuidados. Se o usuário não tiver, proponha um rascunho e peça confirmação.
   - **Arquivos de apoio:** checklists, exemplos ou scripts que valham um arquivo à parte (opcional).
2. **Conferir duplicidade.** Veja `.ai/skills/`, `.claude/skills/` e `.agents/skills/`. Se já existir skill com o nome, ou outra que cubra o mesmo caso, mostre e pergunte se estende a existente. Nunca sobrescreva sem pedido explícito. Nomes que começam com `sg-` são reservados às skills do toolkit: o `update` as gerencia e uma skill do projeto com esse prefixo pode ser substituída. Não use `sg-` nas skills do projeto; se o usuário pedir esse prefixo, avise do risco e sugira outro.
3. **Escrever o `SKILL.md`** em `.ai/skills/<nome>/SKILL.md`:
   - Frontmatter só com `name` (igual ao nome da pasta) e `description`. Não use campos específicos de uma ferramenta (`context`, `allowed-tools`, `model` etc.).
   - `description` em uma ou duas frases: o que faz **e quando usar**, com as palavras que o usuário diria. Se tiver `:`, ponha entre aspas. É por ela que o modelo decide chamar a skill, então seja específico.
   - Corpo curto e direto: passos numerados, regras e saída esperada. Detalhes longos vão em `references/<assunto>.md`, citados no `SKILL.md` com link relativo. Nada de segredos, nem caminhos absolutos da sua máquina.
4. **Copiar para as pastas nativas**, com o mesmo conteúdo (inclusive `references/` e demais arquivos), apenas nos destinos que o projeto usa: `.claude/skills/<nome>/` se a pasta `.claude/skills/` existir, `.agents/skills/<nome>/` se `.agents/skills/` existir. Sem nenhuma das duas, fique só com `.ai/skills/` e avise que a skill só será usada se o modelo ler o índice.
5. **Registrar no índice do projeto.** Acrescente a skill em `.ai/skills/projeto.md` (crie se não existir, com o título `# Skills do projeto`), uma linha por skill: `- [nome](nome/SKILL.md): descrição`. **Não edite `.ai/skills/index.md`**: ele é gerado pelo toolkit e o `update` o reescreve (ele já cita o `projeto.md`).
6. **Conferir.** Releia o `SKILL.md` gravado, confirme que as cópias são idênticas à de `.ai/skills/`, que nenhum link relativo está quebrado e que o `name` bate com a pasta.
7. **Entregar.** Liste os arquivos criados e diga como usar: pelo nome (`/<nome>` no Claude Code, `$<nome>` no Codex) ou pedindo a tarefa com as palavras da descrição. Avise que uma sessão nova da ferramenta é necessária para listar a skill no menu.

## Cuidados

- Skills do projeto (inclusive o `projeto.md`) não entram no lock do toolkit: o `seedgrid-ai update` atualiza o conteúdo do toolkit e não as altera nem as remove. Para virarem parte do toolkit, precisam ser adicionadas ao conteúdo do `seedgrid-ai` (fonte e manifesto).
- Uma skill, uma finalidade. Se a descrição precisa de "e também", provavelmente são duas skills.
- Não duplique regras que já estão em `.ai/rules/`: cite o arquivo.
- Para alterar uma skill existente do projeto, edite as três cópias e mantenha-as iguais.
