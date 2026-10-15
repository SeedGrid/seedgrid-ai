#!/usr/bin/env node
// Gera seedgridKB/SeedGrid/Versoes.md: para cada módulo SeedGrid, a versão que as notas da KB
// descrevem (lida no commit registrado no frontmatter) × a versão atual do repositório
// (× a publicada no Maven Central / npm, com --published).
//
// A tabela é MECÂNICA (poms, package.json, Cargo.toml e git). Ela não afirma que uma nota foi
// revisada: isso continua sendo o `commit`/`analisado-em` do frontmatter, que só muda quando
// alguém revisa a nota contra o código.
//
// Uso:
//   node scripts/kb-versions.mjs [--platform <pasta>] [--write | --check] [--published] [--strict] [--json]
//     --platform  raiz do seedgrid-platform (padrão: $SEEDGRID_PLATFORM ou ../seedgrid-platform)
//     --write     grava SeedGrid/Versoes.md
//     --check     falha (código 1) se Versoes.md não corresponde ao estado atual dos repositórios
//     --strict    falha (código 1) se alguma nota está defasada em relação ao código
//     --published consulta Maven Central e npm (rede) e inclui a coluna "Publicada"
//     --json      imprime o relatório em JSON
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vault = path.join(root, 'seedgridKB');
const outFile = path.join(vault, 'SeedGrid', 'Versoes.md');
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const platform = path.resolve(opt('platform') ?? process.env.SEEDGRID_PLATFORM ?? path.join(root, '..', 'seedgrid-platform'));

function git(dir, ...a) {
  try {
    return execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch {
    return null;
  }
}

// ---------- 1. notas da KB: fonte + commit por módulo ----------
function notes() {
  const out = [];
  const base = path.join(vault, 'SeedGrid');
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name !== 'Toolkit') walk(p);
      } else if (p.endsWith('.md')) {
        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(p, 'utf8'));
        if (!fm) continue;
        const get = (k) => new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(fm[1])?.[1].trim();
        out.push({ rel: path.relative(base, p).split(path.sep).join('/'), fonte: get('fonte') ?? '', commit: get('commit') ?? '' });
      }
    }
  })(base);
  return out;
}

/** Módulo -> { commit mais frequente nas notas, nota principal (para o link) }. */
function documentedModules(all, re) {
  const map = new Map();
  for (const n of all) {
    for (const m of n.fonte.matchAll(re)) {
      const key = m[1];
      const e = map.get(key) ?? { commits: new Map(), notes: [] };
      if (n.commit) e.commits.set(n.commit, (e.commits.get(n.commit) ?? 0) + 1);
      e.notes.push(n.rel);
      map.set(key, e);
    }
  }
  for (const e of map.values()) e.commit = [...e.commits.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  return map;
}

// ---------- 2. leitura de versões ----------
const stripParent = (xml) => xml.replace(/<parent>[\s\S]*?<\/parent>/, '');
const pomField = (xml, tag) => new RegExp(`<${tag}>([^<]+)</${tag}>`).exec(stripParent(xml))?.[1].trim();

function pomAt(dir, commit, file = 'pom.xml') {
  if (commit) return git(dir, 'show', `${commit}:${file}`);
  const p = path.join(dir, file);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

/** Artefatos publicáveis do repositório (jar, exceto deployment/integration-tests; e o pom raiz se for BOM/agregador publicável). */
function javaArtifacts(dir) {
  const found = [];
  (function walk(d, depth) {
    if (depth > 3) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (!e.isDirectory() || ['target', 'node_modules', 'examples', 'docs', '.git', 'deployment', 'integration-tests'].includes(e.name)) continue;
      walk(path.join(d, e.name), depth + 1);
    }
    const pom = path.join(d, 'pom.xml');
    if (!existsSync(pom)) return;
    const xml = readFileSync(pom, 'utf8');
    const id = pomField(xml, 'artifactId');
    const packaging = pomField(xml, 'packaging') ?? 'jar';
    if (id && (packaging === 'jar' || depth === 0)) found.push({ id, packaging });
  })(dir, 0);
  return found.sort((a, b) => a.id.localeCompare(b.id));
}

const CODE = /\.(java|kt|rs|tsx?|jsx?|mjs|properties|ya?ml|sql|toml|xml|json)$/;
const NOT_CODE = /(^|\/)(test|tests|__tests__|e2e|docs?|target|node_modules|dist)\/|\.(test|spec)\.|(^|\/)(README|CHANGELOG)[^/]*$|pnpm-lock|package-lock|Cargo\.lock/;

function drift(dir, commit, pathspec) {
  if (!commit) return { status: 'sem-commit' };
  if (git(dir, 'cat-file', '-t', commit) !== 'commit') return { status: 'commit-ausente' };
  const head = git(dir, 'rev-parse', '--short=10', 'HEAD');
  const n = Number(git(dir, 'rev-list', '--count', `${commit}..HEAD`) ?? 0);
  const files = (git(dir, 'diff', '--name-only', commit, 'HEAD', ...(pathspec ? ['--', pathspec] : [])) ?? '')
    .split('\n')
    .filter((f) => f && CODE.test(f) && !NOT_CODE.test(f));
  const dirty = (git(dir, 'status', '--porcelain', ...(pathspec ? ['--', pathspec] : [])) ?? '').length > 0;
  return { status: files.length === 0 ? 'em-dia' : 'defasada', commits: n, files: files.length, head, dirty };
}

// ---------- 3. consultas publicadas (rede) ----------
async function get(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}
const central = async (id) => /<release>([^<]+)<\/release>/.exec((await get(`https://repo1.maven.org/maven2/br/com/seedgrid/${id}/maven-metadata.xml`)) ?? '')?.[1] ?? null;
const npm = async (name) => {
  const t = await get(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`);
  try {
    return t ? JSON.parse(t).version : null;
  } catch {
    return null;
  }
};

// ---------- 4. montagem ----------
const all = notes();
const report = { java: [], front: [], rust: [] };
const published = flag('published');
const noteLink = (rel, label) => `[[SeedGrid/${rel.replace(/\.md$/, '')}\\|${label}]]`;

if (!existsSync(platform)) {
  console.error(`seedgrid-platform não encontrado em ${platform} (use --platform ou SEEDGRID_PLATFORM).`);
  process.exit(2);
}

// Java: um repositório por módulo
for (const [name, info] of [...documentedModules(all, /java\/(seedgrid-quarkus-(?:ext|lib)-[a-z0-9-]+)/g)].sort()) {
  const dir = path.join(platform, 'java', name);
  if (!existsSync(dir)) continue;
  const docPom = pomAt(dir, info.commit);
  const nowPom = pomAt(dir, '');
  const head = info.notes.find((n) => n.endsWith('/Visao-geral.md')) ?? info.notes[0];
  const arts = javaArtifacts(dir);
  const row = {
    modulo: name.replace(/^seedgrid-quarkus-/, ''),
    nota: head,
    artefatos: arts.map((a) => a.id),
    commit: info.commit,
    documentada: docPom ? pomField(docPom, 'version') ?? null : null,
    atual: nowPom ? pomField(nowPom, 'version') ?? null : null,
    ...drift(dir, info.commit),
  };
  if (published) row.publicada = (await Promise.all(arts.filter((a) => a.packaging === 'jar').map((a) => central(a.id)))).find(Boolean) ?? null;
  report.java.push(row);
}

// Front: um repositório, vários pacotes npm
{
  const dir = path.join(platform, 'front', 'seedgrid-fe-components');
  const info = documentedModules(all, /(front\/seedgrid-fe-components)/g).get('front/seedgrid-fe-components');
  if (existsSync(dir) && info) {
    const pkgDirs = [];
    for (const g of ['packages', 'packages/modules']) {
      const gd = path.join(dir, g);
      if (!existsSync(gd)) continue;
      for (const e of readdirSync(gd, { withFileTypes: true })) {
        if (e.isDirectory() && existsSync(path.join(gd, e.name, 'package.json'))) pkgDirs.push(`${g}/${e.name}`);
      }
    }
    for (const pd of pkgDirs.sort()) {
      const now = JSON.parse(readFileSync(path.join(dir, pd, 'package.json'), 'utf8'));
      if (now.private) continue;
      let doc = null;
      try {
        doc = JSON.parse(git(dir, 'show', `${info.commit}:${pd}/package.json`) ?? 'null');
      } catch {
        doc = null;
      }
      report.front.push({
        pacote: now.name,
        commit: info.commit,
        documentada: doc?.version ?? null,
        atual: now.version,
        ...drift(dir, info.commit, pd),
        ...(published ? { publicada: await npm(now.name) } : {}),
      });
    }
  }
}

// Rust: workspace único
{
  const dir = path.join(platform, 'rust');
  const info = documentedModules(all, /(rust)\//g).get('rust');
  if (existsSync(dir) && info) {
    const ver = (toml) => /\[workspace\.package\][\s\S]*?^version\s*=\s*"([^"]+)"/m.exec(toml ?? '')?.[1] ?? null;
    report.rust.push({
      pacote: 'seedgrid-rust-crate-* (workspace)',
      commit: info.commit,
      documentada: ver(git(dir, 'show', `${info.commit}:Cargo.toml`)),
      atual: ver(readFileSync(path.join(dir, 'Cargo.toml'), 'utf8')),
      ...drift(dir, info.commit),
    });
  }
}

// ---------- 5. renderização ----------
const situacao = (r) => {
  const parts = [];
  if (r.status === 'em-dia') parts.push('em dia');
  else if (r.status === 'defasada') parts.push(`**defasada**: ${r.files} arquivo(s) de código mudaram em ${r.commits} commit(s)`);
  else parts.push(r.status === 'commit-ausente' ? 'commit documentado não encontrado' : 'sem commit na nota');
  if (r.documentada && r.atual && r.documentada !== r.atual) parts.push(`versão mudou ${r.documentada} → ${r.atual}`);
  if (r.dirty) parts.push('alterações locais não commitadas');
  if (published && r.artefatos && r.publicada && r.atual && r.publicada !== r.atual) parts.push(`atual (${r.atual}) ainda não publicada`);
  return parts.join('; ');
};
const v = (x) => (x ? `\`${x}\`` : '—');
const cols = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)];

const today = new Date().toISOString().slice(0, 10);
const md = [
  '---',
  'tags: [seedgrid, versoes, gerado]',
  'gerado-por: scripts/kb-versions.mjs',
  `gerado-em: ${today}`,
  '---',
  '',
  '# Versões documentadas × atuais',
  '',
  '> Nota **gerada por script** a partir dos poms, `package.json`, `Cargo.toml` e do git. Não edite à mão: rode `node scripts/kb-versions.mjs --write`.',
  '',
  '## Como usar',
  '',
  '- **Documentada**: versão do artefato no commit que as notas da KB declaram descrever (`commit` no frontmatter).',
  '- **Atual**: versão no repositório de origem hoje.' + (published ? ' **Publicada**: última versão no Maven Central / npm.' : ''),
  '- Compare a **Documentada** com a versão que o seu projeto usa (`pom.xml` / `package.json`). Se forem diferentes, as notas podem não refletir o comportamento do projeto: confirme no código, no jar ou no pacote e avise.',
  '- **Situação** compara o código atual com o commit documentado, ignorando testes, documentação e lockfiles. "Defasada" significa que a nota precisa de revisão; não significa que está errada.',
  '- Em Java, `groupId` é `br.com.seedgrid`; versões são datas (`yyyy.MM.dd`, com sufixo `-N` a partir da segunda publicação do dia) e **não são sincronizadas entre módulos**.',
  '',
  '## Java / Quarkus',
  '',
  ...cols(
    ['Módulo', 'Artefatos (artifactId)', 'Documentada', 'Atual', ...(published ? ['Publicada'] : []), 'Situação'],
    report.java.map((r) => [noteLink(r.nota, r.modulo), r.artefatos.map((a) => `\`${a}\``).join(', '), v(r.documentada), v(r.atual), ...(published ? [v(r.publicada)] : []), situacao(r)]),
  ),
  '',
  '## Front-end (npm)',
  '',
  ...cols(
    ['Pacote', 'Documentada', 'Atual', ...(published ? ['Publicada'] : []), 'Situação'],
    report.front.map((r) => [`\`${r.pacote}\``, v(r.documentada), v(r.atual), ...(published ? [v(r.publicada)] : []), situacao(r)]),
  ),
  '',
  '## Rust',
  '',
  ...cols(['Crates', 'Documentada', 'Atual', 'Situação'], report.rust.map((r) => [r.pacote, v(r.documentada), v(r.atual), situacao(r)])),
  '',
].join('\n');

// ---------- 6. saída ----------
const stale = [...report.java.map((r) => ({ ...r, id: r.modulo })), ...report.front.map((r) => ({ ...r, id: r.pacote })), ...report.rust.map((r) => ({ ...r, id: r.pacote }))].filter((r) => r.status !== 'em-dia');
const normalize = (t) => t.replace(/^gerado-em:.*$/m, '').replace(/\r\n/g, '\n');
let exit = 0;

if (flag('json')) console.log(JSON.stringify({ platform, ...report }, null, 2));
if (flag('write')) {
  writeFileSync(outFile, md);
  console.log(`Gravado ${path.relative(root, outFile)} (${report.java.length} módulos Java, ${report.front.length} pacotes npm, ${report.rust.length} workspace Rust).`);
}
if (flag('check')) {
  const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : '';
  if (normalize(current) !== normalize(md)) {
    console.error('Versoes.md está desatualizada em relação aos repositórios. Rode: node scripts/kb-versions.mjs --write' + (published ? ' --published' : ''));
    exit = 1;
  } else console.log('Versoes.md confere com os repositórios.');
}
if (!flag('json')) {
  if (stale.length === 0) console.log('Todas as notas estão em dia com o código.');
  else {
    console.log(`Notas a revisar (${stale.length}):`);
    for (const r of stale) console.log(`  - ${r.id}: ${situacao(r)}`);
  }
}
if (flag('strict') && stale.some((r) => r.status === 'defasada' || r.status === 'commit-ausente')) exit = 1;
process.exit(exit);
