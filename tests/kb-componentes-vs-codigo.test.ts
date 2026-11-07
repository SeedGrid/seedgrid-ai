import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const script = path.join(root, 'scripts', 'kb-componentes-vs-codigo.mjs');

const TABELA = (linhaExtra: string) => `# API

## SgFoo

- Arquivo: \`packages/seedgrid_components/lib/src/sg_foo.dart\` (linha 1) · classe \`class SgFoo extends StatelessWidget\`

### Props de SgFoo

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| \`id\` | \`String\` | — | sim | React | Identificador. |
| \`enabled\` | \`bool?\` | — | não | React | Habilita. |
| \`autofocus\` | \`bool\` | \`false\` | não | Flutter | Foco inicial. |
${linhaExtra}`;

async function monta(linhaExtra: string) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'kbvc-'));
  const kb = path.join(dir, 'kb');
  await mkdir(path.join(kb, 'flutter', 'grupo'), { recursive: true });
  await writeFile(path.join(kb, 'flutter', 'grupo', 'API.md'), TABELA(linhaExtra));
  const lib = path.join(dir, 'front', 'packages', 'seedgrid_components', 'lib', 'src');
  await mkdir(lib, { recursive: true });
  await writeFile(path.join(lib, 'sg_foo.dart'), 'class SgFoo extends StatelessWidget {\n  const SgFoo({super.key, required this.id, this.enabled, this.autofocus = false});\n  final String id;\n  final bool? enabled;\n  final bool autofocus;\n}\n');
  const manifesto = path.join(dir, 'manifesto.json');
  await writeFile(manifesto, JSON.stringify({ components: [{ exportName: 'SgFoo', sgMeta: { props: [{ name: 'id', type: 'String', required: true }, { name: 'enabled', type: 'bool?', required: false }] } }] }));
  const react = path.join(dir, 'react.json');
  await writeFile(react, JSON.stringify({ components: [] }));
  const gen = path.join(dir, 'generated-props.json');
  await writeFile(gen, JSON.stringify({}));
  const args = [script, 'SgFoo', '--plataforma', 'flutter', '--kb', kb, '--manifesto', manifesto, '--manifesto-react', react, '--props-react', gen, '--flutter', path.join(dir, 'front')];
  return { dir, args };
}

test('componente certo: sem divergência e código de saída 0', async () => {
  const { dir, args } = await monta('');
  try {
    const r = await run(process.execPath, args);
    assert.match(r.stdout, /SgFoo \(flutter, grupo\): ok/);
    assert.match(r.stdout, /0 divergência\(s\) no total/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('componente com disabled, rules e extra inexistente: acusa e sai com código 1', async () => {
  const { dir, args } = await monta(
    '| `disabled` | `bool?` | — | não | React | Desabilita. |\n| `rules` | `SgRules?` | — | não | React | Regras. |\n| `fantasma` | `int` | — | não | Flutter | Não existe. |\n',
  );
  try {
    await assert.rejects(run(process.execPath, args), (e: { code?: number; stdout?: string }) => {
      assert.equal(e.code, 1);
      assert.match(e.stdout ?? '', /\[legado\].*prop disabled/);
      assert.match(e.stdout ?? '', /\[legado\].*SgRules/);
      assert.match(e.stdout ?? '', /\[removida\] disabled/);
      assert.match(e.stdout ?? '', /\[extra-inexistente\] fantasma/);
      return true;
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
