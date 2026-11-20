import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PLANS_SUBTITLE, PLAN_UNAVAILABLE_MESSAGE, isPlanSubscribable } from "./plan-availability";

describe("plano assinável (FE-42)", () => {
  it("só é assinável com preço no provedor de pagamento", () => {
    expect(isPlanSubscribable({ checkoutEnabled: true })).toBe(true);
    expect(isPlanSubscribable({ checkoutEnabled: false })).toBe(false);
  });

  it("os textos do cliente são de negócio, sem instrução de administrador nem texto de outro produto", () => {
    for (const text of [PLAN_UNAVAILABLE_MESSAGE, PLANS_SUBTITLE]) {
      expect(text).not.toMatch(/admin|stripe|id de pre|cadastre/i);
      expect(text).not.toMatch(/solicita|relat[oó]rio|IA\b/i);
    }
  });
});

describe("tela de assinatura do cliente", () => {
  const source = readFileSync(new URL("../app/assinatura/SubscriptionPlansView.tsx", import.meta.url), "utf8");

  it("não mostra instrução de administrador nem o subtítulo de outro produto", () => {
    expect(source).not.toMatch(/Cadastre o ID/i);
    expect(source).not.toMatch(/ID de pre[cç]o do Stripe/i);
    expect(source).not.toMatch(/solicita[cç][oõ]es de IA/i);
  });

  it("plano sem preço não oferece o botão de assinar", () => {
    expect(source).toMatch(/isPlanSubscribable\(plan\)/);
    expect(source).toMatch(/PLAN_UNAVAILABLE_MESSAGE/);
  });
});
