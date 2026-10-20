#!/usr/bin/env node
// Sincroniza seedgridKB/SeedGrid/Toolkit/boilerplates/ com o repositorio boilerplate (so para quem desenvolve o seedgrid-ai;
// nao entra no conteudo instalado nos hosts). Copia SO os arquivos versionados da ref (padrao origin/main), nunca a pasta de trabalho.
// Uso:
//   node scripts/sync-boilerplates.mjs [--repo <pasta>] [--ref origin/main] [--fetch] [--dry-run]
//   node scripts/sync-boilerplates.mjs --check [--fetch] [--soft]   (nao altera nada; sai com 1 se a copia estiver desatualizada)
// --soft: se o repositorio do boilerplate nao estiver acessivel, avisa e sai com 0 (usado no prepack).
// Transformacoes (as mesmas que o init desfaz no produto): binario -> <arquivo>.b64; .gitignore/.gitattributes/.npmignore -> <arquivo>.template.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, 'seedgridKB', 'SeedGrid', 'Toolkit', 'boilerplates');
const ORIGEM_JSON = join(RAIZ, 'scripts', 'boilerplates-origem.json');
const DOTFILES = ['.gitignore', '.gitattributes', '.npmignore'];
const BINARIOS = /\.(png|jpe?g|gif|ico|webp|avif|woff2?|ttf|otf|eot|pdf|jar|zip|gz)$/i;
const PASTAS_PROIBIDAS = new Set(['node_modules', 'target', '.git', 'infra', 'chave-mvn-central', 'dist', 'build', '.next']);

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (n) => process.argv.includes(`--${n}`);

function falhar(msg, codigo = 1) { console.error(`[sync-boilerplates] ${msg}`); process.exit(codigo); }
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}

// Le varios blobs com um unico processo (git cat-file --batch).
function lerBlobs(repo, ref, caminhos) {
  return new Promise((ok, erro) => {
    const p = spawn('git', ['-C', repo, 'cat-file', '--batch'], { stdio: ['pipe', 'pipe', 'inherit'] });
    const pedacos = [];
    p.stdout.on('data', (c) => pedacos.push(c));
    p.on('error', erro);
    p.on('close', (code) => {
      if (code !== 0) return erro(new Error(`git cat-file saiu com ${code}`));
      const buf = Buffer.concat(pedacos);
      const mapa = new Map();
      let pos = 0;
      for (const c of caminhos) {
        const fim = buf.indexOf(0x0a, pos);
        const cab = buf.subarray(pos, fim).toString('utf8').split(' ');
        if (cab[1] !== 'blob') return erro(new Error(`nao e arquivo: ${c} (${cab.join(' ')})`));
        const tam = Number(cab[2]);
        mapa.set(c, buf.subarray(fim + 1, fim + 1 + tam));
        pos = fim + 1 + tam + 1;
      }
      ok(mapa);
    });
    p.stdin.end(caminhos.map((c) => `${ref}:${c}\n`).join(''));
  });
}

function destinoDe(rel) {
  const partes = rel.split('/');
  const nome = partes.at(-1);
  if (DOTFILES.includes(nome.toLowerCase())) { partes[partes.length - 1] = `${nome}.template`; return { rel: partes.join('/'), binario: false }; }
  if (BINARIOS.test(nome)) { partes[partes.length - 1] = `${nome}.b64`; return { rel: partes.join('/'), binario: true }; }
  return { rel, binario: false };
}

function* arquivos(dir) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* arquivos(p);
    else yield p;
  }
}
const semCR = (b) => Buffer.from(b.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');

async function main() {
  const repo = resolve(arg('repo') ?? process.env.SEEDGRID_BOILERPLATE_REPO ?? join(RAIZ, '..', 'boilerplate'));
  const ref = arg('ref') ?? 'origin/main';
  const soft = flag('soft');
  const aviso = (m) => { if (soft) { console.warn(`[sync-boilerplates] AVISO: ${m} (nao verificado)`); process.exit(0); } falhar(m); };
  if (!existsSync(join(repo, '.git')) && !git(repo, ['rev-parse', '--git-dir']).ok) aviso(`repositorio do boilerplate nao encontrado em ${repo} (use --repo ou SEEDGRID_BOILERPLATE_REPO)`);
  if (flag('fetch')) {
    const f = git(repo, ['fetch', 'origin']);
    if (!f.ok) aviso(`git fetch falhou: ${f.err}`);
  }
  const commit = git(repo, ['rev-parse', '--verify', `${ref}^{commit}`]);
  if (!commit.ok) aviso(`ref ${ref} inexistente em ${repo}`);

  const modelos = existsSync(DESTINO) ? readdirSync(DESTINO).filter((n) => statSync(join(DESTINO, n)).isDirectory()).sort() : [];
  if (modelos.length === 0) falhar('nenhum modelo em seedgridKB/SeedGrid/Toolkit/boilerplates/');
  const desejado = new Map(); // caminho relativo ao DESTINO (com /) -> Buffer
  for (const m of modelos) {
    const ls = git(repo, ['ls-tree', '-r', '--name-only', ref, '--', `${m}/`]);
    if (!ls.ok || !ls.out) falhar(`modelo ${m} nao existe em ${ref}`);
    const lista = ls.out.split('\n').filter((c) => !c.split('/').some((p) => PASTAS_PROIBIDAS.has(p)));
    const blobs = await lerBlobs(repo, ref, lista);
    for (const c of lista) {
      const dados = blobs.get(c);
      const d = destinoDe(c);
      if (d.binario) desejado.set(d.rel, Buffer.from(dados.toString('base64'), 'utf8'));
      else {
        if (dados.includes(0)) falhar(`arquivo binario sem extensao conhecida: ${c} (acrescente a extensao em BINARIOS)`);
        desejado.set(d.rel, dados);
      }
    }
  }

  const atual = new Map();
  for (const p of arquivos(DESTINO)) atual.set(relative(DESTINO, p).split(sep).join('/'), readFileSync(p));
  const novos = [], mudados = [], removidos = [];
  for (const [rel, dados] of desejado) {
    if (!atual.has(rel)) novos.push(rel);
    else if (!semCR(atual.get(rel)).equals(semCR(dados))) mudados.push(rel);
  }
  for (const rel of atual.keys()) if (!desejado.has(rel)) removidos.push(rel);
  const diff = novos.length + mudados.length + removidos.length;
  const curto = commit.out.slice(0, 10);

  if (flag('check')) {
    if (diff === 0) { console.log(`[sync-boilerplates] ok: copia igual a ${ref} (${curto}), ${desejado.size} arquivos`); return; }
    console.error(`[sync-boilerplates] copia DESATUALIZADA em relacao a ${ref} (${curto}): ${novos.length} novo(s), ${mudados.length} alterado(s), ${removidos.length} removido(s).`);
    for (const [t, l] of [['novo', novos], ['alterado', mudados], ['removido', removidos]]) for (const r of l.slice(0, 8)) console.error(`  ${t}: ${r}`);
    console.error('Rode "npm run sync-boilerplates", confira o diff e comite antes de publicar.');
    process.exit(1);
  }

  console.log(`[sync-boilerplates] ${ref} (${curto}): ${novos.length} novo(s), ${mudados.length} alterado(s), ${removidos.length} removido(s), ${desejado.size - novos.length - mudados.length} igual(is)`);
  if (flag('dry-run')) return;
  for (const rel of removidos) rmSync(join(DESTINO, rel));
  for (const rel of [...novos, ...mudados]) {
    const f = join(DESTINO, rel);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, desejado.get(rel));
  }
  for (const rel of removidos) { // pastas que ficaram vazias
    let d = dirname(join(DESTINO, rel));
    while (d !== DESTINO && existsSync(d) && readdirSync(d).length === 0) { rmSync(d, { recursive: true }); d = dirname(d); }
  }
  writeFileSync(ORIGEM_JSON, JSON.stringify({ repositorio: git(repo, ['remote', 'get-url', 'origin']).out || repo, ref, commit: commit.out, modelos, arquivos: desejado.size }, null, 2) + '\n');
  const trava = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'check-secrets.mjs'), '--dir', DESTINO], { stdio: 'inherit' });
  if (trava.status !== 0) falhar('check-secrets reprovou a copia: nada deve ser comitado. Corrija no repositorio do boilerplate e rode de novo.');
  console.log('[sync-boilerplates] pronto. Confira "git status" e "npm test" e comite.');
}

main().catch((e) => falhar(e.message));
