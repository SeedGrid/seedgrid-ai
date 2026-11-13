// Leitores de uso por ferramenta para o sg-custo. Todos devolvem a MESMA estrutura de registro:
//   { ferramenta, modelo, timestamp, tokens: {entrada, saida, cache_lido, cache_criado_5m, cache_criado_1h},
//     plano, fase, tarefa, papel, subagente, sessao, origem, valorInformado?, moeda? }
// Le SO campos de uso (modelo, data, tokens) e, para ligar a tarefa, a marca P<plano>.F<fase>.T<tarefa>.
// Nunca devolve nem grava conteudo de conversa. Nao le credenciais (auth.json etc.).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import zlib from 'node:zlib';

export const TIPOS = ['entrada', 'saida', 'cache_lido', 'cache_criado_5m', 'cache_criado_1h'];
export const zero = () => Object.fromEntries(TIPOS.map((t) => [t, 0]));
export const MARCA = /^\s*P(\d+)\.F(\d+)\.T(\d+)/; // inicio do description do subagente (Claude Code)
const MARCA_EM_QUALQUER_LUGAR = /P(\d+)\.F(\d+)\.T(\d+)/; // titulo da sessao (Codex)

const semMarca = () => ({ plano: null, fase: null, tarefa: '' });
function marcaDe(m) {
  return m ? { plano: Number(m[1]), fase: Number(m[2]), tarefa: `P${m[1]}.F${m[2]}.T${m[3]}` } : semMarca();
}

// ───────────────────────────── Claude Code ─────────────────────────────

/** Transforma o objeto `usage` do transcrito nos cinco tipos de token. Ignora todo o resto. */
export function tokensDoUso(u) {
  if (!u || typeof u !== 'object') return null;
  const n = (v) => (Number.isFinite(v) ? v : 0);
  const cc = u.cache_creation && typeof u.cache_creation === 'object' ? u.cache_creation : null;
  let c5 = cc ? n(cc.ephemeral_5m_input_tokens) : 0;
  const c1 = cc ? n(cc.ephemeral_1h_input_tokens) : 0;
  if (!cc || c5 + c1 === 0) c5 = n(u.cache_creation_input_tokens); // sem detalhe: tudo como 5m
  return { entrada: n(u.input_tokens), saida: n(u.output_tokens), cache_lido: n(u.cache_read_input_tokens), cache_criado_5m: c5, cache_criado_1h: c1 };
}

/** Le um .jsonl do Claude Code e devolve requisicoes deduplicadas por message.id: so modelo, instante e tokens. */
export function lerRequisicoes(arquivo, globais = null) {
  const vistos = new Map();
  let texto;
  try { texto = readFileSync(arquivo, 'utf8'); } catch { return []; }
  for (const linha of texto.split('\n')) {
    if (!linha.includes('"usage"')) continue;
    let o;
    try { o = JSON.parse(linha); } catch { continue; }
    if (o?.type !== 'assistant' || !o.message) continue;
    const tokens = tokensDoUso(o.message.usage);
    if (!tokens) continue;
    const id = o.message.id || o.requestId || o.uuid;
    if (!id) continue;
    if (globais) { if (globais.has(id)) continue; globais.add(id); } // sessao retomada repete respostas em outro arquivo
    vistos.set(id, { modelo: String(o.message.model || 'desconhecido'), timestamp: String(o.timestamp || ''), tokens });
  }
  return [...vistos.values()];
}

/** Pasta de transcritos do Claude Code para um diretorio de projeto. */
export function pastaDeTranscritos(cwd, home = homedir()) {
  return join(home, '.claude', 'projects', resolve(cwd).replace(/[^A-Za-z0-9]/g, '-'));
}

/** Percorre sessoes e subagentes do Claude Code e devolve os registros (sem preco). */
export function coletarClaude(pasta) {
  const regs = [];
  if (!existsSync(pasta)) return regs;
  const globais = new Set();
  const nomes = readdirSync(pasta);
  // Subagentes primeiro: se a mesma resposta aparece no pai e no subagente, fica com a tarefa.
  for (const nome of nomes) {
    const sub = join(pasta, nome, 'subagents');
    if (nome.endsWith('.jsonl') || !existsSync(sub)) continue;
    for (const f of readdirSync(sub)) {
      if (!f.endsWith('.jsonl')) continue;
      const agente = basename(f, '.jsonl');
      let meta = {};
      try { meta = JSON.parse(readFileSync(join(sub, `${agente}.meta.json`), 'utf8')); } catch { /* subagente sem meta: fica sem tarefa */ }
      const marca = marcaDe(MARCA.exec(String(meta.description || '')));
      for (const r of lerRequisicoes(join(sub, f), globais)) {
        regs.push({ ferramenta: 'claude-code', ...r, ...marca, papel: String(meta.agentType || 'subagente'), subagente: true, origem: agente, sessao: nome });
      }
    }
  }
  for (const nome of nomes) {
    if (!nome.endsWith('.jsonl')) continue;
    const sessao = basename(nome, '.jsonl');
    for (const r of lerRequisicoes(join(pasta, nome), globais)) {
      regs.push({ ferramenta: 'claude-code', ...r, ...semMarca(), papel: 'sessao-principal', subagente: false, origem: sessao, sessao });
    }
  }
  return regs;
}

// ───────────────────────────── Codex ─────────────────────────────

/** Pasta de sessoes do Codex (global, nao por projeto). */
export function pastaDoCodex(home = homedir()) {
  return join(home, '.codex', 'sessions');
}

/**
 * Le o texto de um rollout do Codex. `.jsonl.zst` e zstd: usa zlib.zstdDecompressSync (Node 22.15+/23.8+);
 * sem isso, tenta o programa `zstd -dc`. Devolve null (e um aviso) se nao conseguir.
 */
export function lerRollout(arquivo, avisos = []) {
  try {
    if (arquivo.endsWith('.jsonl')) return readFileSync(arquivo, 'utf8');
    const bruto = readFileSync(arquivo);
    if (typeof zlib.zstdDecompressSync === 'function') return zlib.zstdDecompressSync(bruto).toString('utf8');
    const r = spawnSync('zstd', ['-dc'], { input: bruto, maxBuffer: 1 << 30 });
    if (r.status === 0) return r.stdout.toString('utf8');
    avisos.push('rollouts do Codex (.zst) exigem Node 22.15+ ou o programa zstd no PATH; sessões do Codex ignoradas');
  } catch (e) {
    avisos.push(`rollout do Codex ilegível (${basename(arquivo)}): ${e.code || 'erro'}`);
  }
  return null;
}

const normaPasta = (p) => resolve(String(p || '')).split('\\').join('/').replace(/\/+$/, '').toLowerCase();

/** Tokens de um bloco de uso do Codex. `input_tokens` ja INCLUI o cache lido; `output_tokens` inclui o raciocinio. */
export function tokensDoCodex(u) {
  if (!u || typeof u !== 'object') return null;
  const n = (v) => (Number.isFinite(v) ? v : 0);
  const cache = n(u.cached_input_tokens);
  const escrita = n(u.cache_write_input_tokens);
  return { entrada: Math.max(0, n(u.input_tokens) - cache - escrita), saida: n(u.output_tokens), cache_lido: cache, cache_criado_5m: escrita, cache_criado_1h: 0 };
}

const CAMPOS_CODEX = ['input_tokens', 'cached_input_tokens', 'cache_write_input_tokens', 'output_tokens'];

/**
 * Uso de UM rollout: lista de { modelo, timestamp, tokens }.
 * Formato novo: `token_usage_record` por resposta (deduplicado por response_id).
 * Formato antigo: so `event_msg/token_count`, com total ACUMULADO que se repete; usa a diferenca entre totais
 * consecutivos (somar `last_token_usage` conta o mesmo uso varias vezes). Total que diminui = reinicio: conta o total.
 */
export function usoDoRollout(texto) {
  const meta = { id: '', cwd: '' };
  const registros = []; const acumulados = [];
  let modelo = 'desconhecido';
  for (const linha of texto.split('\n')) {
    if (!linha.includes('token') && !linha.includes('session_meta') && !linha.includes('turn_context')) continue;
    let o;
    try { o = JSON.parse(linha); } catch { continue; }
    const p = o?.payload;
    if (!p) continue;
    if (o.type === 'session_meta') { meta.id = String(p.id || ''); meta.cwd = String(p.cwd || ''); continue; }
    if (o.type === 'turn_context') { if (p.model) modelo = String(p.model); continue; }
    if (o.type === 'token_usage_record' && p.usage) registros.push({ id: p.response_id || '', modelo, timestamp: String(o.timestamp || ''), uso: p.usage });
    else if (o.type === 'event_msg' && p.type === 'token_count' && p.info?.total_token_usage) acumulados.push({ modelo, timestamp: String(o.timestamp || ''), total: p.info.total_token_usage });
  }
  const uso = [];
  if (registros.length > 0) {
    const vistos = new Set();
    for (const r of registros) {
      if (r.id) { if (vistos.has(r.id)) continue; vistos.add(r.id); }
      uso.push({ modelo: r.modelo, timestamp: r.timestamp, tokens: tokensDoCodex(r.uso) });
    }
  } else {
    let anterior = null;
    for (const a of acumulados) {
      const t = a.total;
      const ficouMenor = anterior && (t.total_tokens ?? 0) < (anterior.total_tokens ?? 0);
      const delta = {};
      for (const c of CAMPOS_CODEX) delta[c] = anterior && !ficouMenor ? Math.max(0, (t[c] || 0) - (anterior[c] || 0)) : (t[c] || 0);
      anterior = t;
      if (CAMPOS_CODEX.every((c) => delta[c] === 0)) continue;
      uso.push({ modelo: a.modelo, timestamp: a.timestamp, tokens: tokensDoCodex(delta) });
    }
  }
  return { meta, uso };
}

function arquivosDeRollout(dir, saida = []) {
  if (!existsSync(dir)) return saida;
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) arquivosDeRollout(p, saida);
    else if (/^rollout-.*\.jsonl(\.zst)?$/.test(nome)) saida.push(p);
  }
  return saida;
}

/** Titulos das sessoes (session_index.jsonl: id, thread_name): so para achar a marca da tarefa. */
function titulosDoCodex(dir) {
  const mapa = new Map();
  const arq = join(dir, '..', 'session_index.jsonl');
  if (!existsSync(arq)) return mapa;
  for (const l of readFileSync(arq, 'utf8').split('\n')) {
    if (!l) continue;
    try { const o = JSON.parse(l); if (o.id && o.thread_name) mapa.set(String(o.id), String(o.thread_name)); } catch { /* linha ruim */ }
  }
  return mapa;
}

/**
 * Registros do Codex de um ou mais projetos. As sessoes do Codex ficam todas juntas (nao ha pasta por projeto):
 * so entram as cujo `cwd` (session_meta) e o de um dos `projetos` (ou uma subpasta dele).
 * A tarefa vem da marca P<plano>.F<fase>.T<tarefa> no titulo da sessao; sem marca, fica sem tarefa (use --sessao/--janela).
 */
export function coletarCodex(dir, projetos, avisos = []) {
  const regs = [];
  const raizes = projetos.map(normaPasta);
  const titulos = titulosDoCodex(dir);
  for (const arq of arquivosDeRollout(dir)) {
    const texto = lerRollout(arq, avisos);
    if (texto === null) { if (avisos.some((a) => a.startsWith('rollouts do Codex'))) break; continue; }
    const { meta, uso } = usoDoRollout(texto);
    const cwd = normaPasta(meta.cwd);
    if (!meta.cwd || !raizes.some((r) => cwd === r || cwd.startsWith(`${r}/`))) continue;
    const marca = marcaDe(MARCA_EM_QUALQUER_LUGAR.exec(titulos.get(meta.id) || ''));
    for (const u of uso) regs.push({ ferramenta: 'codex', ...u, ...marca, papel: 'sessao-principal', subagente: false, origem: basename(arq).replace(/\.jsonl(\.zst)?$/, ''), sessao: meta.id });
  }
  return regs;
}

// ───────────────────────────── Generico (JSON ou CSV) ─────────────────────────────

/** CSV simples: separador virgula ou ponto e virgula (detectado no cabecalho), aspas duplas, primeira linha e o cabecalho. */
export function lerCsv(texto) {
  const linhas = texto.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (linhas.length === 0) return [];
  const sep = (linhas[0].match(/;/g) || []).length > (linhas[0].match(/,/g) || []).length ? ';' : ',';
  const campos = (l) => {
    const out = []; let atual = ''; let aspas = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (aspas) { if (c === '"' && l[i + 1] === '"') { atual += '"'; i++; } else if (c === '"') aspas = false; else atual += c; }
      else if (c === '"') aspas = true;
      else if (c === sep) { out.push(atual); atual = ''; }
      else atual += c;
    }
    out.push(atual);
    return out;
  };
  const cab = campos(linhas[0]).map((c) => c.trim());
  return linhas.slice(1).map((l) => Object.fromEntries(campos(l).map((v, i) => [cab[i], v.trim()])));
}

const num = (v) => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };

/**
 * Registros de outras LLMs e APIs, por arquivo JSON (lista, ou { registros: [...] }) ou CSV.
 * Colunas: modelo, timestamp (ou data), entrada, saida, cache_lido, cache_criado_5m, cache_criado_1h (as ausentes valem 0);
 * opcionais: ferramenta, tarefa (P<plano>.F<fase>.T<tarefa>), papel, sessao, valor (custo ja calculado pela API) e moeda.
 */
export function coletarGenerico(arquivo, formato = null) {
  const texto = readFileSync(arquivo, 'utf8');
  const fmt = formato || (arquivo.toLowerCase().endsWith('.csv') ? 'csv' : 'json');
  let linhas;
  if (fmt === 'csv') linhas = lerCsv(texto);
  else { const j = JSON.parse(texto); linhas = Array.isArray(j) ? j : (j.registros || []); }
  return linhas.map((r) => {
    const marca = marcaDe(MARCA.exec(String(r.tarefa || '')));
    const reg = {
      ferramenta: String(r.ferramenta || 'generico'),
      modelo: String(r.modelo || 'desconhecido'),
      timestamp: String(r.timestamp || r.data || ''),
      tokens: { entrada: num(r.entrada), saida: num(r.saida), cache_lido: num(r.cache_lido), cache_criado_5m: num(r.cache_criado_5m), cache_criado_1h: num(r.cache_criado_1h) },
      ...marca, papel: String(r.papel || 'sessao-principal'), subagente: false, origem: basename(arquivo), sessao: String(r.sessao || ''),
    };
    if (r.valor !== undefined && r.valor !== '' && Number.isFinite(Number(String(r.valor).replace(',', '.')))) reg.valorInformado = num(r.valor);
    if (r.moeda) reg.moeda = String(r.moeda);
    return reg;
  });
}
