---
name: sg-dev-env
description: "Gera o dev.env (variáveis de ambiente de desenvolvimento) de qualquer projeto a partir do dev.env.example ou .env.example, com segredos novos do tipo certo e sem inventar credencial de fornecedor externo. Use quando o usuário pedir para criar, completar ou refazer o dev.env, ou quando um projeto recém-clonado não sobe por falta de variável."
metadata:
  toolkit: seedgrid-ai
---

# Gerar o `dev.env`

O `dev.env` guarda as variáveis de desenvolvimento do projeto: senhas do banco, chaves de criptografia, par de chaves do JWT, e-mail do administrador. Ele **nunca vai para o git**. Esta skill o gera a partir do arquivo de exemplo, com um script determinístico, e diz o que ainda precisa ser preenchido à mão.

## Quando usar
- Projeto recém-clonado ou recém-gerado sem `dev.env`.
- "Falta variável" ao subir o backend.
- Um `dev.env.example` ganhou variáveis novas e o `dev.env` do desenvolvedor precisa delas.

Não use para produção: segredo de produção mora no cofre do ambiente, nunca num arquivo gerado.

## Passos
1. Rode, na pasta do projeto: `node .ai/skills/sg-dev-env/scripts/gerar-dev-env.mjs --destino .` (acrescente `--exemplo <arquivo>` se o exemplo tiver outro nome e `--saida <arquivo>` para outro destino). O script procura `dev.env.example`, `backend/dev.env.example`, `.env.example` e `backend/.env.example`, nessa ordem.
2. **Leia o relato, não o arquivo.** O script diz quantos segredos gerou (por tipo), quantos valores copiou, o que manteve e as **pendências**. Ele nunca imprime valor de segredo, e você também não deve imprimir o conteúdo do `dev.env` na conversa.
3. Se houver **REVISAR** (um placeholder dentro de um valor maior, como a senha numa URL `mongodb://admin:change-me@...`), troque à mão: o script não reescreve URL.
4. Se houver **pendências** (credencial de fornecedor externo, como Stripe, Google, Facebook, OpenAI, AWS, Twilio, Qdrant), diga ao usuário quais são e onde se obtêm: elas nascem no painel do fornecedor, e a variável fica em branco. **Nunca invente** uma chave.
5. Confirme que `dev.env` está no `.gitignore` (o script acrescenta se faltar e avisa).

## O que o script faz
- **Valor que não é placeholder** é copiado como está (URLs, portas, flags).
- **Placeholder** (vazio, `change-me`, `<...>`, `${externo}`) de **segredo** vira segredo novo, do tipo certo **pelo nome da variável**: senha aleatória; senha do administrador com a política do security (mínimo 8, maiúscula, minúscula, especial, sem repetição seguida); chave de 32 bytes em base64 (criptografia, hash de busca); segredo ou token em hex; **par RSA** para o JWT (a chave privada e a pública saem do mesmo par).
- **dev.env já existe:** só acrescenta o que falta; nunca troca valor existente nem apaga variável sua. Para refazer os segredos, rode com `--forcar` (isso troca as senhas, então o banco que já foi criado com a senha antiga deixa de aceitar a nova: avise o usuário antes).
- O arquivo sai com permissão restrita (onde o sistema permite).

## Regras
- Nunca coloque segredo em log, relato ou commit; nunca copie o `dev.env` para outro lugar.
- O `dev.env` do desenvolvedor é dele: não sobrescreva sem `--forcar` e sem avisar.
- O tipo do segredo vem do **nome** da variável. Se uma variável tem nome fora do padrão (por exemplo `FOO`), o script a deixa como está e você a trata à mão.
- **Limite:** o script não sincroniza valores que o `docker-compose.yml` lê do `.env` da raiz (por exemplo `POSTGRES_PASSWORD` do compose contra `SEEDGRID_DB_PASSWORD` do backend): cada arquivo recebe uma senha própria. Em produto gerado pelo `sg-new-product` isso já vem coerente (o scaffold usa o mesmo segredo nos dois); para outros projetos, copie o valor à mão ou rode o compose com a mesma senha.
- Teste do script: `tests/gerar-dev-env.test.ts` no repositório do `seedgrid-ai`.
