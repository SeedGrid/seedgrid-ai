import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-custo/scripts/custo.mjs');
type Tokens = Record<'entrada' | 'saida' | 'cache_lido' | 'cache_criado_5m' | 'cache_criado_1h', number>;
type Reg = { modelo: string; timestamp: string; tokens: Tokens; plano: number | null; fase: number | null; tarefa: string; papel: string };
type Ag = { linhas: { tarefa: string; fase: number; tokens: Tokens; valor: number; parcial: boolean; requisicoes: number }[]; fases: { fase: number; valor: number; parcial: boolean; tokens: Tokens }[]; total: { valor: number; parcial: boolean; tokens: Tokens }; semTarefa: { requisicoes: number }; avisos: string[] };
const mod = (await import(pathToFileURL(SCRIPT).href)) as {
  tokensDoUso: (u: unknown) => Tokens | null;
  lerRequisicoes: (f: string) => { tokens: Tokens }[];
  coletar: (p: string) => Reg[];
  aplicarJanelas: (r: Reg[], j: unknown[]) => Reg[];
  lerJanela: (t: string) => unknown;
  precificar: (r: unknown, t: unknown) => { valor: number | null; aviso: string | null };
  agregar: (r: Reg[], t: unknown, plano: number, fase?: number | null) => Ag;
  fmtTokens: (n: number) => string;
  main: (a: string[], o: { cwd: string; saida: (s: string) => void; erro: (s: string) => void }) => number;
};

const linha = (id: string, ts: string, u: Record<string, unknown>, model = 'modelo-x') =>
  JSON.stringify({ type: 'assistant', timestamp: ts, requestId: 'r-' + id, message: { id, model, content: [{ type: 'text', text: 'CONTEUDO-SECRETO' }], usage: u } });

function projeto(): { raiz: string; transcritos: string } {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-custo-'));
  const t = join(raiz, 'transcritos');
  mkdirSync(join(t, 'sess1', 'subagents'), { recursive: true });
  // Sessao principal: a mesma resposta repetida em 2 linhas (um bloco cada) + outra resposta.
  const u1 = { input_tokens: 10, output_tokens: 100, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0 };
  writeFileSync(join(t, 'sess1.jsonl'), [linha('m1', '2026-11-13T10:00:00Z', u1), linha('m1', '2026-11-13T10:00:00Z', u1), linha('m2', '2026-11-13T11:00:00Z', { input_tokens: 1, output_tokens: 5 })].join('\n') + '\n');
  // Subagente ligado a P7.F1.T1, com cache criado detalhado.
  const cc = { input_tokens: 2, output_tokens: 50, cache_read_input_tokens: 500, cache_creation_input_tokens: 300, cache_creation: { ephemeral_5m_input_tokens: 100, ephemeral_1h_input_tokens: 200 } };
  writeFileSync(join(t, 'sess1', 'subagents', 'agent-a1.jsonl'), linha('s1', '2026-11-13T10:30:00Z', cc) + '\n');
  writeFileSync(join(t, 'sess1', 'subagents', 'agent-a1.meta.json'), JSON.stringify({ agentType: 'backend-java', description: 'P7.F1.T1 criar endpoint' }));
  // Subagente de outro plano e outro sem marca.
  writeFileSync(join(t, 'sess1', 'subagents', 'agent-a2.jsonl'), linha('s2', '2026-11-13T10:40:00Z', { input_tokens: 9, output_tokens: 9 }) + '\n');
  writeFileSync(join(t, 'sess1', 'subagents', 'agent-a2.meta.json'), JSON.stringify({ agentType: 'qa', description: 'P8.F1.T1 outro plano' }));
  return { raiz, transcritos: t };
}

const PRECOS = { moeda: 'BRL', precos: [
  { modelo: 'modelo-x', vigente_desde: '2026-01-01', por_milhao: { entrada: 1, saida: 10, cache_lido: 0.1, cache_criado_5m: 2, cache_criado_1h: 4 } },
  { modelo: 'modelo-x', vigente_desde: '2026-11-13', por_milhao: { entrada: 2, saida: 20, cache_lido: 0.2, cache_criado_5m: 4, cache_criado_1h: 8 } },
] };

test('tokensDoUso: cache criado detalhado, sem detalhe e valores ausentes', () => {
  assert.deepEqual(mod.tokensDoUso({ input_tokens: 1, cache_creation_input_tokens: 7 }), { entrada: 1, saida: 0, cache_lido: 0, cache_criado_5m: 7, cache_criado_1h: 0 });
  assert.equal(mod.tokensDoUso({ cache_creation: { ephemeral_5m_input_tokens: 1, ephemeral_1h_input_tokens: 2 } })!.cache_criado_1h, 2);
  assert.equal(mod.tokensDoUso(null), null);
});

test('lerRequisicoes deduplica por message.id e não devolve conteúdo', () => {
  const { raiz, transcritos } = projeto();
  try {
    const regs = mod.lerRequisicoes(join(transcritos, 'sess1.jsonl'));
    assert.equal(regs.length, 2);
    assert.equal(regs[0]!.tokens.saida, 100, 'a resposta repetida conta uma vez');
    assert.ok(!JSON.stringify(regs).includes('CONTEUDO-SECRETO'));
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('agregar liga o subagente à tarefa pelo description e separa planos', () => {
  const { raiz, transcritos } = projeto();
  try {
    const ag = mod.agregar(mod.coletar(transcritos), PRECOS, 7);
    assert.equal(ag.linhas.length, 1);
    assert.equal(ag.linhas[0]!.tarefa, 'P7.F1.T1');
    assert.equal(ag.total.tokens.cache_criado_1h, 200);
    assert.equal(ag.semTarefa.requisicoes, 2, 'sessão principal sem janela fica à parte');
    assert.equal(ag.total.tokens.saida, 50, 'nada do plano 8 nem da sessão principal');
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('--janela atribui o uso da sessão principal à tarefa', () => {
  const { raiz, transcritos } = projeto();
  try {
    const regs = mod.aplicarJanelas(mod.coletar(transcritos), [mod.lerJanela('P7.F1.T2=2026-11-13T09:00:00Z,2026-11-13T10:10:00Z')]);
    const ag = mod.agregar(regs, PRECOS, 7);
    assert.deepEqual(ag.linhas.map((l) => l.tarefa), ['P7.F1.T1', 'P7.F1.T2']);
    assert.equal(ag.linhas[1]!.tokens.saida, 100);
    assert.throws(() => mod.lerJanela('lixo'), /--janela invalida/);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('precificar escolhe a vigência pela data e calcula o valor', () => {
  const r = (ts: string) => ({ modelo: 'modelo-x', timestamp: ts, tokens: { entrada: 1e6, saida: 1e6, cache_lido: 0, cache_criado_5m: 0, cache_criado_1h: 0 } });
  assert.equal(mod.precificar(r('2026-06-01T00:00:00Z'), PRECOS).valor, 11);
  assert.equal(mod.precificar(r('2026-11-13T00:00:00Z'), PRECOS).valor, 22);
});

test('preço ausente: valor nulo, aviso e total parcial; nunca aborta', () => {
  const { raiz, transcritos } = projeto();
  try {
    assert.match(mod.precificar({ modelo: 'outro', timestamp: '2026-11-13T00:00:00Z', tokens: {} }, PRECOS).aviso!, /sem preço para outro em 2026-11-13/);
    assert.match(mod.precificar({ modelo: 'modelo-x', timestamp: '2025-01-01T00:00:00Z', tokens: {} }, PRECOS).aviso!, /sem preço/);
    const ag = mod.agregar(mod.coletar(transcritos), null, 7);
    assert.equal(ag.total.parcial, true);
    assert.equal(ag.total.tokens.saida, 50);
    assert.deepEqual(ag.avisos, ['sem preço para modelo-x em 2026-11-13']);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('main: resumo imprime tokens, valor e consultas ao fonte; --gravar escreve em docs/ai/custos', () => {
  const { raiz, transcritos } = projeto();
  try {
    mkdirSync(join(raiz, 'docs', 'ai', 'demands'), { recursive: true });
    writeFileSync(join(raiz, 'docs', 'ai', 'demands', 'P7.F1.DEM1-algo.md'), 'x');
    mkdirSync(join(raiz, '.ai', 'local'), { recursive: true });
    writeFileSync(join(raiz, '.ai', 'local', 'precos-de-modelo.json'), JSON.stringify(PRECOS));
    let out = ''; let err = '';
    const code = mod.main(['7', 'resumo', '--transcritos', transcritos, '--gravar'], { cwd: raiz, saida: (s) => (out += s), erro: (s) => (err += s) });
    assert.equal(code, 0);
    assert.match(out, /P7\.F1\.T1 \| backend-java \| modelo-x/);
    assert.match(out, /\| F1 \|.*\| 1 \|/, 'consultas ao fonte da fase');
    assert.match(out, /BRL/);
    assert.ok(!out.includes('CONTEUDO-SECRETO'));
    const gravado = err.match(/gravado: (.+)\n/)![1]!;
    assert.ok(existsSync(gravado) && gravado.includes('custos'));
    assert.equal(readFileSync(gravado, 'utf8'), out);
    assert.equal(mod.main(['x'], { cwd: raiz, saida: () => {}, erro: () => {} }), 2);
  } finally { rmSync(raiz, { recursive: true, force: true }); }
});

test('fmtTokens', () => {
  assert.equal(mod.fmtTokens(632), '632');
  assert.equal(mod.fmtTokens(73651), '74 mil');
  assert.equal(mod.fmtTokens(1200000), '1,2 M');
});
