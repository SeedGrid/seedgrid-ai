#!/usr/bin/env node
// Gera docs/ai/INDEX.md: o índice geral dos documentos que a IA grava no projeto (planos, demandas, decisões/ADR,
// handoffs, relatórios, especificações e o que mais houver em docs/ai/<pasta>/). Só lê os cabeçalhos e os nomes.
// Uso: node <pasta-das-skills>/sg-docs-index/scripts/docs-index.mjs [--dir docs/ai] [--check] [--stdout]
//   --check    não escreve: falha se o INDEX.md estiver desatualizado ou se houver erro (veja abaixo)
//   --stdout   imprime o índice em vez de gravar (para conferir)
// Erros (saem 1): INDEX.md desatualizado (só com --check); id repetido entre planos, entre demandas ou entre ADRs;
//   plano `proposto` com tarefa em andamento ou feita (`- [~]`, `- [x]`): o status acompanha a execução (rules/documentos.md).
// Avisos (saem 0): demanda citada num plano sem arquivo; demanda cujo plano não existe; documento sem "aidlc:".
// O índice de decisões (adrs/INDEX.md, do adr-index.mjs) continua existindo; aqui as ADRs entram só como lista.
// Layout FIXO: Resumo, Demandas abertas, Planos, Decisões (ADR), Handoffs, Relatórios, Especificações, Análises, Demandas
//   respondidas e Outros, sempre nessa ordem e sempre presentes (a seção sem documento diz "Nenhum").
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const di = args.indexOf('--dir');
const raiz = path.resolve(di >= 0 && args[di + 1] ? args[di + 1] : 'docs/ai');
const check = args.includes('--check');
const stdout = args.includes('--stdout');

if (!existsSync(raiz)) {
  console.error(`Pasta não encontrada: ${raiz}`);
  process.exit(1);
}

const TIPOS = [
  { pastas: ['plans'], titulo: 'Planos', chave: 'plano' },
  { pastas: ['adrs'], titulo: 'Decisões (ADR)', chave: 'adr' },
  { pastas: ['handoff', 'handoffs'], titulo: 'Handoffs', chave: 'handoff' },
  { pastas: ['reports'], titulo: 'Relatórios', chave: 'relatorio' },
  { pastas: ['specs'], titulo: 'Especificações', chave: 'spec' },
  { pastas: ['analises'], titulo: 'Análises', chave: 'analise' },
];
const DEMANDAS = ['demands'];
const ABERTA = /^(aberta|aberto|pendente|em[- ]andamento)/i;
const FECHADA = /^(respondida|fechada|recusada|cancelada|conclu|confirmada|atendida)/i;

function cabecalho(texto) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  const out = {};
  if (!m) return out;
  for (const linha of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(linha);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["'](.*)["']$/, '$1');
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean).join(', ');
    out[kv[1]] = v;
  }
  return out;
}

function arquivosMd(dir) {
  const out = [];
  for (const n of readdirSync(dir).sort()) {
    if (n.startsWith('.') || n === 'node_modules') continue;
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) out.push(...arquivosMd(p));
    else if (n.endsWith('.md') && n !== 'INDEX.md') out.push(p);
  }
  return out;
}

const rel = (p) => path.relative(raiz, p).split(path.sep).join('/');
const primeiroTitulo = (texto) => {
  const corpo = texto.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const m = /^#\s+(.+?)\s*$/m.exec(corpo);
  return m ? m[1] : '';
};

function idDe(tipo, nome, h) {
  const base = nome.replace(/\.md$/, '');
  if (tipo === 'demanda') return (/^(P\d+\.F\d+\.DEM\d+)-/.exec(base) || [])[1] || h.id || base;
  if (tipo === 'plano') return (/^(P\d+)-/.exec(base) || [])[1] || (h.numero ? `P${h.numero}` : base);
  if (tipo === 'adr') return (/^(ADR\d+)-/.exec(base) || [])[1] || (h.numero ? `ADR${h.numero}` : base);
  return (/^(P\d+(?:\.F\d+)?(?:\.[A-Z]+\d+)?)/.exec(base) || [])[1] || base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
const dataDe = (nome, h) => h.data || (/(\d{4}-\d{2}-\d{2})/.exec(nome) || [])[1] || '';
function planoFase(id, h) {
  const m = /^(P\d+)(?:\.(F\d+))?/.exec(id);
  const plano = h.plano ? (/^\d+$/.test(h.plano) ? `P${h.plano}` : h.plano) : m ? m[1] : '';
  const fase = h.fase ? (/^\d+$/.test(h.fase) ? `F${h.fase}` : h.fase) : m && m[2] ? m[2] : '';
  return [plano, fase].filter(Boolean).join('.');
}
const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });

const docs = [];
for (const arq of arquivosMd(raiz)) {
  const r = rel(arq);
  const partes = r.split('/');
  const pasta = partes.length > 1 ? partes[0] : '';
  const texto = readFileSync(arq, 'utf8');
  const h = cabecalho(texto);
  let tipo = 'outro';
  if (DEMANDAS.includes(pasta)) tipo = 'demanda';
  else {
    const t = TIPOS.find((x) => x.pastas.includes(pasta));
    if (t) tipo = t.chave;
  }
  const nome = partes[partes.length - 1];
  const id = idDe(tipo, nome, h);
  docs.push({ arq, rel: r, pasta, tipo, nome, h, id, titulo: h.titulo || primeiroTitulo(texto) || nome.replace(/\.md$/, ''), status: h.status || '', data: dataDe(nome, h), pf: planoFase(id, h), texto });
}

const erros = [];
const avisos = [];
for (const tipo of ['plano', 'demanda', 'adr']) {
  const vistos = new Map();
  for (const d of docs.filter((x) => x.tipo === tipo)) {
    if (vistos.has(d.id)) erros.push(`id repetido (${d.id}): ${vistos.get(d.id)} e ${d.rel}`);
    else vistos.set(d.id, d.rel);
  }
}
for (const p of docs.filter((d) => d.tipo === 'plano')) {
  const st = String(p.status).trim().toLowerCase();
  const linhas = p.texto.split(/\r?\n/);
  const andando = linhas.filter((l) => /^\s*- \[[x~]\]/.test(l)).length;
  const abertas = linhas.filter((l) => /^\s*- \[[ ~?]\]/.test(l)).length;
  if (st.startsWith('proposto') && andando) erros.push(`${p.rel}: status "proposto" com ${andando} tarefa(s) em andamento ou feita(s); mude para "em-andamento"`);
  else if (st.startsWith('concluido') && abertas) avisos.push(`${p.rel}: status "concluido" com ${abertas} tarefa(s) ainda aberta(s)`);
}
const idsDemanda = new Set(docs.filter((d) => d.tipo === 'demanda').map((d) => d.id));
const idsPlano = new Set(docs.filter((d) => d.tipo === 'plano').map((d) => d.id));
// O que uma tarefa AINDA NÃO feita (`- [ ]`, `[~]`, `[?]`, `[>]`) vai escrever (`escreve`: ...) é saída planejada, não citação de arquivo que falta.
const semPlanejado = (texto) => texto.split(/\r?\n/).map((l) => (/^\s*- \[[ ~?>]\]/.test(l) ? l.replace(/`escreve`:.*$/, '') : l)).join('\n');
for (const p of docs.filter((d) => d.tipo === 'plano')) {
  for (const c of new Set(semPlanejado(p.texto).match(/\bP\d+\.F\d+\.DEM\d+\b/g) || [])) {
    if (!idsDemanda.has(c)) avisos.push(`${p.rel} cita a demanda ${c}, que não tem arquivo em demands/`);
  }
}
for (const d of docs.filter((x) => x.tipo === 'demanda')) {
  const plano = (/^(P\d+)\./.exec(d.id) || [])[1];
  if (plano && !idsPlano.has(plano)) avisos.push(`${d.rel}: o plano ${plano} não existe em plans/`);
}
const semAidlc = docs.filter((d) => !d.h.aidlc);
if (semAidlc.length) avisos.push(`${semAidlc.length} documento(s) sem "aidlc:" no cabeçalho (ex.: ${semAidlc.slice(0, 3).map((d) => d.rel).join(', ')})`);

const esc = (s) => String(s).replace(/\|/g, '\\|');
const linha = (d) => `| ${d.id} | [${esc(d.titulo)}](${d.rel}) | ${esc(d.status || '—')} | ${d.data || '—'} | ${d.pf || '—'} |`;
const tabela = (lista) => [
  '| Id | Título | Status | Data | Plano.Fase |',
  '|---|---|---|---|---|',
  ...lista.sort((a, b) => natural(a.id, b.id) || natural(a.rel, b.rel)).map(linha),
].join('\n');

const dem = docs.filter((d) => d.tipo === 'demanda');
const fechadas = dem.filter((d) => FECHADA.test(d.status));
const abertas = dem.filter((d) => !FECHADA.test(d.status));
for (const d of abertas) if (!ABERTA.test(d.status)) avisos.push(`${d.rel}: status "${d.status || 'vazio'}" não reconhecido; tratada como aberta`);
const outros = docs.filter((d) => d.tipo === 'outro');

// Layout FIXO em todo produto (decisão do dono, 2026-11-05): a mesma ordem e todas as seções sempre aparecem; a que não
// tem documento diz NENHUM. Quem abre o índice sabe onde olhar e não confunde "não existe" com "não foi registrado".
const NENHUM = '_Nenhum._';
const porTipo = (chave) => docs.filter((d) => d.tipo === chave);
const SECOES = [
  { titulo: 'Demandas abertas (cobram ação de alguém)', resumo: 'Demandas abertas', lista: abertas },
  { titulo: 'Planos', resumo: 'Planos', lista: porTipo('plano') },
  { titulo: 'Decisões (ADR)', resumo: 'Decisões (ADR)', lista: porTipo('adr') },
  { titulo: 'Handoffs', resumo: 'Handoffs', lista: porTipo('handoff') },
  { titulo: 'Relatórios', resumo: 'Relatórios', lista: porTipo('relatorio') },
  { titulo: 'Especificações', resumo: 'Especificações', lista: porTipo('spec') },
  { titulo: 'Análises', resumo: 'Análises', lista: porTipo('analise') },
  { titulo: 'Demandas respondidas', resumo: 'Demandas respondidas', lista: fechadas },
];
const pastasOutros = [...new Set(outros.map((d) => d.pasta || '(raiz de docs/ai)'))].sort();

const resumo = [
  '| Tipo | Documentos |',
  '|---|---|',
  ...SECOES.map((x) => `| ${x.resumo} | ${x.lista.length} |`),
  `| Outros | ${outros.length} |`,
  `| **Total** | **${docs.length}** |`,
].join('\n');

// Planos divididos por estado (decisão do dono, 2026-11-06); cada grupo em ordem numérica crescente do id (a ordem de
// criação): em andamento, propostos, concluídos e abandonados ou superados. Os quatro grupos sempre aparecem (layout fixo).
const estadoDoPlano = (d) => {
  const st = String(d.status).trim().toLowerCase();
  if (st.startsWith('concluido')) return 'concluidos';
  if (st.startsWith('proposto')) return 'propostos';
  if (/^(abandonad|superad|cancelad)/.test(st)) return 'abandonados';
  return 'andamento';
};
const planosPorEstado = (lista) => [
  ['andamento', 'Em andamento'],
  ['propostos', 'Propostos (não começaram)'],
  ['concluidos', 'Concluídos'],
  ['abandonados', 'Abandonados ou superados'],
].map(([chave, titulo]) => {
  const grupo = lista.filter((d) => estadoDoPlano(d) === chave);
  return `### ${titulo} (${grupo.length})\n\n${grupo.length ? tabela(grupo) : NENHUM}`;
}).join('\n\n');

const secoes = [
  `## Resumo\n\n${resumo}`,
  ...SECOES.map((x) => `## ${x.titulo}\n\n${x.lista.length ? (x.resumo === 'Planos' ? planosPorEstado(x.lista) : tabela(x.lista)) : NENHUM}`),
  `## Outros\n\n${pastasOutros.length ? pastasOutros.map((pasta) => `### ${pasta}\n\n${tabela(outros.filter((d) => (d.pasta || '(raiz de docs/ai)') === pasta))}`).join('\n\n') : NENHUM}`,
];

const corpo = `# Documentos de docs/ai

> Gerado pela skill \`sg-docs-index\` (script \`docs-index.mjs\`) a partir dos nomes e dos cabeçalhos. **Não edite à mão**; rode o script sempre que criar, renomear ou mudar o status de um documento (\`--check\` confere se está em dia). As decisões têm também o índice próprio em \`adrs/INDEX.md\`. O layout é o mesmo em todo produto: Resumo, Demandas abertas, Planos, Decisões (ADR), Handoffs, Relatórios, Especificações, Análises, Demandas respondidas e Outros; a seção sem documento diz "Nenhum".

${secoes.join('\n\n')}
`;

const alvo = path.join(raiz, 'INDEX.md');
let atual = '';
try { atual = readFileSync(alvo, 'utf8').replace(/\r\n/g, '\n'); } catch { /* sem índice ainda */ }
if (avisos.length) console.error(`Aviso:\n  ${avisos.join('\n  ')}`);
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
if (stdout) { process.stdout.write(corpo); process.exit(0); }
if (check) {
  if (atual !== corpo) { console.error('docs/ai/INDEX.md desatualizado: rode o script sem --check'); process.exit(1); }
  console.log(`docs/ai/INDEX.md em dia (${docs.length} documentos)`);
} else {
  writeFileSync(alvo, corpo, 'utf8');
  console.log(`docs/ai/INDEX.md gerado (${docs.length} documentos)`);
}
