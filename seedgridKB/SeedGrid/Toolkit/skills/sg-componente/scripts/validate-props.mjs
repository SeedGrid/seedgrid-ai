#!/usr/bin/env node
// Valida as props de um componente SeedGrid contra os tipos reais (data/props.json, gerado do código).
// Substitui validate_props do MCP. Só leitura.
//
// Uso:
//   node validate-props.mjs <Componente> --jsx '<SgInputNumber id="q" minValue={1} maxValue={100} />'
//   node validate-props.mjs <Componente> --json '{"id":"q","minValue":1}'
//   node validate-props.mjs <Componente> --props id,minValue,maxValue     (só os nomes)
//   node validate-props.mjs <Componente> --list                          (lista as props: nome, tipo, obrigatória, valores)
//   node validate-props.mjs --find <texto>                               (componentes cujo nome contém o texto)
// Saída: 0 = ok; 1 = problema (prop inexistente, obrigatória ausente, valor fora do enum, tipo errado); 2 = uso inválido.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(here, '..', 'data', 'props.json'), 'utf8'));
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const die = (m, code = 2) => { console.error(m); process.exit(code); };

if (opt('--find')) {
  const q = opt('--find').toLowerCase();
  const hit = Object.keys(data).filter((k) => k.toLowerCase().includes(q));
  console.log(hit.length ? hit.join(', ') : 'nenhum componente com esse nome');
  process.exit(0);
}

const name = args.find((a) => !a.startsWith('--') && a !== opt('--jsx') && a !== opt('--json') && a !== opt('--props'));
if (!name) die('Informe o componente. Ex.: validate-props.mjs SgInputNumber --jsx \'<SgInputNumber id="q" minValue={1} />\'');
const comp = data[name];
if (!comp) {
  const near = Object.keys(data).filter((k) => k.toLowerCase().includes(name.toLowerCase().replace(/^sg/, ''))).slice(0, 6);
  die(`Componente "${name}" não existe${near.length ? `. Parecidos: ${near.join(', ')}` : ''}. Use --find <texto>.`, 1);
}
const defs = comp.props;

if (args.includes('--list')) {
  console.log(`${name} (${comp.pkg}) — ${Object.keys(defs).length} props; * = obrigatória`);
  for (const [k, [kind, req, en]] of Object.entries(defs)) console.log(`${req ? '*' : ' '} ${k}: ${en ? en.map((v) => `"${v}"`).join(' | ') : kind}`);
  process.exit(0);
}

// Entrada: { nome: valor | undefined(tipo desconhecido) }
let given = {};
const known = new Set(); // props cujo valor não deu para avaliar (só a presença conta)
if (opt('--json')) {
  try { given = JSON.parse(opt('--json')); } catch { die('--json inválido.'); }
} else if (opt('--props')) {
  for (const k of opt('--props').split(',').map((x) => x.trim()).filter(Boolean)) { given[k] = undefined; known.add(k); }
} else if (opt('--jsx')) {
  const src = opt('--jsx');
  // atributos: nome="texto" | nome={expr} | nome (booleano) | {...spread}
  const re = /([A-Za-z_][\w.-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^{}]*\})*)\}))?|\{\s*\.\.\.[^}]*\}/g;
  const tag = new RegExp(`<${name}\\b([\\s\\S]*?)\\/?>`).exec(src);
  const body = tag ? tag[1] : src;
  let m;
  while ((m = re.exec(body))) {
    if (!m[1]) continue;
    const k = m[1];
    if (m[2] !== undefined || m[3] !== undefined) given[k] = m[2] ?? m[3];
    else if (m[4] !== undefined) {
      const e = m[4].trim();
      if (/^-?\d+(\.\d+)?$/.test(e)) given[k] = Number(e);
      else if (e === 'true' || e === 'false') given[k] = e === 'true';
      else if (/^(["'`])(.*)\1$/.test(e)) given[k] = e.slice(1, -1);
      else { given[k] = undefined; known.add(k); }
    } else given[k] = true;
  }
} else die('Informe --jsx, --json, --props ou --list.');

const issues = [];
for (const [k, [kind, req]] of Object.entries(defs)) if (req && !(k in given)) issues.push(`FALTA obrigatória: ${k} (${kind})`);
for (const [k, v] of Object.entries(given)) {
  if (k.startsWith('aria-') || k.startsWith('data-') || k === 'key' || k === 'ref') continue;
  const d = defs[k];
  if (!d) {
    const near = Object.keys(defs).filter((x) => x.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(x.toLowerCase())).slice(0, 4);
    issues.push(`NÃO EXISTE: ${k}${near.length ? ` (parecidas: ${near.join(', ')})` : ''}`);
    continue;
  }
  if (v === undefined) continue; // só presença
  const [kind, , en] = d;
  if (en && typeof v === 'string' && !en.includes(v)) issues.push(`VALOR inválido em ${k}: "${v}" (aceita ${en.map((x) => `"${x}"`).join(' | ')})`);
  else if (kind === 'string' && !en && typeof v !== 'string') issues.push(`TIPO em ${k}: esperado string, veio ${typeof v}`);
  else if (kind === 'number' && typeof v !== 'number') issues.push(`TIPO em ${k}: esperado number, veio ${typeof v}`);
  else if (kind === 'boolean' && typeof v !== 'boolean') issues.push(`TIPO em ${k}: esperado boolean, veio ${typeof v}`);
  else if (kind === 'array' && !Array.isArray(v)) issues.push(`TIPO em ${k}: esperado array`);
}
if (!issues.length) { console.log(`${name}: OK (${Object.keys(given).length} props conferidas contra o tipo)`); process.exit(0); }
console.log(`${name}: ${issues.length} problema(s)`);
for (const i of issues) console.log(`  - ${i}`);
process.exit(1);
