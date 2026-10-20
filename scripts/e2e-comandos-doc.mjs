#!/usr/bin/env node
// Gera comandos.md a partir dos turno-NN.prompt.txt / turno-NN.json que o E2E grava: o registro de cada chamada ao claude -p.
// Uso: node scripts/e2e-comandos-doc.mjs <pasta-de-saida-do-e2e>
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '');
if (!process.argv[2] || !existsSync(dir)) { console.error('uso: node scripts/e2e-comandos-doc.mjs <pasta-de-saida-do-e2e>'); process.exit(2); }
const FERRAMENTAS = 'Bash(node:*) Bash(git:*) Bash(ls:*) Bash(mkdir:*) Bash(cat:*) Read Write Edit Glob Grep Skill';
const turnos = readdirSync(dir).filter((f) => /^turno-\d+\.prompt\.txt$/.test(f)).sort();
let total = 0;
const partes = [`# Chamadas ao claude -p do E2E\n\nPasta: \`${dir}\`. Cada turno roda na pasta do produto; o prompt entra por stdin.\n`];
for (const f of turnos) {
  const base = f.replace('.prompt.txt', '');
  const n = Number(base.slice(6));
  const prompt = readFileSync(join(dir, f), 'utf8');
  let j = null;
  try { j = JSON.parse(readFileSync(join(dir, `${base}.json`), 'utf8')); } catch { /* turno em andamento ou invalido */ }
  const resume = n > 0 && j?.session_id ? ` --resume ${j.session_id}` : n > 0 ? ' --resume <sessao>' : '';
  total += j?.total_cost_usd ?? 0;
  partes.push(`## Turno ${n}\n\n\`\`\`\nclaude -p --output-format json --permission-mode acceptEdits --allowedTools ${FERRAMENTAS}${resume}\n\`\`\`\n`);
  partes.push(`**Prompt (stdin):**\n\n> ${prompt.trim().replace(/\n/g, '\n> ')}\n`);
  if (j) {
    partes.push(`**Resposta:**\n\n${String(j.result ?? '').trim().replace(/\n/g, '\n')}\n`);
    const den = (j.permission_denials ?? []).length;
    partes.push(`_Custo US$ ${(j.total_cost_usd ?? 0).toFixed(4)} · ${j.num_turns ?? '?'} turno(s) internos · ${((j.duration_ms ?? 0) / 1000).toFixed(1)} s · permissões negadas: ${den}_\n`);
  } else partes.push('_(sem resposta registrada ainda)_\n');
}
partes.push(`---\nTotal até aqui: US$ ${total.toFixed(4)} em ${turnos.length} chamada(s).\n`);
writeFileSync(join(dir, 'comandos.md'), partes.join('\n'));
console.log(`comandos.md: ${turnos.length} chamada(s), US$ ${total.toFixed(4)}`);
