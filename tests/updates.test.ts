import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareVersions, npxCommandLine, runPublishedVersion } from '../src/core/updates.js';

test('compara versões semver, inclusive pré-release', () => {
  assert.equal(compareVersions('0.3.0', '0.2.0'), 1);
  assert.equal(compareVersions('0.2.0', '0.2.0'), 0);
  assert.equal(compareVersions('0.10.0', '0.9.9'), 1);
  assert.equal(compareVersions('1.0.0', '1.0.0-beta.2'), 1);
  assert.equal(compareVersions('1.0.0-beta.10', '1.0.0-beta.2'), 1);
  assert.equal(compareVersions('v1.2.3', '1.2.4'), -1);
});

test('monta a linha de comando com aspas para caminhos com espaços', () => {
  assert.equal(
    npxCommandLine('0.3.0', ['update', '--project', 'C:/meu projeto ção']),
    'npx @seedgrid/ai-toolkit@0.3.0 update --project "C:/meu projeto ção"',
  );
});

test('recusa repassar argumentos com caracteres perigosos para o shell', async () => {
  assert.equal(await runPublishedVersion('0.3.0', ['update', '--project', 'a & del x']), null);
  assert.equal(await runPublishedVersion('0.3.0', ['update', '--project', 'a"b']), null);
});
