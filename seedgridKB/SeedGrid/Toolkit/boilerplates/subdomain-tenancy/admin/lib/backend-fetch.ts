import "server-only";
import { adminForwardedHost } from "./tenant-host";

export function backendHost(): string {
  return adminForwardedHost();
}

export async function backendFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("X-Forwarded-Host", backendHost());
  headers.delete("X-Company-Id");
  const target = new URL(url);
  const method = options.method?.toUpperCase();
  if ((method === "POST" && target.pathname === "/users")
      || (method === "PATCH" && /^\/users\/[^/]+$/.test(target.pathname))) {
    target.pathname = `/app/security${target.pathname}`;
  }
  return fetch(target, { ...options, headers, cache: "no-store" });
}
