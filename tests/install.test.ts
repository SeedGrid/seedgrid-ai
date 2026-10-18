import assert from 'node:assert/strict';
import { mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { parse as parseToml } from 'smol-toml';
import { nodeIo, type Io } from '../src/core/apply.js';
import { BLOCK_BEGIN, BLOCK_END } from '../src/core/blocks.js';
import { parseFrontmatter } from '../src/core/frontmatter.js';
import { sha256 } from '../src/core/hash.js';
import { EXIT_CONFLICT, EXIT_ERROR, EXIT_OK } from '../src/commands/common.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { initCommand } from '../src/commands/init.js';
import { removeCommand } from '../src/commands/remove.js';
import { statusCommand } from '../src/commands/status.js';
import { updateCommand } from '../src/commands/update.js';
import { TK, cleanupAll, copyContent, editManifest, readText, snapshot, tempProject, writeText } from './helpers.js';

after(cleanupAll);

const SKILLS = ['sg-adr', 'sg-bump', 'sg-code-review', 'sg-crud-back', 'sg-crud-front', 'sg-new-screen', 'sg-new-skill', 'sg-plan-change', 'sg-plan-goal', 'sg-review', 'sg-validate-change'];
const AGENTS = ['arquiteto', 'backend-java', 'backend-rust', 'frontend-react', 'qa', 'revisor'];

/** Gera uma nova versão de conteúdo alterando uma regra. */
async function bumpContent(dir: string, version: string, marker: string) {
  await editManifest(dir, (m) => {
    m.contentVersion = version;
  });
  const p = TK + 'rules/formato-entrega.md';
  await writeText(dir, p, `${await readText(dir, p)}\n${marker}\n`);
}

describe('instalação', () => {
  test('instala os dois targets em projeto novo, com skills completas nos destinos corretos', async () => {
    const project = await tempProject();
    const res = await initCommand({ project, target: 'both', mode: 'shared' });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project);

    for (const name of SKILLS) {
      for (const dir of ['.claude/skills', '.agents/skills']) {
        const skill = files[`${dir}/${name}/SKILL.md`];
        assert.ok(skill, `${dir}/${name}/SKILL.md ausente`);
        const fm = parseFrontmatter(skill);
        assert.ok(!('error' in fm));
        assert.equal(fm.data.name, name);
        assert.ok(typeof fm.data.description === 'string' && fm.data.description.length > 20);
      }
    }
    // Recursos relativos acompanham a skill e as cópias são idênticas.
    assert.ok(files['.claude/skills/sg-code-review/references/code-review-checklist.md']);
    assert.ok(files['.agents/skills/sg-plan-change/assets/especificacao-tarefa.md']);
    for (const [rel, text] of Object.entries(files).filter(([k]) => k.startsWith('.claude/skills/'))) {
      assert.equal(files[rel.replace('.claude/', '.agents/')], text);
    }
    for (const id of AGENTS) assert.ok(files[`.ai/agents/${id}.md`]);
    assert.ok(files['.ai/agents/index.md']!.includes('| revisor |'));
    assert.ok(files['.ai/rules/coordenacao.md']);
    assert.ok(files['.ai/templates/relatorio-validacao.md']);
    assert.ok(files['.ai/references/glossario.md']);
    assert.ok(files['AGENTS.md']!.includes(BLOCK_BEGIN));
    assert.match(files['CLAUDE.md']!, /^@AGENTS\.md$/m);
    assert.equal(files['.claude/agents/revisor.md'], undefined, 'shared não gera agentes nativos');

    const lock = JSON.parse(files['.ai/toolkit-lock.json']!);
    assert.deepEqual(lock.targets, ['claude', 'codex']);
    assert.equal(lock.mode, 'shared');
    assert.deepEqual(lock.source, { type: 'bundled' });
    for (const f of lock.files) {
      assert.ok(!path.isAbsolute(f.path) && !f.path.includes('\\'), `caminho não portável: ${f.path}`);
      assert.equal(sha256(files[f.path]!), f.sha256);
    }
    assert.ok(!JSON.stringify(lock).includes(project), 'o lock não deve conter caminhos absolutos');
  });

  test('instala a base de conhecimento em .ai/brain/ sem arquivos de manutenção do vault', async () => {
    const project = await tempProject();
    await writeText(project, 'AGENTS.md', '# Projeto\n');
    assert.equal((await initCommand({ project })).exitCode, EXIT_OK);
    const files = await snapshot(project);
    const brain = Object.keys(files).filter((f) => f.startsWith('.ai/brain/'));
    assert.ok(brain.length > 100, `esperava >100 notas, obteve ${brain.length}`);
    assert.ok(files['.ai/brain/SeedGrid/Visao-geral.md']);
    assert.ok(files['.ai/brain/SeedGrid/Extensions/Catalogo-de-propriedades.md']);
    assert.ok(!brain.some((f) => f.includes('/Toolkit/') || f.includes('.obsidian')));
    assert.equal(files['.ai/brain/AGENTS.md'], undefined, 'o AGENTS.md do vault (manutenção) não é distribuído');
    assert.equal(files['.ai/brain/CLAUDE.md'], undefined);
    assert.equal(files['.ai/brain/Bem-vindo.md'], undefined);

    const block = files['AGENTS.md']!;
    assert.match(block, /Base de conhecimento SeedGrid/);
    assert.match(block, /\.ai\/brain\/SeedGrid\/Visao-geral\.md/);
    assert.match(block, /Não invente propriedades/);

    // Os destinos citados no bloco existem de fato.
    for (const m of block.matchAll(/`(\.ai\/brain\/[^`]+\.md)`/g)) assert.ok(files[m[1]!], `entrypoint ausente: ${m[1]}`);
    // Os links [[SeedGrid/...]] das notas instaladas resolvem dentro de .ai/brain/.
    const note = files['.ai/brain/SeedGrid/Extensions/ai-pricing/Configuracao.md']!;
    const link = /\[\[(SeedGrid\/[^\]|\\#]+)/.exec(note)![1]!;
    assert.ok(files[`.ai/brain/${link}.md`], `link não resolve: ${link}`);
  });

  test('update leva mudanças da KB e conflito protege nota editada', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await initCommand({ project, source });
    const note = 'SeedGrid/Visao-geral.md';
    await writeText(source, note, `${await readText(source, note)}\nNova linha da KB.\n`);
    await editManifest(source, (m) => {
      m.contentVersion = '0.9.0';
    });
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    assert.match(await readText(project, '.ai/brain/SeedGrid/Visao-geral.md'), /Nova linha da KB\./);

    await writeText(project, '.ai/brain/SeedGrid/Visao-geral.md', 'minha edição\n');
    await writeText(source, note, `${await readText(source, note)}\nOutra.\n`);
    const conflict = await updateCommand({ project, source });
    assert.equal(conflict.exitCode, EXIT_CONFLICT);
    assert.match(JSON.stringify(conflict.report.conflicts), /Visao-geral\.md/);
  });

  test('índice de skills é gerado e o bloco do AGENTS.md só aponta para ele', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'claude' });
    const files = await snapshot(project);
    const index = files['.ai/skills/index.md']!;
    for (const name of SKILLS) {
      assert.match(index, new RegExp(`\\| \`${name}\` \\|.*\\[${name}/SKILL\\.md\\]\\(${name}/SKILL\\.md\\)`));
      assert.ok(files[`.ai/skills/${name}/SKILL.md`], `${name} tem cópia canônica em .ai/skills`);
      assert.equal(files[`.claude/skills/${name}/SKILL.md`], files[`.ai/skills/${name}/SKILL.md`], `${name}: cópia nativa igual à canônica`);
    }
    assert.match(files['AGENTS.md']!, /Skills: `\.ai\/skills\/` \(11\)/);
    for (const dir of ['rules', 'agents', 'templates', 'references']) {
      assert.ok(files[`.ai/${dir}/index.md`], `${dir}/index.md gerado`);
      assert.ok(files['AGENTS.md']!.includes(`.ai/${dir}/`), `AGENTS.md aponta para ${dir}/`);
    }
    assert.match(files['.ai/rules/index.md']!, /\| \[coordenacao\.md\]\(coordenacao\.md\) \| Fluxo de coordenação/);
    assert.match(files['.ai/templates/index.md']!, /relatorio-validacao\.md/);
    assert.doesNotMatch(files['AGENTS.md']!, /coordenacao\.md.*formato-entrega|relatorio-validacao/s, 'AGENTS.md não lista arquivos');
    // A única skill citada pelo nome é a de revisão, que o bloco recomenda explicitamente.
    for (const name of SKILLS.filter((n) => n !== 'sg-review')) {
      assert.ok(!files['AGENTS.md']!.includes(`\`${name}\``), `AGENTS.md não deve listar ${name}`);
    }
    assert.match(files['AGENTS.md']!, /Padrões SeedGrid obrigatórios.*frontend-seedgrid\.md.*backend-java-seedgrid\.md.*sg-review/);

    // Ao instalar o outro target, as cópias nativas dos dois destinos coexistem com a canônica em .ai/skills.
    await initCommand({ project, target: 'both' });
    const both = await snapshot(project);
    assert.equal(both['.agents/skills/sg-crud-front/SKILL.md'], both['.ai/skills/sg-crud-front/SKILL.md']);
    assert.equal(both['.claude/skills/sg-crud-front/SKILL.md'], both['.ai/skills/sg-crud-front/SKILL.md']);
    assert.equal((await removeCommand({ project })).exitCode, EXIT_OK);
  });

  test('reinstalar não altera arquivos nem duplica blocos', async () => {
    const project = await tempProject();
    await writeText(project, 'AGENTS.md', '# Projeto\n');
    await initCommand({ project });
    const before = await snapshot(project);
    const again = await initCommand({ project });
    assert.equal(again.exitCode, EXIT_OK);
    assert.equal((again.report.summary as Record<string, number>).unchanged, (again.report.operations as unknown[]).length);
    assert.deepEqual(await snapshot(project), before);
    const agentsMd = await readText(project, 'AGENTS.md');
    assert.equal(agentsMd.split(BLOCK_BEGIN).length - 1, 1);
  });

  test('dry-run não escreve nenhum arquivo (init, update e remove)', async () => {
    const project = await tempProject();
    await writeText(project, 'AGENTS.md', '# Projeto\n');
    const empty = await snapshot(project);
    const plan = await initCommand({ project, dryRun: true });
    assert.equal(plan.exitCode, EXIT_OK);
    assert.ok(((plan.report.summary as Record<string, number>).create ?? 0) > 0);
    assert.deepEqual(await snapshot(project), empty);

    await initCommand({ project });
    const installed = await snapshot(project);
    const source = await copyContent();
    await bumpContent(source, '0.2.0', 'mudança');
    await updateCommand({ project, source, dryRun: true });
    await removeCommand({ project, dryRun: true });
    assert.deepEqual(await snapshot(project), installed);
  });

  test('atualiza conteúdo intacto e registra backup', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await initCommand({ project, source });
    await bumpContent(source, '0.2.0', 'NOVA REGRA 0.2.0');
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    assert.match(await readText(project, '.ai/rules/formato-entrega.md'), /NOVA REGRA 0\.2\.0/);
    const lock = JSON.parse(await readText(project, '.ai/toolkit-lock.json'));
    assert.equal(lock.contentVersion, '0.2.0');
    assert.equal(lock.source.type, 'local');
    assert.equal(lock.source.path, undefined, 'fonte fora do projeto não registra caminho');
    const backupDir = (res.report.result as { backupDir: string }).backupDir;
    const backup = await readText(project, `${backupDir}/.ai/rules/formato-entrega.md`);
    assert.doesNotMatch(backup, /NOVA REGRA/);
    assert.match(await readText(project, '.ai/backups/.gitignore'), /^\*$/m);
  });

  test('update renova o conteúdo do toolkit e preserva as skills criadas pelo usuário', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await initCommand({ project, source });
    const mine = '---\nname: gerar-relatorio\ndescription: minha skill\n---\n# minha\n';
    for (const dir of ['.ai/skills', '.claude/skills', '.agents/skills']) await writeText(project, `${dir}/gerar-relatorio/SKILL.md`, mine);
    await writeText(project, '.ai/skills/projeto.md', '# Skills do projeto\n\n- [gerar-relatorio](gerar-relatorio/SKILL.md): minha\n');
    const extras = ['.ai/rules/minha-regra.md', '.ai/templates/meu-modelo.md', '.ai/references/minha-ref.md', '.ai/local/regras.md'];
    for (const f of extras) await writeText(project, f, `meu conteúdo em ${f}\n`);

    await bumpContent(source, '0.2.0', 'NOVA REGRA 0.2.0');
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project);
    assert.match(files['.ai/rules/formato-entrega.md']!, /NOVA REGRA 0\.2\.0/);
    for (const dir of ['.ai/skills', '.claude/skills', '.agents/skills']) assert.equal(files[`${dir}/gerar-relatorio/SKILL.md`], mine);
    assert.match(files['.ai/skills/projeto.md']!, /gerar-relatorio/);
    assert.match(files['.ai/skills/index.md']!, /projeto\.md/);
    for (const f of extras) assert.equal(files[f], `meu conteúdo em ${f}\n`, `${f} preservado no update`);
    assert.equal((await removeCommand({ project })).exitCode, EXIT_OK);
    const after = await snapshot(project);
    assert.equal(after['.claude/skills/gerar-relatorio/SKILL.md'], mine, 'remove também preserva a skill do usuário');
    for (const f of extras) assert.ok(after[f], `${f} preservado no remove`);
  });

  test('update leva skills novas a um projeto instalado com conteúdo anterior', async () => {
    const project = await tempProject();
    const old = await copyContent();
    await editManifest(old, (m) => {
      m.contentVersion = '0.1.0';
      m.components = m.components.filter((c: { id: string }) => !/^skill:sg-(crud|new|review|bump)/.test(c.id));
    });
    await rm(path.join(old, TK, 'skills', 'sg-crud-front'), { recursive: true });
    await rm(path.join(old, TK, 'skills', 'sg-new-screen'), { recursive: true });
    await rm(path.join(old, TK, 'skills', 'sg-review'), { recursive: true });
    await rm(path.join(old, TK, 'skills', 'sg-crud-back'), { recursive: true });
    await rm(path.join(old, TK, 'skills', 'sg-bump'), { recursive: true });
    await rm(path.join(old, TK, 'skills', 'sg-new-skill'), { recursive: true });
    // Os papéis atuais citam essas skills; no conteúdo "anterior" elas deixam de existir.
    for (const id of ['backend-java', 'frontend-react', 'revisor']) {
      const p = `${TK}agents/${id}.md`;
      await writeText(old, p, (await readText(old, p)).replace(/^preferred_skills: .*$/m, 'preferred_skills: []'));
    }
    await initCommand({ project, source: old });
    assert.equal((await snapshot(project))['.claude/skills/sg-crud-front/SKILL.md'], undefined);

    const st = await statusCommand({ project });
    assert.equal(st.report.updateAvailable, true);
    const res = await updateCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project);
    for (const dir of ['.claude/skills', '.agents/skills']) {
      assert.ok(files[`${dir}/sg-crud-front/references/crud-front-patterns.md`]);
      assert.ok(files[`${dir}/sg-new-screen/agents/openai.yaml`]);
    }
    const lock = JSON.parse(files['.ai/toolkit-lock.json']!);
    assert.deepEqual(lock.source, { type: 'bundled' });
    assert.notEqual(lock.contentVersion, '0.1.0');
  });

  test('customização local gera conflito e nada é alterado', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await initCommand({ project, source });
    await writeText(project, '.ai/rules/formato-entrega.md', 'minha versão\n');
    await bumpContent(source, '0.2.0', 'NOVA');
    const before = await snapshot(project);
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.deepEqual(
      (res.report.conflicts as { path: string }[]).map((c) => c.path),
      ['.ai/rules/formato-entrega.md'],
    );
    assert.deepEqual(await snapshot(project), before);
  });

  test('arquivo preexistente não gerenciado com conteúdo diferente gera conflito', async () => {
    const project = await tempProject();
    await writeText(project, '.ai/rules/coordenacao.md', 'minha regra\n');
    const before = await snapshot(project);
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.deepEqual(await snapshot(project), before);
  });

  test('skill do projeto com o mesmo nome de uma do toolkit é substituída, com backup', async () => {
    const project = await tempProject();
    const mine = '---\nname: sg-crud-front\ndescription: antiga do projeto\n---\n';
    await writeText(project, '.ai/skills/sg-crud-front/SKILL.md', mine);
    await writeText(project, '.claude/skills/sg-code-review/SKILL.md', mine);
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project);
    assert.doesNotMatch(files['.ai/skills/sg-crud-front/SKILL.md']!, /antiga do projeto/);
    assert.doesNotMatch(files['.claude/skills/sg-code-review/SKILL.md']!, /antiga do projeto/);
    const backupDir = (res.report.result as { backupDir: string }).backupDir;
    assert.equal(await readText(project, `${backupDir}/.ai/skills/sg-crud-front/SKILL.md`), mine);
    assert.ok(res.lines.join('\n').includes('substituído pela skill do toolkit'));
  });

  test('bloco editado manualmente gera conflito; texto fora dos marcadores é preservado', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await writeText(project, 'AGENTS.md', '# Antes\n\nTexto anterior.\n');
    await initCommand({ project, source });
    const withBlock = await readText(project, 'AGENTS.md');
    await writeText(project, 'AGENTS.md', `${withBlock}\nTexto posterior.\n`);

    // Atualização com bloco intacto preserva texto antes e depois.
    await bumpContent(source, '0.2.0', 'x');
    assert.equal((await updateCommand({ project, source })).exitCode, EXIT_OK);
    const updated = await readText(project, 'AGENTS.md');
    assert.ok(updated.startsWith('# Antes\n\nTexto anterior.\n'));
    assert.ok(updated.endsWith('\nTexto posterior.\n'));
    assert.match(updated, /conteúdo 0\.2\.0/);

    // Edição dentro do bloco: conflito.
    await writeText(project, 'AGENTS.md', updated.replace('## SeedGrid AI Toolkit', '## Editado'));
    await bumpContent(source, '0.3.0', 'y');
    const res = await updateCommand({ project, source });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.match(JSON.stringify(res.report.conflicts), /editado localmente/);
  });

  test('remove apaga somente o que é gerenciado e intacto', async () => {
    const project = await tempProject();
    await writeText(project, 'AGENTS.md', '# Projeto\n\nRegras do time.\n');
    await writeText(project, '.claude/settings.json', '{}\n');
    await writeText(project, '.claude/skills/minha-skill/SKILL.md', '---\nname: minha-skill\ndescription: x\n---\n');
    await writeText(project, '.ai/local/projeto.md', '# local\n');
    await initCommand({ project, mode: 'native' });
    const res = await removeCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    const files = await snapshot(project, { ignoreBackups: true });
    assert.deepEqual(Object.keys(files).sort(), [
      '.ai/local/projeto.md',
      '.claude/settings.json',
      '.claude/skills/minha-skill/SKILL.md',
      'AGENTS.md',
    ]);
    assert.equal(files['AGENTS.md'], '# Projeto\n\nRegras do time.\n');
  });

  test('remove aborta quando há customização', async () => {
    const project = await tempProject();
    await initCommand({ project });
    await writeText(project, '.agents/skills/sg-validate-change/SKILL.md', 'alterado\n');
    const before = await snapshot(project);
    const res = await removeCommand({ project });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.deepEqual(await snapshot(project), before);
  });

  test('modo native gera agentes válidos e voltar a shared os remove', async () => {
    const project = await tempProject();
    const res = await initCommand({ project, mode: 'native' });
    assert.equal(res.exitCode, EXIT_OK);
    for (const id of AGENTS) {
      const md = parseFrontmatter(await readText(project, `.claude/agents/${id}.md`));
      assert.ok(!('error' in md));
      assert.equal(md.data.name, id);
      assert.ok(typeof md.data.description === 'string');
      const toml = parseToml(await readText(project, `.codex/agents/${id}.toml`)) as Record<string, string>;
      assert.equal(toml.name, id);
      assert.ok(toml.description && toml.developer_instructions!.includes('## Objetivo'));
    }
    const revisor = parseFrontmatter(await readText(project, '.claude/agents/revisor.md'));
    assert.ok(!('error' in revisor));
    assert.equal(revisor.data.tools, 'Read, Grep, Glob, Bash, Skill');

    const back = await initCommand({ project, mode: 'shared' });
    assert.equal(back.exitCode, EXIT_OK);
    const files = await snapshot(project);
    assert.ok(!Object.keys(files).some((f) => f.startsWith('.claude/agents/') || f.startsWith('.codex/')));
  });

  test('target claude não instala skills do Codex', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'claude' });
    const files = await snapshot(project);
    assert.ok(files['.claude/skills/sg-code-review/SKILL.md']);
    assert.ok(!Object.keys(files).some((f) => f.startsWith('.agents/')));
    assert.doesNotMatch(files['AGENTS.md']!, /\.agents\/skills/);
  });

  test('falha de escrita no meio da operação faz rollback completo', async () => {
    const project = await tempProject();
    const source = await copyContent();
    await writeText(project, 'AGENTS.md', '# Projeto\n');
    await initCommand({ project, source });
    await bumpContent(source, '0.2.0', 'NOVA');
    const p = TK + 'rules/coordenacao.md';
    await writeText(source, p, `${await readText(source, p)}\nOutra mudança.\n`);
    const before = await snapshot(project, { ignoreBackups: true });

    let renames = 0;
    const faulty: Io = {
      ...nodeIo,
      rename: async (a, b) => {
        renames++;
        if (renames === 2) throw new Error('disco cheio (simulado)');
        return nodeIo.rename(a, b);
      },
    };
    const res = await updateCommand({ project, source, io: faulty });
    assert.equal(res.exitCode, EXIT_ERROR);
    assert.equal((res.report.rollback as { complete: boolean }).complete, true);
    assert.deepEqual(await snapshot(project, { ignoreBackups: true }), before);
    // Depois da falha, uma nova execução funciona normalmente.
    assert.equal((await updateCommand({ project, source })).exitCode, EXIT_OK);
  });

  test('lock adulterado não é usado para apagar fora das áreas gerenciadas', async () => {
    const project = await tempProject();
    await initCommand({ project });
    await writeFile(path.join(path.dirname(project), 'fora.txt'), 'não apagar');
    const lockPath = '.ai/toolkit-lock.json';
    const lock = JSON.parse(await readText(project, lockPath));
    lock.files.push({ path: '../fora.txt', sha256: sha256('não apagar'), component: 'x' });
    await writeText(project, lockPath, JSON.stringify(lock));
    await assert.rejects(removeCommand({ project }), /lock é inválido/);
    assert.equal(await readText(path.dirname(project), 'fora.txt'), 'não apagar');

    lock.files.pop();
    lock.files.push({ path: 'src/app.ts', sha256: sha256('x'), component: 'x' });
    await writeText(project, lockPath, JSON.stringify(lock));
    const status = await statusCommand({ project });
    assert.equal(status.exitCode, EXIT_ERROR);
    assert.equal((await initCommand({ project })).exitCode, EXIT_CONFLICT);
  });

  test('rejeita destino que é link para fora do projeto', async (t) => {
    const project = await tempProject();
    const outside = path.join(path.dirname(project), 'fora do projeto');
    await mkdir(outside, { recursive: true });
    try {
      await symlink(outside, path.join(project, '.claude'), 'junction');
    } catch {
      t.skip('sem permissão para criar links neste sistema');
      return;
    }
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_CONFLICT);
    assert.match(JSON.stringify(res.report.conflicts), /link simbólico/);
    assert.deepEqual(await snapshot(outside), {});
  });

  test('status e doctor explicam instalação e divergências', async () => {
    const project = await tempProject();
    const none = await statusCommand({ project });
    assert.equal(none.report.installed, false);

    await initCommand({ project });
    const ok = await doctorCommand({ project });
    assert.equal(ok.exitCode, EXIT_OK, ok.lines.join('\n'));
    const discovery = ok.report.discovery as { realDiscovery: string; syntax: string }[];
    assert.ok(discovery.length >= 4);
    assert.ok(discovery.every((d) => d.syntax === 'válida' && d.realDiscovery === 'não verificada'));
    assert.match(ok.lines.join('\n'), /teste real de descoberta não foi executado/);

    await writeText(project, '.ai/agents/revisor.md', 'mexi\n');
    const st = await statusCommand({ project });
    assert.deepEqual(
      (st.report.files as { path: string; state: string }[]).filter((f) => f.state !== 'ok'),
      [{ path: '.ai/agents/revisor.md', component: 'agents', state: 'modificado' }],
    );
    const bad = await doctorCommand({ project });
    assert.equal(bad.exitCode, EXIT_ERROR);
  });

  test('preserva CRLF de AGENTS.md existente e trata checkout CRLF como inalterado', async () => {
    const project = await tempProject();
    await writeText(project, 'AGENTS.md', '# Projeto\r\n\r\nRegras.\r\n');
    await initCommand({ project });
    const text = await readText(project, 'AGENTS.md');
    assert.ok(text.startsWith('# Projeto\r\n\r\nRegras.\r\n'));
    assert.ok(text.includes(`${BLOCK_END}\r\n`));
    // Simula core.autocrlf convertendo um arquivo gerenciado.
    const rel = '.ai/rules/coordenacao.md';
    await writeText(project, rel, (await readText(project, rel)).replace(/\r?\n/g, '\r\n'));
    const again = await initCommand({ project });
    assert.equal(again.exitCode, EXIT_OK);
    assert.equal((again.report.summary as Record<string, number>).update ?? 0, 0);
  });
});
