---
description: "Limites de quem usa o host: nunca altera extension da plataforma, registra lacunas como demanda em docs/ai/ e mantém documentos do produto separados dos da plataforma. Leia antes de decidir mexer em extension, boilerplate ou em documento que não seja do produto."
---
# Limites do host (HO-08 e HO-09)

Quem desenvolve um produto com o toolkit de host **usa** as extensions SeedGrid; não as desenvolve. Não tem o fonte delas, e não deve ter.

- **HO-08. O host nunca altera extension da plataforma** (nem o fonte, nem o `pom.xml` de uma extension, nem uma cópia local dela). Usa as versões publicadas e lê o contrato pela KB (`.ai/brain/`). Se a KB não responde o que a tarefa precisa, isso é **falha da KB**, não motivo para abrir o código da extension.
- **Lacuna vira demanda.** Defeito, limitação ou informação que falta numa extension ou na KB é registrado em `docs/ai/demands/AAAA-MM-DD-assunto.md` do produto (o que se esperava, o que acontece, versão usada, como reproduzir), e a tarefa segue com o que a extension oferece (configuração, SPI, ponto de extensão do próprio produto). Nunca com remendo no fonte da extension.
- **HO-09. Documentos do produto ficam no produto.** Plano, ADR, handoff, especificação e relatório do produto moram em `docs/ai/<tipo>/` do produto (veja [documentos](documentos.md)). Os documentos da plataforma (planos de extension, ADRs da plataforma, KB de plataforma) não são lidos nem gravados a partir de um produto, e o produto não os referencia.
- O `boilerplate` copiado em `.ai/boilerplates/` é **modelo**: a cópia criada no produto é do produto e pode ser alterada; o modelo em `.ai/boilerplates/` é gerenciado e não se edita.
