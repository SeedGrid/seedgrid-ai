#!/usr/bin/env node
// P175: AVISA quando um boilerplate (Toolkit/boilerplates/<modelo>) fixa uma extension (pom.xml) ou um pacote
// @seedgrid/* (package.json) numa versao anterior a ultima publicada (Nexus e npm). Publicar um componente ou uma
// extension nao atualiza os boilerplates; este passo so' avisa (sai 0), a atualizacao e' decisao de quem faz o release.
//
// Uso:
//   node scripts/check-boilerplate-versions.mjs [--boilerplates <pasta>] [--fixture <arquivo.json>] [--strict] [--json]
//     --boilerplates  pasta dos modelos (padrao: seedgridKB/SeedGrid/Toolkit/boilerplates)
//     --fixture       JSON com as "ultimas publicadas" (roda offline, usado nos testes):
//                     { "mvn": { "<artifactId>": "<versao>" }, "npm": { "@seedgrid/<nome>": "<versao>" },
//                       "bom": { "<parentArtifactId>@<versao>": { "<nome>": "<versao>" } } }   (<nome> = o x de seedgrid.<x>.version)
//     --strict        sai com 1 quando ha pacote atras (padrao: avisa e sai 0)
//     --json          saida em JSON (tabela modelo x pacote x fixada x ultima)
// Sem fixture consulta o Nexus (maven-releases; precisa SEEDGRID_NEXUS_USER/SEEDGRID_NEXUS_PASSWORD, senao o
// repositorio responde 401) e o registro npm. Rede ou credencial indisponivel = aviso e sai 0 (nunca reprova o CI).
//
// Versao efetiva de um pacote do pom: a propriedade `seedgrid.<nome>.version` do proprio pom; sem ela, a do BOM do
// parent do modelo (`<parent>` seedgrid-*-parent); `<dependency>` com <version> literal vale como fixada.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const strict = args.includes('--strict');
const asJson = args.includes('--json');
const boilerDir = path.resolve(opt('boilerplates') ?? path.join(root, 'seedgridKB', 'SeedGrid', 'Toolkit', 'boilerplates'));
const fixtureFile = opt('fixture');
const NEXUS = 'https://nexus.seedgrid.com.br/repository/maven-releases/br/com/seedgrid';

// propriedade `seedgrid.<nome>.version` -> artifactId (o padrao e' seedgrid-<nome>)
const PROP_ARTIFACT = {
  audit: 'seedgrid-audit-postgresql',
  usernotifications: 'seedgrid-user-notifications',
  businessdays: 'seedgrid-business-days',
  aipricing: 'seedgrid-ai-pricing',
  resilience: 'seedgrid-resilience-core',
  whatsapp: 'seedgrid-whatsapp-evolution',
};
const artifactOfProp = (nome) => PROP_ARTIFACT[nome] ?? `seedgrid-${nome}`;

const isVersion = (v) => /^\d{4}\.\d+\.\d+$/.test(v);
const cmp = (a, b) => {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

// ---------- le o que os boilerplates fixam ----------
const fixados = []; // { modelo, origem, pacote, tipo, fixada, bom? }
const parentsUsados = new Map(); // "artifact@versao" -> { props, modelos }

function lerPom(modelo, file) {
  const x = readFileSync(file, 'utf8');
  const props = {};
  const bloco = x.match(/<properties>([\s\S]*?)<\/properties>/)?.[1] ?? '';
  for (const [, nome, v] of bloco.matchAll(/<seedgrid\.([\w-]+)\.version>([^<$]+)</g)) props[nome] = v.trim();
  // BOM do modelo: <parent> seedgrid-* ou import em dependencyManagement (<type>pom</type><scope>import</scope>);
  // a versao pode ser literal ou "${seedgrid.<nome>.version}" (resolvida pelas propriedades do pom)
  const resolve = (v) => {
    const ref = v.trim().match(/^\$\{seedgrid\.([\w-]+)\.version\}$/);
    return ref ? props[ref[1]] : v.trim();
  };
  const parent =
    x.match(/<parent>\s*<groupId>br\.com\.seedgrid<\/groupId>\s*<artifactId>([\w-]+)<\/artifactId>\s*<version>([^<]+)<\/version>/) ??
    x.match(/<groupId>br\.com\.seedgrid<\/groupId>\s*<artifactId>([\w-]+-parent)<\/artifactId>\s*<version>([^<]+)<\/version>\s*<type>pom<\/type>\s*<scope>import<\/scope>/);
  const parentVersao = parent ? resolve(parent[2]) : undefined;
  const parentKey = parent && parentVersao ? `${parent[1]}@${parentVersao}` : undefined;
  if (parentKey) {
    const e = parentsUsados.get(parentKey) ?? { artifactId: parent[1], versao: parentVersao, modelos: new Set() };
    e.modelos.add(modelo);
    parentsUsados.set(parentKey, e);
  }
  for (const [nome, v] of Object.entries(props)) {
    if (isVersion(v)) fixados.push({ modelo, origem: 'backend/pom.xml', pacote: artifactOfProp(nome), tipo: 'mvn', fixada: v, prop: nome });
  }
  for (const [, a, v] of x.matchAll(/<dependency>\s*<groupId>br\.com\.seedgrid<\/groupId>\s*<artifactId>([\w-]+)<\/artifactId>\s*<version>(\d{4}\.\d+\.\d+)<\/version>/g)) {
    fixados.push({ modelo, origem: 'backend/pom.xml', pacote: a, tipo: 'mvn', fixada: v });
  }
  return { parentKey, props };
}

function lerPackageJson(modelo, pasta, file) {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  for (const campo of ['dependencies', 'devDependencies']) {
    for (const [nome, v] of Object.entries(j[campo] ?? {})) {
      if (nome.startsWith('@seedgrid/')) fixados.push({ modelo, origem: `${pasta}/package.json`, pacote: nome, tipo: 'npm', fixada: String(v).replace(/^[\^~]/, '') });
    }
  }
}

if (!existsSync(boilerDir)) {
  console.log(`[check-boilerplate-versions] pasta de boilerplates nao encontrada: ${boilerDir}; nada conferido`);
  process.exit(0);
}
const modelosPom = new Map(); // modelo -> { parentKey, props }
for (const m of readdirSync(boilerDir, { withFileTypes: true })) {
  if (!m.isDirectory()) continue;
  const pom = path.join(boilerDir, m.name, 'backend', 'pom.xml');
  if (existsSync(pom)) modelosPom.set(m.name, lerPom(m.name, pom));
  for (const pasta of ['frontend', 'admin']) {
    const pj = path.join(boilerDir, m.name, pasta, 'package.json');
    if (existsSync(pj)) lerPackageJson(m.name, pasta, pj);
  }
}

// ---------- le as ultimas publicadas ----------
async function ultimaNexus(artifactId, auth) {
  const r = await fetch(`${NEXUS}/${artifactId}/maven-metadata.xml`, { headers: auth ? { Authorization: auth } : {} });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Nexus HTTP ${r.status} para ${artifactId}`);
  const body = await r.text();
  const versoes = [...body.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1]).filter(isVersion).sort(cmp);
  return versoes.at(-1) ?? null;
}
async function bomNexus(artifactId, versao, auth) {
  const r = await fetch(`${NEXUS}/${artifactId}/${versao}/${artifactId}-${versao}.pom`, { headers: auth ? { Authorization: auth } : {} });
  if (!r.ok) throw new Error(`Nexus HTTP ${r.status} para o pom de ${artifactId}@${versao}`);
  const body = await r.text();
  const props = {};
  for (const [, nome, v] of body.matchAll(/<seedgrid\.([\w-]+)\.version>([^<$]+)</g)) props[nome] = v.trim();
  return props;
}
async function ultimaNpm(nome) {
  const r = await fetch(`https://registry.npmjs.org/${nome.replace('/', '%2f')}/latest`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`npm HTTP ${r.status} para ${nome}`);
  return (await r.json()).version ?? null;
}

let ultimas = { mvn: {}, npm: {}, bom: {} };
if (fixtureFile) {
  ultimas = { mvn: {}, npm: {}, bom: {}, ...JSON.parse(readFileSync(fixtureFile, 'utf8')) };
} else {
  const user = process.env.SEEDGRID_NEXUS_USER;
  const pass = process.env.SEEDGRID_NEXUS_PASSWORD;
  const auth = user && pass ? `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` : undefined;
  try {
    for (const p of new Set(fixados.filter((f) => f.tipo === 'mvn').map((f) => f.pacote))) ultimas.mvn[p] = await ultimaNexus(p, auth);
    for (const [k, e] of parentsUsados) ultimas.bom[k] = await bomNexus(e.artifactId, e.versao, auth);
    for (const p of new Set(fixados.filter((f) => f.tipo === 'npm').map((f) => f.pacote))) ultimas.npm[p] = await ultimaNpm(p);
  } catch (e) {
    console.log(`[check-boilerplate-versions] nao consegui consultar as versoes publicadas (${e.message}); nada conferido. ` +
      'No Nexus informe SEEDGRID_NEXUS_USER e SEEDGRID_NEXUS_PASSWORD.');
    process.exit(0);
  }
}

// versao efetiva dos pacotes que o pom NAO fixa: vem do BOM do parent
for (const [modelo, { parentKey, props }] of modelosPom) {
  const bom = parentKey ? ultimas.bom[parentKey] ?? {} : {};
  for (const [chave, v] of Object.entries(bom)) {
    const nome = chave.replace(/^seedgrid\./, '').replace(/\.version$/, ''); // aceita "security" ou "seedgrid.security.version"
    if (props[nome] === undefined && isVersion(v)) {
      fixados.push({ modelo, origem: `BOM de ${parentKey}`, pacote: artifactOfProp(nome), tipo: 'mvn', fixada: v, prop: nome });
    }
  }
}

// ---------- compara ----------
const linhas = [];
const vistos = new Set();
for (const f of fixados) {
  const chave = `${f.modelo}|${f.origem}|${f.pacote}`;
  if (vistos.has(chave)) continue;
  vistos.add(chave);
  const ultima = f.tipo === 'mvn' ? ultimas.mvn[f.pacote] : ultimas.npm[f.pacote];
  const fixada = f.fixada;
  let situacao = 'ok';
  if (!ultima) situacao = 'sem-referencia';
  else if (isVersion(fixada) && isVersion(ultima) && cmp(fixada, ultima) < 0) situacao = 'atras';
  linhas.push({ modelo: f.modelo, origem: f.origem, pacote: f.pacote, fixada, ultima: ultima ?? null, situacao });
}
const atras = linhas.filter((l) => l.situacao === 'atras');

if (asJson) {
  console.log(JSON.stringify({ atras: atras.length, linhas }, null, 2));
} else {
  for (const l of atras) {
    const msg = `${l.modelo}: ${l.pacote} fixa ${l.fixada} (${l.origem}); a ultima publicada e' ${l.ultima}`;
    console.log(`[check-boilerplate-versions] ATRAS ${msg}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Boilerplate atras da ultima publicada::${msg}`);
  }
  const semRef = linhas.filter((l) => l.situacao === 'sem-referencia').length;
  console.log(`[check-boilerplate-versions] ${atras.length} pacote(s) atras de ${linhas.length} conferidos` +
    (semRef ? ` (${semRef} sem referencia publicada)` : '') +
    (atras.length ? '; aviso, nao reprova: atualize com a prova (build, tsc e testes) conforme o procedimento de release' : ''));
}
process.exit(strict && atras.length ? 1 : 0);
