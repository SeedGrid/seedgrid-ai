import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Alias "@/" igual ao do tsconfig: os testes dos route handlers (BFF) importam "@/lib/..." (T7.2).
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    server: {
      deps: {
        // `@seedgrid/fe-core` publica ESM com imports sem extensao (`export * from "./module"`), que o
        // Node puro nao resolve. Inline passa o pacote pelo Vite, que resolve — assim os testes usam o
        // `ApiClientError` real (o mesmo que o app usa) em vez de um dublê.
        inline: [/@seedgrid\/fe-core/],
      },
    },
  },
});
