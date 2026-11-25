#!/usr/bin/env node
// P188.F4.T1: prova por build de UMA receita de remocao de modulo de front (sob demanda; NAO entra no `npm test`).
// Copia o app do boilerplate para uma pasta temporaria, aplica a receita (sg-new-product/data/modulos-front.json),
// instala as dependencias e roda `pnpm build` e `pnpm test`. UM comando por vez (memoria): rode uma receita, espere, rode a proxima.
// Uso: node scripts/provar-receita-front.mjs <modulo> <escopo: frontend|admin> <modelo> [--dir <boilerplates>] [--dest <pasta>] [--manter] [--sem-test]
// Exemplo: node scripts/provar-receita-front.mjs backup frontend login-tenancy-b2b
// Saida: quadro final com o resultado de cada etapa (PROVADO / FALHOU) e o commit do boilerplate; registre-o no P188.F4.T1.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flags = new Set(['--manter', '--sem-test']);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !flags.has(args[i - 1])));
const [modulo, escopo, modelo] = pos;
if (!modulo || !escopo || !modelo) {
  console.error('uso: node scripts/provar-receita-front.mjs <modulo> <frontend|admin> <modelo> [--dir <boilerplates>] [--dest <pasta>] [--manter] [--sem-test]');
  process.exit(2);
}
const skillDir = path.resolve('seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
const root = path.resolve(opt('--dir', 'seedgridKB/SeedGrid/Toolkit/boilerplates'));
const receitasFile = path.join(skillDir, 'data/modulos-front.json');
const { removerModulosFront, ESCOPOS_FRONT } = await import(pathToFileURL(path.join(skillDir, 'scripts/modulos-front.mjs')).href);
const catalogo = JSON.parse(fs.readFileSync(receitasFile, 'utf8'));

if (!ESCOPOS_FRONT.includes(escopo)) { console.error(`escopo invalido: ${escopo}`); process.exit(2); }
if (!catalogo.modulos[modulo]?.escopos?.[escopo]) { console.error(`sem receita para ${modulo}@${escopo}`); process.exit(2); }
const origem = path.join(root, modelo, escopo);
if (!fs.existsSync(origem)) { console.error(`nao existe: ${origem}`); process.exit(2); }

const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage']);
const base = opt('--dest', null) ?? fs.mkdtempSync(path.join(os.tmpdir(), `prova-${modelo}-${escopo}-${modulo}-`));
const dest = path.join(base, 'app');
fs.mkdirSync(path.join(dest, escopo), { recursive: true });
fs.cpSync(origem, path.join(dest, escopo), { recursive: true, filter: (p) => !SKIP.has(path.basename(p)) });

const notas = removerModulosFront(dest, [`${modulo}@${escopo}`], catalogo);
const quadro = [];
const run = (nome, cmd, cmdArgs, cwd) => {
  console.log(`\n== ${nome}: ${cmd} ${cmdArgs.join(' ')} (${cwd})`);
  const t0 = Date.now();
  const r = spawnSync(cmd, cmdArgs, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  const ok = r.status === 0;
  quadro.push({ etapa: nome, resultado: ok ? 'PROVADO' : `FALHOU (codigo ${r.status})`, segundos: Math.round((Date.now() - t0) / 1000) });
  return ok;
};

let commit = 'desconhecido';
try {
  const g = spawnSync('git', ['log', '-1', '--format=%h', '--', path.join(root, modelo)], { encoding: 'utf8' });
  if (g.status === 0 && g.stdout.trim()) commit = g.stdout.trim();
} catch { /* sem git */ }

const app = path.join(dest, escopo);
let ok = run('install', 'pnpm', ['install', '--prefer-offline'], app);
if (ok) ok = run('build', 'pnpm', ['build'], app);
if (ok && !args.includes('--sem-test')) ok = run('test', 'pnpm', ['test'], app);

console.log(`\n=== quadro: ${modulo}@${escopo} em ${modelo} (commit do boilerplate: ${commit}; data ${new Date().toISOString().slice(0, 10)}) ===`);
for (const n of notas) console.log(`nota da receita: ${n}`);
for (const q of quadro) console.log(`${q.etapa.padEnd(8)} ${q.resultado} (${q.segundos}s)`);
if (!ok) console.log('resultado: FALHOU');
else console.log('resultado: PROVADO');
if (args.includes('--manter')) console.log(`copia mantida em ${base}`);
else fs.rmSync(base, { recursive: true, force: true });
process.exit(ok ? 0 : 1);
