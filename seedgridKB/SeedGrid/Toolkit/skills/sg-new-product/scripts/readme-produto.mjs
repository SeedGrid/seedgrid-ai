// README.md do produto gerado: esqueleto com o que se deriva de produto.json e do docker-compose.yml (C1 e C2 em Mermaid,
// C3 com as extensions so pelo nome) e marcadores `<!-- sg:preencher: ... -->` para o que e do dominio do host
// (o que o produto faz, como funciona, fluxos). A skill preenche os marcadores; o guardiao (`marcadoresPendentes`) aponta o que sobrou.
// So dominio do host: o que cada extension faz fica na KB (.ai/brain/), o README so cita o nome.

export const MARCADOR = 'sg:preencher';
export const SECOES = ['Visão', 'Como funciona', 'Contexto (C1)', 'Contêineres (C2)', 'Componentes do backend (C3)', 'Fluxos principais', 'Como rodar'];

const limpa = (s) => String(s ?? '').replace(/["\r\n]/g, ' ').trim();
const id = (s) => 'n_' + String(s).replace(/[^A-Za-z0-9]/g, '_');

const EXTERNOS = {
  billing: ['stripe', 'Stripe', 'Provedor de cobranca'],
  notification: ['smtp', 'Servidor SMTP', 'Envio de e-mails (em desenvolvimento, o Mailpit)'],
  filemanagement: ['storage', 'Armazenamento de arquivos', 'Disco, MinIO ou nuvem, conforme a configuracao'],
};

export function readmeProduto(produto, portas = { servicos: [], apps: [] }) {
  const nome = limpa(produto.nome ?? produto.slug);
  const exts = produto.extensoes ?? [];
  const apps = (produto.servicos ?? []).map((s) => s.nome);
  const apoio = (portas.servicos ?? []).filter((s) => !apps.includes(s.servico));
  const usuarios = produto.publico === 'b2c' ? 'Cliente final' : produto.modelo === 'modular' ? 'Usuário interno' : 'Usuário da empresa cliente';
  const l = [];
  l.push(`# ${nome}`, '');
  l.push('## Visão', '');
  l.push(produto.apikeysUso ? limpa(produto.apikeysUso) : `<!-- ${MARCADOR}: em 2 ou 3 frases, o que o produto faz e para quem -->`, '');
  l.push(`<!-- ${MARCADOR}: problema que resolve e quem usa; sem repetir o que as extensions documentam -->`, '');
  l.push('## Como funciona', '');
  l.push(`<!-- ${MARCADOR}: regras e fluxos do dominio do produto (o que o host acrescenta sobre as extensions) -->`, '');

  l.push('## Modelo C4', '', '### Contexto (C1)', '', '```mermaid', 'C4Context', `  title Contexto de ${nome}`);
  l.push(`  Person(usuario, "${usuarios}", "Usa o produto pelo navegador")`);
  l.push(`  System(produto, "${nome}", "Produto SeedGrid")`);
  const externos = [...new Set(exts.filter((e) => EXTERNOS[e]))];
  for (const e of externos) l.push(`  System_Ext(${EXTERNOS[e][0]}, "${EXTERNOS[e][1]}", "${EXTERNOS[e][2]}")`);
  l.push('  Rel(usuario, produto, "Usa")');
  for (const e of externos) l.push(`  Rel(produto, ${EXTERNOS[e][0]}, "Usa")`);
  l.push('```', '', `<!-- ${MARCADOR}: acrescente em C1 os sistemas externos do dominio (ex.: o servidor MCP que valida as chaves) -->`, '');

  l.push('### Contêineres (C2)', '', '```mermaid', 'C4Container', `  title Contêineres de ${nome}`);
  l.push(`  Person(usuario, "${usuarios}", "")`);
  l.push(`  System_Boundary(sistema, "${nome}") {`);
  for (const s of produto.servicos ?? []) l.push(`    Container(${id(s.nome)}, "${limpa(s.nome)}", "${s.tipo === 'backend' ? 'Quarkus (Java)' : 'Next.js'}", "Porta ${s.porta}")`);
  for (const s of apoio) l.push(`    ContainerDb(${id(s.servico)}, "${limpa(s.servico)}", "${limpa(s.imagem)}", "${limpa(s.finalidade)}")`);
  l.push('  }');
  const front = apps.filter((a) => a !== 'backend');
  for (const a of front) l.push(`  Rel(usuario, ${id(a)}, "Usa")`);
  for (const a of front) if (apps.includes('backend')) l.push(`  Rel(${id(a)}, ${id('backend')}, "HTTP/JSON")`);
  if (!front.length && apps.includes('backend')) l.push(`  Rel(usuario, ${id('backend')}, "HTTP/JSON")`);
  for (const s of apoio) if (apps.includes('backend') && !/mockoon/i.test(s.servico)) l.push(`  Rel(${id('backend')}, ${id(s.servico)}, "Usa")`);
  l.push('```', '');

  l.push('### Componentes do backend (C3)', '', '```mermaid', 'C4Component', `  title Componentes do backend de ${nome}`);
  l.push('  Container_Boundary(backend, "backend") {');
  l.push('    Component(dominio, "Domínio do host", "Quarkus", "Recursos e regras próprios deste produto")');
  for (const e of exts) l.push(`    Component(${id(e)}, "seedgrid-${limpa(e)}", "Extension SeedGrid", "Ver KB: .ai/brain/SeedGrid/Extensions/${limpa(e)}")`);
  l.push('  }');
  for (const e of exts) l.push(`  Rel(dominio, ${id(e)}, "Usa")`);
  l.push('```', '', `<!-- ${MARCADOR}: nomeie os componentes do dominio do host (recursos, servicos, jobs) no lugar de "Dominio do host" -->`, '');

  l.push('## Fluxos principais', '');
  l.push(`<!-- ${MARCADOR}: diagrama de sequencia (Mermaid sequenceDiagram) dos fluxos do dominio que valem a pena; se nao houver, escreva "Nenhum fluxo alem do que as extensions ja documentam." -->`, '');

  l.push('## Como rodar', '', 'Comandos, portas e serviços estão em [`docs/COMO-RODAR.md`](docs/COMO-RODAR.md). Variáveis em `backend/dev.env.example`.', '');
  if (exts.length) l.push('## Extensions usadas', '', exts.map((e) => `\`${e}\``).join(', ') + '. O que cada uma faz está na KB do projeto (`.ai/brain/`), não aqui.', '');
  return l.join('\n');
}

/** Marcadores que sobraram no README (a skill deve ter preenchido todos antes de entregar). */
export function marcadoresPendentes(texto) {
  return [...String(texto).matchAll(new RegExp(`<!--\\s*${MARCADOR}:([^>]*?)-->`, 'g'))].map((m) => m[1].trim());
}

/** Erros do guardiao para um README de produto. */
export function conferirReadme(texto, { permitirMarcadores = false } = {}) {
  const erros = [];
  for (const sec of SECOES) if (!new RegExp(`^#{2,3} ${sec.replace(/[()]/g, '\\$&')}\\s*$`, 'm').test(texto)) erros.push(`README sem a seção "${sec}"`);
  if (!/```mermaid/.test(texto)) erros.push('README sem diagrama Mermaid');
  if (!permitirMarcadores) for (const m of marcadoresPendentes(texto)) erros.push(`marcador sem preencher: ${m.slice(0, 60)}`);
  return erros;
}
