// Hook de resolucao SO' para `npm test` (node --test --experimental-strip-types). Nao participa do
// build do Next. Faz o Node puro resolver o que o bundler do Next resolve sozinho:
//   - `next/server`            -> `next/server.js` (o pacote nao tem campo `exports`);
//   - import relativo sem extensao (`./lib/admin-auth`) -> `.ts`, `/index.ts` ou `.js`
//     (o `proxy.ts` e os modulos de `lib/` importam assim; `@seedgrid/fe-core` tambem, em `.js`).
export async function resolve(specifier, context, nextResolve) {
  const target = specifier === "next/server" ? "next/server.js" : specifier;
  try {
    return await nextResolve(target, context);
  } catch (error) {
    const code = error && error.code;
    const relative = target.startsWith("./") || target.startsWith("../");
    const importerInPackage = context.parentURL && context.parentURL.includes("/node_modules/");
    if ((code !== "ERR_MODULE_NOT_FOUND" && code !== "ERR_UNSUPPORTED_DIR_IMPORT") || !relative) {
      throw error;
    }
    const suffixes = importerInPackage ? [".js", "/index.js"] : [".ts", "/index.ts"];
    for (const suffix of suffixes) {
      try {
        return await nextResolve(target + suffix, context);
      } catch {
        // tenta o proximo sufixo
      }
    }
    throw error;
  }
}
