import { describe, expect, it, vi } from "vitest";

import { installCompanyAccessFetchGuard, isBffUrl } from "./company-access-guard";

function hostReturning(response: () => Response) {
  return { fetch: vi.fn(async () => response()) as unknown as typeof fetch };
}

describe("isBffUrl", () => {
  it("so' considera o BFF (/api/**)", () => {
    expect(isBffUrl("/api/security/users")).toBe(true);
    expect(isBffUrl("http://localhost:3002/api/me/usage")).toBe(true);
    expect(isBffUrl("https://cdn.exemplo.com/lib.js")).toBe(false);
    expect(isBffUrl("/login")).toBe(false);
  });
});

describe("installCompanyAccessFetchGuard", () => {
  it("avisa READ_ONLY sem consumir o corpo", async () => {
    const body = '{"status":403,"code":"COMPANY_READ_ONLY"}';
    const host = hostReturning(() => new Response(body, { status: 403 }));
    const onReadOnly = vi.fn();
    const onDisabled = vi.fn();
    installCompanyAccessFetchGuard(host, { onReadOnly, onDisabled });

    const response = await host.fetch("/api/security/users", { method: "POST" });
    expect(onReadOnly).toHaveBeenCalledTimes(1);
    expect(onDisabled).not.toHaveBeenCalled();
    expect(await response.text()).toBe(body);
  });

  it("avisa DISABLED", async () => {
    const host = hostReturning(() => new Response('{"code":"COMPANY_DISABLED"}', { status: 403 }));
    const onDisabled = vi.fn();
    installCompanyAccessFetchGuard(host, { onReadOnly: vi.fn(), onDisabled });
    await host.fetch("/api/me/usage");
    expect(onDisabled).toHaveBeenCalledTimes(1);
  });

  it("ignora 403 sem codigo de empresa, outros status e URLs fora do BFF", async () => {
    const onReadOnly = vi.fn();
    const onDisabled = vi.fn();

    const denied = hostReturning(() => new Response('{"code":"ACCESS_DENIED"}', { status: 403 }));
    installCompanyAccessFetchGuard(denied, { onReadOnly, onDisabled });
    await denied.fetch("/api/security/users");

    const ok = hostReturning(() => new Response("{}", { status: 200 }));
    installCompanyAccessFetchGuard(ok, { onReadOnly, onDisabled });
    await ok.fetch("/api/security/users");

    const external = hostReturning(() => new Response('{"code":"COMPANY_READ_ONLY"}', { status: 403 }));
    installCompanyAccessFetchGuard(external, { onReadOnly, onDisabled });
    await external.fetch("https://terceiro.exemplo.com/x");

    expect(onReadOnly).not.toHaveBeenCalled();
    expect(onDisabled).not.toHaveBeenCalled();
  });

  it("e' idempotente (a segunda instalacao so' troca os handlers) e o disposer restaura o fetch", async () => {
    const host = hostReturning(() => new Response('{"code":"COMPANY_READ_ONLY"}', { status: 403 }));
    const original = host.fetch;
    const first = vi.fn();
    const second = vi.fn();
    const dispose = installCompanyAccessFetchGuard(host, { onReadOnly: first, onDisabled: vi.fn() });
    const wrapped = host.fetch;
    installCompanyAccessFetchGuard(host, { onReadOnly: second, onDisabled: vi.fn() });
    expect(host.fetch).toBe(wrapped);

    await host.fetch("/api/x");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    dispose();
    expect(host.fetch).toBe(original);
  });
});
