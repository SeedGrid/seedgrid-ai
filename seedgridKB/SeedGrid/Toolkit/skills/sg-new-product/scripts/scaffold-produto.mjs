#!/usr/bin/env node
// Scaffold deterministico de um produto SeedGrid novo na pasta corrente.
// Uso: node scaffold-produto.mjs --respostas <respostas.json> [--destino <pasta>] [--boilerplates <pasta>] [--json]
// Valida as respostas contra a matriz (recusa o que nao estiver nela), copia o boilerplate do modelo, ajusta o pom,
// gera dev.env (segredos novos por produto), .example, docker-compose.yml, workflow e docs/ai/. Sem dependencias.
// Determinismo: o que vai para o git (tudo menos dev.env, .env e keys/*.pem) e identico para as mesmas respostas.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { carregar, resolver, SEGREDO } from './matriz.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(AQUI, '..', 'assets');
const TEXTO = /\.(java|xml|properties|md|ya?ml|json|sh|txt|html|sql|ts|tsx|js|mjs|css|env|example)$/i;
const MARCA = '# --- Adicionado pelo sg-new-product ---';

const snake = (s) => s.replace(/-/g, '_');
const norm = (t) => t.replace(/\r\n/g, '\n');

// ---------- segredos ----------
function alnum(n) {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const b = randomBytes(n * 2);
  let s = '';
  for (let i = 0; i < b.length && s.length < n; i++) if (b[i] < 256 - (256 % alfabeto.length)) s += alfabeto[b[i] % alfabeto.length];
  return s.length === n ? s : alnum(n);
}
function senhaPolitica() {
  // Politica do security: minimo 8, maiuscula, minuscula, especial, sem repeticao seguida.
  for (;;) {
    const s = `${alnum(6)}${randomBytes(1)[0] % 10}${'!@#$%&*?'[randomBytes(1)[0] % 8]}${alnum(6)}`;
    if (/[A-Z]/.test(s) && /[a-z]/.test(s) && !/(.)\1/.test(s)) return s;
  }
}
export function criarGerador() {
  const cache = new Map();
  let par = null;
  const rsa = () => (par ??= generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'der' }, privateKeyEncoding: { type: 'pkcs8', format: 'der' } }));
  const gerar = (tipo) => {
    switch (tipo) {
      case 'senha': return alnum(32);
      case 'politica-admin': return senhaPolitica();
      case 'base64-32': return randomBytes(32).toString('base64');
      case 'hex-32': return randomBytes(32).toString('hex');
      case 'rsa-privada-b64': return rsa().privateKey.toString('base64');
      case 'rsa-publica-b64': return rsa().publicKey.toString('base64');
      default: throw new Error(`tipo de segredo desconhecido: ${tipo}`);
    }
  };
  return {
    valor: (nome, tipo) => { if (!cache.has(nome)) cache.set(nome, gerar(tipo)); return cache.get(nome); },
    pem: () => {
      const k = rsa();
      const quebra = (b) => b.toString('base64').match(/.{1,64}/g).join('\n');
      // Cabecalho montado em tempo de execucao: o texto do marcador no fonte seria lido como chave colada pela trava.
      const pem = (tipo, der) => `${'-'.repeat(5)}BEGIN ${tipo}${'-'.repeat(5)}\n${quebra(der)}\n${'-'.repeat(5)}END ${tipo}${'-'.repeat(5)}\n`;
      return { privada: pem('PRIVATE KEY', k.privateKey), publica: pem('PUBLIC KEY', k.publicKey) };
    },
  };
}

// ---------- efeitos ----------
// Reune os efeitos das respostas, na ordem das perguntas; env de uma resposta mais tarde vence a anterior.
function juntar(efeitos, matriz) {
  const r = { env: new Map(), remover: new Set(), front: new Map(), compose: [], portas: {}, servicos: null, boilerplate: null, extRemover: [], pomRemover: [], pendencias: [], produto: {}, docs: [] };
  for (const { efeito } of efeitos) {
    for (const b of efeito.blocos_env ?? []) for (const [k, v] of Object.entries(matriz.blocos_env[b])) r.env.set(k, v);
    for (const [k, v] of Object.entries(efeito.env && !Array.isArray(efeito.env) ? efeito.env : {})) r.env.set(k, v);
    for (const [k, v] of Object.entries(efeito.env_front ?? {})) r.front.set(k, v);
    for (const k of efeito.env_remover ?? []) r.remover.add(k);
    for (const s of efeito.compose ?? []) if (!r.compose.includes(s)) r.compose.push(s);
    Object.assign(r.portas, efeito.portas ?? {});
    if (efeito.servicos) r.servicos = efeito.servicos;
    if (efeito.boilerplate) r.boilerplate = efeito.boilerplate;
    r.extRemover.push(...(efeito.extensions_remover ?? []));
    r.pomRemover.push(...(efeito.pom_remover ?? []));
    r.pendencias.push(...(efeito.pendencias ?? []));
    r.docs.push(...(efeito.docs ?? []));
    if (efeito.produto && !Array.isArray(efeito.produto)) Object.assign(r.produto, efeito.produto);
  }
  for (const k of r.remover) if (!efeitos.some(({ efeito }) => efeito.env && efeito.env[k] !== undefined && !Array.isArray(efeito.env))) r.env.delete(k);
  return r;
}

function substituir(valor, derivados, gerador, segredos, { exemplo }) {
  let v = String(valor).replace(/\{\{(\w+)\}\}/g, (_, n) => {
    if (!(n in derivados)) throw new Error(`campo desconhecido no modelo: {{${n}}}`);
    return String(derivados[n]);
  });
  v = v.replace(SEGREDO, (_, nome) => (exemplo ? 'change-me' : gerador.valor(nome, segredos[nome])));
  if (v === '${externo}') v = 'change-me';
  return v;
}

// ---------- arquivos ----------
function* percorrer(dir) {
  for (const nome of readdirSync(dir).sort()) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) yield* percorrer(p);
    else yield p;
  }
}
function gravar(raiz, rel, conteudo, criados) {
  const destino = join(raiz, rel);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conteudo);
  criados.push(rel.split(sep).join('/'));
}

function copiarBoilerplate(origem, destino, { pacote }, criados) {
  const pacotePath = pacote.split('.').join('/');
  const antigo = 'br/com/seedgrid/app';
  for (const sub of ['backend', 'frontend', 'admin']) {
    const base = join(origem, sub);
    if (!existsSync(base)) continue;
    for (const arq of percorrer(base)) {
      let rel = relative(origem, arq).split(sep).join('/');
      let buf = readFileSync(arq);
      if (rel.endsWith('.b64')) { rel = rel.slice(0, -4); buf = Buffer.from(buf.toString('utf8').replace(/\s+/g, ''), 'base64'); }
      const nomeArq = rel.split('/').pop();
      if (nomeArq.endsWith('.template') && nomeArq.startsWith('.')) rel = rel.slice(0, -'.template'.length);
      if (sub === 'backend') {
        rel = rel.replace(antigo, pacotePath);
        if (TEXTO.test(rel) || rel.endsWith('pom.xml')) {
          buf = Buffer.from(buf.toString('utf8').replace(/br\.com\.seedgrid\.app\b/g, pacote), 'utf8');
        }
      }
      gravar(destino, rel, buf, criados);
    }
  }
}

function ajustarPom(destino, { artefatoApi, nome, r, catalogo, removerPom, adicionar }) {
  const f = join(destino, 'backend/pom.xml');
  if (!existsSync(f)) return [];
  let pom = norm(readFileSync(f, 'utf8'));
  const feito = [];
  pom = pom.replace(/<artifactId>(seedgrid-app-api|seedgrid-subdomain-api)<\/artifactId>/, `<artifactId>${artefatoApi}</artifactId>`);
  pom = pom.replace(/<name>[^<]*<\/name>/, `<name>${nome} API</name>`);
  pom = pom.replace(/<description>[^<]*<\/description>/, `<description>API do ${nome}</description>`);
  const remover = (grupoArtefato) => {
    const [g, a] = grupoArtefato.includes(':') ? grupoArtefato.split(':') : ['br.com.seedgrid', grupoArtefato];
    const re = new RegExp(`(\\n[ \\t]*<!--(?:(?!-->)[\\s\\S])*-->[ \\t]*)?\\n[ \\t]*<dependency>\\s*<groupId>${g.replace(/\./g, '\\.')}</groupId>\\s*<artifactId>${a}</artifactId>[\\s\\S]*?</dependency>`);
    if (re.test(pom)) { pom = pom.replace(re, ''); feito.push(`pom: removida ${g}:${a}`); }
  };
  for (const id of r.extRemover) for (const p of catalogo.extensions[id].pom ?? []) remover(p.artifactId);
  for (const x of removerPom) remover(x);
  for (const id of adicionar) {
    for (const p of catalogo.extensions[id].pom ?? []) {
      if (pom.includes(`<artifactId>${p.artifactId}</artifactId>`)) continue;
      const bloco = `\n        <dependency>\n            <groupId>br.com.seedgrid</groupId>\n            <artifactId>${p.artifactId}</artifactId>\n            <version>${p.versao}</version>\n        </dependency>`;
      const fim = pom.indexOf('</dependencies>', pom.indexOf('</dependencyManagement>'));
      pom = pom.slice(0, fim).replace(/\s*$/, '') + bloco + '\n    ' + pom.slice(fim);
      feito.push(`pom: adicionada ${p.artifactId} ${p.versao}`);
    }
  }
  writeFileSync(f, pom);
  return feito;
}

function removerArquivos(destino, padroes) {
  const removidos = [];
  for (const padrao of padroes) {
    const [pref, sufixo] = padrao.split('**');
    const base = join(destino, 'backend', pref);
    if (!existsSync(base)) continue;
    for (const arq of percorrer(base)) {
      const rel = relative(join(destino, 'backend'), arq).split(sep).join('/');
      if (rel.endsWith(sufixo)) { rmSync(arq); removidos.push(`removido: backend/${rel}`); }
    }
  }
  return removidos;
}

// ---------- dev.env ----------
function montarEnv(base, env, remover) {
  const linhas = norm(base).split('\n');
  const aplicadas = new Set();
  const saida = [];
  for (const l of linhas) {
    const m = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(l);
    if (!m) { saida.push(l); continue; }
    if (remover.has(m[1])) continue;
    if (env.has(m[1])) { saida.push(`${m[1]}=${env.get(m[1])}`); aplicadas.add(m[1]); continue; }
    saida.push(/^(TROQUE-ME|GERE-A-SUA|GERE-UMA|MESMO-VALOR)/.test(m[2]) ? `${m[1]}=change-me` : l);
  }
  const novas = [...env.keys()].filter((k) => !aplicadas.has(k));
  while (saida.length && saida.at(-1) === '') saida.pop();
  if (novas.length) { saida.push('', MARCA); for (const k of novas) saida.push(`${k}=${env.get(k)}`); }
  return saida.join('\n') + '\n';
}

// ---------- compose ----------
function composeTexto({ slug, db, portas, servicos, buckets }) {
  const blocos = {
    postgres: `  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${db}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:${portas.postgres}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ${db}"]
      interval: 5s
      timeout: 5s
      retries: 10
`,
    mailhog: `  mailhog:
    image: mailhog/mailhog:v1.0.1
    restart: unless-stopped
    ports:
      - "127.0.0.1:${portas.smtp}:1025"
      - "127.0.0.1:${portas['mailhog-ui']}:8025"
`,
    minio: `  minio:
    image: soldevelo/minio:2026.7.17
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: \${MINIO_ROOT_PASSWORD}
      MINIO_DEFAULT_BUCKETS: ${buckets}
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    volumes:
      - minio_data:/data
`,
    mongodb: `  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 10
`,
  };
  const volumes = { postgres: 'postgres_data', minio: 'minio_data', mongodb: 'mongo_data' };
  const ordem = ['postgres', 'mailhog', 'minio', 'mongodb'].filter((s) => servicos.includes(s));
  return `name: ${slug}\n\n# Infraestrutura local. API, admin e frontend rodam no host. Senhas vem do .env desta pasta (nao versionado).\nservices:\n${ordem.map((s) => blocos[s]).join('\n')}\nvolumes:\n${ordem.filter((s) => volumes[s]).map((s) => `  ${volumes[s]}:`).join('\n')}\n`;
}

// ---------- principal ----------
export async function scaffold({ respostas, destino, boilerplates, dataDir }) {
  const { matriz, catalogo } = carregar(dataDir);
  const res = resolver(matriz, catalogo, respostas);
  if (res.erros.length) return { ok: false, erros: res.erros };
  const R = res.respostas;
  const modeloOpcao = matriz.perguntas.find((p) => p.id === 'modelo').opcoes.find((o) => o.id === R.modelo);
  const efeitos = res.efeitos;
  const r = juntar(efeitos, matriz);

  if (existsSync(join(destino, 'produto.json'))) return { ok: false, erros: ['produto.json ja existe nesta pasta: o scaffold nao sobrescreve um produto'] };
  if (r.boilerplate && existsSync(join(destino, 'backend'))) return { ok: false, erros: ['a pasta backend/ ja existe: o scaffold nao sobrescreve codigo'] };
  const origem = r.boilerplate ? join(boilerplates, r.boilerplate) : null;
  if (origem && !existsSync(origem)) return { ok: false, erros: [`boilerplate nao encontrado: ${origem} (rode "seedgrid-ai update")`] };

  const slug = R.slug;
  const derivados = {
    ...R,
    slugSnake: snake(slug),
    appName: R.appName ?? R.nome,
    appCode: R.appCode ?? slug,
    trialAtivo: Number(R.trialDias) > 0 ? 'true' : 'false',
    portaPostgres: r.portas.postgres,
    portaSmtp: r.portas.smtp,
  };
  const gerador = criarGerador();
  const criados = [];
  const notas = [];
  const exts = new Set(res.extensoes);

  // 1. codigo do boilerplate
  if (origem) {
    copiarBoilerplate(origem, destino, { pacote: R.pacote }, criados);
    for (const t of ['.gitignore', '.gitattributes']) {
      const f = join(origem, `${t}.template`);
      if (existsSync(f)) gravar(destino, t, norm(readFileSync(f, 'utf8')), criados);
    }
  }
  // .gitignore do produto: o do boilerplate (ou minimo) mais o que este scaffold gera e nao pode ir ao git.
  const extraIgnore = ['', '# sg-new-product: nunca versionar', 'dev.env', '.env', '.env.local', '*.pem', 'keys/', 'data/'];
  const giPath = join(destino, '.gitignore');
  let gi = existsSync(giPath) ? norm(readFileSync(giPath, 'utf8')) : '';
  const faltam = extraIgnore.filter((l) => l && !gi.split('\n').includes(l));
  if (faltam.length) { gi = gi.replace(/\n*$/, '\n') + extraIgnore.filter((l) => l === '' || faltam.includes(l) || l.startsWith('#')).join('\n') + '\n'; writeFileSync(giPath, gi); if (!criados.includes('.gitignore')) criados.push('.gitignore'); }

  // 2. pom
  const adicionar = [...exts].filter((id) => (catalogo.extensions[id].pom ?? []).length && !r.extRemover.includes(id) && ['business-days', 'cache'].includes(id));
  const artefatoApi = `${slug}-api`;
  const feitoPom = origem ? ajustarPom(destino, { artefatoApi, nome: R.nome, r, catalogo, removerPom: r.pomRemover, adicionar }) : [];
  notas.push(...feitoPom);
  const apagar = [...new Set(r.extRemover.flatMap((id) => catalogo.extensions[id].remover_se_ausente_arquivos ?? []))];
  if (origem) notas.push(...removerArquivos(destino, apagar));

  // 3. dev.env
  const envFinal = new Map();
  const envExemplo = new Map();
  for (const [k, v] of r.env) {
    envFinal.set(k, substituir(v, derivados, gerador, matriz.segredos, { exemplo: false }));
    envExemplo.set(k, substituir(v, derivados, gerador, matriz.segredos, { exemplo: true }));
  }
  const baseEnv = origem && existsSync(join(origem, 'backend/dev.env.example')) ? readFileSync(join(origem, 'backend/dev.env.example'), 'utf8') : '# Variaveis de ambiente do backend (copie para dev.env; nao versionado)\n';
  const rem = r.remover;
  gravar(destino, 'backend/dev.env', montarEnv(baseEnv, envFinal, rem), criados);
  gravar(destino, 'backend/dev.env.example', montarEnv(baseEnv, envExemplo, rem), criados);

  // 4. chaves do JWT em arquivo (mesmo par do dev.env)
  if ([...r.env.values()].some((v) => String(v).includes('${segredo:JWT_PRIVATE}')) && origem) {
    const k = gerador.pem();
    gravar(destino, 'backend/src/main/resources/keys/private.pem', k.privada, criados);
    gravar(destino, 'backend/src/main/resources/keys/public.pem', k.publica, criados);
  }

  // 5. compose e .env da raiz
  const db = (R.modelo === 'subdomain-tenancy' ? `${snake(slug)}_master` : `${snake(slug)}_app`);
  const compose = r.compose;
  gravar(destino, 'docker-compose.yml', composeTexto({ slug, db, portas: r.portas, servicos: compose, buckets: `${slug}-avatars,${slug}-backups` }), criados);
  const segCompose = { postgres: 'POSTGRES_PASSWORD', minio: 'MINIO_ROOT_PASSWORD', mongodb: 'MONGO_ROOT_PASSWORD' };
  const nomes = compose.filter((s) => segCompose[s]).map((s) => segCompose[s]);
  const cab = '# Senhas dos servicos do docker-compose.yml (nao versionado). Os mesmos valores estao no backend/dev.env.\n';
  gravar(destino, '.env', cab + nomes.map((n) => `${n}=${gerador.valor(n, matriz.segredos[n])}`).join('\n') + '\n', criados);
  gravar(destino, '.env.example', cab.replace('(nao versionado)', '(modelo)') + nomes.map((n) => `${n}=change-me`).join('\n') + '\n', criados);

  // 6. .env do front e do admin
  if (origem) {
    const cookie = (t) => `sg_${snake(slug)}_${t}_token`;
    for (const app of ['frontend', 'admin']) {
      if (!existsSync(join(destino, app))) continue;
      const linhas = [...r.front].map(([k, v]) => `${k}=${substituir(v, derivados, gerador, matriz.segredos, { exemplo: true })}`);
      linhas.push(`SEEDGRID_SECURITY_ACCESS_COOKIE_NAME=${cookie('access')}`, `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME=${cookie('refresh')}`);
      gravar(destino, `${app}/.env.example`, linhas.join('\n') + '\n', criados);
      gravar(destino, `${app}/.env.local`, linhas.join('\n') + '\n', criados);
    }
  }

  // 7. publicacao (workflow; Dockerfile so onde o boilerplate nao trouxe)
  const servicos = Object.entries(r.servicos).map(([nomeSvc, porta]) => ({ nome: nomeSvc, tipo: nomeSvc, porta }));
  const produto = {
    schema: 1,
    slug,
    nome: R.nome,
    dominio: R.dominioFront,
    dominioAdmin: R.dominioAdmin,
    registry: R.registry,
    pacote: R.pacote,
    ...r.produto,
    publicacao: 'easypanel',
    banco: 'postgres',
    extensoes: res.extensoes,
    servicos,
    billing: R.billingProvider ? { provider: R.billingProvider, trialDias: R.trialDias, planos: Array.isArray(R.planos) ? R.planos : String(R.planos).split(',').map((x) => x.trim()).filter(Boolean) } : undefined,
    apikeysUso: R.apikeysUso,
    pendencias: [...new Set(r.pendencias)],
  };
  const render = await import(pathToFileURL(join(ASSETS, 'render.mjs')).href);
  const pubs = render.renderProduto(produto);
  for (const [rel, texto] of Object.entries(pubs)) {
    if (rel.endsWith('/Dockerfile') && existsSync(join(destino, rel))) continue;
    gravar(destino, rel, texto, criados);
  }
  gravar(destino, 'produto.json', JSON.stringify(JSON.parse(JSON.stringify(produto)), null, 2) + '\n', criados);

  // 8. docs/ai
  for (const d of ['plans', 'decisions', 'handoffs', 'reports', 'demands']) gravar(destino, `docs/ai/${d}/.gitkeep`, '', criados);

  const unicos = [...new Set(criados)].sort();
  return { ok: true, criados: unicos, notas, pendencias: produto.pendencias, adicionadas: res.adicionadas, extensoes: res.extensoes, segredosGerados: Object.keys(matriz.segredos).filter((n) => [...r.env.values()].some((v) => String(v).includes(`\${segredo:${n}}`)) || nomes.includes(n)) };
}

// ---------- CLI ----------
function arg(nome) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const arqResp = arg('respostas');
  if (!arqResp) {
    console.error('uso: node scaffold-produto.mjs --respostas <respostas.json> [--destino <pasta>] [--boilerplates <pasta>] [--json]');
    process.exit(2);
  }
  const destino = resolve(arg('destino') ?? process.cwd());
  const boilerplates = resolve(arg('boilerplates') ?? join(destino, '.ai', 'boilerplates'));
  let respostas;
  try { respostas = JSON.parse(readFileSync(arqResp, 'utf8')); } catch (e) { console.error(`respostas ilegiveis: ${e.message}`); process.exit(2); }
  const out = await scaffold({ respostas, destino, boilerplates });
  if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
  else if (!out.ok) { console.error('Respostas recusadas, nada foi gravado:'); for (const e of out.erros) console.error(`  - ${e}`); }
  else {
    console.log(`Produto criado em ${destino}: ${out.criados.length} arquivos.`);
    if (out.adicionadas.length) console.log(`Extensions trazidas por dependencia: ${out.adicionadas.join(', ')}`);
    for (const n of out.notas) console.log(`  ${n}`);
    for (const p of out.pendencias) console.log(`  PENDENTE: ${p}`);
    console.log('Segredos gerados por produto (nao versionados): backend/dev.env, .env, backend/src/main/resources/keys/*.pem');
  }
  process.exit(out.ok ? 0 : 1);
}
