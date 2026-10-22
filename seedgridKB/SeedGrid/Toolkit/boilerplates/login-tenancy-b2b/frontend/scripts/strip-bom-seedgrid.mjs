// Remove o BOM (UTF-8 Byte Order Mark, EF BB BF) do inicio de arquivos .json
// dentro dos pacotes @seedgrid/*.
//
// Motivo: alguns pacotes @seedgrid publicam JSON de i18n COM BOM
// (ex.: @seedgrid/fe-theme/dist/i18n/pt-BR.json). O Node tolera BOM, mas o
// Turbopack (default do Next 16) NAO parseia esse JSON e gera um modulo "sem
// exports", quebrando o build:
//   "Export default doesn't exist in target module ... i18n/pt-BR.json"
//
// Este script roda no postinstall: e idempotente e nao depende da VERSAO do
// pacote (varre o que estiver instalado), entao continua funcionando quando o
// fe-theme subir de versao. O fix DEFINITIVO de verdade e o pacote passar a
// publicar o JSON sem BOM; enquanto isso nao sai, isto segura o dev/build local.

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const scopeRoot = join(process.cwd(), "node_modules", "@seedgrid");
if (!existsSync(scopeRoot)) {
  // Sem deps @seedgrid instaladas (ex.: install parcial) — nada a fazer.
  process.exit(0);
}

let fixed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue; // symlink quebrado etc.
    }
    if (st.isDirectory()) {
      walk(full);
    } else if (name.endsWith(".json")) {
      const buf = readFileSync(full);
      if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
        writeFileSync(full, buf.subarray(3));
        fixed++;
        console.log("  strip-bom: " + full.slice(process.cwd().length + 1));
      }
    }
  }
}

walk(scopeRoot);

if (fixed > 0) {
  console.log(`[strip-bom-seedgrid] removido BOM de ${fixed} arquivo(s) @seedgrid`);
}
