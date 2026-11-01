#!/usr/bin/env node
// Gera docs/ai/decisions/INDEX.md a partir do cabeçalho das ADRs, da mais nova para a mais antiga.
// Uso: node .ai/skills/sg-adr/scripts/adr-index.mjs [--dir docs/ai/decisions] [--check]
//   --check    só valida e falha se o INDEX.md estiver desatualizado (sem escrever)
//   --proximo  imprime o próximo número livre para uma ADR nova
//   --numerar  dá número, em ordem de data e nome, SÓ às ADRs sem "numero"; nunca renumera
//   --renomear põe o prefixo ADR<n>- (n = "numero" do cabeçalho) nas ADRs que ainda têm o nome antigo AAAA-MM-DD-slug.md,
//              acerta substitui/substituida-por nas outras ADRs e lista os documentos de docs/ai que citam o nome antigo
// Nome do arquivo: ADR<n>-AAAA-MM-DD-slug.md, com <n> igual ao "numero" do cabeçalho. O nome antigo (AAAA-MM-DD-slug.md) ainda
// é aceito, com aviso, para não quebrar projetos que já têm ADRs: rode --renomear para migrar.
// Domínios: se existir <dir>/dominios.txt (um por linha), só esses são aceitos; senão, qualquer slug em minúsculas com hífen.
import { existsSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const di = args.indexOf('--dir');
const dir = path.resolve(di >= 0 && args[di + 1] ? args[di + 1] : 'docs/ai/decisions');
const check = args.includes('--check');
const STATUS = ['proposta', 'aceita', 'implementada', 'substituida', 'rejeitada'];

if (!existsSync(dir)) {
  console.error(`Pasta não encontrada: ${dir}`);
  process.exit(1);
}
const domFile = path.join(dir, 'dominios.txt');
const DOMINIOS = existsSync(domFile)
  ? readFileSync(domFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : null;

function parse(text, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) throw new Error(`${file}: sem cabeçalho (---)`);
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    out[kv[1]] = v;
  }
  return out;
}

const NOME_NOVO = /^ADR(\d+)-(\d{4}-\d{2}-\d{2})-.+\.md$/;
const NOME_ANTIGO = /^\d{4}-\d{2}-\d{2}-.+\.md$/;
const listar = () => readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'INDEX.md').sort();
let files = listar();
const numeroDe = (f) => {
  try {
    const n = parse(readFileSync(path.join(dir, f), 'utf8'), f).numero;
    return /^\d+$/.test(String(n ?? '')) ? Number(n) : null;
  } catch { return null; }
};
const maior = () => Math.max(0, ...files.map(numeroDe).filter((n) => n !== null));
if (args.includes('--numerar')) {
  let max = maior();
  for (const f of files.filter((x) => numeroDe(x) === null)) {
    const file = path.join(dir, f);
    const raw = readFileSync(file, 'utf8');
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    const out = raw.replace(/^(titulo:[^\r\n]*)/m, `$1${eol}numero: ${++max}`);
    if (out === raw) { console.error(`${f}: sem linha "titulo:" para numerar`); process.exit(1); }
    writeFileSync(file, out, 'utf8');
    console.log(`${f} -> #${max}`);
  }
}
if (args.includes('--renomear')) {
  const mapa = [];
  for (const f of files.filter((x) => !NOME_NOVO.test(x))) {
    const n = numeroDe(f);
    if (n === null) { console.error(`${f}: sem "numero" no cabeçalho; rode --numerar antes de --renomear`); process.exit(1); }
    if (!NOME_ANTIGO.test(f)) { console.error(`${f}: o nome deve ser AAAA-MM-DD-slug.md para ser renomeado`); process.exit(1); }
    const novo = `ADR${n}-${f}`;
    if (files.includes(novo)) { console.error(`${novo} já existe`); process.exit(1); }
    mapa.push([f, novo]);
  }
  for (const [antigo, novo] of mapa) renameSync(path.join(dir, antigo), path.join(dir, novo));
  files = listar();
  // substitui / substituida-por (e qualquer outra citação) nas ADRs da própria pasta
  for (const f of files) {
    const file = path.join(dir, f);
    const raw = readFileSync(file, 'utf8');
    let out = raw;
    for (const [antigo, novo] of mapa) out = out.replace(new RegExp(`(?<!ADR\\d+-)${antigo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), novo);
    if (out !== raw) writeFileSync(file, out, 'utf8');
  }
  for (const [antigo, novo] of mapa) console.log(`${antigo} -> ${novo}`);
  // outros documentos de docs/ai que citam o nome antigo: só avisa, quem escreveu decide
  const raiz = path.dirname(dir);
  const citam = [];
  const varrer = (d) => {
    for (const n of readdirSync(d)) {
      const p = path.join(d, n);
      if (p === dir || n === 'node_modules' || n.startsWith('.')) continue;
      if (statSync(p).isDirectory()) varrer(p);
      else if (n.endsWith('.md')) {
        const txt = readFileSync(p, 'utf8');
        for (const [antigo] of mapa) if (txt.includes(antigo)) citam.push(`${path.relative(raiz, p)} cita ${antigo}`);
      }
    }
  };
  if (mapa.length) varrer(raiz);
  if (citam.length) console.error(`Atualize a referência nestes documentos:\n  ${citam.join('\n  ')}`);
  if (!mapa.length) console.log('Nada a renomear: todas as ADRs já têm o prefixo ADR<n>-');
}
if (args.includes('--proximo')) {
  console.log(maior() + 1);
  process.exit(0);
}

const errors = [];
const avisos = [];
const adrs = [];
for (const f of files) {
  let h;
  try {
    h = parse(readFileSync(path.join(dir, f), 'utf8'), f);
  } catch (e) {
    errors.push(e.message);
    continue;
  }
  const novo = NOME_NOVO.exec(f);
  if (novo) {
    if (h.numero && Number(novo[1]) !== Number(h.numero)) errors.push(`${f}: o prefixo ADR${novo[1]}- não bate com o numero do cabeçalho (${h.numero})`);
    if (h.data && novo[2] !== h.data) errors.push(`${f}: a data do nome (${novo[2]}) não bate com a data do cabeçalho (${h.data})`);
  } else if (NOME_ANTIGO.test(f)) {
    avisos.push(`${f}: nome sem o prefixo ADR<n>-; rode "node .ai/skills/sg-adr/scripts/adr-index.mjs --renomear"`);
  } else {
    errors.push(`${f}: o nome deve ser ADR<n>-AAAA-MM-DD-slug.md`);
  }
  for (const k of ['titulo', 'numero', 'data', 'status', 'decidido-por', 'dominio']) if (!h[k] || h[k].length === 0) errors.push(`${f}: falta "${k}"`);
  if (h.numero && !/^[1-9]\d*$/.test(h.numero)) errors.push(`${f}: numero inválido (${h.numero}); use inteiro a partir de 1`);
  if (h.aidlc && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(h.aidlc)) errors.push(`${f}: aidlc inválido (${h.aidlc}); use a versão do .ai/toolkit-lock.json, ex.: 0.6.1`);
  if (h.data && !/^\d{4}-\d{2}-\d{2}$/.test(h.data)) errors.push(`${f}: data inválida (${h.data})`);
  if (h.status && !STATUS.includes(h.status)) errors.push(`${f}: status inválido (${h.status}); use ${STATUS.join(' | ')}`);
  const doms = Array.isArray(h.dominio) ? h.dominio : [h.dominio].filter(Boolean);
  for (const d of doms) {
    if (DOMINIOS ? !DOMINIOS.includes(d) : !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d)) {
      errors.push(`${f}: domínio "${d}" inválido${DOMINIOS ? ` (permitidos em dominios.txt: ${DOMINIOS.join(', ')})` : ' (use slug em minúsculas com hífen)'}`);
    }
  }
  adrs.push({ file: f, ...h, doms });
}
const nums = adrs.map((a) => Number(a.numero)).filter(Number.isInteger).sort((a, b) => a - b);
for (let i = 0; i < nums.length; i++) {
  if (i > 0 && nums[i] === nums[i - 1]) errors.push(`numero #${nums[i]} repetido`);
  else if (nums[i] !== i + 1) { errors.push(`numeração com lacuna: esperado #${i + 1}, achei #${nums[i]}`); break; }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
adrs.sort((a, b) => b.data.localeCompare(a.data) || Number(b.numero) - Number(a.numero));

const list = (v) => (Array.isArray(v) ? v.join(', ') : v || '');
const rows = adrs.map((a) => `| ${a.numero} | ${a.data} | [${a.titulo}](${a.file}) | ${a.doms.join(', ')} | ${a.status} | ${list(a['decidido-por'])} | ${list(a.consultados)} |`);
const body = `# Decisões (ADR)

> Gerado por \`node .ai/skills/sg-adr/scripts/adr-index.mjs\` a partir do cabeçalho de cada ADR. Não edite à mão. Ordem: da mais nova para a mais antiga. O número \`#\` é sequencial, dado na criação e **nunca muda**: use-o para falar de uma ADR ("ADR #7").

Para saber **por que** algo foi feito, procure pelo domínio (coluna 3) ou pelo módulo no cabeçalho de cada ADR.${DOMINIOS ? ` Domínios: ${DOMINIOS.join(', ')}.` : ''}

| # | Data | Decisão | Domínio | Status | Decidido por | Consultados |
|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
const target = path.join(dir, 'INDEX.md');
let current = '';
try { current = readFileSync(target, 'utf8').replace(/\r\n/g, '\n'); } catch { /* sem índice ainda */ }
if (avisos.length) console.error(`Aviso:\n  ${avisos.join('\n  ')}`);
if (check) {
  if (current !== body) { console.error('INDEX.md desatualizado: rode o script sem --check'); process.exit(1); }
  console.log(`INDEX.md em dia (${adrs.length} ADRs)`);
} else {
  writeFileSync(target, body, 'utf8');
  console.log(`INDEX.md gerado (${adrs.length} ADRs)`);
}
