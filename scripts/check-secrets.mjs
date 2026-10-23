#!/usr/bin/env node
// Trava contra credenciais no boilerplate. Sem dependencias.
//
//   node scripts/check-secrets.mjs               confere todos os arquivos versionados (CI)
//   node scripts/check-secrets.mjs --staged      confere so o que esta no indice (pre-commit)
//   node scripts/check-secrets.mjs --history     confere as linhas adicionadas em todo o historico
//   node scripts/check-secrets.mjs --dir <pasta> confere uma pasta fora do git (copia para o toolkit, pacote); repetivel
//   node scripts/check-secrets.mjs --kb-dir <pasta> igual a --dir, para a base de conhecimento do pacote (ver excecao abaixo); repetivel
//   (pasta inexistente em --dir/--kb-dir: aviso e segue; a pasta de boilerplates e criada por outra tarefa)
//
// EXCECAO UNICA de --kb-dir: nos arquivos *.md a checagem de ATRIBUICAO (senha=, apiKey: "..." e valor aleatorio longo)
// e ignorada, porque as notas da KB citam nomes de variavel e exemplos. Continuam valendo em *.md: o NOME do arquivo
// e os padroes de token real (chave privada, AKIA, ghp_, sk_live_/sk_test_ com 16+ caracteres, JWT, URL com senha).
// Unica outra folga: em *.md o marcador de chave privada citado ENTRE CRASES, na prosa, nao conta; marcador solto (chave colada) conta.
// Em .env, .txt, .ts, .json e qualquer outro tipo nada e relaxado. --dir (boilerplates) nao tem excecao.
//
// Sai com 1 se achar algo. A conferencia olha NOME e CONTEUDO: renomear dev.env para _dev.env, dev.env.bak
// ou qualquer outro nome nao esconde o segredo, porque o conteudo tambem e examinado.
// Valor de exemplo legitimo: use um marcador (change-me, troque..., ${VAR}, <valor>) ou ponha a linha em
// arquivo de teste (*.test.*, *.spec.*, src/test/).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dirTargets = [];
args.forEach((a, i) => { if (a === '--dir' || a === '--kb-dir') dirTargets.push({ dir: args[i + 1], kb: a === '--kb-dir' }); });
const mode = args.includes('--staged') ? 'staged' : args.includes('--history') ? 'history' : dirTargets.length ? 'dir' : 'tracked';

// ---- nomes -------------------------------------------------------------------------------------------------
const SAFE_SUFFIX = /\.(example|sample|template|dist)$/;
const FORBIDDEN_NAMES = [
  // qualquer arquivo de ambiente, com qualquer prefixo ou sufixo: dev.env, _dev.env, dev.env.bak, copia-dev.env, .env.local
  /(^|\/)[^/]*\.env([._~-][^/]*)?$/, /(^|\/)[^/]*[._-]env$/, /(^|\/)\.env$/,
  // backup ou copia de qualquer coisa
  /\.(bak|orig|old|backup|save|swp|tmp)$/i, /~$/,
  // chaves e certificados
  /\.pem$/, /\.p12$/, /\.pfx$/, /\.jks$/, /\.keystore$/, /\.key$/, /(^|\/)id_(rsa|ed25519|ecdsa)$/,
  /(^|\/)credentials(\.[a-z]+)?$/, /(^|\/)service-account[^/]*\.json$/,
];

// ---- conteudo ----------------------------------------------------------------------------------------------
const TOKEN_PATTERNS = [
  ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['token do GitHub', /\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ['chave Stripe', /\b(sk|rk)_(live|test)_[A-Za-z0-9]{16,}\b/],
  ['token Slack', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['JWT assinado', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['URL com usuario e senha', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@'"${}<>]+:[^\s@/'"${}<>]{3,}@[^\s'"]+/i],
];

// Atribuicao de segredo: o nome da chave TERMINA em palavra de segredo.
const KEY = '([A-Za-z0-9_.-]*(?:password|passwd|secret|secret[_-]?key|token|api[_-]?key|apikey|private[_-]?key|credential)s?)';
const ASSIGN_CODE = new RegExp(KEY + '["\']?\\s*[:=]\\s*["`\']([^"`\']{6,})["`\']', 'i'); // codigo: so string literal
const ASSIGN_CONF = new RegExp('(?:^|[\\s"\'])' + KEY + '["\']?\\s*[:=]\\s*["\']?([^"\'\\s#]+)', 'i'); // env, properties, yaml, md
const CODE_EXT = /\.(tsx?|jsx?|mjs|cjs|java|kt|rs|py|go)$/;
const PLACEHOLDER = /^(postgres|postgresql|admin|root|dev|local|localhost|minioadmin|guest|sa|user|changeit|change-?me|troque.*|gere.*|xxx+|x{4,}|example|exemplo|test|teste|dummy|secret|password|senha|\*+|\.\.\.|null|none|true|false|\$.*|\{.*|\(.*|\/.*|<.*|your[_-].*|.*example.*|.*placeholder.*|.*changeme.*|.*\$\{.*)$/i;
// Em codigo, palavra so de letras (rotulo de tela, chave de traducao) nao e segredo; segredo tem digito ou simbolo.
const LABEL_LIKE = /^[A-Za-z][A-Za-z.\-_]*$/;
const TEST_FILE =/(\.test\.|\.spec\.|[/\\]src[/\\]test[/\\]|[/\\]__tests__[/\\]|[/\\]e2e[/\\])/;
const COMPOSE_DEV = /(^|\/)docker-compose[^/]*\.ya?ml$/;
const SKIP_PATH = /(^|\/)(node_modules|target|dist|build|\.next)\//;
const SKIP_EXT = /(\.(png|jpe?g|gif|webp|ico|svg|woff2?|ttf|eot|pdf|zip|gz|tgz|jar|class|lock)|pnpm-lock\.yaml|package-lock\.json)$/i;

// Valor longo e aleatorio (base64 ou hex) em qualquer chave, mesmo sem nome suspeito.
const BLOB_LINE = /[:=]\s*["']?([A-Za-z0-9+/_=-]{32,})["']?\s*$/;
function entropy(s) {
  const m = {};
  for (const ch of s) m[ch] = (m[ch] || 0) + 1;
  return -Object.values(m).reduce((h, n) => h + (n / s.length) * Math.log2(n / s.length), 0);
}

const problems = [];
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

function scanText(file, text, label = '', kb = false) {
  const isMd = /.md$/i.test(file);
  const isTest = TEST_FILE.test(file) || (kb && isMd); // kb: nota .md so passa pela checagem de token
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.length > 2000) return;
    const where = `${file}:${i + 1}${label}`;
    for (const [nome, re] of TOKEN_PATTERNS) {
      const hit = re.exec(line);
      if (!hit || /example|exemplo|placeholder/i.test(line)) continue;
      if (kb && isMd && nome === 'chave privada' && /`[^`]*-----BEGIN/.test(line)) continue; // nota que apenas CITA o marcador entre crases; chave colada (linha propria) continua achado
      if (nome.startsWith('URL')) { const pw = /:\/\/[^:/@]+:([^@]+)@/.exec(hit[0]); if (pw && PLACEHOLDER.test(pw[1])) continue; } // admin:admin@localhost de desenvolvimento
      problems.push(`${where}: ${nome}`);
      return;
    }
    if (isTest) return;
    const m = (CODE_EXT.test(file) ? ASSIGN_CODE : ASSIGN_CONF).exec(line);
    // Decisao do dono: o compose de DESENVOLVIMENTO dos boilerplates traz a senha do pgAdmin literal, para subir e testar sem configurar nada.
    if (m && COMPOSE_DEV.test(file) && /^PGADMIN_DEFAULT_PASSWORD$/i.test(m[1])) return;
    if (m && !PLACEHOLDER.test(m[2]) && m[2].length >= 6 && /^\S+$/.test(m[2]) && !(CODE_EXT.test(file) && LABEL_LIKE.test(m[2]))) {
      problems.push(`${where}: ${m[1]} com valor literal "${m[2].slice(0, 3)}..."`);
      return;
    }
    const b = BLOB_LINE.exec(line);
    // "NOME_DA_VARIAVEL=valor" citado num comentario/exemplo (ex.: "... Para ligar: SEEDGRID_X=google") nao e chave.
    if (b && !PLACEHOLDER.test(b[1]) && !/^[A-Z][A-Z0-9_]*=[A-Za-z0-9._-]{1,12}$/.test(b[1]) && entropy(b[1]) >= 4.0 &&!/sha\d*|integrity|checksum|hash|digest/i.test(line)) {
      problems.push(`${where}: valor aleatorio longo (possivel chave)`);
    }
  });
}

function checkName(file) {
  if (FORBIDDEN_NAMES.some((re) => re.test(file)) && !SAFE_SUFFIX.test(file)) problems.push(`${file}: arquivo de credencial, ambiente ou backup nao pode ser versionado`);
}

if (mode === 'history') {
  const out = git('log', '--all', '-p', '--no-color', '--format=@@commit %h');
  let commit = '';
  let file = '';
  for (const line of out.split('\n')) {
    if (line.startsWith('@@commit ')) { commit = line.slice(9); continue; }
    if (line.startsWith('+++ b/')) { file = line.slice(6); continue; }
    if (!line.startsWith('+') || line.startsWith('+++') || SKIP_PATH.test(file) || SKIP_EXT.test(file)) continue;
    scanText(file, line.slice(1), ` (commit ${commit})`);
  }
  for (const n of new Set(git('log', '--all', '--diff-filter=A', '--name-only', '--format=').split('\n').filter(Boolean))) checkName(n);
} else {
  const scan = (files, read, kb = false) => {
    for (const f of files) {
      checkName(f);
      if (SKIP_PATH.test(f) || SKIP_EXT.test(f)) continue;
      let text;
      try { text = read(f); } catch { continue; }
      if (text.includes('\0')) continue;
      scanText(f, text, '', kb);
    }
  };
  if (mode === 'dir') {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.name === '.git' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const { dir, kb } of dirTargets) {
      if (!dir || !fs.existsSync(dir)) { console.warn(`[check-secrets] aviso: pasta inexistente, nada a conferir: ${dir}`); continue; }
      scan(walk(dir).map((f) => path.relative(dir, f).split(path.sep).join('/')), (f) => fs.readFileSync(path.join(dir, f), 'utf8'), kb);
    }
  } else if (mode === 'staged') {
    scan(git('diff', '--cached', '--name-only', '--diff-filter=ACM').split('\n').filter(Boolean), (f) => git('show', `:${f}`));
  } else {
    scan(git('ls-files').split('\n').filter(Boolean), (f) => fs.readFileSync(f, 'utf8'));
  }
}

if (problems.length) {
  console.error(`[check-secrets] ${problems.length} achado(s):`);
  for (const p of problems.slice(0, 80)) console.error('  ' + p);
  console.error('Credencial nunca entra no repositorio, com qualquer nome de arquivo. Use um marcador (change-me, ${VAR}) ou variavel de ambiente; backup de segredo fica FORA da pasta do repositorio.');
  process.exit(1);
}
console.log(`[check-secrets] ok (${mode})`);
