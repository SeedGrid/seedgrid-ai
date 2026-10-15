# AGENTS.md — vault seedgrid-brain

Instruções para agentes (Claude Code, Codex etc.) que trabalham neste vault Obsidian.

<!-- seedgrid-docs:start -->
## Documentação técnica SeedGrid (`SeedGrid/`)

Esta pasta documenta o código de `D:\empreendedorismo\seedgrid\seedgrid-platform`:
- `java/seedgrid-quarkus-*` — extensions e libraries Quarkus (cada uma é um repositório Git próprio);
- `rust/` — crates Rust (porte 1:1 das extensions; Java é a fonte da verdade);
- `front/seedgrid-fe-components/` — pacotes React `@seedgrid/fe-*` e o app `showcase`.

### Como consultar
1. Comece pelos índices, não por buscas em toda a base:
   - `SeedGrid/Visao-geral.md` → ponto de entrada;
   - `SeedGrid/Extensions/Catalogo-de-propriedades.md` → toda propriedade de configuração que funciona, com link;
   - `SeedGrid/Extensions/Catalogo-de-enums.md` → enums por extension (valores, onde são tratados);
   - `SeedGrid/Extensions/Indice.md` e `SeedGrid/SeedGrid-components/Indice.md`;
   - `SeedGrid/Mapa-dos-repositorios.md` → repositórios, commits analisados e dependências;
   - `SeedGrid/Versoes.md` → versão que cada nota descreve × versão atual de cada artefato (**gerada por script**, não edite à mão).
2. Antes de responder algo que dependa do estado atual do código, confirme no repositório de origem (o commit da nota pode estar desatualizado: compare com `git -C <repo> log -1`).

### Como atualizar
- Quando uma API, propriedade de configuração, prop de componente ou default mudar, atualize **todas** as notas afetadas: a nota da extension/componente, o `Catalogo-de-propriedades.md` e os índices.
- Atualize no frontmatter `commit` e `analisado-em` das notas que você revisou. Mantenha a data e o commit da análise rastreáveis. Só mude esses campos depois de **revisar de fato** a nota contra o código: eles afirmam "esta nota descreve o código neste commit".
- `SeedGrid/Versoes.md` é gerada: depois de revisar notas ou de uma nova versão publicada, rode `node scripts/kb-versions.mjs --write` na raiz do repositório do toolkit. Ela lista as notas defasadas em relação ao código.
- Preserve propriedades YAML, tags e links internos existentes; acrescente, não substitua.
- Links internos sempre com caminho completo (`[[SeedGrid/Extensions/security/Configuracao|...]]`), pois existem várias notas com o mesmo nome (`Visao-geral`, `API`, `Exemplos`).
- Não invente comportamentos, nomes de propriedade ou valores padrão. Marque **Confirmado / Inferência / Não confirmado** e cite arquivo + símbolo de origem.
- Nunca copie segredos, tokens, valores de `.env`/`dev.env` ou dados de clientes; use placeholders e 🔒.
- Exemplos de configuração não são valores padrão — não os apresente como tal.
- Documente **apenas o que funciona**: propriedade/prop/variável declarada mas nunca lida não entra na doc. Se a nota já existia, remova a menção; não deixe registros de limpeza dentro do vault.
- Valores de enum: todos documentados em `Enums.md` (Java) ou na seção "Enums" do `Rust.md`, inclusive os que nenhum código trata (diga isso).
- Estrutura por extension: `Visao-geral.md`, `Configuracao.md` (Quarkus), `Exemplos.md`, `Enums.md` (quando houver enums), e quando houver crate: `Rust.md`, `Configuracao-Rust.md`. Por grupo de componentes: `Visao-geral.md`, `API.md`, `Exemplos.md`.

### O que não fazer sem pedido explícito
- Não modificar os repositórios de origem (código, configs, git).
- Não modificar a pasta `.obsidian`, instalar plugins ou registrar agentes.
- Não excluir notas nem sobrescrever alterações manuais; em conflito, pergunte.
- Não rodar builds que publiquem artefatos, façam deploy ou alterem serviços externos.
<!-- seedgrid-docs:end -->
