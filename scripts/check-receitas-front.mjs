#!/usr/bin/env node
// P188.F1.T1: guarda estatica das receitas de remocao de modulos de front (sg-new-product/data/modulos-front.json).
// Para cada boilerplate, escopo (frontend/admin) e modulo com receita, aplica a receita numa copia temporaria e reprova:
//  1. receita velha: caminho de `apagar` ou trecho `contem` de `linhas`/`blocos` que nao existe mais no boilerplate;
//  2. import quebrado: arquivo restante que importa (from, import(), import 'x') algo que a receita apagou.
// Sem `pnpm build` (a prova por build e sob demanda, P188.F4.T1). Sem dependencias.
// node scripts/check-receitas-front.mjs [--dir <boilerplates>] [--receitas <modulos-front.json>] [--so <modelo>]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const skillDir = path.resolve('seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
const root = path.resolve(opt('--dir', 'seedgridKB/SeedGrid/Toolkit/boilerplates'));
const receitasFile = path.resolve(opt('--receitas', path.join(skillDir, 'data/modulos-front.json')));
const so = opt('--so', null);
const { removerModulosFront, ESCOPOS_FRONT } = await import(pathToFileURL(path.join(skillDir, 'scripts/modulos-front.mjs')).href);
const catalogo = JSON.parse(fs.readFileSync(receitasFile, 'utf8'));

const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage']);
const EXT = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css', '/index.ts', '/index.tsx', '/index.js'];
const SRC = /\.(tsx?|mjs|jsx?)$/;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}
const exists = (base) => EXT.some((x) => { try { return fs.statSync(base + x).isFile(); } catch { return false; } });
const SPEC = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])([^'"\n]+)\1/g;

// especificadores locais (@/ e relativos) que nao resolvem: Set de "arquivo -> especificador"
function quebrados(raiz) {
  const out = new Set();
  for (const f of walk(raiz)) {
    if (!SRC.test(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const m of txt.matchAll(SPEC)) {
      const s = m[2];
      let alvo = null;
      if (s.startsWith('@/')) alvo = path.join(raiz, s.slice(2));
      else if (s.startsWith('./') || s.startsWith('../')) alvo = path.resolve(path.dirname(f), s);
      if (alvo && !exists(alvo)) out.add(`${path.relative(raiz, f).split(path.sep).join('/')} -> ${s}`);
    }
  }
  return out;
}

const copiar = (de, para) => fs.cpSync(de, para, { recursive: true, filter: (p) => !SKIP.has(path.basename(p)) });
const falhas = [];
let aplicadas = 0;
const modelos = fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'receitas-front-'));
try {
  for (const modelo of modelos) {
    if (so && modelo !== so) continue;
    for (const escopo of ESCOPOS_FRONT) {
      const origem = path.join(root, modelo, escopo);
      if (!fs.existsSync(origem)) continue;
      const antes = quebrados(origem);
      for (const [nome, mod] of Object.entries(catalogo.modulos)) {
        if (!mod.escopos?.[escopo]) continue;
        const dest = path.join(tmp, `${modelo}-${escopo}-${nome}`);
        copiar(origem, path.join(dest, escopo));
        const alvo = `${nome}@${escopo}`;
        const notas = removerModulosFront(dest, [alvo], catalogo);
        aplicadas++;
        // modulo que o modelo nao tem (nenhum caminho de `apagar` existe): a receita nao se aplica a este modelo
        const temModulo = (mod.escopos[escopo].apagar ?? []).some((rel) => fs.existsSync(path.join(origem, rel)));
        if (!temModulo) { fs.rmSync(dest, { recursive: true, force: true }); continue; }
        for (const n of notas) if (/ja nao existe|nao existe|nao encontrad/.test(n)) falhas.push({ modelo, escopo, modulo: nome, tipo: 'receita velha', detalhe: n.replace(`${alvo}: `, '') });
        for (const q of quebrados(path.join(dest, escopo))) if (!antes.has(q)) falhas.push({ modelo, escopo, modulo: nome, tipo: 'import quebrado', detalhe: q });
        fs.rmSync(dest, { recursive: true, force: true });
      }
    }
  }
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

if (falhas.length) {
  console.error(`check-receitas-front: ${falhas.length} problema(s) em ${aplicadas} receita(s) aplicadas`);
  for (const f of falhas) console.error(`  [${f.modelo}/${f.escopo}] ${f.modulo}: ${f.tipo}: ${f.detalhe}`);
  process.exit(1);
}
console.log(`check-receitas-front: ok (${aplicadas} receita(s) aplicadas em ${modelos.length} boilerplate(s))`);
