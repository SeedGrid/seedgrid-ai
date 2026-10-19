import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { initCommand } from '../src/commands/init.js';
import { bundledContentDir } from '../src/core/env.js';
import { cleanupAll, readText, tempProject } from './helpers.js';

after(cleanupAll);

describe('limites do host (T1.4)', () => {
  test('a regra está no manifesto e é instalada pelo init', async () => {
    const manifest = JSON.parse(await readFile(path.join(bundledContentDir(), 'manifest.json'), 'utf8'));
    const rules = manifest.components.find((c: any) => c.id === 'rules').files as string[];
    assert.ok(rules.includes('rules/limites-do-host.md'));
    const project = await tempProject();
    await initCommand({ project });
    assert.match(await readText(project, '.ai/rules/limites-do-host.md'), /HO-08/);
  });

  test('o AGENTS.md gerado diz que a sessão principal é o coordenador e que o host não altera extension', async () => {
    const project = await tempProject();
    await initCommand({ project });
    const agents = await readText(project, 'AGENTS.md');
    assert.match(agents, /sessão principal é o coordenador/);
    assert.match(agents, /nunca altera extension da plataforma/);
  });

  test('o sg-review checa HO-08/HO-09', async () => {
    const project = await tempProject();
    await initCommand({ project });
    const skill = await readText(project, '.claude/skills/sg-review/SKILL.md');
    assert.match(skill, /HO-08\/HO-09/);
    assert.match(skill, /seedgrid-platform-work/);
  });
});
