import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { loadContent } from '../src/core/content.js';
import { bundledContentDir } from '../src/core/env.js';
import { ToolkitError } from '../src/core/types.js';
import { TK, cleanupAll, copyContent, editManifest, readText, writeText } from './helpers.js';

after(cleanupAll);

async function expectInvalid(dir: string, pattern: RegExp) {
  await assert.rejects(loadContent(dir), (err: unknown) => {
    assert.ok(err instanceof ToolkitError);
    assert.ok(
      err.details.some((d) => pattern.test(d)),
      `esperava erro ${pattern}, obtive:\n${err.details.join('\n')}`,
    );
    return true;
  });
}

test('o conteúdo empacotado é válido', async () => {
  const bundle = await loadContent(bundledContentDir());
  assert.deepEqual(
    bundle.agents.map((a) => a.id),
    ['arquiteto', 'backend-java', 'backend-rust', 'frontend-react', 'qa', 'revisor'],
  );
  assert.deepEqual(
    bundle.skills.map((s) => s.name),
    ['sg-adr', 'sg-branch-status', 'sg-bump', 'sg-code-review', 'sg-componente', 'sg-crud-back', 'sg-crud-front', 'sg-new-screen', 'sg-new-skill', 'sg-plan-change', 'sg-plan-goal', 'sg-review', 'sg-validate-change'],
  );
  for (const s of bundle.skills) assert.ok(s.description.length > 20);
});

test('rules, templates e references exigem description no frontmatter', async () => {
  const dir = await copyContent();
  const p = TK + 'rules/formato-entrega.md';
  await writeText(dir, p, (await readText(dir, p)).replace(/^---[\s\S]*?---\r?\n/, ''));
  await expectInvalid(dir, /rules\/formato-entrega\.md: .*frontmatter/);
});

test('index.md das pastas é gerado e não pode constar no manifesto', async () => {
  const dir = await copyContent();
  await writeText(dir, TK + 'rules/index.md', '---\ndescription: x\n---\n# x\n');
  await editManifest(dir, (m) => {
    m.components.find((c: { type: string }) => c.type === 'rules').files.push('rules/index.md');
  });
  await expectInvalid(dir, /rules\/index\.md é gerado automaticamente/);
});

test('rejeita nome de skill inválido', async () => {
  const dir = await copyContent();
  await editManifest(dir, (m) => {
    m.components.push({ id: 'skill:Invalida', type: 'skill', name: 'Invalida', files: ['SKILL.md'] });
  });
  await expectInvalid(dir, /nome de skill inválido/);
});

test('rejeita name do SKILL.md diferente da pasta', async () => {
  const dir = await copyContent();
  const p = TK + 'skills/sg-code-review/SKILL.md';
  await writeText(dir, p, (await readText(dir, p)).replace('name: sg-code-review', 'name: outro-nome'));
  await expectInvalid(dir, /igual à pasta/);
});

test('rejeita id de papel duplicado ou que não corresponde ao arquivo', async () => {
  const dir = await copyContent();
  const p = TK + 'agents/revisor.md';
  await writeText(dir, p, (await readText(dir, p)).replace('id: revisor', 'id: qa'));
  await expectInvalid(dir, /nome do arquivo deve ser qa\.md/);
});

test('rejeita referência quebrada em skill', async () => {
  const dir = await copyContent();
  const p = TK + 'skills/sg-code-review/SKILL.md';
  await writeText(dir, p, `${await readText(dir, p)}\nVeja [inexistente](references/nao-existe.md).\n`);
  await expectInvalid(dir, /referência quebrada .*nao-existe\.md/);
});

test('rejeita referência quebrada entre regras', async () => {
  const dir = await copyContent();
  const p = TK + 'rules/coordenacao.md';
  await writeText(dir, p, `${await readText(dir, p)}\n[x](../templates/sumiu.md)\n`);
  await expectInvalid(dir, /referência quebrada .*sumiu\.md/);
});

test('rejeita preferred_skills inexistente', async () => {
  const dir = await copyContent();
  const p = TK + 'agents/revisor.md';
  await writeText(dir, p, (await readText(dir, p)).replace('[sg-code-review, sg-review]', '[skill-fantasma]'));
  await expectInvalid(dir, /skill inexistente "skill-fantasma"/);
});

test('rejeita arquivo fora do manifesto e caminho que escapa da fonte', async () => {
  const dir = await copyContent();
  await writeText(dir, TK + 'rules/esquecido.md', '# esquecido\n');
  await expectInvalid(dir, /não listado no manifesto: rules\/esquecido\.md/);

  const dir2 = await copyContent();
  await editManifest(dir2, (m) => {
    m.components[1].files.push('rules/../../fora.md');
  });
  await expectInvalid(dir2, /arquivo inválido/);
});

test('rejeita campo de frontmatter não portável na skill e modelo fixo no papel', async () => {
  const dir = await copyContent();
  const p = TK + 'skills/sg-validate-change/SKILL.md';
  await writeText(dir, p, (await readText(dir, p)).replace('metadata:', 'context: fork\nmetadata:'));
  await expectInvalid(dir, /campo "context" não é portável/);

  const dir2 = await copyContent();
  const a = TK + 'agents/arquiteto.md';
  await writeText(dir2, a, (await readText(dir2, a)).replace('capabilities:', 'model: opus\ncapabilities:'));
  await expectInvalid(dir2, /campo não suportado "model"/);
});

test('KB: wikilink sem destino, caminho local, segredo e arquivo não-markdown são rejeitados', async () => {
  const dir = await copyContent();
  const note = 'SeedGrid/Visao-geral.md';
  await writeText(dir, note, `${await readText(dir, note)}\nVeja [[SeedGrid/Extensions/nao-existe/Configuracao|x]] e [[SeedGrid/Extensions/nao-existe-2/Visao-geral\\|y]].\n`);
  await expectInvalid(dir, /wikilink sem destino .*nao-existe\/Configuracao/);
  await expectInvalid(dir, /wikilink sem destino .*nao-existe-2\/Visao-geral\]\]/);

  const dir2 = await copyContent();
  await writeText(dir2, note, `${await readText(dir2, note)}\nCódigo em D:\\empreendedorismo\\seedgrid\\x\n`);
  await expectInvalid(dir2, /caminho local de máquina/);

  const dir3 = await copyContent();
  await writeText(dir3, 'SeedGrid/Extensions/chave.md', `chave: sk_live_${'a1B2c3D4e5F6'}\n`);
  await expectInvalid(dir3, /parece conter chave Stripe/);

  const dir4 = await copyContent();
  await writeText(dir4, 'SeedGrid/Extensions/diagrama.png', 'x');
  await expectInvalid(dir4, /só arquivos \.md são suportados/);
});

test('KB: wikilinks em código, tabelas escapadas e âncoras são tratados', async () => {
  const dir = await copyContent();
  const note = 'SeedGrid/Visao-geral.md';
  await writeText(
    dir,
    note,
    `${await readText(dir, note)}\n\`[[...rota]]\`\n\n| a |\n|---|\n| [[SeedGrid/Mapa-dos-repositorios\\|mapa]] [[SeedGrid/Mapa-dos-repositorios#Seção|x]] |\n\n\`\`\`\n[[exemplo/em/bloco]]\n\`\`\`\n`,
  );
  await loadContent(dir); // não deve lançar
});

test('KB: entrypoint inexistente é rejeitado e o Toolkit não é duplicado dentro da KB', async () => {
  const dir = await copyContent();
  await editManifest(dir, (m) => {
    m.components.find((c: { type: string }) => c.type === 'brain').entrypoints.push('Nao-existe.md');
  });
  await expectInvalid(dir, /entrypoint inexistente "Nao-existe\.md"/);

  const bundle = await loadContent(bundledContentDir());
  assert.ok(bundle.shared.some((s) => s.path === 'brain/SeedGrid/Visao-geral.md'));
  assert.ok(!bundle.shared.some((s) => s.path.startsWith('brain/SeedGrid/Toolkit/')));
  assert.ok(bundle.brain && bundle.brain.notes > 100);
});

test('agentsNotes: aceita linhas curtas e rejeita lista inválida', async () => {
  const ok = await copyContent();
  await editManifest(ok, (m) => { m.agentsNotes = ['Modo X: leia a nota Y primeiro.']; });
  assert.deepEqual((await loadContent(ok)).agentsNotes, ['Modo X: leia a nota Y primeiro.']);
  const bad = await copyContent();
  await editManifest(bad, (m) => { m.agentsNotes = ['linha\ncom quebra']; });
  await expectInvalid(bad, /agentsNotes/);
});
