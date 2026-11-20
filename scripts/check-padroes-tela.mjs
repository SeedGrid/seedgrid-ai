#!/usr/bin/env node
// P180.F2.T5: verificacao dos padroes de tela dos boilerplates (FE-40, FE-41, FE-42 e campo mascarado). Reprova:
//  1. campo de documento, telefone, WhatsApp ou CEP com `SgInputText` em `*_edit/page.tsx` (use o componente com mascara);
//  2. item de seguranca (/security/..., /apikeys/...) solto na raiz do menu (`data.ts`), fora do grupo Seguranca (FE-40);
//  3. texto "Cadastre o ID de preco" fora do admin: o cliente nunca ve instrucao de administrador (FE-42);
//  4. contador `requests` declarado por padrao em *UsageMeters*.java (FE-41, BE-74).
// Sem dependencias.  node scripts/check-padroes-tela.mjs [--dir <pasta>] [--baseline <arquivo>|--no-baseline]
// Baseline: violacoes ja conhecidas das copias da KB ainda nao sincronizadas com o boilerplate corrigido.
// Violacao nova reprova; entrada do baseline que deixou de ocorrer tambem reprova (apague-a: o baseline so encolhe).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(opt('--dir', 'seedgridKB/SeedGrid/Toolkit/boilerplates'));
const useBaseline = !args.includes('--no-baseline');
const baselineFile = path.resolve(opt('--baseline', 'scripts/check-padroes-tela.baseline.json'));
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'target']);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const out = [];
const add = (regra, file, detalhe) => out.push({ regra, file: rel(file), detalhe });

const MASCARADO = /\b(cpf|cnpj|documento|document(?!ation)|telefone|phone|celular|whats\s?app|cep|zip|postal)/i;

// atributos da tag que comeca em `start` (depois do nome), no nivel 0 de chaves/aspas
function tagAttrs(src, start) {
  let depth = 0, quote = null, txt = '';
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (quote) { txt += c; if (c === quote && src.charCodeAt(k - 1) !== 92) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; txt += c; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
    if (depth === 0 && c === '>' && src[k - 1] !== '=') return txt;
    txt += c;
  }
  return txt;
}

for (const f of walk(root)) {
  const r = rel(f);
  if (/_edit\/page\.tsx$/.test(r)) {
    const src = read(f);
    for (const m of src.matchAll(/<SgInputText\b/g)) {
      const attrs = tagAttrs(src, m.index + m[0].length);
      const hit = attrs.match(/\b(?:id|label|field|name)\s*=\s*(?:"([^"]*)"|\{[`'"]([^`'"]*)[`'"]\})/g) || [];
      const campo = hit.find((h) => MASCARADO.test(h));
      if (campo) add('campo-mascarado', f, `SgInputText para ${campo.replace(/\s+/g, ' ')}: use o componente com mascara (documento, telefone, CEP)`);
    }
  }
  if (/(^|\/)data\.ts$/.test(r)) {
    const lines = read(f).split('\n');
    const itens = lines.map((l, i) => ({ i, m: l.match(/^(\s*)\{?\s*href:\s*"([^"]*)"/), l })).filter((x) => x.m);
    const ind = itens.length ? Math.min(...itens.map((x) => x.m[1].length)) : 0;
    // item do nivel raiz (mesma indentacao do primeiro): nos grupos o href aparece na linha seguinte a `{`
    const rootIndent = Math.min(...lines.filter((l) => /^\s*\{\s*$/.test(l) || /^\s*\{\s*href:/.test(l)).map((l) => l.match(/^\s*/)[0].length), 99);
    for (const x of itens) {
      const href = x.m[2];
      const ehRaiz = /^\s*\{\s*href:/.test(x.l) ? x.m[1].length === rootIndent : x.m[1].length === rootIndent + 2 && /^\s*\{\s*$/.test(lines[x.i - 1] || '') && (lines[x.i - 1].match(/^\s*/)[0].length === rootIndent);
      if (ehRaiz && /^\/(security\/|apikeys|audit)/.test(href) && !/children/.test(lines.slice(x.i, x.i + 4).join('\n'))) {
        add('menu-seguranca-solto', f, `item "${href}" na raiz do menu: deve ficar dentro do grupo Seguranca (FE-40)`);
      }
    }
    void ind;
  }
  if (/\.(tsx|ts)$/.test(r) && !/(^|\/)admin\//.test(r) && !/\.(test|spec)\./.test(r)) {
    if (/Cadastre o ID de pre[cç]o/i.test(read(f))) add('instrucao-admin-no-cliente', f, 'texto "Cadastre o ID de preco" fora do admin: o cliente nunca ve instrucao de administrador (FE-42)');
  }
  if (/UsageMeters?[A-Za-z]*\.java$/.test(r) || /Usage.*Meter.*\.java$/.test(r)) {
    const src = read(f);
    if (/UsageMeterDefinition/.test(src) && /new\s+UsageMeterDefinition\(\s*(REQUESTS\b|"requests")/.test(src)) {
      add('contador-requests-por-padrao', f, 'contador `requests` declarado por padrao: so o que o dominio do produto conta (FE-41, BE-74)');
    }
  }
}

const key = (v) => `${v.regra}|${v.file}`;
let base = new Set();
if (useBaseline && fs.existsSync(baselineFile)) base = new Set(JSON.parse(fs.readFileSync(baselineFile, 'utf8')).conhecidas || []);
const found = new Set(out.map(key));
const novas = out.filter((v) => !base.has(key(v)));
const velhas = [...base].filter((k) => !found.has(k));

if (!novas.length && !velhas.length) {
  console.log(`[check-padroes-tela] ok (${out.length} violacao(oes) conhecida(s) no baseline)`);
  process.exit(0);
}
for (const v of novas) console.error(`[check-padroes-tela] ${v.regra}: ${v.file}: ${v.detalhe}`);
for (const k of velhas) console.error(`[check-padroes-tela] baseline obsoleto (ja corrigido, apague a entrada): ${k}`);
process.exit(1);
