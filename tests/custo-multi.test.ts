import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import zlib from 'node:zlib';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-custo/scripts/custo.mjs');
type Tokens = Record<'entrada' | 'saida' | 'cache_lido' | 'cache_criado_5m' | 'cache_criado_1h', number>;
type Reg = { ferramenta: string; sessao: string; tarefa: string; fase: number | null; modelo: string; timestamp: string; tokens: Tokens };
type Grupo = { tokens: Tokens; valores: Record<string, number>; parcial: boolean };
type Ag = { linhas: (Grupo & { tarefa: string; ferramenta: string })[]; fases: (Grupo & { fase: number })[]; porFerramenta: unknown[]; total: Grupo; avisos: string[] };
const mod = (await import(pathToFileURL(SCRIPT).href)) as {
  coletarCodex: (d: string, projetos: string[], avisos?: string[]) => Reg[];
  coletarGenerico: (f: string, fmt?: string | null) => Reg[];
  usoDoRollout: (t: string) => { meta: { id: string; cwd: string }; uso: { modelo: string; tokens: Tokens }[] };
  lerCsv: (t: string) => Record<string, string>[];
  precificar: (r: unknown, t: unknown) => { valor: number | null; moeda: string | null; aviso: string | null };
  fmtValor: (g: { valores: Record<string, number>; parcial: boolean }) => string;
  main: (a: string[], o: { cwd: string; home?: string; saida: (s: string) => void; erro: (s: string) => void }) => number;
};

const meta = (id: string, cwd: string) => JSON.stringify({ type: 'session_meta', payload: { id, cwd, timestamp: '2026-11-13T09:00:00Z', base_instructions: 'CONTEUDO-SECRETO' } });
const turno = (model: string) => JSON.stringify({ type: 'turn_context', payload: { model } });
const tot = (input: number, cached: number, output: number) => ({ input_tokens: input, cached_input_tokens: cached, cache_write_input_tokens: 0, output_tokens: output, reasoning_output_tokens: 0, total_tokens: input + output });
const tc = (ts: string, total: Record<string, number>) => JSON.stringify({ timestamp: ts, type: 'event_msg', payload: { type: 'token_count', info: { total_token_usage: total, last_token_usage: total } } });
const rec = (rid: string, ts: string, u: Record<string, number>) => JSON.stringify({ timestamp: ts, type: 'token_usage_record', payload: { response_id: rid, usage: u } });
const claudeLinha = (id: string, ts: string, u: Record<string, unknown>, model = 'modelo-x') =>
  JSON.stringify({ type: 'assistant', timestamp: ts, message: { id, model, content: [{ type: 'text', text: 'CONTEUDO-SECRETO' }], usage: u } });

/** Monta, dentro de `raiz`, as sessões do Codex (formato antigo, de outro projeto e formato novo em zstd) e o índice de títulos. */
function codexDir(raiz: string, projeto: string): string {
  const sess = join(raiz, '.codex', 'sessions');
  const dia = join(sess, '2026', '11', '13');
  mkdirSync(dia, { recursive: true });
  writeFileSync(join(dia, 'rollout-a-cdx-1.jsonl'), [
    meta('cdx-1', projeto), turno('gpt-a'),
    tc('2026-11-13T10:00:00Z', tot(1000, 600, 100)),
    tc('2026-11-13T10:00:05Z', tot(1000, 600, 100)), // total repetido: não conta de novo
    tc('2026-11-13T10:10:00Z', tot(3000, 2000, 300)),
    turno('gpt-b'),
    tc('2026-11-13T10:20:00Z', tot(3500, 2200, 450)),
    tc('2026-11-13T10:30:00Z', tot(200, 0, 10)), // contador reiniciou: conta o total
  ].join('\n') + '\n');
  writeFileSync(join(dia, 'rollout-b-cdx-2.jsonl'), [meta('cdx-2', join(raiz, 'outro')), turno('gpt-a'), tc('2026-11-13T10:00:00Z', tot(9, 0, 9))].join('\n') + '\n');
  const novo = [meta('cdx-3', join(projeto, 'sub')), turno('gpt-a'), rec('r1', '2026-11-13T12:00:00Z', tot(500, 100, 50)), rec('r1', '2026-11-13T12:00:00Z', tot(500, 100, 50)), rec('r2', '2026-11-13T12:05:00Z', tot(700, 0, 70))].join('\n') + '\n';
  const z = (zlib as unknown as { zstdCompressSync?: (b: Buffer) => Buffer }).zstdCompressSync;
  if (z) writeFileSync(join(dia, 'rollout-c-cdx-3.jsonl.zst'), z(Buffer.from(novo)));
  else writeFileSync(join(dia, 'rollout-c-cdx-3.jsonl'), novo);
  writeFileSync(join(raiz, '.codex', 'session_index.jsonl'), [JSON.stringify({ id: 'cdx-3', thread_name: 'P7.F2.T1 cadastro de clientes' }), JSON.stringify({ id: 'cdx-1', thread_name: 'sem marca' })].join('\n') + '\n');
  return sess;
}

test('Codex: usa a diferença entre totais acumulados, o modelo vigente, trata reinício; a entrada não inclui o cache', () => {
  const r = mod.usoDoRollout([meta('c', '/p'), turno('gpt-a'), tc('t1', tot(1000, 600, 100)), tc('t1', tot(1000, 600, 100)), tc('t2', tot(3000, 2000, 300)), turno('gpt-b'), tc('t3', tot(3500, 2200, 450)), tc('t4', tot(200, 0, 10))].join('\n'));
  assert.deepEqual(r.uso.map((u) => [u.modelo, u.tokens.entrada, u.tokens.cache_lido, u.tokens.saida]), [
    ['gpt-a', 400, 600, 100],
    ['gpt-a', 600, 1400, 200],
    ['gpt-b', 300, 200, 150],
    ['gpt-b', 200, 0, 10],
  ]);
  assert.ok(!JSON.stringify(r).includes('CONTEUDO-SECRETO'));
});

test('Codex: só as sessões do projeto entram, dedupe por response_id e a marca vem do título', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-custo-cdx-'));
  try {
    const projeto = join(raiz, 'prod');
    const sess = codexDir(raiz, projeto);
    const avisos: string[] = [];
    const regs = mod.coletarCodex(sess, [projeto], avisos);
    assert.deepEqual(avisos, []);
    assert.ok(regs.every((x) => x.ferramenta === 'codex' && x.sessao !== 'cdx-2'));
    const novo = regs.filter((x) => x.sessao === 'cdx-3');
    assert.equal(novo.length, 2, 'r1 repetido conta uma vez');
    assert.ok(novo.every((x) => x.tarefa === 'P7.F2.T1' && x.fase === 2));
    assert.ok(regs.filter((x) => x.sessao === 'cdx-1').every((x) => x.tarefa === ''), 'título sem marca');
    assert.ok(!JSON.stringify(regs).includes('CONTEUDO-SECRETO'));
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('genérico: JSON e CSV, campos ausentes valem zero, valor e moeda informados pela API', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-custo-gen-'));
  try {
    writeFileSync(join(raiz, 'api.json'), JSON.stringify({ registros: [{ ferramenta: 'outra-llm', modelo: 'llm-z', timestamp: '2026-11-13T09:00:00Z', entrada: 1000, saida: 200, tarefa: 'P7.F3.T1' }] }));
    writeFileSync(join(raiz, 'api.csv'), 'modelo;timestamp;entrada;saida;tarefa;valor;moeda\n"llm-w";2026-11-13T09:00:00Z;10;5;P7.F3.T2;1,5;EUR\n');
    const j = mod.coletarGenerico(join(raiz, 'api.json'));
    assert.equal(j[0]!.tokens.cache_lido, 0);
    assert.equal(j[0]!.ferramenta, 'outra-llm');
    assert.equal(j[0]!.tarefa, 'P7.F3.T1');
    const c = mod.coletarGenerico(join(raiz, 'api.csv'));
    assert.equal(c[0]!.ferramenta, 'generico');
    assert.equal(mod.precificar(c[0], { moeda: 'USD', precos: [] }).valor, 1.5);
    assert.equal(mod.precificar(c[0], { moeda: 'USD', precos: [] }).moeda, 'EUR');
    assert.deepEqual(mod.lerCsv('a,b\n"x,y",2\n'), [{ a: 'x,y', b: '2' }]);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('preço por modelo e moeda por linha de preço; moedas diferentes não se somam', () => {
  const tabela = { moeda: 'USD', precos: [
    { modelo: 'gpt-a', vigente_desde: '2026-01-01', por_milhao: { entrada: 1, saida: 10, cache_lido: 0.1 } },
    { modelo: 'llm-z', vigente_desde: '2026-01-01', moeda: 'BRL', por_milhao: { entrada: 5, saida: 50 } },
  ] };
  const reg = (modelo: string) => ({ modelo, timestamp: '2026-11-13T00:00:00Z', tokens: { entrada: 1e6, saida: 1e6, cache_lido: 1e6, cache_criado_5m: 0, cache_criado_1h: 0 } });
  const a = mod.precificar(reg('gpt-a'), tabela);
  assert.ok(Math.abs(a.valor! - 11.1) < 1e-9);
  assert.equal(a.moeda, 'USD');
  const z = mod.precificar(reg('llm-z'), tabela);
  assert.equal(z.valor, 55);
  assert.equal(z.moeda, 'BRL');
  assert.equal(mod.fmtValor({ valores: { USD: 1.5, BRL: 2 }, parcial: true }), 'BRL 2,00 + USD 1,50 (parcial)');
});

test('Claude Code e Codex no mesmo plano: uma fase em cada ferramenta, somadas, cada modelo com o seu preço', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-custo-mix-'));
  try {
    const proj = join(raiz, 'prod');
    const sess = codexDir(raiz, proj);
    const transcritos = join(raiz, 'transcritos');
    mkdirSync(join(transcritos, 's1', 'subagents'), { recursive: true });
    writeFileSync(join(transcritos, 's1', 'subagents', 'agent-a1.jsonl'), claudeLinha('m1', '2026-11-13T10:30:00Z', { input_tokens: 2, output_tokens: 50 }) + '\n');
    writeFileSync(join(transcritos, 's1', 'subagents', 'agent-a1.meta.json'), JSON.stringify({ agentType: 'backend-java', description: 'P7.F1.T1 endpoint' }));
    writeFileSync(join(raiz, 'api.csv'), 'ferramenta,modelo,timestamp,entrada,saida,tarefa\nllm-externa,llm-z,2026-11-13T09:00:00Z,100,20,P7.F3.T1\n');
    mkdirSync(join(raiz, '.ai', 'local'), { recursive: true });
    writeFileSync(join(raiz, '.ai', 'local', 'precos-de-modelo.json'), JSON.stringify({ moeda: 'USD', precos: [
      { modelo: 'modelo-x', vigente_desde: '2026-01-01', por_milhao: { entrada: 1, saida: 10 } },
      { modelo: 'gpt-a', vigente_desde: '2026-01-01', moeda: 'BRL', por_milhao: { entrada: 100, saida: 1000, cache_lido: 10 } },
    ] }));
    const args = ['7', 'resumo', '--transcritos', transcritos, '--codex', sess, '--projeto', proj, '--fonte', 'claude-code', '--fonte', 'codex', '--fonte', 'csv:api.csv'];
    let out = '';
    assert.equal(mod.main([...args, '--json'], { cwd: raiz, home: raiz, saida: (s) => (out += s), erro: () => {} }), 0);
    const ag = JSON.parse(out) as Ag;
    assert.deepEqual(ag.fases.map((f) => f.fase), [1, 2, 3]);
    // Soma independente: F1 = Claude (subagente), F2 = Codex (r1 + r2), F3 = CSV.
    assert.equal(ag.fases[0]!.tokens.saida, 50);
    assert.equal(ag.fases[1]!.tokens.entrada, 400 + 700, 'entrada sem o cache lido: (500-100) + 700');
    assert.equal(ag.fases[1]!.tokens.cache_lido, 100);
    assert.equal(ag.fases[1]!.tokens.saida, 120);
    assert.equal(ag.fases[2]!.tokens.entrada, 100);
    assert.equal(ag.total.tokens.saida, 50 + 120 + 20);
    assert.equal(ag.total.tokens.entrada, 2 + 1100 + 100);
    // Cada modelo com o seu preço e a sua moeda; llm-z sem preço deixa essa fase (e o total) parcial.
    assert.ok(Math.abs(ag.fases[1]!.valores.BRL! - (1100 * 100 + 120 * 1000 + 100 * 10) / 1e6) < 1e-9);
    assert.ok(ag.fases[0]!.valores.USD! > 0);
    assert.equal(ag.fases[2]!.parcial, true);
    assert.equal(ag.total.parcial, true);
    assert.deepEqual([...new Set(ag.linhas.map((l) => l.ferramenta))].sort(), ['claude-code', 'codex', 'llm-externa']);
    assert.ok(ag.avisos.includes('sem preço para llm-z em 2026-11-13'));
    let txt = '';
    mod.main(args, { cwd: raiz, home: raiz, saida: (s) => (txt += s), erro: () => {} });
    assert.match(txt, /\| P7\.F2\.T1 \| codex \| sessao-principal \| gpt-a \|/);
    assert.match(txt, /## Por ferramenta e modelo/);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('--janela atribui à tarefa o uso sem marca do Codex; --fonte inválida dá erro', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-custo-cdxw-'));
  try {
    const proj = join(raiz, 'prod');
    const sess = codexDir(raiz, proj);
    let out = '';
    let err = '';
    const janela = 'P7.F4.T1=2026-11-13T10:05:00Z,2026-11-13T10:15:00Z';
    mod.main(['7', 'resumo', '--json', '--fonte', 'codex', '--codex', sess, '--projeto', proj, '--sessao', 'cdx-1', '--janela', janela], { cwd: raiz, home: raiz, saida: (s) => (out += s), erro: () => {} });
    const ag = JSON.parse(out) as Ag;
    assert.deepEqual(ag.linhas.map((l) => l.tarefa), ['P7.F4.T1']);
    assert.equal(ag.linhas[0]!.tokens.saida, 200, 'só o evento das 10:10');
    assert.equal(mod.main(['7', 'resumo', '--fonte', 'xyz'], { cwd: raiz, home: raiz, saida: () => {}, erro: (s) => (err += s) }), 2);
    assert.match(err, /--fonte invalida/);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});
