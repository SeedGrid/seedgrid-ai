#!/usr/bin/env node
// Confere as versões fixadas (`versao`) do catálogo da skill sg-new-product contra a versão ATUAL de cada
// artefato nos poms do seedgrid-platform. Um pin velho no catálogo vence a versão transitiva que o modelo
// (login-tenancy, subdomain-tenancy) já traz e gera projeto com extension antiga (P145: ai-pricing 2026.10.13
// criava as tabelas sem o prefixo sg_).
//
// Uso:
//   node scripts/check-catalogo-pins.mjs [--platform <pasta>] [--strict]
//     --platform  raiz do seedgrid-platform (padrão: $SEEDGRID_PLATFORM ou ../seedgrid-platform)
//     --strict    falha também quando a plataforma não é encontrada (padrão: avisa e sai com 0, para CI sem o repositório)
//
// Pin com propriedade do pom do produto (`${seedgrid.x.version}`) não tem versão fixa e é ignorado.
// Sai com 1 se algum pin difere da versão atual do pom da plataforma.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const strict = args.includes('--strict');
const platform = path.resolve(opt('platform') ?? process.env.SEEDGRID_PLATFORM ?? path.join(root, '..', 'seedgrid-platform'));
const dataDir = path.join(root, 'seedgridKB', 'SeedGrid', 'Toolkit', 'skills', 'sg-new-product', 'data');
const catalogFile = path.join(dataDir, 'catalogo.json');
const matrizFile = path.join(dataDir, 'matriz-produto.json');

const catalogo = JSON.parse(readFileSync(catalogFile, 'utf8'));
const pins = new Map();
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') {
    if (typeof o.artifactId === 'string' && typeof o.versao === 'string' && !o.versao.startsWith('$')) pins.set(o.artifactId, o.versao);
    Object.values(o).forEach(walk);
  }
})(catalogo);

// A matriz tambem fixa versao em `pom_adicionar` ("br.com.seedgrid:artifact:versao"): pin velho ali vence a mediacao do BOM do modelo
// do mesmo jeito que o do catalogo (P145; a conferencia so do catalogo deixava a matriz passar).
(function walkMatriz(o) {
  if (Array.isArray(o)) return o.forEach(walkMatriz);
  if (o && typeof o === 'object') return Object.values(o).forEach(walkMatriz);
  const m = typeof o === 'string' ? o.match(/^br\.com\.seedgrid:([\w-]+):(\d{4}\.\d+\.\d+)$/) : null;
  if (m && !pins.has(m[1])) pins.set(m[1], m[2]);
})(JSON.parse(readFileSync(matrizFile, 'utf8')));

const javaDir = path.join(platform, 'java');
if (!existsSync(javaDir)) {
  const msg = `[check-catalogo-pins] seedgrid-platform nao encontrado em ${platform}; ${pins.size} pin(s) nao conferidos (use --platform ou SEEDGRID_PLATFORM)`;
  if (strict) {
    console.error(msg);
    process.exit(1);
  }
  console.log(msg);
  process.exit(0);
}

// artifactId -> versão do projeto (o primeiro artifactId/version depois de remover <parent> e <dependencies>/<build>)
const atual = new Map();
function lerPom(file) {
  let x = readFileSync(file, 'utf8');
  // módulo filho herda a versão do parent (runtime/pom.xml das extensions): sem <version> própria vale a do parent
  const parentVersion = x.match(/<parent>[\s\S]*?<version>([^<]+)<\/version>[\s\S]*?<\/parent>/)?.[1];
  x = x.replace(/<parent>[\s\S]*?<\/parent>/, '');
  const top = x.split(/<(dependencyManagement|dependencies|build|profiles|properties)>/)[0];
  const a = top.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
  const v = top.match(/<version>([^<]+)<\/version>/)?.[1] ?? parentVersion;
  if (a && v && /^\d{4}\.\d+\.\d+$/.test(v)) atual.set(a, v);
}
function varrer(dir, nivel) {
  if (nivel > 3) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'target' || e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrer(p, nivel + 1);
    else if (e.name === 'pom.xml') lerPom(p);
  }
}
varrer(javaDir, 0);

const erros = [];
let conferidos = 0;
for (const [artifactId, versao] of pins) {
  const cur = atual.get(artifactId);
  if (!cur) {
    console.log(`[check-catalogo-pins] aviso: ${artifactId} nao achado nos poms da plataforma (pin ${versao} nao conferido)`);
    continue;
  }
  conferidos += 1;
  if (cur !== versao) erros.push(`${artifactId}: catalogo fixa ${versao}, a plataforma esta em ${cur}`);
}
for (const e of erros) console.error(`[check-catalogo-pins] DEFASADO ${e}`);
if (erros.length) {
  console.error(`[check-catalogo-pins] ${erros.length} pin(s) fora da versao atual: atualize ${path.relative(root, catalogFile)}`);
  process.exit(1);
}
console.log(`[check-catalogo-pins] ok (${conferidos} pin(s) conferidos de ${pins.size})`);
