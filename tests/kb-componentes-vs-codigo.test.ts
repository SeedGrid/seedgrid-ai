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

// ---------- modo --tipos (P156.F3.T2) ----------
const TABELA_TIPOS = (tipoEnabled: string, padraoAutofocus: string, tipoId: string) => `# API

## SgFoo

- Arquivo: \`packages/seedgrid_components/lib/src/sg_foo.dart\` (linha 1) · classe \`class SgFoo extends StatelessWidget\`

### Props de SgFoo

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| \`id\` | \`${tipoId}\` | — | sim | React | Identificador. |
| \`enabled\` | \`${tipoEnabled}\` | — | não | React | Habilita. |
| \`autofocus\` | \`bool\` | \`${padraoAutofocus}\` | não | Flutter | Foco inicial. |
`;

async function montaTipos(tabela: string, plataforma: 'flutter' | 'react', tsx = '') {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'kbvc-tipos-'));
  const kb = path.join(dir, 'kb');
  const grupoDir = plataforma === 'flutter' ? path.join(kb, 'flutter', 'grupo') : path.join(kb, 'grupo');
  await mkdir(grupoDir, { recursive: true });
  await writeFile(path.join(grupoDir, 'API.md'), tabela);
  const lib = path.join(dir, 'front', 'packages', 'seedgrid_components', 'lib', 'src');
  await mkdir(lib, { recursive: true });
  await writeFile(path.join(lib, 'sg_foo.dart'), 'class SgFoo extends StatelessWidget {\n  const SgFoo({super.key, required this.id, this.enabled, this.autofocus = false});\n  final String id;\n  final bool? enabled;\n  final bool autofocus;\n}\n');
  const manifesto = path.join(dir, 'manifesto.json');
  await writeFile(manifesto, JSON.stringify({ components: [{ exportName: 'SgFoo', sgMeta: { props: [{ name: 'id', type: 'String', required: true }, { name: 'enabled', type: 'bool?', required: false }] } }] }));
  const src = path.join(dir, 'react', 'src');
  await mkdir(path.join(src, 'ai-meta'), { recursive: true });
  await writeFile(path.join(src, 'SgFoo.tsx'), tsx);
  const gen = path.join(src, 'ai-meta', 'generated-props.json');
  await writeFile(gen, JSON.stringify({ SgFoo: [{ name: 'size', type: '"sm" | "md"', required: false }, { name: 'count', type: 'number', required: false }, { name: 'label', type: 'string', required: false }] }));
  const reactManifest = path.join(dir, 'react.json');
  await writeFile(reactManifest, JSON.stringify({ components: [{ exportName: 'SgFoo', sgMeta: { props: [{ name: 'size', type: 'string', default: 'md' }, { name: 'count', type: 'number' }] } }] }));
  const args = [script, 'SgFoo', '--tipos', '--plataforma', plataforma, '--kb', kb, '--manifesto', manifesto, '--manifesto-react', reactManifest, '--props-react', gen, '--flutter', path.join(dir, 'front')];
  return { dir, args };
}

test('--tipos Flutter: tipo e padrão iguais ao construtor Dart (só forma muda): sem divergência', async () => {
  const { dir, args } = await montaTipos(TABELA_TIPOS('bool', 'false', 'String'), 'flutter');
  try {
    const r = await run(process.execPath, args);
    assert.match(r.stdout, /0 divergência\(s\) no total/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('--tipos Flutter: tipo e padrão diferentes do construtor Dart viram divergência', async () => {
  const { dir, args } = await montaTipos(TABELA_TIPOS('int', 'true', 'Object'), 'flutter');
  try {
    await assert.rejects(run(process.execPath, args), (e: { code?: number; stdout?: string }) => {
      assert.equal(e.code, 1);
      assert.match(e.stdout ?? '', /\[tipo-dart\] enabled .*Dart bool\? × KB int/);
      assert.match(e.stdout ?? '', /\[tipo-dart\] id .*Dart String × KB Object/);
      assert.match(e.stdout ?? '', /\[padrao-dart\] autofocus .*construtor false × KB true/);
      return true;
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const TABELA_REACT = (tipoSize: string, padraoSize: string, padraoCount: string) => `# API

## SgFoo

Fonte: \`src/SgFoo.tsx\` → \`SgFoo\`.

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| \`size\` | ${tipoSize} | ${padraoSize} | Não | Tamanho. |
| \`count\` | \`number\` | ${padraoCount} | Não | Quantidade. |
| \`label\` | \`string\` | — | Não | Rótulo. |
`;
const TSX = 'export function SgFoo({\n  size = "md",\n  count,\n  label,\n}: Props) { return null; }\n';

test('--tipos React: tipo e padrão iguais ao generated-props e ao .tsx: sem divergência', async () => {
  const { dir, args } = await montaTipos(TABELA_REACT('`"md" \\| "sm"`', '`"md"`', '—'), 'react', TSX);
  try {
    const r = await run(process.execPath, args);
    assert.match(r.stdout, /0 divergência\(s\) no total/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('--tipos React: tipo e padrão errados viram divergência; prop fora do manifesto vira só aviso', async () => {
  const { dir, args } = await montaTipos(TABELA_REACT('`string`', '`"lg"`', '`3`'), 'react', TSX);
  try {
    await assert.rejects(run(process.execPath, args), (e: { code?: number; stdout?: string }) => {
      assert.equal(e.code, 1);
      assert.match(e.stdout ?? '', /\[tipo-ts\] size .*generated-props "sm" \| "md" × KB string/);
      assert.match(e.stdout ?? '', /\[padrao-ts\] size .*\.tsx "md" × KB "lg"/);
      assert.match(e.stdout ?? '', /\[aviso-tipo\] count .*sem inicializador/);
      assert.match(e.stdout ?? '', /2 divergência\(s\) no total/);
      return true;
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
