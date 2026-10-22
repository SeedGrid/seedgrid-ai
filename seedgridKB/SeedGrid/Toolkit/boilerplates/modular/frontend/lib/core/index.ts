// seedgrid:managed

// Barrel canônico do httpclient SeedGrid no admin-web (espelha crm/src/modules/core).
// Consumidores importam tudo daqui (`@/lib/core`): a extração de mensagem, o cliente
// HTTP e o handler de exceção vêm todos do pacote `@seedgrid/fe-core`.

export {
  ApiClientError,
  extractApiErrorMessage,
  isApiClientErrorLike,
  readApiErrorMessage,
  captureException,
  createApiClient,
  formatCurlCommand,
  normalizeError,
  registerExceptionReporter,
  runGuarded,
  suppressException,
  type ApiClientConfig,
  type ApiParseMode,
  type ApiRequestOptions,
  type ApiRetryOptions,
  type ExceptionContext,
  type ExceptionReporter,
} from "@seedgrid/fe-core";

export { adminProxyClient } from "./admin-proxy-client";

// `problemResponse` é SERVER-ONLY (usa next/server) e NÃO é re-exportado aqui para
// manter este barrel seguro nos bundles client. Route handlers importam de
// "@/lib/core/problem-response".
