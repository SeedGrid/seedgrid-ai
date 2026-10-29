#!/usr/bin/env node
// Prepara a release de um produto SeedGrid: sobe a versao (YYYY.M.N) em todos os servicos de uma vez, numa branch
// release/<versao> saindo da develop, com commit e tag LOCAIS. PARA ali: push, merge na main e deploy NAO sao feitos
// (HO-07: so com autorizacao do dono).
//   node release.mjs [--destino <pasta do produto>] [--versao YYYY.M.N] [--dry-run] [--sem-testes] [--base develop] [--json]
// Le os arquivos de versao de produto.json (servicos): backend -> pom.xml, frontend/admin -> package.json; CHANGELOG.md na raiz.
// Sem --versao calcula YYYY.M.N: ano e mes de hoje e N = (maior N ja tagueado nesse mes) + 1.
// Conferencias antes de mexer em qualquer arquivo: repositorio limpo, na branch base, tag inexistente (local e no origin),
// versoes coerentes entre os servicos, nenhum segredo versionado, build e testes (pule com --sem-testes).
// Saidas: 0 ok (ou dry-run ok), 1 conferencia falhou, 2 uso/ambiente. Sem dependencias.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSAO = /^(\d{4})\.(\d{1,2})\.(\d+)$/;
const windows = process.platform === 'win32';

export function proximaVersao(tags, hoje, prefixo = 'v') {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;
  let n = 0;
  for (const t of tags) {
    const m = VERSAO.exec(t.startsWith(prefixo) ? t.slice(prefixo.length) : t);
    if (m && Number(m[1]) === ano && Number(m[2]) === mes) n = Math.max(n, Number(m[3]));
  }
  return `${ano}.${mes}.${n + 1}`;
}

/** Posicao e valor do <version> do projeto no pom (o primeiro fora de <parent>). */
export function versaoDoPom(xml) {
  const sem = xml.replace(/<parent>[\s\S]*?<\/parent>/, (m) => ' '.repeat(m.length));
  const m = /<version>([^<]+)<\/version>/.exec(sem);
  if (!m) return null;
  return { valor: m[1].trim(), inicio: m.index + '<version>'.length, fim: m.index + '<version>'.length + m[1].length };
}

export function trocarNoPom(xml, nova) {
  const v = versaoDoPom(xml);
  if (!v) throw new Error('pom.xml sem <version> do projeto');
  return `${xml.slice(0, v.inicio)}${nova}${xml.slice(v.fim)}`;
}

export function trocarNoPackageJson(texto, nova) {
  const m = /("version"\s*:\s*")([^"]+)(")/.exec(texto);
  if (!m) throw new Error('package.json sem "version"');
  return `${texto.slice(0, m.index)}${m[1]}${nova}${m[3]}${texto.slice(m.index + m[0].length)}`;
}

/** Fecha a secao "Nao publicado" como a versao e abre uma nova vazia; sem o arquivo ou sem a secao, cria. */
export function atualizarChangelog(texto, versao, data) {
  const cab = '# Changelog\n\nFormato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).\n';
  const base = (texto ?? cab).replace(/\r\n/g, '\n');
  const re = /^## \[(Nao|Não) publicado\][^\n]*$/im;
  const fechada = `## [Nao publicado]\n\n## [${versao}] - ${data}`;
  if (re.test(base)) return base.replace(re, fechada);
  const i = base.search(/^## /m);
  const novo = `## [Nao publicado]\n\n## [${versao}] - ${data}\n\n- Release ${versao}.\n\n`;
  return i < 0 ? `${base.replace(/\n*$/, '\n')}\n${novo}`.replace(/\n+$/, '\n') : `${base.slice(0, i)}${novo}${base.slice(i)}`;
}

const SEGREDOS_NOME = /(^|\/)(dev\.env|\.env|\.env\.[^/]*|[^/]*\.pem|[^/]*\.p12|[^/]*\.pfx|id_rsa|[^/]*\.key)$/i;
const EXEMPLO_NOME = /\.(example|sample|template)$/i;
const SEGREDOS_CONTEUDO = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bsk_(live|test)_[A-Za-z0-9]{16,}/];

export function segredosVersionados(arquivos, ler) {
  const achados = [];
  for (const f of arquivos) {
    if (SEGREDOS_NOME.test(f) && !EXEMPLO_NOME.test(f)) { achados.push(`${f}: nome de arquivo de segredo`); continue; }
    if (/\.(test|spec)\.|[\\/]src[\\/]test[\\/]|\.md$/i.test(f)) continue;
    let t;
    try { t = ler(f); } catch { continue; }
    if (t.length > 2_000_000 || t.includes('\u0000')) continue;
    for (const re of SEGREDOS_CONTEUDO) if (re.test(t)) { achados.push(`${f}: padrao de credencial`); break; }
  }
  return achados;
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
  const dry = args.includes('--dry-run');
  const semTestes = args.includes('--sem-testes');
  const json = args.includes('--json');
  const destino = resolve(opt('--destino', '.'));
  const base = opt('--base', 'develop');
  const falhaUso = (m) => { console.error(`Erro: ${m}`); process.exit(2); };
  const git = (a, permite = false) => {
    try { return execFileSync('git', ['-C', destino, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 }).replace(/\r?\n$/, ''); } catch (e) { if (permite) return null; throw new Error(`git ${a.join(' ')}: ${(e.stderr || e.message).toString().trim()}`); }
  };

  if (!existsSync(join(destino, 'produto.json'))) falhaUso(`sem produto.json em ${destino}`);
  if (git(['rev-parse', '--git-dir'], true) === null) falhaUso(`${destino} nao e um repositorio git`);
  const produto = JSON.parse(readFileSync(join(destino, 'produto.json'), 'utf8'));
  const servicos = produto.servicos ?? [];

  // Arquivos de versao por servico.
  const alvos = [];
  for (const s of servicos) {
    const dir = s.nome;
    if (s.tipo === 'backend') alvos.push({ servico: s.nome, tipo: 'pom', arquivo: `${dir}/pom.xml` });
    else if (s.tipo === 'frontend' || s.tipo === 'admin') alvos.push({ servico: s.nome, tipo: 'package', arquivo: `${dir}/package.json` });
  }
  if (!alvos.length) falhaUso('produto.json sem servicos com arquivo de versao');
  for (const a of alvos) if (!existsSync(join(destino, a.arquivo))) falhaUso(`falta ${a.arquivo}`);

  const hoje = process.env.SG_RELEASE_HOJE ? new Date(`${process.env.SG_RELEASE_HOJE}T12:00:00`) : new Date();
  const dataIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const hasOrigin = (git(['remote'], true) || '').split('\n').includes('origin');
  const tagsLocais = (git(['tag', '--list'], true) || '').split('\n').filter(Boolean);
  const tagsRemotas = hasOrigin ? (git(['ls-remote', '--tags', '--refs', 'origin'], true) || '').split('\n').map((l) => l.split('refs/tags/')[1]).filter(Boolean) : [];
  const versao = opt('--versao', null) ?? proximaVersao([...tagsLocais, ...tagsRemotas], hoje);
  if (!VERSAO.test(versao)) falhaUso(`versao invalida (YYYY.M.N): ${versao}`);
  const tag = `v${versao}`;

  const checks = [];
  const confere = (id, passou, detalhe = '') => checks.push({ id, passou, detalhe });

  const suja = git(['status', '--porcelain']);
  confere('arvore de trabalho limpa', suja === '', suja ? suja.split('\n').slice(0, 5).join('; ') : '');
  const atual = git(['branch', '--show-current'], true) || '';
  confere(`na branch ${base}`, atual === base, atual ? `esta em ${atual}` : 'HEAD solto');
  confere(`tag ${tag} inexistente`, !tagsLocais.includes(tag) && !tagsRemotas.includes(tag), tagsLocais.includes(tag) ? 'ja existe local' : tagsRemotas.includes(tag) ? 'ja existe no origin' : '');
  confere(`branch release/${versao} inexistente`, git(['rev-parse', '--verify', '--quiet', `refs/heads/release/${versao}`], true) === null);

  // Versoes coerentes: todos os servicos na mesma versao (pom sem -SNAPSHOT).
  const atuais = alvos.map((a) => {
    const t = readFileSync(join(destino, a.arquivo), 'utf8');
    if (a.tipo === 'pom') { const v = versaoDoPom(t); return { ...a, atual: v ? v.valor.replace(/-SNAPSHOT$/, '') : null }; }
    const m = /"version"\s*:\s*"([^"]+)"/.exec(t);
    return { ...a, atual: m ? m[1] : null };
  });
  const distintas = [...new Set(atuais.map((a) => a.atual))];
  confere('versoes coerentes entre os servicos', atuais.every((a) => a.atual) && distintas.length === 1, atuais.map((a) => `${a.servico}=${a.atual}`).join(', '));
  const nova = atuais.find((a) => a.atual && VERSAO.test(a.atual) && a.atual === versao);
  confere('versao nova diferente da atual', !nova, nova ? `ja esta em ${versao}` : '');

  // Segredos: usa o check-secrets completo da skill irma (sg-check-secrets) se estiver instalada; senao, a conferencia minima daqui.
  const completo = resolve(fileURLToPath(import.meta.url), '..', '..', '..', 'sg-check-secrets', 'scripts', 'check-secrets.mjs');
  const ignorar = ['^\\.ai/(brain|skills|rules|agents|templates|references)/', '^\\.agents/', '^\\.claude/(skills|agents)/'].flatMap((r) => ['--ignore', r]);
  if (existsSync(completo)) {
    const cs = spawnSync(process.execPath, [completo, ...ignorar], { cwd: destino, encoding: 'utf8', maxBuffer: 1 << 26 });
    confere('nenhum segredo versionado (sg-check-secrets)', cs.status === 0, cs.status === 0 ? '' : (cs.stderr || cs.stdout).trim().split('\n').slice(1, 6).join('; '));
  } else {
    const rastreados = (git(['ls-files'], true) || '').split('\n').filter(Boolean);
    const segredos = segredosVersionados(rastreados, (f) => readFileSync(join(destino, f), 'utf8'));
    confere('nenhum segredo versionado', segredos.length === 0, segredos.slice(0, 5).join('; '));
  }

  if (!semTestes && !dry) {
    for (const s of servicos) {
      let cmd = null;
      if (s.tipo === 'backend') cmd = windows ? ['mvn.cmd', ['-B', '-q', 'verify']] : ['mvn', ['-B', '-q', 'verify']];
      else if ((s.tipo === 'frontend' || s.tipo === 'admin') && existsSync(join(destino, s.nome, 'package.json')) && /"build"\s*:/.test(readFileSync(join(destino, s.nome, 'package.json'), 'utf8'))) cmd = [windows ? 'npm.cmd' : 'npm', ['run', 'build']];
      if (!cmd) continue;
      const r = spawnSync(cmd[0], cmd[1], { cwd: join(destino, s.nome), encoding: 'utf8', shell: windows, maxBuffer: 1 << 28 });
      confere(`build e testes: ${s.nome}`, r.status === 0, r.status === 0 ? '' : `${cmd[0]} ${cmd[1].join(' ')} saiu com ${r.status}`);
    }
  } else if (!semTestes) {
    confere('build e testes', true, 'nao rodados no --dry-run (rodam na release de verdade; --sem-testes pula)');
  }

  const plano = { versao, tag, branch: `release/${versao}`, base, data: dataIso, dryRun: dry, arquivos: [...atuais.map((a) => ({ arquivo: a.arquivo, de: a.atual, para: versao })), { arquivo: 'CHANGELOG.md', de: '[Nao publicado]', para: `[${versao}] - ${dataIso}` }], conferencias: checks };
  const falhas = checks.filter((c) => !c.passou);
  const relata = (extra = {}) => {
    if (json) { console.log(JSON.stringify({ ...plano, ...extra }, null, 2)); return; }
    console.log(`Release ${versao} (${dry ? 'dry-run: nada foi alterado' : 'preparacao local'})`);
    for (const c of checks) console.log(`${c.passou ? 'OK   ' : 'FALHA'} ${c.id}${c.detalhe ? ` — ${c.detalhe}` : ''}`);
    for (const a of plano.arquivos) console.log(`  ${a.arquivo}: ${a.de} -> ${a.para}`);
    if (extra.proximo) console.log(extra.proximo);
  };
  if (falhas.length) { relata(); console.error(`\n${falhas.length} conferencia(s) falharam: nada foi alterado.`); process.exit(1); }
  if (dry) { relata(); return; }

  git(['switch', '-c', `release/${versao}`]);
  for (const a of atuais) {
    const caminho = join(destino, a.arquivo);
    const t = readFileSync(caminho, 'utf8');
    writeFileSync(caminho, a.tipo === 'pom' ? trocarNoPom(t, versao) : trocarNoPackageJson(t, versao));
  }
  const cl = join(destino, 'CHANGELOG.md');
  writeFileSync(cl, atualizarChangelog(existsSync(cl) ? readFileSync(cl, 'utf8') : null, versao, dataIso));
  git(['add', '--', ...atuais.map((a) => a.arquivo), 'CHANGELOG.md']);
  git(['commit', '-q', '-m', `release: ${versao}`]);
  git(['tag', '-a', tag, '-m', `Release ${versao}`]);
  relata({ commit: git(['rev-parse', '--short', 'HEAD']), proximo: `\nPARADO: commit e tag ${tag} locais na branch release/${versao}. Merge normal na main, push, tag no origin e deploy so com a autorizacao do dono (HO-07).` });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
