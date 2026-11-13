---
description: "Modelo de demanda do produto à plataforma: lacuna da KB ou limitação de extension (HO-08)."
---
# Demanda P<plano>.F<fase>.DEM<n> — <assunto>

```yaml
plano: <número>
fase: F<n>   # F0 = demanda do plano todo
status: aberta   # aberta | respondida
data: AAAA-MM-DD
aidlc: <versão lida de .ai/toolkit-lock.json>
```

Arquivo em `docs/ai/demands/P<plano>.F<fase>.DEM<n>-AAAA-MM-DD-assunto.md`. Regras: [limites do host](../rules/limites-do-host.md) (HO-08) e [documentos](../rules/documentos.md).

| Campo | Preencha |
|---|---|
| O que se esperava | O que a tarefa precisava saber ou obter da extension ou biblioteca |
| O que acontece | O defeito, a limitação ou a informação que falta |
| Versão usada | Extension ou biblioteca e a versão (do `pom.xml`/`package.json`) |
| Como reproduzir | Passos mínimos, quando for defeito |

## Consulta ao fonte (preencha se alguém abriu o código ou descompilou)

| Campo | Preencha |
|---|---|
| Biblioteca ou classe consultada | Nome e versão (por exemplo, `seedgrid-security`, classe `X`) |
| Pergunta que a KB não respondeu | Uma frase |
| Onde a KB foi consultada | Páginas lidas em `.ai/brain/` (`Visao-geral`, `SPIs`, `Exemplos`, `Configuracao`) |
| Por que não bastou | Página ausente, incompleta ou desatualizada |
| O que o código mostrou | A resposta, para a doc fechar a lacuna na KB |
