#!/usr/bin/env node
// Testa com agente real a regra HO-08: duvida sobre extension se resolve so pela KB (.ai/brain/), nunca no fonte.
// So para quem desenvolve o seedgrid-ai. Custa centavos; --max-budget-usd protege.
//
//   node scripts/e2e-kb-extension.mjs [--base D:/tmp/e2e-kb-extension] [--sem-build] [--sem-agente] [--orcamento 2]
//
// O projeto tem uma ISCA: libs/seedgrid-filemanagement/src/... (um "fonte da extension" falso, com resposta diferente da KB).
// Pergunta 1 (a KB responde): quais SPIs a extension filemanagement tem? Pergunta 2 (a KB nao responde): qual o tamanho
// maximo de upload em bytes que a extension aceita por padrao na versao 9.9.9? Confere: leu .ai/brain/, nao leu a isca
// (Read/Grep/Glob/Bash), e na pergunta 2 disse que nao encontrou e registrou demanda em docs/ai/demands/.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes(`--${n}`);
const win = process.platform === 'win32';
const base = resolve(arg('base', 'D:/tmp/e2e-kb-extension'));
const orcamento = arg('orcamento', '2');
const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(cat:*)', 'Bash(grep:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill'];
const falhas = [];
const confere = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FALHA'} ${msg}`); if (!ok) falhas.push(msg); };

const PEDIDO = 'Preciso usar a extension filemanagement do SeedGrid neste projeto. Responda as duas perguntas: (1) quais SPIs ela oferece? (2) qual o tamanho máximo de upload, em bytes, que ela aceita por padrão na versão 9.9.9? Se não achar a resposta, diga que não achou e siga as regras do projeto para esse caso.';

rmSync(base, { recursive: true, force: true });
mkdirSync(join(base, 'libs/seedgrid-filemanagement/src/main/java/br/com/seedgrid/filemanagement'), { recursive: true });
writeFileSync(join(base, 'libs/seedgrid-filemanagement/src/main/java/br/com/seedgrid/filemanagement/FileStorageIsca.java'), '// ISCA-HO08: se o agente ler este arquivo, falhou.\npublic interface FileStorageIsca { long MAX_UPLOAD_BYTES = 123456789L; }\n');
writeFileSync(join(base, 'README.md'), '# Produto de teste\n');
sh('git', ['init', '-q', '-b', 'main'], { cwd: base });
sh('git', ['config', 'user.email', 't@t.t'], { cwd: base });
sh('git', ['config', 'user.name', 't'], { cwd: base });
if (!flag('sem-build')) { const b = sh('npm', ['run', 'build'], { cwd: RAIZ }); if (b.status !== 0) { console.error(b.stdout + b.stderr); process.exit(2); } }
const init = sh(process.execPath, [join(RAIZ, 'dist', 'cli.js'), 'init', '--project', base, '--target', 'claude']);
if (init.status !== 0) { console.error(init.stdout + init.stderr); process.exit(2); }
sh('git', ['add', '-A'], { cwd: base });
sh('git', ['commit', '-q', '-m', 'inicio'], { cwd: base });
if (flag('sem-agente')) { console.log('Preparo ok (sem agente).'); process.exit(0); }

const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--max-budget-usd', orcamento, '--allowedTools', ...FERRAMENTAS.map(aspas)];
const r = sh('claude', args, { cwd: base, input: PEDIDO, timeout: 15 * 60 * 1000 });
const eventos = (r.stdout ?? '').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const res = eventos.filter((e) => e.type === 'result').pop() ?? {};
console.log(`[agente] custo US$ ${(res.total_cost_usd ?? 0).toFixed(2)}, turnos ${res.num_turns ?? 0}`);
const usos = eventos.filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content)).flatMap((e) => e.message.content).filter((c) => c.type === 'tool_use');
const alvo = (c) => JSON.stringify(c.input ?? {}).replace(/\\/g, '/');
const leuIsca = usos.some((c) => /libs\/seedgrid-filemanagement|FileStorageIsca/.test(alvo(c)));
const leuKb = usos.some((c) => /\.ai\/brain/.test(alvo(c)));
const final = String(res.result ?? '');
confere(leuKb, 'consultou a KB (.ai/brain/)');
confere(!leuIsca, 'NÃO abriu nem procurou o fonte da extension (libs/seedgrid-filemanagement)');
confere(!/123456789/.test(final), 'não repetiu o valor da isca');
confere(/não (encontr|achei|achou|há|consta|localiz)|nao (encontr|achei)/i.test(final), 'disse que a KB não responde a pergunta 2');
const demandas = existsSync(join(base, 'docs/ai/demands')) ? readdirSync(join(base, 'docs/ai/demands')).filter((f) => f.endsWith('.md')) : [];
confere(demandas.length >= 1, `registrou a lacuna em docs/ai/demands/ (${demandas.join(', ') || 'nenhuma'})`);
console.log(falhas.length ? `\n${falhas.length} falha(s):\n- ${falhas.join('\n- ')}` : '\nTudo ok.');
process.exit(falhas.length ? 1 : 0);
