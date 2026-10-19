import assert from 'node:assert/strict';
import { readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { EXIT_CONFLICT, EXIT_OK } from '../src/commands/common.js';
import { initCommand } from '../src/commands/init.js';
import { removeCommand } from '../src/commands/remove.js';
import { updateCommand } from '../src/commands/update.js';
import { bundledContentDir } from '../src/core/env.js';
import { forbiddenBoilerplateFile, loadContent } from '../src/core/content.js';
import { ToolkitError } from '../src/core/types.js';
import { TK, cleanupAll, copyContent, editManifest, readText, snapshot, tempProject, writeText } from './helpers.js';

after(cleanupAll);

const MODELS = ['login-tenancy', 'subdomain-tenancy'];
const BP = TK + 'boilerplates/';

async function expectInvalid(dir: string, pattern: RegExp) {
  await assert.rejects(loadContent(dir), (err: unknown) => {
    assert.ok(err instanceof ToolkitError);
    assert.ok(err.details.some((d) => pattern.test(d)), `esperava erro ${pattern}, obtive:\n${err.details.join('\n')}`);
    return true;
  });
}

async function walk(dir: string, prefix = ''): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), rel)));
    else out.push(rel);
  }
  return out;
}

describe('componente boilerplates (conteúdo)', () => {
  test('o pacote declara os dois modelos e carrega todos os arquivos', async () => {
    const bundle = await loadContent(bundledContentDir());
    assert.ok(bundle.boilerplates);
    assert.deepEqual(bundle.boilerplates.names, MODELS);
    assert.ok(bundle.boilerplates.files > 500);
    const bp = bundle.shared.filter((s) => s.type === 'boilerplates');
    assert.equal(bp.length, bundle.boilerplates.files);
    for (const m of MODELS) {
      assert.ok(bp.some((s) => s.path === `boilerplates/${m}/backend/pom.xml`), `${m}: backend/pom.xml`);
      assert.ok(bp.some((s) => s.path === `boilerplates/${m}/frontend/package.json`), `${m}: frontend/package.json`);
      assert.ok(bp.some((s) => s.path === `boilerplates/${m}/admin/package.json`), `${m}: admin/package.json`);
    }
  });

  test('o tamanho da cópia fica abaixo de 10 MB (cópia direta, sem .tgz)', async () => {
    const bundle = await loadContent(bundledContentDir());
    assert.ok(bundle.boilerplates!.bytes < 10 * 1024 * 1024, `${bundle.boilerplates!.bytes} bytes`);
  });

  test('não há arquivo de ambiente, chave, backup, node_modules nem target na cópia', async () => {
    const root = path.join(bundledContentDir(), ...BP.split('/'));
    const files = await walk(root);
    assert.ok(files.length > 500);
    const examples = files.filter((f) => /\.(example|sample|template)$/.test(f));
    assert.ok(examples.some((f) => f.endsWith('dev.env.example')));
    for (const f of files) {
      const segs = f.split('/');
      const name = segs[segs.length - 1]!;
      assert.equal(forbiddenBoilerplateFile(name), null, `arquivo proibido: ${f}`);
      const bare = name.replace(/\.(example|sample|template)$/, '');
      if (bare === name) assert.ok(!/(^|[._-])env$/i.test(name) && !/^\.env(\.|$)/i.test(name), `arquivo de ambiente: ${f}`);
      assert.ok(!/\.(pem|key|p12|pfx|jks|keystore|bak|orig|old)$/i.test(name), `chave ou backup: ${f}`);
      for (const bad of ['node_modules', 'target', '.git', 'infra', 'chave-mvn-central']) assert.ok(!segs.includes(bad), `pasta proibida: ${f}`);
      assert.ok(!['.gitignore', '.gitattributes', '.npmignore'].includes(name), `o npm descarta ${f}; use .template`);
    }
  });

  test('forbiddenBoilerplateFile separa ambiente real de modelo', () => {
    for (const bad of ['dev.env', '_dev.env', '.env', '.env.local', '.env.production', 'app.env', 'dev.env.bak', 'a.pem', 'prd_private.pem', 'x.key', 'notas.old', 'arq~', '.gitignore', '.gitattributes']) {
      assert.notEqual(forbiddenBoilerplateFile(bad), null, bad);
    }
    for (const ok of ['dev.env.example', '.env.example', '.env.sample', 'env.template', 'next-env.d.ts', 'environment.ts', 'application.properties', '.gitignore.template', 'logo.png.b64', 'Dockerfile', '.dockerignore']) {
      assert.equal(forbiddenBoilerplateFile(ok), null, ok);
    }
    assert.notEqual(forbiddenBoilerplateFile('a.pem.example'), null);
  });

  test('a fonte é recusada se levar _dev.env, .bak, node_modules ou pasta fora de names', async () => {
    for (const [rel, re] of [
      ['login-tenancy/backend/_dev.env', /_dev\.env não pode entrar/],
      ['login-tenancy/backend/dev.env.bak', /dev\.env\.bak não pode entrar/],
      ['login-tenancy/backend/chaves/private.pem', /private\.pem não pode entrar/],
      ['login-tenancy/frontend/node_modules/x/index.js', /pasta proibida/],
      ['login-tenancy/.gitignore', /\.gitignore não pode entrar/],
    ] as const) {
      const src = await copyContent();
      await writeText(src, BP + rel, 'X=1\n');
      await expectInvalid(src, re);
    }
    const src = await copyContent();
    await writeText(src, BP + 'outro-modelo/README.md', 'x\n');
    await expectInvalid(src, /sem entrada em names/);
  });

  test('a fonte é recusada se levar chave real (a cópia passa pelo detector de segredos)', async () => {
    const src = await copyContent();
    await writeText(src, BP + 'login-tenancy/backend/notas.txt', `chave: ${'sk_live_'}${'abcdefghijklmnop1234'}\n`);
    await expectInvalid(src, /parece conter chave Stripe/);
  });

  test('manifesto: names inválido, repetido ou modelo sem arquivos', async () => {
    let src = await copyContent();
    await editManifest(src, (m) => {
      m.components.find((c: { type: string }) => c.type === 'boilerplates').names = [];
    });
    await expectInvalid(src, /names deve ser uma lista/);
    src = await copyContent();
    await editManifest(src, (m) => {
      m.components.find((c: { type: string }) => c.type === 'boilerplates').names.push('login-tenancy');
    });
    await expectInvalid(src, /sem repetição/);
    src = await copyContent();
    await editManifest(src, (m) => {
      m.components.find((c: { type: string }) => c.type === 'boilerplates').names.push('fantasma');
    });
    await expectInvalid(src, /boilerplate sem arquivos: boilerplates\/fantasma/);
    src = await copyContent();
    await editManifest(src, (m) => {
      m.components.push({ id: 'boilerplates-2', type: 'boilerplates', names: ['login-tenancy'] });
    });
    await expectInvalid(src, /só pode haver um componente boilerplates/);
  });
});

describe('boilerplates no init, update e remove', () => {
  test('init em pasta vazia cria .ai/boilerplates/<modelo> e registra no lock', async () => {
    const project = await tempProject();
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project);
    for (const m of MODELS) {
      assert.ok(files[`.ai/boilerplates/${m}/backend/pom.xml`], m);
      assert.ok(files[`.ai/boilerplates/${m}/backend/dev.env.example`], m);
      assert.ok(files[`.ai/boilerplates/${m}/.gitignore.template`], m);
    }
    // A saída resume os modelos em uma linha, não uma linha por arquivo.
    assert.ok(res.lines.some((l) => /\.ai\/boilerplates\/login-tenancy\/ \(\d+ arquivo/.test(l)));
    assert.ok(!res.lines.some((l) => /\.ai\/boilerplates\/[^/]+\/\S+\/\S+/.test(l)), 'uma linha por arquivo do modelo');
    const lock = JSON.parse(await readText(project, '.ai/toolkit-lock.json'));
    assert.ok(lock.files.some((f: { component: string }) => f.component === 'boilerplates'));
    // Nenhum .gitignore/.env vivo dentro do projeto por causa dos modelos.
    for (const rel of Object.keys(files).filter((k) => k.startsWith('.ai/boilerplates/'))) {
      const name = rel.split('/').pop()!;
      assert.ok(!/^(\.gitignore|\.gitattributes|\.env|\.env\.(local|development|production)|dev\.env|_dev\.env)$/.test(name), rel);
    }
  });

  test('update repetido não altera nada, nem a pasta de um produto já criada a partir do modelo', async () => {
    const project = await tempProject();
    assert.equal((await initCommand({ project })).exitCode, EXIT_OK);
    // O produto nasce copiando o modelo para fora de .ai/ e depois evolui por conta própria.
    await writeText(project, 'backend/pom.xml', '<project>do produto</project>\n');
    await writeText(project, 'frontend/package.json', '{"name":"produto"}\n');
    await writeText(project, 'admin/src/pagina.tsx', 'export default 1;\n');
    await writeText(project, 'dev.env', 'X=segredo-do-produto\n');
    const before = await snapshot(project, { ignoreBackups: true });
    for (let i = 0; i < 2; i++) {
      const res = await updateCommand({ project });
      assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    }
    assert.deepEqual(await snapshot(project, { ignoreBackups: true }), before);
  });

  test('update com modelo novo troca só .ai/boilerplates e deixa a cópia do produto intacta', async () => {
    const project = await tempProject();
    const source = await copyContent();
    assert.equal((await initCommand({ project, source })).exitCode, EXIT_OK);
    await writeText(project, 'backend/pom.xml', '<project>do produto</project>\n');
    const productBefore = await readText(project, 'backend/pom.xml');
    const model = BP + 'login-tenancy/backend/pom.xml';
    await writeText(source, model, `${await readText(source, model)}<!-- v2 -->\n`);
    await writeText(source, BP + 'login-tenancy/backend/NOVO.md', 'novo\n');
    await rm(path.join(source, ...(BP + 'subdomain-tenancy/backend/run.sh').split('/')));
    await editManifest(source, (m) => {
      m.contentVersion = '0.5.1';
    });
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    assert.ok((await readText(project, '.ai/boilerplates/login-tenancy/backend/pom.xml')).endsWith('<!-- v2 -->\n'));
    assert.equal(await readText(project, '.ai/boilerplates/login-tenancy/backend/NOVO.md'), 'novo\n');
    const after = await snapshot(project);
    assert.ok(!('.ai/boilerplates/subdomain-tenancy/backend/run.sh' in after), 'arquivo removido do modelo some da cópia gerenciada');
    assert.equal(await readText(project, 'backend/pom.xml'), productBefore);
  });

  test('copia gerenciada editada à mão gera conflito (o update não a sobrescreve)', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await initCommand({ project, source });
    const rel = '.ai/boilerplates/login-tenancy/backend/pom.xml';
    await writeFile(path.join(project, ...rel.split('/')), 'editado\n');
    const model = BP + 'login-tenancy/backend/pom.xml';
    await writeText(source, model, `${await readText(source, model)}<!-- v2 -->\n`);
    await editManifest(source, (m) => {
      m.contentVersion = '0.5.1';
    });
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.equal(await readText(project, rel), 'editado\n');
  });

  test('remove retira o que o init instalou, inclusive .ai/boilerplates', async () => {
    const project = await tempProject();
    assert.equal((await initCommand({ project })).exitCode, EXIT_OK);
    await writeText(project, 'backend/pom.xml', '<project>do produto</project>\n');
    const res = await removeCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const left = Object.keys(await snapshot(project, { ignoreBackups: true }));
    assert.deepEqual(left.filter((k) => k.startsWith('.ai/')), []);
    assert.deepEqual(left, ['backend/pom.xml']);
  });
});
