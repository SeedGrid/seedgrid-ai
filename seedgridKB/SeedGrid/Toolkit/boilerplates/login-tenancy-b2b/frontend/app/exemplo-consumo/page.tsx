"use client";

import { SgButton, SgCard, SgSkeleton, SgStack, toast } from "@seedgrid/fe-components";
import { Send, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MeterUsageBar } from "../components/MeterUsageBar";
import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import type { UsageAccess, UsageResponse } from "@/lib/ported/billingTypes";

/**
 * EXEMPLO DE CONSUMO: as duas formas de contar uso, lado a lado, com o saldo de cada contador. E' a parte
 * visivel do dominio de exemplo do backend (demo/UsageDemoResource.java). Guia: docs/contadores-de-uso.md.
 *
 * O bloqueio vem do billing como 402 com um `code` estavel; a tela so' traduz. Antes de tentar, o
 * `meterAccess` do /me/usage ja' diz se 1 unidade passaria — e o botao mostra por que nao.
 */

type Problem = { code?: string; detail?: string; label?: string };

const CODE_MESSAGES: Record<string, (problem: Problem) => string> = {
  METER_NOT_IN_PLAN: (p) => `Seu plano nao inclui ${p.label ?? "este recurso"}. Troque de plano para usar.`,
  QUOTA_EXCEEDED: (p) => `A franquia de ${p.label ?? "uso"} deste ciclo acabou.`,
  TRIAL_QUOTA_EXCEEDED: (p) => `Seu periodo de avaliacao chegou ao limite de ${p.label ?? "uso"}. Assine um plano.`,
  TRIAL_EXPIRED: () => "Seu periodo de avaliacao terminou. Assine um plano para continuar.",
  NO_ACTIVE_SUBSCRIPTION: () => "Sua conta nao tem assinatura ativa.",
  PAYMENT_PAST_DUE: () => "Ha um pagamento pendente. Regularize para continuar.",
};

function messageFor(problem: Problem | null, fallback: string): string {
  if (problem?.code && CODE_MESSAGES[problem.code]) {
    return CODE_MESSAGES[problem.code](problem);
  }
  return problem?.detail ?? fallback;
}

async function readProblem(response: Response): Promise<Problem | null> {
  try {
    return (await response.json()) as Problem;
  } catch {
    return null;
  }
}

function blockedReason(access: UsageAccess | undefined): string | null {
  if (!access || access.canConsume) {
    return null;
  }
  return messageFor({ code: access.code ?? undefined, detail: access.message ?? undefined }, "Indisponivel.");
}

export default function UsageExamplePage() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"requests" | "files" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadUsage = useCallback(async () => {
    try {
      const response = await fetch("/api/me/usage", { cache: "no-store" });
      if (response.ok) {
        setUsage((await response.json()) as UsageResponse);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  async function makeRequest() {
    setBusy("requests");
    try {
      const response = await fetch("/api/demo/requests", { method: "POST" });
      if (!response.ok) {
        toast.error(messageFor(await readProblem(response), "Falha na requisicao."));
        return;
      }
      toast.success("Requisicao feita: 1 unidade de Requisicoes consumida.");
    } finally {
      setBusy(null);
      await loadUsage();
    }
  }

  async function upload(file: File) {
    setBusy("files");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/demo/files", { method: "POST", body: form });
      if (!response.ok) {
        toast.error(messageFor(await readProblem(response), "Falha no envio."));
        return;
      }
      const result = (await response.json()) as { storedMb: number };
      toast.success(`Arquivo enviado: ${result.storedMb} MB de armazenamento consumidos.`);
    } finally {
      setBusy(null);
      if (fileInput.current) {
        fileInput.current.value = "";
      }
      await loadUsage();
    }
  }

  const requestsBlocked = blockedReason(usage?.meterAccess?.requests);
  const storageBlocked = blockedReason(usage?.meterAccess?.["storage-mb"]);

  return (
    <Shell
      eyebrow="Exemplo"
      title="Exemplo de consumo"
      description="As duas formas de cobrar por uso: uma chamada vale uma unidade, ou a quantidade se conhece na hora."
    >
      <SgStack gap={16}>
        <SgCard
          cardStyle="outlined"
          title="Consumo do ciclo"
          description="Um saldo por contador de uso que o seu plano inclui."
        >
          {loading ? (
            <SgSkeleton borderRadius={16} height={96} shape="rectangle" />
          ) : usage?.billingCycle && usage.billingCycle.meters.length > 0 ? (
            <SgStack gap={12}>
              {usage.billingCycle.meters.map((meter) => (
                <MeterUsageBar key={meter.meter} meter={meter} />
              ))}
            </SgStack>
          ) : (
            <StatusBadge severity="warning" value={messageFor(
              { code: usage?.access?.code ?? undefined, detail: usage?.access?.message ?? undefined },
              "Sua conta ainda nao tem consumo neste ciclo.",
            )} />
          )}
        </SgCard>

        <SgCard
          cardStyle="outlined"
          title="Requisicoes (contadas pela anotacao)"
          description="Cada clique chama um endpoint anotado com @ConsumesUsage(meter = &quot;requests&quot;): 1 chamada = 1 unidade."
        >
          <SgStack gap={8}>
            <SgButton
              appearance="solid"
              severity="primary"
              label={busy === "requests" ? "Enviando..." : "Fazer requisicao"}
              leftIcon={<Send size={16} />}
              onClick={() => void makeRequest()}
            />
            {requestsBlocked ? <StatusBadge severity="warning" value={requestsBlocked} /> : null}
          </SgStack>
        </SgCard>

        <SgCard
          cardStyle="outlined"
          title="Armazenamento (contado pelo codigo)"
          description="O tamanho do arquivo (em MB, arredondado para cima) so' se conhece no envio: o backend chama UsageService.consume(&quot;storage-mb&quot;, mb). O exemplo nao guarda o arquivo."
        >
          <SgStack gap={8}>
            <input
              ref={fileInput}
              type="file"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void upload(file);
                }
              }}
            />
            <SgButton
              appearance="outline"
              severity="secondary"
              label={busy === "files" ? "Enviando..." : "Enviar arquivo"}
              leftIcon={<Upload size={16} />}
              onClick={() => fileInput.current?.click()}
            />
            {storageBlocked ? <StatusBadge severity="warning" value={storageBlocked} /> : null}
          </SgStack>
        </SgCard>
      </SgStack>
    </Shell>
  );
}
