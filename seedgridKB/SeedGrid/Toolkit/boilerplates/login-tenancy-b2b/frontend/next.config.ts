import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // gera .next/standalone (server.js + deps mínimas) p/ a imagem Docker
  output: "standalone",
  transpilePackages: ["@seedgrid/fe-components", "@seedgrid/fe-theme"],
  // Mantem os pacotes de OTel FORA do bundle do server: as instrumentacoes precisam patchear
  // os modulos reais (require-in-the-middle / diagnostics_channel) — se empacotados, o patch quebra.
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/sdk-logs",
    "@opentelemetry/instrumentation-http",
    "@opentelemetry/instrumentation-undici",
    "@opentelemetry/exporter-trace-otlp-proto",
    "@opentelemetry/exporter-logs-otlp-proto",
  ],
};

export default nextConfig;
