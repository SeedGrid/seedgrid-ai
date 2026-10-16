---
name: sg-new-skill
description: Cria ou altera uma skill do projeto - pergunta nome, descrição, quando usar e passos, grava o SKILL.md em .ai/skills e sincroniza as pastas nativas do Claude Code e do Codex, atualizando o índice. Use SEMPRE que pedirem para criar, adicionar, escrever, editar, ajustar, renomear ou remover uma skill, ou para transformar um procedimento repetido em skill.
metadata:
  toolkit: seedgrid-ai
---

# Criar ou alterar uma skill

Toda skill nova do projeto nasce por aqui, e toda alteração passa por aqui, para ficar completa e nos lugares certos. Não crie nem edite skill escrevendo arquivos soltos. Para **alterar** uma skill existente, vá direto à seção [Alterar uma skill existente](#alterar-uma-skill-existente); os passos abaixo são de **criação**.

## Passos (criar)

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

## Alterar uma skill existente

Vale para editar o conteúdo, ajustar a descrição, renomear ou remover.

1. **Localizar.** Confirme o nome em `.ai/skills/`. Se não existir, ofereça criar (passos acima). Leia a `.ai/skills/<nome>/` inteira (`SKILL.md` e `references/`).
2. **Verificar o dono.** Se o nome começa com `sg-`, ela é do toolkit: o `seedgrid-ai update` a sobrescreve e a edição local se perde. Avise e ofereça duas saídas: (a) alterar no conteúdo do `seedgrid-ai` (fonte e manifesto) para valer para todos; (b) criar uma skill do projeto com outro nome, sem `sg-`, que estenda ou substitua o comportamento. Só edite a cópia local de uma `sg-*` se o usuário insistir, e deixe claro que é temporário.
3. **Comparar as cópias.** Veja se `.claude/skills/<nome>/` e `.agents/skills/<nome>/` (as que existirem) estão iguais a `.ai/skills/<nome>/`. Se divergirem, mostre a diferença e pergunte qual vale antes de editar.
4. **Combinar a mudança.** Resuma o que vai mudar (antes e depois) e confirme se for uma mudança grande. Respeite as regras do passo 3 de criação: frontmatter só com `name` e `description`, corpo curto, detalhes em `references/`.
5. **Editar em `.ai/skills/<nome>/`** e só depois replicar o resultado, com o mesmo conteúdo, nas pastas nativas que o projeto usa.
   - **Renomear:** mude a pasta e o `name` do frontmatter, nas três pastas e nos links relativos. Procure referências ao nome antigo em outras skills, em `.ai/rules/` e no `projeto.md`.
   - **Remover:** só com pedido explícito. Apague a pasta nas três e a linha do `projeto.md`.
6. **Atualizar o índice.** Se a descrição, o nome ou a existência mudou, ajuste a linha em `.ai/skills/projeto.md`. Não edite `.ai/skills/index.md`.
7. **Conferir.** Releia o `SKILL.md` gravado, confirme que as cópias são idênticas, que nenhum link relativo está quebrado e que o `name` bate com a pasta.
8. **Entregar.** Liste os arquivos alterados, resuma a mudança e avise que uma sessão nova da ferramenta é necessária para o menu refletir nome ou descrição novos.

## Cuidados

- Skills do projeto (inclusive o `projeto.md`) não entram no lock do toolkit: o `seedgrid-ai update` atualiza o conteúdo do toolkit e não as altera nem as remove. Para virarem parte do toolkit, precisam ser adicionadas ao conteúdo do `seedgrid-ai` (fonte e manifesto).
- Uma skill, uma finalidade. Se a descrição precisa de "e também", provavelmente são duas skills.
- Não duplique regras que já estão em `.ai/rules/`: cite o arquivo.
- Nunca deixe as cópias divergirem: toda edição termina com as três pastas idênticas.
