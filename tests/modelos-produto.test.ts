import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';

const DIR = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product/assets');
const render = (await import(pathToFileURL(join(DIR, 'render.mjs')).href)) as {
  renderProduto: (p: unknown) => Record<string, string>;
  renderTemplate: (t: string, v: Record<string, unknown>) => string;
};
const produto = JSON.parse(readFileSync(join(DIR, 'exemplo/produto.json'), 'utf8')) as {
  servicos: { nome: string; tipo: string; porta: number }[];
};
const saida = render.renderProduto(produto);

test('gera um Dockerfile por servico e o workflow', () => {
  assert.deepEqual(Object.keys(saida).sort(), [
    '.github/workflows/publicar.yml',
    'admin/Dockerfile',
    'backend/Dockerfile',
    'frontend/Dockerfile',
  ]);
});

test('nenhum placeholder sobrando nem segredo fixo', () => {
  for (const [caminho, texto] of Object.entries(saida)) {
    const sobra = texto.replace(/\$\{\{[^}]*\}\}/g, '').match(/\{\{.*?\}\}/);
    assert.equal(sobra, null, `${caminho} tem placeholder: ${sobra?.[0]}`);
    assert.doesNotMatch(texto, /BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20}|password\s*[:=]\s*[^$\s"]/i, caminho);
  }
});

test('Dockerfiles: FROM, EXPOSE, porta e CMD corretos', () => {
  for (const s of produto.servicos) {
    const d = saida[`${s.nome}/Dockerfile`]!;
    assert.match(d, /^FROM .+ AS build$/m);
    assert.match(d, /^FROM .+ AS runtime$/m);
    assert.match(d, new RegExp(`^EXPOSE ${s.porta}$`, 'm'));
    if (s.tipo === 'backend') {
      assert.match(d, new RegExp(`QUARKUS_HTTP_PORT=${s.porta}`));
      assert.match(d, /^CMD \["sh", "-c", "exec java \$JAVA_OPTS -jar quarkus-run\.jar"\]$/m);
    } else {
      assert.match(d, new RegExp(`PORT=${s.porta}`));
      assert.match(d, /^CMD \["node", "server\.js"\]$/m);
    }
  }
  assert.match(saida['admin/Dockerfile']!, /npm ci/);
  assert.match(saida['frontend/Dockerfile']!, /npm install/);
});

test('workflow parseia como YAML e tem um job por servico com secrets por expressao', () => {
  const wf = parse(saida['.github/workflows/publicar.yml']!) as {
    on: unknown;
    jobs: Record<string, { needs?: string; steps: { run?: string }[] }>;
  };
  assert.ok(wf.on);
  const nomes = produto.servicos.map((s) => `publicar-${s.nome}`);
  assert.deepEqual(Object.keys(wf.jobs).sort(), ['segredos', 'versao', ...nomes].sort());
  assert.equal(wf.jobs.versao!.needs, 'segredos', 'nada e publicado antes da conferencia de segredos');
  assert.ok(wf.jobs.segredos!.steps.some((x) => (x.run ?? '').includes('sg-check-secrets/scripts/check-secrets.mjs')));
  for (const s of produto.servicos) {
    const job = wf.jobs[`publicar-${s.nome}`]!;
    assert.equal(job.needs, 'versao');
    const run = job.steps.map((x) => x.run ?? '').join('\n');
    assert.ok(run.includes(`\${{ secrets.EASYPANEL_WEBHOOK_${s.nome.toUpperCase()} }}`));
  }
  const texto = saida['.github/workflows/publicar.yml']!;
  assert.match(texto, /\$\{\{ secrets\.REGISTRY_TOKEN \}\}/);
  assert.match(texto, /registry: ghcr\.io$/m);
});

test('renderizador: placeholder desconhecido e produto invalido sao recusados', () => {
  assert.throws(() => render.renderTemplate('x {{faltando}}', {}), /faltando/);
  assert.equal(render.renderTemplate('${{ secrets.X }} {{a}}', { a: '1' }), '${{ secrets.X }} 1');
  assert.throws(() => render.renderProduto({ ...produto, servicos: [{ nome: 'a', tipo: 'x', porta: 1 }] }), /tipo invalido/);
});

test('CLI render.mjs grava os arquivos', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'modelos-'));
  try {
    execFileSync(process.execPath, [join(DIR, 'render.mjs'), join(DIR, 'exemplo/produto.json'), tmp]);
    assert.ok(readdirSync(tmp).includes('backend'));
    writeFileSync(join(tmp, 'ok'), '');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
