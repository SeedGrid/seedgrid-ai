#!/usr/bin/env node
// FE-43: componente SeedGrid usa `enabled`, nunca `disabled`. Varre os .tsx/.jsx dos boilerplates e reprova
// <SgXxx ... disabled ...> (atributo no nivel da tag; elementos nativos <button disabled> sao permitidos).
// Sem dependencias.  node scripts/check-sg-enabled.mjs [--dir <pasta>]   (padrao: seedgridKB/SeedGrid/Toolkit/boilerplates)
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const i = args.indexOf('--dir');
const root = i >= 0 ? args[i + 1] : 'seedgridKB/SeedGrid/Toolkit/boilerplates';
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git']);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx|jsx)$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) yield p;
  }
}

// Devolve o texto dos atributos da tag que comeca em `start` (logo depois do nome), no nivel 0 de chaves/aspas.
function tagAttrs(src, start) {
  let depth = 0; let quote = null; let out = '';
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (quote) { if (c === quote && src.charCodeAt(k - 1) !== 92) quote = null; continue; }
    if (depth === 0 && (c === '"' || c === "'")) { quote = c; out += ' '; continue; }
    if (c === '{') { depth++; out += ' '; continue; }
    if (c === '}') { depth--; out += ' '; continue; }
    if (depth > 0) continue;
    if (c === '>') return out;
    out += c;
  }
  return out;
}

const problems = [];
let files = 0;
for (const file of walk(root)) {
  files++;
  const src = fs.readFileSync(file, 'utf8');
  const re = /<(Sg[A-Z][A-Za-z0-9]*)\b/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = tagAttrs(src, m.index + m[0].length);
    if (/(^|\s)disabled(\s|=|\/|$)/.test(attrs)) {
      const line = src.slice(0, m.index).split('\n').length;
      problems.push(`${path.relative(process.cwd(), file)}:${line}: <${m[1]}> usa disabled (use enabled={...}; FE-43)`);
    }
  }
}
if (problems.length) {
  console.error(`[check-sg-enabled] ${problems.length} uso(s) de disabled em componente Sg:`);
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log(`[check-sg-enabled] ok (${files} arquivos)`);
