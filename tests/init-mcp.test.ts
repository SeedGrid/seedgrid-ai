import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { after, afterEach, beforeEach, describe, test } from 'node:test';
import { EXIT_OK } from '../src/commands/common.js';
import { initCommand } from '../src/commands/init.js';
import { cleanupAll, tempProject } from './helpers.js';

after(cleanupAll);

const URL_MCP = 'https://components-mcp.seedgrid.com.br/mcp/all';
const ler = (p: string, f: string) => readFile(path.join(p, f), 'utf8');

describe('init: MCP de componentes no .mcp.json (Claude) e no .codex/config.toml (Codex)', () => {
  beforeEach(() => {
    delete process.env.SEEDGRID_AI_SKIP_MCP;
  });
  afterEach(() => {
    process.env.SEEDGRID_AI_SKIP_MCP = '1';
  });

  test('pasta nova: as duas ferramentas ficam com o seedgrid-components apontando para /mcp/all', async () => {
    const project = await tempProject();
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const mcp = JSON.parse(await ler(project, '.mcp.json'));
    assert.deepEqual(mcp.mcpServers['seedgrid-components'], { type: 'http', url: URL_MCP });
    const toml = await ler(project, '.codex/config.toml');
    assert.match(toml, /^\[mcp_servers\.seedgrid-components\]\r?\nurl = "https:\/\/components-mcp\.seedgrid\.com\.br\/mcp\/all"/m);
    assert.ok(res.lines.some((l) => l.includes('marque este projeto como confiável')));
    assert.match(await ler(project, 'AGENTS.md'), /passe sempre `platform`/);
    assert.match(await ler(project, 'CLAUDE.md'), /@AGENTS\.md|passe sempre `platform`/);
  });

  test('só claude: não cria .codex/config.toml; só codex: não cria .mcp.json', async () => {
    const c = await tempProject();
    await initCommand({ project: c, target: 'claude' });
    await assert.rejects(ler(c, '.codex/config.toml'));
    assert.ok(await ler(c, '.mcp.json'));
    const x = await tempProject();
    await initCommand({ project: x, target: 'codex' });
    await assert.rejects(ler(x, '.mcp.json'));
    assert.ok(await ler(x, '.codex/config.toml'));
  });

  test('aditivo: preserva as entradas do usuário e nunca sobrescreve a entrada de mesmo nome', async () => {
    const project = await tempProject();
    await writeFile(path.join(project, '.mcp.json'), JSON.stringify({ mcpServers: { outro: { type: 'http', url: 'https://x.test/mcp' }, 'seedgrid-components': { type: 'http', url: 'https://meu.host/mcp/react' } } }, null, 2));
    await mkdir(path.join(project, '.codex'), { recursive: true });
    await writeFile(path.join(project, '.codex/config.toml'), '[agents]\nenabled = true\n\n[mcp_servers.seedgrid-components]\nurl = "https://meu.host/mcp/flutter"\n');
    await initCommand({ project });
    const mcp = JSON.parse(await ler(project, '.mcp.json'));
    assert.equal(mcp.mcpServers.outro.url, 'https://x.test/mcp');
    assert.equal(mcp.mcpServers['seedgrid-components'].url, 'https://meu.host/mcp/react');
    const toml = await ler(project, '.codex/config.toml');
    assert.match(toml, /meu\.host\/mcp\/flutter/);
    assert.ok(!toml.includes('/mcp/all'));
    assert.match(toml, /\[agents\]\r?\nenabled = true/);
  });

  test('config existente sem a entrada: acrescenta no fim sem reescrever o resto', async () => {
    const project = await tempProject();
    await writeFile(path.join(project, '.mcp.json'), JSON.stringify({ mcpServers: { outro: { type: 'http', url: 'https://x.test/mcp' } } }));
    await mkdir(path.join(project, '.codex'), { recursive: true });
    await writeFile(path.join(project, '.codex/config.toml'), '[agents]\nenabled = true\n');
    await initCommand({ project });
    const mcp = JSON.parse(await ler(project, '.mcp.json'));
    assert.deepEqual(Object.keys(mcp.mcpServers).sort(), ['outro', 'seedgrid-components']);
    const toml = await ler(project, '.codex/config.toml');
    assert.ok(toml.startsWith('[agents]\nenabled = true\n'));
    assert.match(toml, /\[mcp_servers\.seedgrid-components\]\nurl = /);
  });

  test('.mcp.json inválido não é tocado e a instalação conclui com aviso', async () => {
    const project = await tempProject();
    await writeFile(path.join(project, '.mcp.json'), '{ isto não é json');
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK);
    assert.equal(await ler(project, '.mcp.json'), '{ isto não é json');
    assert.ok(res.lines.some((l) => l.includes('.mcp.json inválido')));
  });

  test('segunda execução não altera nada', async () => {
    const project = await tempProject();
    await initCommand({ project });
    const a = [await ler(project, '.mcp.json'), await ler(project, '.codex/config.toml')];
    await initCommand({ project });
    assert.deepEqual([await ler(project, '.mcp.json'), await ler(project, '.codex/config.toml')], a);
  });
});
