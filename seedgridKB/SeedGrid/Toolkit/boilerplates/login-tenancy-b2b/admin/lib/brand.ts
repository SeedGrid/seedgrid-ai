// Nome do produto mostrado ao usuario (P180.F2.T17): titulo do menu, <title>/metadados, mensagens e telas.
// Uma constante so, alimentada pela variavel publica do produto; cada produto novo define NEXT_PUBLIC_PRODUCT_NAME
// (o mesmo valor do brand.title do menu) em vez de editar os textos. O logo (SeedGridLogo*.tsx) e o desenho da marca
// e nao entra aqui. Acesso literal a process.env.NEXT_PUBLIC_*: o Next so troca pelo valor assim, no cliente tambem.
export const DEFAULT_PRODUCT_NAME = "SeedGrid App";

export function resolveProductName(value: string | undefined): string {
  const name = (value ?? "").trim();
  return name === "" ? DEFAULT_PRODUCT_NAME : name;
}

export const PRODUCT_NAME: string = resolveProductName(process.env.NEXT_PUBLIC_PRODUCT_NAME);
