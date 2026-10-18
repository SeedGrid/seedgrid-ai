#!/usr/bin/env node
// Gera docs/ai/decisions/INDEX.md a partir do cabeçalho das ADRs, da mais nova para a mais antiga.
// Uso: node .ai/skills/sg-adr/scripts/adr-index.mjs [--dir docs/ai/decisions] [--check]
//   --check  só valida e falha se o INDEX.md estiver desatualizado (sem escrever)
// Domínios: se existir <dir>/dominios.txt (um por linha), só esses são aceitos; senão, qualquer slug em minúsculas com hífen.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const di = args.indexOf('--dir');
const dir = path.resolve(di >= 0 && args[di + 1] ? args[di + 1] : 'docs/ai/decisions');
const check = args.includes('--check');
const STATUS = ['proposta', 'aceita', 'substituida', 'rejeitada'];

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

const errors = [];
const adrs = [];
for (const f of readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'INDEX.md').sort()) {
  let h;
  try {
    h = parse(readFileSync(path.join(dir, f), 'utf8'), f);
  } catch (e) {
    errors.push(e.message);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}-/.test(f)) errors.push(`${f}: o nome deve começar com AAAA-MM-DD-`);
  for (const k of ['titulo', 'data', 'status', 'decidido-por', 'dominio']) if (!h[k] || h[k].length === 0) errors.push(`${f}: falta "${k}"`);
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
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
adrs.sort((a, b) => b.data.localeCompare(a.data) || b.file.localeCompare(a.file));

const list = (v) => (Array.isArray(v) ? v.join(', ') : v || '');
const rows = adrs.map((a) => `| ${a.data} | [${a.titulo}](${a.file}) | ${a.doms.join(', ')} | ${a.status} | ${list(a['decidido-por'])} | ${list(a.consultados)} |`);
const body = `# Decisões (ADR)

> Gerado por \`node .ai/skills/sg-adr/scripts/adr-index.mjs\` a partir do cabeçalho de cada ADR. Não edite à mão. Ordem: da mais nova para a mais antiga.

Para saber **por que** algo foi feito, procure pelo domínio (coluna 3) ou pelo módulo no cabeçalho de cada ADR.${DOMINIOS ? ` Domínios: ${DOMINIOS.join(', ')}.` : ''}

| Data | Decisão | Domínio | Status | Decidido por | Consultados |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
const target = path.join(dir, 'INDEX.md');
let current = '';
try { current = readFileSync(target, 'utf8').replace(/\r\n/g, '\n'); } catch { /* sem índice ainda */ }
if (check) {
  if (current !== body) { console.error('INDEX.md desatualizado: rode o script sem --check'); process.exit(1); }
  console.log(`INDEX.md em dia (${adrs.length} ADRs)`);
} else {
  writeFileSync(target, body, 'utf8');
  console.log(`INDEX.md gerado (${adrs.length} ADRs)`);
}
