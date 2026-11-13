#!/usr/bin/env node
// Custo por tarefa, fase e plano (tokens e valor), a partir dos transcritos do Claude Code. Node sem dependencia.
// Le SO campos de uso (modelo, data, tokens). Nunca le nem grava conteudo de conversa.
//
//   node custo.mjs <plano> resumo                 o plano inteiro, uma linha por tarefa, subtotal por fase e total
//   node custo.mjs <plano> fase <fase>            so uma fase (1 ou F1)
//   <plano>: o numero (163) ou o caminho do arquivo do plano (P163-....md)
//
// Opcoes:
//   --transcritos <pasta>   pasta dos transcritos (padrao: ~/.claude/projects/<pasta atual com / e : trocados por ->)
//   --precos <arquivo>      tabela de precos (padrao: .ai/local/precos-de-modelo.json na pasta atual)
//   --janela P1.F1.T1=<inicio>,<fim>
//                           atribui a uma tarefa o uso da SESSAO PRINCIPAL entre dois instantes ISO (repetivel)
//   --gravar                grava o relatorio em docs/ai/custos/ (alem de imprimir)
//   --json                  saida em JSON
//
// Ligacao uso -> tarefa: o `description` do Agent comeca com P<plano>.F<fase>.T<tarefa> (fica no meta.json do subagente).
// Uso deduplicado por message.id (o transcrito repete a linha uma vez por bloco de conteudo).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MARCA = /^\s*P(\d+)\.F(\d+)\.T(\d+)/;
const TIPOS = ['entrada', 'saida', 'cache_lido', 'cache_criado_5m', 'cache_criado_1h'];

export const zero = () => Object.fromEntries(TIPOS.map((t) => [t, 0]));

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

/** Le um .jsonl e devolve requisicoes deduplicadas por message.id: so modelo, instante e tokens. */
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

/** Percorre sessoes e subagentes e devolve os registros de custo (sem preco). */
export function coletar(pasta) {
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
      const m = MARCA.exec(String(meta.description || ''));
      for (const r of lerRequisicoes(join(sub, f), globais)) {
        regs.push({ ...r, plano: m ? Number(m[1]) : null, fase: m ? Number(m[2]) : null, tarefa: m ? `P${m[1]}.F${m[2]}.T${m[3]}` : '', papel: String(meta.agentType || 'subagente'), origem: agente });
      }
    }
  }
  for (const nome of nomes) {
    if (!nome.endsWith('.jsonl')) continue;
    const sessao = basename(nome, '.jsonl');
    for (const r of lerRequisicoes(join(pasta, nome), globais)) regs.push({ ...r, plano: null, fase: null, tarefa: '', papel: 'sessao-principal', origem: sessao });
  }
  return regs;
}

/** Atribui a uma tarefa o uso da sessao principal dentro de janelas de tempo. */
export function aplicarJanelas(regs, janelas) {
  for (const r of regs) {
    if (r.tarefa || r.papel !== 'sessao-principal') continue;
    const t = Date.parse(r.timestamp);
    const j = janelas.find((w) => t >= w.inicio && t <= w.fim);
    if (!j) continue;
    r.tarefa = j.tarefa; r.plano = j.plano; r.fase = j.fase;
  }
  return regs;
}

export function lerJanela(texto) {
  const m = /^P(\d+)\.F(\d+)\.T(\d+)=([^,]+),(.+)$/.exec(texto);
  if (!m) throw new Error(`--janela invalida: ${texto} (esperado P<plano>.F<fase>.T<tarefa>=<inicio>,<fim>)`);
  const inicio = Date.parse(m[4]); const fim = Date.parse(m[5]);
  if (Number.isNaN(inicio) || Number.isNaN(fim)) throw new Error(`--janela com data invalida: ${texto}`);
  return { tarefa: `P${m[1]}.F${m[2]}.T${m[3]}`, plano: Number(m[1]), fase: Number(m[2]), inicio, fim };
}

/** Valor de uma requisicao. Devolve { valor, aviso }; valor nulo se nao ha preco (nunca inventa). */
export function precificar(reg, tabela) {
  const dia = reg.timestamp.slice(0, 10);
  const linhas = (tabela?.precos || []).filter((p) => p.modelo === reg.modelo && String(p.vigente_desde) <= dia);
  if (linhas.length === 0) return { valor: null, aviso: `sem preço para ${reg.modelo} em ${dia || 'data desconhecida'}` };
  const p = linhas.sort((a, b) => String(b.vigente_desde).localeCompare(String(a.vigente_desde)))[0];
  let v = 0;
  for (const t of TIPOS) v += (reg.tokens[t] / 1e6) * (Number(p.por_milhao?.[t]) || 0);
  return { valor: v, aviso: null, faixa: p.vigente_desde };
}

export function lerTabelaDePrecos(arquivo) {
  if (!existsSync(arquivo)) return null;
  try { return JSON.parse(readFileSync(arquivo, 'utf8')); } catch { return null; }
}

/** Soma por tarefa. Linhas sem tarefa do plano ficam fora (aparecem em `semTarefa`). */
export function agregar(regs, tabela, plano, fase = null) {
  const avisos = new Set();
  const porTarefa = new Map();
  const semTarefa = { tokens: zero(), valor: 0, parcial: false, requisicoes: 0 };
  for (const r of regs) {
    const doPlano = r.plano === plano && (fase === null || r.fase === fase);
    const { valor, aviso, faixa } = precificar(r, tabela);
    if (aviso && doPlano) avisos.add(aviso);
    if (!doPlano) {
      if (r.plano === null && fase === null) {
        for (const t of TIPOS) semTarefa.tokens[t] += r.tokens[t];
        semTarefa.requisicoes++;
        if (valor === null) semTarefa.parcial = true; else semTarefa.valor += valor;
      }
      continue;
    }
    const chave = `${r.tarefa}|${r.papel}|${r.modelo}`;
    let l = porTarefa.get(chave);
    if (!l) { l = { tarefa: r.tarefa, fase: r.fase, papel: r.papel, modelo: r.modelo, tokens: zero(), valor: 0, parcial: false, requisicoes: 0, faixa: faixa || null }; porTarefa.set(chave, l); }
    for (const t of TIPOS) l.tokens[t] += r.tokens[t];
    l.requisicoes++;
    if (valor === null) l.parcial = true; else l.valor += valor;
  }
  const linhas = [...porTarefa.values()].sort((a, b) => a.fase - b.fase || a.tarefa.localeCompare(b.tarefa, 'en', { numeric: true }) || a.papel.localeCompare(b.papel));
  const somar = (ls) => {
    const s = { tokens: zero(), valor: 0, parcial: false };
    for (const l of ls) { for (const t of TIPOS) s.tokens[t] += l.tokens[t]; s.valor += l.valor; if (l.parcial) s.parcial = true; }
    return s;
  };
  const fases = [...new Set(linhas.map((l) => l.fase))].map((f) => ({ fase: f, ...somar(linhas.filter((l) => l.fase === f)) }));
  return { linhas, fases, total: somar(linhas), semTarefa, avisos: [...avisos].sort() };
}

/** Conta as demandas registradas da fase (docs/ai/demands/P<plano>.F<fase>.DEM*). */
export function consultasAoFonte(raiz, plano, fase) {
  const dir = join(raiz, 'docs', 'ai', 'demands');
  if (!existsSync(dir)) return 0;
  const re = new RegExp(`^P${plano}\\.F${fase}\\.DEM\\d+`);
  return readdirSync(dir).filter((f) => re.test(f)).length;
}

export function fmtTokens(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')} M`;
  if (n >= 1e4) return `${Math.round(n / 1e3)} mil`;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
const fmtValor = (l, moeda) => (l.parcial && l.valor === 0 ? '— (sem preço)' : `${moeda} ${l.valor.toFixed(2).replace('.', ',')}${l.parcial ? ' (parcial)' : ''}`);

export function relatorio(ag, { plano, fase, moeda = 'USD', raiz = '.', data = '' }) {
  const L = [`# Custo do P${plano}${fase === null ? '' : ` — fase F${fase}`}${data ? ` (${data})` : ''}`, ''];
  L.push('| Tarefa | Papel | Modelo | Entrada | Saída | Cache lido | Cache criado | Valor |', '|---|---|---|---:|---:|---:|---:|---:|');
  const linha = (t, p, m, x) => `| ${t} | ${p} | ${m} | ${fmtTokens(x.tokens.entrada)} | ${fmtTokens(x.tokens.saida)} | ${fmtTokens(x.tokens.cache_lido)} | ${fmtTokens(x.tokens.cache_criado_5m + x.tokens.cache_criado_1h)} | ${fmtValor(x, moeda)} |`;
  for (const l of ag.linhas) L.push(linha(l.tarefa || '(sem tarefa)', l.papel, l.modelo, l));
  L.push('', '## Por fase', '', '| Fase | Entrada | Saída | Cache lido | Cache criado | Valor | Consultas ao fonte |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const f of ag.fases) {
    L.push(`| F${f.fase} | ${fmtTokens(f.tokens.entrada)} | ${fmtTokens(f.tokens.saida)} | ${fmtTokens(f.tokens.cache_lido)} | ${fmtTokens(f.tokens.cache_criado_5m + f.tokens.cache_criado_1h)} | ${fmtValor(f, moeda)} | ${consultasAoFonte(raiz, plano, f.fase)} |`);
  }
  L.push('', `**Total do plano:** entrada ${fmtTokens(ag.total.tokens.entrada)} · saída ${fmtTokens(ag.total.tokens.saida)} · cache lido ${fmtTokens(ag.total.tokens.cache_lido)} · cache criado ${fmtTokens(ag.total.tokens.cache_criado_5m + ag.total.tokens.cache_criado_1h)} · valor ${fmtValor(ag.total, moeda)}${ag.total.parcial ? ' — total PARCIAL: faltou preço' : ''}`);
  if (ag.semTarefa.requisicoes > 0) L.push('', `Sessão principal sem tarefa atribuída (fora das somas acima; use --janela): ${ag.semTarefa.requisicoes} requisições, saída ${fmtTokens(ag.semTarefa.tokens.saida)}, cache lido ${fmtTokens(ag.semTarefa.tokens.cache_lido)}.`);
  for (const a of ag.avisos) L.push('', `Aviso: ${a}.`);
  return L.join('\n') + '\n';
}

function planoNumero(arg) {
  const m = /^\d+$/.test(arg) ? [null, arg] : /(?:^|[\\/])P(\d+)-/.exec(arg);
  return m ? Number(m[1]) : null;
}

export function main(argv, { cwd = process.cwd(), saida = (s) => process.stdout.write(s), erro = (s) => process.stderr.write(s) } = {}) {
  const pos = []; const opt = { janela: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json' || a === '--gravar') opt[a.slice(2)] = true;
    else if (['--transcritos', '--precos'].includes(a)) opt[a.slice(2)] = argv[++i];
    else if (a === '--janela') opt.janela.push(argv[++i]);
    else pos.push(a);
  }
  const plano = pos[0] ? planoNumero(pos[0]) : null;
  const modo = pos[1];
  const fase = modo === 'fase' && pos[2] ? Number(String(pos[2]).replace(/^F/i, '')) : null;
  if (plano === null || !['resumo', 'fase'].includes(modo) || (modo === 'fase' && !Number.isInteger(fase))) {
    erro('uso: custo.mjs <plano> resumo | <plano> fase <fase> [--transcritos pasta] [--precos arquivo] [--janela P1.F1.T1=ini,fim] [--gravar] [--json]\n');
    return 2;
  }
  let regs;
  try {
    regs = aplicarJanelas(coletar(opt.transcritos || pastaDeTranscritos(cwd)), opt.janela.map(lerJanela));
  } catch (e) { erro(`${e.message}\n`); return 2; }
  const arqPrecos = opt.precos || join(cwd, '.ai', 'local', 'precos-de-modelo.json');
  const tabela = lerTabelaDePrecos(arqPrecos);
  const ag = agregar(regs, tabela, plano, fase);
  const moeda = tabela?.moeda || 'USD';
  if (!tabela) ag.avisos.unshift(`tabela de preços ausente ou ilegível (${arqPrecos}); mostrando só tokens`);
  const data = new Date().toISOString().slice(0, 10);
  if (opt.json) saida(JSON.stringify({ plano, fase, moeda, ...ag }, null, 2) + '\n');
  else saida(relatorio(ag, { plano, fase, moeda, raiz: cwd, data }));
  if (opt.gravar) {
    const dir = join(cwd, 'docs', 'ai', 'custos');
    mkdirSync(dir, { recursive: true });
    const arq = join(dir, `P${plano}${fase === null ? '' : `-F${fase}`}-custo-${data}.md`);
    writeFileSync(arq, relatorio(ag, { plano, fase, moeda, raiz: cwd, data }), 'utf8');
    erro(`gravado: ${arq}\n`);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
