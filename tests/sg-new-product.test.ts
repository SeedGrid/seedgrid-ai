import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { initCommand } from '../src/commands/init.js';
import { bundledContentDir } from '../src/core/env.js';
import { cleanupAll, readText, tempProject } from './helpers.js';

after(cleanupAll);

const RESPOSTAS = {
  nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal', modelo: 'login-tenancy-b2b', extensoes: [],
  selfEnter: 'nao', auditoria: 'postgres', armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem', apikeysUso: 'Integracoes', billingProvider: 'stripe', trialDias: 14,
  planos: 'Basico,Pro', dominioFront: 'app.acme.com.br', dominioAdmin: 'admin.acme.com.br', emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br',
};

async function* arquivos(dir: string): AsyncGenerator<string> {
  for (const nome of (await readdir(dir)).sort()) {
    const p = path.join(dir, nome);
    if ((await stat(p)).isDirectory()) yield* arquivos(p);
    else yield p;
  }
}

describe('skill sg-new-product (T2.3)', () => {
  test('está no manifesto com todos os arquivos que a skill usa', async () => {
    const manifest = JSON.parse(await readFile(path.join(bundledContentDir(), 'manifest.json'), 'utf8'));
    const comp = manifest.components.find((c: any) => c.id === 'skill:sg-new-product');
    assert.ok(comp, 'skill:sg-new-product no manifesto');
    for (const f of ['SKILL.md', 'data/matriz-produto.json', 'data/catalogo.json', 'data/matriz-produto.schema.json', 'scripts/matriz.mjs', 'scripts/scaffold-produto.mjs', 'assets/render.mjs', 'assets/workflow.yml.tpl']) {
      assert.ok(comp.files.includes(f), f);
    }
  });

  test('a descrição permite descobrir a skill e o nome bate com a pasta', async () => {
    const skill = await readFile(path.join(bundledContentDir(), 'SeedGrid/Toolkit/skills/sg-new-product/SKILL.md'), 'utf8');
    assert.match(skill, /^---\r?\nname: sg-new-product\r?\n/);
    const descricao = /description: (.+)/.exec(skill)![1]!;
    for (const termo of ['produto novo', 'projeto novo', 'matriz']) assert.ok(descricao.toLowerCase().includes(termo), termo);
  });

  test('nenhum arquivo da skill referencia o work da plataforma, nem caminho fora da pasta do produto', async () => {
    const base = path.join(bundledContentDir(), 'SeedGrid/Toolkit/skills/sg-new-product');
    for await (const f of arquivos(base)) {
      const texto = await readFile(f, 'utf8');
      const rel = path.relative(base, f);
      assert.doesNotMatch(texto, /seedgrid-platform|seedgrid-ia-dev|seedgridKB-dev/i, rel);
      assert.doesNotMatch(texto, /[A-Za-z]:\\\\|\/Users\/|\/home\//, rel);
    }
    const skill = await readFile(path.join(base, 'SKILL.md'), 'utf8');
    for (const m of skill.matchAll(/`((?:\.\.\/|\/)[^`\s]*)`/g)) assert.fail(`caminho fora do produto na SKILL.md: ${m[1]}`);
  });

  test('coordenação, arquiteto e AGENTS.md apontam para a skill antes do arquiteto', async () => {
    const project = await tempProject();
    await initCommand({ project });
    assert.match(await readText(project, '.ai/rules/coordenacao.md'), /sg-new-product.*antes.*arquiteto/s);
    assert.match(await readText(project, '.ai/agents/arquiteto.md'), /sg-new-product/);
    assert.match(await readText(project, 'AGENTS.md'), /PRIMEIRA ação é invocar a skill `sg-new-product`/);
  });

  test('fluxo completo no produto instalado: init, script da skill e pasta pronta', async () => {
    const project = await tempProject();
    await initCommand({ project });
    const skillDir = path.join(project, '.ai/skills/sg-new-product');
    for (const f of ['SKILL.md', 'data/matriz-produto.json', 'scripts/scaffold-produto.mjs', 'assets/render.mjs']) assert.ok(existsSync(path.join(skillDir, f)), f);
    assert.ok(existsSync(path.join(project, '.ai/boilerplates/login-tenancy-b2b/backend/pom.xml')));
    await mkdir(path.join(project, 'docs/ai/plans'), { recursive: true });
    const respostas = path.join(project, 'docs/ai/plans/respostas-produto.json');
    await writeFile(respostas, JSON.stringify(RESPOSTAS));
    const r = spawnSync(process.execPath, [path.join(skillDir, 'scripts/scaffold-produto.mjs'), '--respostas', respostas], { cwd: project, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /Produto criado/);
    for (const f of ['produto.json', 'backend/pom.xml', 'backend/dev.env', 'docker-compose.yml', '.github/workflows/publicar.yml', 'docs/ai/handoffs/.gitkeep']) assert.ok(existsSync(path.join(project, f)), f);
    // segunda execução é recusada e não mexe em nada
    const de_novo = spawnSync(process.execPath, [path.join(skillDir, 'scripts/scaffold-produto.mjs'), '--respostas', respostas], { cwd: project, encoding: 'utf8' });
    assert.equal(de_novo.status, 1);
    assert.match(de_novo.stderr, /produto\.json ja existe/);
  });

  test('o script recusa resposta fora da matriz, imprime o motivo e não grava nada', async () => {
    const project = await tempProject();
    await initCommand({ project });
    const respostas = path.join(project, 'respostas.json');
    await writeFile(respostas, JSON.stringify({ ...RESPOSTAS, modelo: 'login-tenancy-b2c' }));
    const r = spawnSync(process.execPath, [path.join(project, '.ai/skills/sg-new-product/scripts/scaffold-produto.mjs'), '--respostas', respostas], { cwd: project, encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /indisponivel/);
    assert.ok(!existsSync(path.join(project, 'produto.json')));
    assert.ok(!existsSync(path.join(project, 'backend')));
  });
});
