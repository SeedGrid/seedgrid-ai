import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// build-test/tests/check-padroes-tela.test.js -> raiz do repositorio
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-padroes-tela.mjs');

function withTree(files: Record<string, string>, fn: (dir: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-padroes-tela-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(dir, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, 'utf8');
    }
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const run = (dir: string, ...extra: string[]) => {
  const r = spawnSync(process.execPath, [SCRIPT, '--dir', dir, '--no-baseline', ...extra], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

const ruins: Record<string, [Record<string, string>, string]> = {
  'campo de CEP com SgInputText': [{ 'app/company_edit/page.tsx': '<SgInputText id="company-postal-code" label="CEP" inputProps={{ value: v }} />' }, 'campo-mascarado'],
  'telefone com SgInputText': [{ 'app/x/user_edit/page.tsx': '<SgInputText\n  id="user-phone"\n  label="Telefone"\n/>' }, 'campo-mascarado'],
  'item de seguranca solto na raiz do menu': [{ 'frontend/app/data.ts': 'export const navItems = [\n  { href: "/security/users/user_list", label: "Usuarios" },\n];\n' }, 'menu-seguranca-solto'],
  'Empresas e Seguranca antes de itens do produto': [{ 'frontend/app/data.ts': ['export const navItems = [', '  { href: "/security/companies/company_list", label: "Empresas" },', '  { href: "/midias/media_list", label: "Midias" },', '];', ''].join('\n') }, 'menu-ordem'],
  'instrucao de admin no app do cliente': [{ 'frontend/app/assinatura/View.tsx': 'const t = "Cadastre o ID de preco do Stripe nesse plano";' }, 'instrucao-admin-no-cliente'],
  'console.log com cabecalho da requisicao': [{ 'frontend/lib/http.ts': 'export function f(init: RequestInit) {\n  console.log("[API Request] Headers:", init.headers);\n}\n' }, 'console-log-sensivel'],
  'console.log com corpo e senha': [{ 'frontend/app/auth/login.tsx': 'console.log("login", body, password);' }, 'console-log-sensivel'],
  'FE-39: e-mail da empresa com SgInputText': [{ 'frontend/app/security/companies/company_edit/page.tsx': '<SgInputText id="company-email" label="E-mail" inputProps={{ value: v }} />' }, 'empresa-campo-texto'],
  'FE-39: SgInputCNPJ sem a busca ligada': [{ 'frontend/app/auth/SignupForm.tsx': '<SgInputCNPJ id="signup-cnpj" validateWithPublicaCnpj />' }, 'empresa-cnpj-sem-busca'],
  'FE-39: SgInputPostalCode sem a busca ligada': [{ 'frontend/app/security/companies/company_edit/page.tsx': '<SgInputPostalCode id="company-cep" onViaCepResult={x} />' }, 'empresa-cep-sem-busca'],
  'FE-39: seletor Tipo de pessoa': [{ 'frontend/app/security/companies/company_edit/page.tsx': '<SgSelect label="Tipo de pessoa" />' }, 'empresa-tipo-pessoa'],
  'contador requests por padrao': [{ 'backend/src/AppUsageMeters.java': 'class A { List<X> m(){ return List.of(new UsageMeterDefinition(REQUESTS, "Requisicoes")); } }' }, 'contador-requests-por-padrao'],
};
for (const [nome, [files, regra]] of Object.entries(ruins)) {
  test(`reprova: ${nome}`, () => withTree(files, (dir) => {
    const r = run(dir);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, new RegExp(regra));
  }));
}

test('passa: exemplo corrigido (mascara, menu agrupado, texto no admin, contador do dominio)', () => withTree({
  'app/company_edit/page.tsx': '<SgInputText id="company-name" label="Nome" />\n<SgInputCpfCnpj id="company-doc" label="CNPJ" />',
  'frontend/app/data.ts': 'export const navItems = [\n  {\n    href: "/security",\n    label: "Seguranca",\n    children: [\n      { href: "/security/users/user_list", label: "Usuarios" },\n    ],\n  },\n];\n',
  'frontend/app/empresas/data.ts': 'export const navItems = [{ href: "/security/companies/company_list", label: "Empresas" }];',
  'admin/app/plans/plan_edit/page.tsx': 'const t = "Cadastre o ID de preco do Stripe";',
  'backend/src/AppUsageMeters.java': 'class A { List<X> m(){ return List.of(new UsageMeterDefinition("exports", "Exportacoes")); } }',
}, (dir) => {
  const r = run(dir);
  assert.equal(r.code, 0, r.out);
}));

test('baseline: entrada que deixou de ocorrer reprova (o baseline so encolhe)', () => withTree({
  'app/x_edit/page.tsx': '<SgInputText id="nome" label="Nome" />',
  'base.json': JSON.stringify({ conhecidas: ['campo-mascarado|app/x_edit/page.tsx'] }),
}, (dir) => {
  const r = spawnSync(process.execPath, [SCRIPT, '--dir', dir, '--baseline', path.join(dir, 'base.json')], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(`${r.stdout}${r.stderr}`, /baseline obsoleto/);
}));

test('FE-46: onClick com void numa acao de gravacao reprova; devolver a Promise passa', () => {
  withTree({ 'app/a/page.tsx': '<SgButton onClick={() => void salvar()} />' }, (dir) => {
    const r = run(dir);
    assert.equal(r.code, 1);
    assert.match(r.out, /botao-grava-com-void/);
  });
  withTree({ 'app/a/page.tsx': '<SgButton onClick={() => salvar()} />' }, (dir) => {
    assert.equal(run(dir).code, 0);
  });
  withTree({ 'app/a/page.tsx': '<SgButton onClick={() => void abrirDialogo()} />' }, (dir) => {
    assert.equal(run(dir).code, 0);
  });
});

test('FE-46: form com onSubmit que faz mais que preventDefault reprova; so preventDefault passa', () => {
  withTree({ 'app/a/page.tsx': '<form onSubmit={onSubmit}><SgButton type="submit" /></form>' }, (dir) => {
    const r = run(dir);
    assert.equal(r.code, 1);
    assert.match(r.out, /form-onsubmit-grava/);
  });
  withTree({ 'app/a/page.tsx': '<form onSubmit={(event) => { void salvar(); }}><SgButton type="submit" /></form>' }, (dir) => {
    assert.equal(run(dir).code, 1);
  });
  withTree({ 'app/a/page.tsx': '<form onSubmit={(event) => event.preventDefault()}><SgButton type="submit" onClick={() => salvar()} /></form>' }, (dir) => {
    assert.equal(run(dir).code, 0);
  });
  withTree({ 'app/a/page.tsx': '<form onSubmit={(e) => e.preventDefault()}><input /></form>' }, (dir) => {
    assert.equal(run(dir).code, 0);
  });
});

test('passa: console.log sem dado sensivel e console de arquivo de teste', () => withTree({
  'frontend/lib/x.ts': 'console.log("carregou a tela");\n',
  'frontend/lib/y.test.ts': 'console.log("token", token);\n',
}, (dir) => {
  const r = run(dir);
  assert.equal(r.code, 0, r.out);
}));
