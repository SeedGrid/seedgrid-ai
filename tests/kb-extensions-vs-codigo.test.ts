import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const script = path.join(root, 'scripts', 'kb-extensions-vs-codigo.mjs');

const CONFIG = `package br.com.seedgrid.foo.configs;

import java.util.Map;
import java.util.Optional;
import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

@ConfigMapping(prefix = "seedgrid.foo")
public interface FooConfig {
    /** Liga o modulo. */
    @WithDefault("true")
    boolean enabled();

    Optional<String> persistenceUnit();

    Rest rest();

    @io.smallrye.config.WithName("use-https")
    boolean useHttps();

    Map<String, Limit> limits();

    interface Rest {
        @WithDefault("/foo")
        String prefix();
    }

    interface Limit {
        int permits();
    }

    enum Mode { A, B(1), C }
}
`;

const PROPS = (extra: string) => `# Catálogo

## Quarkus (Java) — \`application.properties\`

### foo

| Propriedade | Grupo | Tipo | Padrão | Fase | Finalidade | Nota |
|---|---|---|---|---|---|---|
| \`seedgrid.foo.enabled\` | x | boolean | true | runtime | liga | n |
| \`seedgrid.foo.persistence-unit\` | x | String | — | runtime | pu | n |
| \`seedgrid.foo.rest.prefix\` | x | String | /foo | runtime | prefixo | n |
| \`seedgrid.foo.use-https\` | x | boolean | false | runtime | https | n |
| \`seedgrid.foo.limits.<nome>.permits\` | x | int | — | runtime | teto | n |
${extra}
## Rust — variáveis de ambiente e structs de config
`;

const ENUMS = (valores: string) => `# Catálogo de enums

| Enum | Plataforma | Extension | Valores | Onde | Nota |
|---|---|---|---|---|---|
| \`FooConfig.Mode\` | Quarkus | foo | ${valores} | config | n |
`;

async function monta(props: string, enums: string) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'kbext-'));
  const java = path.join(dir, 'platform', 'java', 'seedgrid-quarkus-ext-foo', 'runtime', 'src', 'main', 'java', 'br', 'seedgrid', 'foo', 'configs');
  await mkdir(java, { recursive: true });
  await writeFile(path.join(java, 'FooConfig.java'), CONFIG);
  const cat = path.join(dir, 'cat');
  await mkdir(cat, { recursive: true });
  await writeFile(path.join(cat, 'Catalogo-de-propriedades.md'), props);
  await writeFile(path.join(cat, 'Catalogo-de-enums.md'), enums);
  const baseline = path.join(dir, 'baseline.json');
  await writeFile(baseline, '{}');
  return { dir, args: [script, '--platform', path.join(dir, 'platform'), '--catalogos', cat, '--baseline', baseline] };
}

async function roda(args: string[]) {
  try {
    const r = await run(process.execPath, args);
    return { code: 0, out: r.stdout };
  } catch (e) {
    const err = e as { code: number; stdout: string };
    return { code: err.code, out: err.stdout };
  }
}

test('catálogo igual ao código: sem divergência e saída 0', async () => {
  const { dir, args } = await monta(PROPS(''), ENUMS('A, B, C'));
  try {
    const r = await roda(args);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /0 divergência\(s\) no total/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('propriedade removida de propósito do catálogo: reprova e diz qual', async () => {
  const props = PROPS('').replace(/^\| `seedgrid\.foo\.rest\.prefix`.*\n/m, '');
  const { dir, args } = await monta(props, ENUMS('A, B, C'));
  try {
    const r = await roda(args);
    assert.equal(r.code, 1);
    assert.match(r.out, /seedgrid\.foo\.rest\.prefix/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('propriedade do catálogo que o código não tem: reprova', async () => {
  const { dir, args } = await monta(PROPS('| `seedgrid.foo.fantasma` | x | int | — | runtime | nada | n |\n'), ENUMS('A, B, C'));
  try {
    const r = await roda(args);
    assert.equal(r.code, 1);
    assert.match(r.out, /seedgrid\.foo\.fantasma/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('valor de enum diferente entre código e catálogo: reprova', async () => {
  const { dir, args } = await monta(PROPS(''), ENUMS('A, B'));
  try {
    const r = await roda(args);
    assert.equal(r.code, 1);
    assert.match(r.out, /valores diferentes[^\n]*: 1/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('baseline aceita a divergência conhecida', async () => {
  const { dir, args } = await monta(PROPS('| `seedgrid.foo.fantasma` | x | int | — | runtime | nada | n |\n'), ENUMS('A, B, C'));
  try {
    await writeFile(String(args[args.length - 1]), JSON.stringify({ propriedades: { catalogoSemCodigo: [{ padrao: 'seedgrid.foo.fantasma', motivo: 'teste' }] } }));
    const r = await roda(args);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /1 aceita\(s\) pelo baseline/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('catálogos reais x seedgrid-platform: sem divergência fora do baseline (pula se a plataforma não existir)', async (t) => {
  const plataforma = process.env.SEEDGRID_PLATFORM ?? path.join(root, '..', 'seedgrid-platform');
  try {
    await access(path.join(plataforma, 'java'));
  } catch {
    t.skip('seedgrid-platform não encontrado');
    return;
  }
  const r = await roda([script, '--platform', plataforma]);
  assert.equal(r.code, 0, r.out);
});
