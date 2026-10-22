/**
 * Instrumentacao OpenTelemetry do admin (server-side) via NodeSDK manual.
 *
 * Por que NodeSDK e nao @vercel/otel: no Next 16 standalone o @vercel/otel registrava mas nao
 * gerava span. O NodeSDK patcheia `http` (entrada) e `undici`/`fetch` (saida) no nivel do Node.
 * O UndiciInstrumentation captura o fetch do proxy /api/admin/* para o report-api e propaga o
 * traceparent (W3C) => trace unico admin -> api.
 *
 * Alem de TRACES, envia LOGS: uma ponte console->OTel manda todo console.log/warn/error do server
 * para o Loki (com o nivel certo), mantendo o stdout intacto.
 *
 * DESLIGADO por padrao — liga com OTEL_SDK_DISABLED=false. Endpoint/serviço por env
 * (OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_SERVICE_NAME). OTEL_LOG_LEVEL=debug liga o diag no console.
 */
export async function register() {
  if (process.env.OTEL_SDK_DISABLED !== "false") {
    console.log("[otel] desligado — defina OTEL_SDK_DISABLED=false para ligar");
    return;
  }
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-proto");
  const { OTLPLogExporter } = await import("@opentelemetry/exporter-logs-otlp-proto");
  const { BatchLogRecordProcessor } = await import("@opentelemetry/sdk-logs");
  const { HttpInstrumentation } = await import("@opentelemetry/instrumentation-http");
  const { UndiciInstrumentation } = await import("@opentelemetry/instrumentation-undici");
  const { resourceFromAttributes } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME } = await import("@opentelemetry/semantic-conventions");
  const { logs, SeverityNumber } = await import("@opentelemetry/api-logs");
  const { diag, DiagConsoleLogger, DiagLogLevel } = await import("@opentelemetry/api");
  const { format } = await import("node:util");

  if ((process.env.OTEL_LOG_LEVEL ?? "").toLowerCase() === "debug") {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? "seedgrid-app-client";
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "(default localhost:4318)";

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
    traceExporter: new OTLPTraceExporter(),
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() })],
    instrumentations: [new HttpInstrumentation(), new UndiciInstrumentation()],
  });
  sdk.start();

  // Ponte console -> OTel logs: espelha o stdout do server para o Loki com o nivel correto.
  const otelLogger = logs.getLogger("console");
  const bridge: Array<["error" | "warn" | "info" | "log" | "debug", number, string]> = [
    ["error", SeverityNumber.ERROR, "ERROR"],
    ["warn", SeverityNumber.WARN, "WARN"],
    ["info", SeverityNumber.INFO, "INFO"],
    ["log", SeverityNumber.INFO, "INFO"],
    ["debug", SeverityNumber.DEBUG, "DEBUG"],
  ];
  for (const [method, severityNumber, severityText] of bridge) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      try {
        otelLogger.emit({ severityNumber, severityText, body: format(...args) });
      } catch {
        // nunca deixa o log quebrar a app
      }
    };
  }

  console.log(`[otel] ligado (NodeSDK + logs) — service=${serviceName} endpoint=${endpoint}`);
}
