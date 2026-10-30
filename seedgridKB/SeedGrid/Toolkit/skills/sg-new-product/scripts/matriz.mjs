// Biblioteca da matriz do sg-new-product: carrega matriz e catalogo, valida a propria matriz e resolve
// um conjunto de respostas nos efeitos que o scaffold aplica. Sem dependencias (roda no produto).
// Determinismo: a mesma matriz e as mesmas respostas dao sempre os mesmos efeitos, na mesma ordem.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarAlvos } from './modulos-front.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const DATA = join(AQUI, '..', 'data');

export function carregar(dataDir = DATA) {
  return {
    matriz: JSON.parse(readFileSync(join(dataDir, 'matriz-produto.json'), 'utf8')),
    catalogo: JSON.parse(readFileSync(join(dataDir, 'catalogo.json'), 'utf8')),
    modulosFront: JSON.parse(readFileSync(join(dataDir, 'modulos-front.json'), 'utf8')),
  };
}

const VALIDADORES = {
  'nao-vazio': (v) => typeof v === 'string' && v.trim() !== '',
  slug: (v) => typeof v === 'string' && /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/.test(v),
  'pacote-java': (v) => typeof v === 'string' && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(v),
  dominio: (v) => typeof v === 'string' && /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(v),
  email: (v) => typeof v === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v),
  registry: (v) => typeof v === 'string' && /^[a-z0-9.-]+(:\d+)?(\/[a-z0-9._-]+)*$/.test(v),
  subdominios: (v) => { const l = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((x) => x.trim()).filter(Boolean) : []; return l.length > 0 && l.length <= 10 && new Set(l).size === l.length && l.every((x) => typeof x === 'string' && /^[a-z][a-z0-9-]{1,30}[a-z0-9]$/.test(x)); },
  lista: (v) => Array.isArray(v) ? v.length > 0 && v.every((x) => typeof x === 'string' && x.trim()) : typeof v === 'string' && v.split(',').some((x) => x.trim()),
};

function validar(regra, valor) {
  if (regra.startsWith('opcao:')) return regra.slice(6).split('|').includes(valor);
  if (regra.startsWith('inteiro:')) {
    const [min, max] = regra.slice(8).split('-').map(Number);
    return Number.isInteger(valor) && valor >= min && valor <= max;
  }
  const f = VALIDADORES[regra];
  if (!f) throw new Error(`validacao desconhecida na matriz: ${regra}`);
  return f(valor);
}

// Marcador de segredo nos valores de env: ${segredo:NOME}. O valor e gerado por produto, nunca fixo.
export const SEGREDO = /\$\{segredo:([A-Z0-9_]+)\}/g;
const vazio = (e) => !e || Object.keys(e).length === 0;
const TENANCIES = ['login-tenancy', 'subdomain-tenancy'];
const CHAVES_EFEITO = new Set(['produto', 'boilerplate', 'extensions', 'extensions_remover', 'blocos_env', 'env', 'env_remover', 'env_front', 'compose', 'modulos_front_remover', 'portas', 'servicos', 'pom_remover', 'pom_manter', 'pom_adicionar', 'flyway_locations', 'hibernate_packages', 'props_acrescentar', 'pendencias', 'docs', 'renomeia', 'usado_em', 'publicacao']);

// Confere a matriz contra o catalogo. Retorna a lista de problemas (vazia = valida).
export function validarMatriz(matriz, catalogo, modulosFront = null) {
  const erros = [];
  const e = (m) => erros.push(m);
  const ids = new Set();
  const numeros = new Set();
  let ultima = 0;
  const extensoesCatalogo = new Set(Object.keys(catalogo.extensions));
  const segredos = new Set(Object.keys(matriz.segredos ?? {}));
  const blocos = matriz.blocos_env ?? {};
  const efeitoOk = (onde, ef) => {
    if (vazio(ef)) return e(`${onde}: opcao sem efeito declarado`);
    for (const k of Object.keys(ef)) if (!CHAVES_EFEITO.has(k)) e(`${onde}: chave de efeito desconhecida "${k}"`);
    for (const x of [...(ef.extensions ?? []), ...(ef.extensions_remover ?? [])]) if (!extensoesCatalogo.has(x)) e(`${onde}: extension fora do catalogo: ${x}`);
    if (modulosFront) for (const m of validarAlvos(ef.modulos_front_remover ?? [], modulosFront)) e(`${onde}: ${m}`);
    for (const b of ef.blocos_env ?? []) if (!blocos[b]) e(`${onde}: bloco_env inexistente: ${b}`);
    const envs = [...Object.values(ef.env ?? {}), ...Object.values(ef.env_front ?? {})];
    for (const v of envs) for (const m of String(v).matchAll(SEGREDO)) if (!segredos.has(m[1])) e(`${onde}: segredo nao declarado: ${m[1]}`);
    for (const k of [...Object.keys(ef.env ?? {}), ...(ef.env_remover ?? [])]) if (!/^[A-Z][A-Z0-9_]*$/.test(k)) e(`${onde}: nome de variavel invalido: ${k}`);
  };
  for (const [nome, b] of Object.entries(blocos)) {
    for (const [k, v] of Object.entries(b)) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(k)) e(`bloco ${nome}: variavel invalida ${k}`);
      for (const m of String(v).matchAll(SEGREDO)) if (!segredos.has(m[1])) e(`bloco ${nome}: segredo nao declarado ${m[1]}`);
    }
  }
  for (const p of matriz.perguntas) {
    const onde = `pergunta ${p.numero}`;
    if (ids.has(p.id)) e(`${onde}: id repetido ${p.id}`);
    ids.add(p.id);
    if (numeros.has(p.numero)) e(`${onde}: numero repetido`);
    numeros.add(p.numero);
    if (!(p.ordem > ultima)) e(`${onde}: ordem nao crescente`);
    ultima = p.ordem;
    if (!p.pergunta || !p.recomendacao) e(`${onde}: falta texto da pergunta ou recomendacao`);
    if (['escolha', 'multi', 'texto'].includes(p.tipo) && !p.chave) e(`${onde}: falta "chave" da resposta`);
    if (p.tipo === 'texto') efeitoOk(onde, p.efeito);
    else if (p.tipo === 'campos') {
      if (!p.campos?.length) e(`${onde}: sem campos`);
      for (const c of p.campos ?? []) {
        efeitoOk(`${onde}.${c.id}`, c.efeito);
        if (!c.validacao) e(`${onde}.${c.id}: sem validacao`);
        else try { validar(c.validacao, 'x'); } catch (err) { e(`${onde}.${c.id}: ${err.message}`); }
      }
    } else {
      if (!p.opcoes?.length) e(`${onde}: sem opcoes`);
      const idsOpc = new Set();
      for (const o of p.opcoes ?? []) {
        if (idsOpc.has(o.id)) e(`${onde}: opcao repetida ${o.id}`);
        idsOpc.add(o.id);
        efeitoOk(`${onde}.${o.id}`, o.efeito);
        if (o.efeito_ausente) efeitoOk(`${onde}.${o.id}.efeito_ausente`, o.efeito_ausente);
        if (o.disponivel === false && !o.motivo) e(`${onde}.${o.id}: opcao desligada sem motivo`);
      }
    }
    for (const k of Object.keys(p.se ?? {})) if (!['modelo', 'extensao', 'resposta'].includes(k)) e(`${onde}: condicao desconhecida "${k}"`);
    for (const m of p.se?.modelo ?? []) if (!matriz.perguntas.find((q) => q.id === 'modelo')?.opcoes.some((o) => o.id === m)) e(`${onde}: se.modelo inexistente ${m}`);
    for (const x of p.se?.extensao ?? []) if (!extensoesCatalogo.has(x)) e(`${onde}: se.extensao fora do catalogo ${x}`);
  }
  // As opcoes da pergunta 3 sao exatamente o que cada modelo nao traz; a 3b cobre todas as extensions.
  const p3 = matriz.perguntas.find((q) => q.id === 'extensoes-opcionais');
  const p3b = matriz.perguntas.find((q) => q.id === 'extensoes-modelo-modular');
  const ofertadas = new Set(p3?.opcoes.map((o) => o.id));
  for (const t of TENANCIES) {
    const mod = catalogo.modelos[t];
    const naoTraz = new Set(mod.nao_traz);
    for (const x of naoTraz) if (!ofertadas.has(x)) e(`pergunta 3: falta a opcao ${x} (nao_traz de ${t})`);
    for (const x of ofertadas) if (!naoTraz.has(x)) e(`pergunta 3: opcao ${x} nao esta em nao_traz de ${t}`);
    for (const x of mod.traz) if (ofertadas.has(x)) e(`pergunta 3: ${x} ja vem em ${t} e nao pode ser opcional`);
  }
  const ofertadasB = new Set(p3b?.opcoes.map((o) => o.id));
  const baseModular = new Set(matriz.perguntas.find((q) => q.id === 'modelo')?.opcoes.find((o) => o.id === 'modular')?.efeito?.extensions ?? []); // base do modelo modular: nao se pergunta
  for (const x of extensoesCatalogo) if (!ofertadasB.has(x) && !baseModular.has(x)) e(`pergunta 3b: falta a extension ${x} do catalogo`);
  for (const t of TENANCIES) if (ofertadasB.has(t)) e(`pergunta 3b: ${t} nao pode ser oferecida`);
  return erros;
}

// Fecha as dependencias (depende_de) de um conjunto de extensions, em ordem estavel.
export function fecharDependencias(catalogo, ids) {
  const out = new Set();
  const visitar = (id) => {
    if (out.has(id)) return;
    out.add(id);
    for (const d of catalogo.extensions[id]?.depende_de ?? []) visitar(d);
  };
  for (const id of ids) visitar(id);
  return out;
}

function aplica(p, ctx) {
  const se = p.se;
  if (!se) return true;
  if (se.modelo && !se.modelo.includes(ctx.modelo)) return false;
  if (se.extensao && !se.extensao.some((x) => ctx.extensoes.has(x))) return false;
  if (se.resposta && !Object.entries(se.resposta).every(([k, v]) => ctx.respostas[k] === v)) return false;
  return true;
}

const mesclar = (a, b) => {
  for (const [k, v] of Object.entries(b ?? {})) {
    if (Array.isArray(v)) a[k] = [...new Set([...(a[k] ?? []), ...v])];
    else if (v && typeof v === 'object') a[k] = { ...(a[k] ?? {}), ...v };
    else a[k] = v;
  }
};

// Valida as respostas contra a matriz e devolve { erros, respostas, extensoes, adicionadas, efeitos }.
// `efeitos` vem na ordem das perguntas; cada item e { origem, efeito }. Nada e perguntado fora da matriz:
// resposta a pergunta que nao se aplica, ou chave desconhecida, e erro.
export function resolver(matriz, catalogo, entrada) {
  const erros = [];
  const e = (m) => erros.push(m);
  const respostas = { ...entrada };
  const efeitos = [];
  const ctx = { modelo: null, extensoes: new Set(), respostas };
  const usadas = new Set();
  const naoAplica = new Map();
  let adicionadas = [];

  for (const p of matriz.perguntas) {
    const aplicavel = aplica(p, ctx);
    const chaves = p.tipo === 'campos' ? p.campos.map((c) => c.id) : [p.chave];
    if (!aplicavel) {
      for (const k of chaves) naoAplica.set(k, p.numero);
      continue;
    }
    for (const k of chaves) usadas.add(k);

    if (p.tipo === 'campos') {
      for (const c of p.campos) {
        if (c.se?.modelo && !c.se.modelo.includes(ctx.modelo)) { naoAplica.set(c.id, p.numero); continue; } // campo so de alguns modelos (ex.: dominioAdmin: o modelo modular nao tem admin)
        let v = respostas[c.id];
        if ((v === undefined || v === '') && c.padrao !== undefined) {
          v = c.padrao.replace(/\{\{(\w+)\}\}/g, (_, n) => respostas[n] ?? '');
          respostas[c.id] = v;
        }
        if (v === undefined) { e(`pergunta ${p.numero}: falta "${c.id}"`); continue; }
        if (!validar(c.validacao, v)) { e(`pergunta ${p.numero}: valor invalido em "${c.id}": ${JSON.stringify(v)} (regra ${c.validacao})`); continue; }
        efeitos.push({ origem: `${p.id}.${c.id}`, efeito: c.efeito });
      }
    } else if (p.tipo === 'texto') {
      const v = respostas[p.chave];
      if (!VALIDADORES['nao-vazio'](v)) { e(`pergunta ${p.numero}: falta "${p.chave}"`); continue; }
      efeitos.push({ origem: p.id, efeito: p.efeito });
    } else if (p.tipo === 'escolha') {
      const v = respostas[p.chave];
      const o = p.opcoes.find((x) => x.id === v);
      if (!o) { e(`pergunta ${p.numero}: "${p.chave}" deve ser um de: ${p.opcoes.map((x) => x.id).join(', ')}`); continue; }
      if (o.disponivel === false) { e(`pergunta ${p.numero}: a opcao "${o.id}" esta indisponivel (${o.motivo})`); continue; }
      efeitos.push({ origem: `${p.id}.${o.id}`, efeito: o.efeito });
      if (p.id === 'modelo') ctx.modelo = o.id;
      for (const x of o.efeito.extensions ?? []) ctx.extensoes.add(x);
    } else if (p.tipo === 'multi') {
      const v = respostas[p.chave] ?? [];
      if (!Array.isArray(v)) { e(`pergunta ${p.numero}: "${p.chave}" deve ser uma lista`); continue; }
      const validos = new Set(p.opcoes.map((x) => x.id));
      const repetido = v.find((x, i) => v.indexOf(x) !== i);
      if (repetido) e(`pergunta ${p.numero}: opcao repetida ${repetido}`);
      for (const x of v) if (!validos.has(x)) e(`pergunta ${p.numero}: opcao desconhecida "${x}" (validas: ${[...validos].join(', ')})`);
      const escolhidas = [...validos].filter((x) => v.includes(x));
      const fechadas = p.id === 'extensoes-modelo-modular' ? fecharDependencias(catalogo, escolhidas) : new Set(escolhidas);
      adicionadas = p.id === 'extensoes-modelo-modular' ? [...fechadas].filter((x) => !escolhidas.includes(x) && !ctx.extensoes.has(x)).sort() : []; // o que a base do modelo ja traz nao conta como 'trazida por dependencia'
      for (const o of p.opcoes) {
        if (fechadas.has(o.id)) { efeitos.push({ origem: `${p.id}.${o.id}`, efeito: o.efeito }); if (catalogo.extensions[o.id]) ctx.extensoes.add(o.id); }
        else if (o.efeito_ausente) efeitos.push({ origem: `${p.id}.${o.id}.ausente`, efeito: o.efeito_ausente });
      }
      respostas[p.chave] = [...fechadas];
    }
  }
  for (const k of Object.keys(entrada)) {
    if (usadas.has(k) || entrada[k] === undefined) continue; // chave sem valor e o mesmo que nao responder
    if (naoAplica.has(k)) e(`"${k}" nao se aplica as respostas anteriores (pergunta ${naoAplica.get(k)})`);
    else e(`resposta desconhecida ou fora da matriz: "${k}"`);
  }
  if (ctx.modelo) respostas.modelo = ctx.modelo;
  return { erros, respostas, extensoes: [...ctx.extensoes].sort(), adicionadas, efeitos };
}

export { mesclar };
