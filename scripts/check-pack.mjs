#!/usr/bin/env node
// Confere o que entraria no pacote npm sem publicar nada.
// Uso: node scripts/check-pack.mjs [--release <tag>]
//   --release v0.3.0  também exige tag == versão do package.json e campo repository preenchido.
// Requer `npm run build` (usa o carregador de conteúdo compilado).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const errors = [];
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const vault = 'seedgridKB';

const { loadContent } = await import(pathToFileURL(path.resolve('dist/core/content.js')).href);
let bundle;
try {
  bundle = await loadContent(vault);
} catch (err) {
  console.error(`Conteúdo inválido:\n${[err.message, ...(err.details ?? [])].map((e) => `- ${e}`).join('\n')}`);
  process.exit(1);
}

const out = execSync('npm pack --dry-run --json --ignore-scripts', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const files = new Set(JSON.parse(out)[0].files.map((f) => f.path.replace(/\\/g, '/')));

// 1. Tudo que o manifesto instala precisa estar no pacote.
const expected = new Set([`${vault}/manifest.json`, ...bundle.sourceFiles.map((f) => `${vault}/${f}`)]);
for (const f of ['package.json', 'LICENSE', 'README.md', 'dist/cli.js', ...expected]) {
  if (!files.has(f)) errors.push(`ausente no pacote: ${f}`);
}

// 2. O vault só pode contribuir com o que o manifesto instala (nada de .obsidian, AGENTS.md de manutenção, etc.).
for (const f of files) {
  if (f.startsWith(`${vault}/`) && !expected.has(f)) errors.push(`o vault vazaria arquivo que o manifesto não instala: ${f}`);
}

// 3. Nunca no pacote.
const forbidden = [/(^|\/)\.ai\/backups\//, /(^|\/)\.env/, /\.seedgrid-tmp-/, /\.tgz$/, /^(src|tests|build-test|node_modules|scripts)\//, /(^|\/)\.npmrc$/, /(^|\/)\.obsidian\//];
for (const f of files) if (forbidden.some((re) => re.test(f))) errors.push(`não deveria estar no pacote: ${f}`);

const i = process.argv.indexOf('--release');
if (i >= 0) {
  const tag = process.argv[i + 1] ?? '';
  if (tag !== `v${pkg.version}`) errors.push(`tag ${tag || '(vazia)'} diferente da versão do package.json (v${pkg.version})`);
  const repo = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  if (!repo) errors.push('package.json sem "repository" (obrigatório para publicar com provenance)');
}
if (bundle.contentVersion !== pkg.version) {
  errors.push(`contentVersion (${bundle.contentVersion}) diferente da versão do pacote (${pkg.version}); mantenha as duas iguais`);
}

if (errors.length > 0) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}
console.log(`Pacote ${pkg.name}@${pkg.version} ok: ${files.size} arquivos (${bundle.brain?.notes ?? 0} notas da KB), conteúdo ${bundle.contentVersion}.`);
