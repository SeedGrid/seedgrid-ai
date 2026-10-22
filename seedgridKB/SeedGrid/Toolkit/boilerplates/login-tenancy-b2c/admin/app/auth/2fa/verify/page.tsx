"use client";

import {
  SgButton,
  SgCard,
  SgInputOTP,
  SgScreen,
  SgStack,
} from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  readPendingTwoFactor,
  clearPendingTwoFactor,
  type PendingTwoFactor,
} from "@/lib/two-factor-pending";

const CODE_LENGTH = 6;

function normalizeCode(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function methodHintFor(method: string): string {
  if (method === "EMAIL") {
    return "Enviamos um codigo para o seu e-mail.";
  }
  if (method === "WHATSAPP") {
    return "Enviamos um codigo para o seu WhatsApp.";
  }
  if (method === "TOTP") {
    return "Use o codigo do seu app autenticador.";
  }
  return "Informe o codigo do segundo fator.";
}

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const [pendingSession, setPendingSession] = useState<PendingTwoFactor | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const lastSubmittedRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = readPendingTwoFactor();
    if (!stored) {
      setErrorMessage("Sessao de verificacao expirada. Faca login novamente.");
      return;
    }
    setPendingSession(stored);
  }, []);

  const method = pendingSession?.method?.trim().toUpperCase() ?? "";
  const canResend = method === "EMAIL";
  const methodHint = methodHintFor(method);

  async function verify(rawCode: string) {
    const normalized = normalizeCode(rawCode);
    if (
      normalized.length !== CODE_LENGTH ||
      pending ||
      !pendingSession ||
      lastSubmittedRef.current === normalized
    ) {
      return;
    }

    setPending(true);
    setErrorMessage(null);
    lastSubmittedRef.current = normalized;
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: pendingSession.tempToken, code: normalized }),
      });
      const payload = (await response.json().catch(() => null)) as {
        changePasswordRequired?: boolean;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        lastSubmittedRef.current = null;
        setErrorMessage(
          payload?.error ?? payload?.message ?? "Codigo invalido ou expirado.",
        );
        return;
      }

      clearPendingTwoFactor();
      if (payload?.changePasswordRequired === true) {
        router.push("/change-password");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      lastSubmittedRef.current = null;
      setErrorMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    if (!pendingSession || resending) {
      return;
    }
    setResending(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const response = await fetch("/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: pendingSession.tempToken }),
      });
      const payload = (await response.json().catch(() => null)) as {
        method?: string;
        message?: string;
        error?: string;
      } | null;
      if (!response.ok) {
        setErrorMessage(payload?.error ?? payload?.message ?? "Falha ao reenviar.");
        return;
      }
      setCode("");
      lastSubmittedRef.current = null;
      setInfoMessage(payload?.message ?? "Codigo reenviado.");
    } finally {
      setResending(false);
    }
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title="Validar segundo fator"
          description="Confirme o codigo para concluir o acesso administrativo."
        >
          <SgStack gap={16}>
            <span className="text-xs text-muted-foreground">{methodHint}</span>

            <SgInputOTP
              id="login-2fa-otp"
              label="Codigo"
              mask="### ###"
              value={code}
              inputProps={{ autoComplete: "one-time-code", inputMode: "text" }}
              onChange={setCode}
              onRawChange={(raw) => {
                if (normalizeCode(raw).length < CODE_LENGTH) {
                  lastSubmittedRef.current = null;
                }
              }}
              onComplete={(value) => void verify(value)}
            />

            {infoMessage ? <div className="login-info">{infoMessage}</div> : null}
            {errorMessage ? <div className="login-error">{errorMessage}</div> : null}

            <SgButton
              label={pending ? "Validando..." : "Validar codigo"}
              onClick={() => void verify(code)}
            />

            {canResend ? (
              <SgButton
                appearance="ghost"
                label={resending ? "Reenviando..." : "Reenviar codigo"}
                onClick={() => void resend()}
                severity="secondary"
                type="button"
              />
            ) : null}

            <SgButton
              appearance="ghost"
              label="Voltar para o login"
              onClick={() => {
                clearPendingTwoFactor();
                router.push("/login");
              }}
              severity="secondary"
              type="button"
            />
          </SgStack>
        </SgCard>
      </div>
    </SgScreen>
  );
}
