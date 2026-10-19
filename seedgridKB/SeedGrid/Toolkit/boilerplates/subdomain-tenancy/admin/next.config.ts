import type { NextConfig } from "next";

// Em dev o Next bloqueia /_next/* (HMR etc.) quando a pagina nao vem de localhost. Aqui ela vem do
// dominio do produto e dos subdominios de tenant (via hosts), entao libera os dois a partir da
// mesma env que o BFF ja usa. So vale para `next dev`; em build/producao e ignorado.
const tenancyDomain = process.env.SEEDGRID_TENANCY_DOMAIN?.trim().toLowerCase() || "localhost";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [tenancyDomain, `*.${tenancyDomain}`],
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
