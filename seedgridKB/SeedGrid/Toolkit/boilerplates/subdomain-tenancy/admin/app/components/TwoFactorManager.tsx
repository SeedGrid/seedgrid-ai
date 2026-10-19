"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgGrid,
  SgInputOTP,
  SgInputPassword,
  SgInputText,
  SgQRCode,
  SgSkeleton,
  SgStack,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { Download, ShieldCheck, ShieldOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "./StatusBadge";
import type {
  TwoFactorEnableResponse,
  TwoFactorMethod,
  TwoFactorStatus,
} from "@/lib/seedgrid-app-api";

// So instrucao PERSISTENTE (precisa continuar visivel enquanto o usuario confirma o QR/codigo) -
// sucesso/erro de acao pontual (ativar, desativar, confirmar) usa toast, nao esse estado.
type Feedback = { severity: "info"; message: string };

/**
 * Gestao do 2FA da propria conta (ativar/desativar, TOTP/EMAIL/WHATSAPP, backup codes).
 * Sem o Shell: e embutido na tela "Meu perfil" (e reusado pela rota /security/two-factor).
 */
export function TwoFactorManager() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [enableResponse, setEnableResponse] =
    useState<TwoFactorEnableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [method, setMethod] = useState<TwoFactorMethod>("TOTP");
  const [totpCode, setTotpCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableBackupCode, setDisableBackupCode] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/2f/status", { cache: "no-store" });
      if (!response.ok) {
        // Sem toast aqui: falha de CARREGAR o componente inteiro ja tem fallback proprio
        // (StatusBadge "Nao foi possivel carregar o 2FA" quando status fica null).
        return;
      }
      const next = (await response.json()) as TwoFactorStatus;
      setStatus(next);
      setMethod(next.availableMethods[0] ?? "TOTP");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  function resetForms() {
    setTotpCode("");
    setSetupCode("");
    setDisableCode("");
    setDisablePassword("");
    setDisableBackupCode("");
  }

  async function postJson(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data } as const;
  }

  function extractError(data: unknown): string {
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const candidate = record.detail ?? record.error ?? record.message;
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
    return "Operacao de 2FA falhou.";
  }

  async function handleEnable() {
    setPending(true);
    setFeedback(null);
    try {
      const { ok, data } = await postJson("/api/auth/2f/enable", { method });
      if (!ok) {
        toast.error(extractError(data));
        return;
      }
      const response = data as TwoFactorEnableResponse;
      setEnableResponse(response);
      if (response.backupCodes?.length && method !== "TOTP") {
        toast.success("2FA ativado.");
        await loadStatus();
      } else if (method === "TOTP") {
        setFeedback({
          severity: "info",
          message: "Escaneie o QR code no app autenticador e confirme com o codigo.",
        });
      } else {
        setFeedback({
          severity: "info",
          message: "Enviamos um codigo de confirmacao. Informe-o abaixo.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  async function handleConfirmTotp(code: string = totpCode) {
    setPending(true);
    setFeedback(null);
    try {
      const { ok, data } = await postJson("/api/auth/2f/totp-confirm", {
        code: code.trim(),
      });
      if (!ok) {
        toast.error(extractError(data));
        return;
      }
      setEnableResponse(data as TwoFactorEnableResponse);
      toast.success("2FA ativado.");
      setTotpCode("");
      await loadStatus();
    } finally {
      setPending(false);
    }
  }

  async function handleConfirmSetup(code: string = setupCode) {
    setPending(true);
    setFeedback(null);
    try {
      const { ok, data } = await postJson("/api/auth/2f/setup-confirm", {
        method,
        code: code.trim(),
      });
      if (!ok) {
        toast.error(extractError(data));
        return;
      }
      setEnableResponse(data as TwoFactorEnableResponse);
      toast.success("2FA ativado.");
      setSetupCode("");
      await loadStatus();
    } finally {
      setPending(false);
    }
  }

  async function handleDisable() {
    const requiresTotp = status?.primaryMethod === "TOTP";
    if (
      !disablePassword.trim() &&
      !disableBackupCode.trim() &&
      (!requiresTotp || !disableCode.trim())
    ) {
      toast.error(
        requiresTotp
          ? "Informe sua senha, um codigo de backup ou o codigo do app."
          : "Informe sua senha ou um codigo de backup.",
      );
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      const { ok, data } = await postJson("/api/auth/2f/disable", {
        twoFactorCode: disableCode.trim() || undefined,
        password: disablePassword.trim() || undefined,
        backupCode: disableBackupCode.trim() || undefined,
      });
      if (!ok) {
        toast.error(extractError(data));
        return;
      }
      toast.success("2FA desativado.");
      setEnableResponse(null);
      resetForms();
      await loadStatus();
    } finally {
      setPending(false);
    }
  }

  function downloadBackupCodes() {
    const codes = enableResponse?.backupCodes ?? [];
    if (!codes.length || typeof window === "undefined") {
      return;
    }
    const csv = ["code", ...codes].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "seedgrid-2fa-backup-codes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  const methodSource: SgComboboxSource = (status?.availableMethods ?? []).map(
    (item) => ({ id: item, label: item, value: item }),
  );

  if (loading) {
    return <SgSkeleton borderRadius={16} height={280} shape="rectangle" />;
  }

  if (!status) {
    return <StatusBadge severity="warning" value="Nao foi possivel carregar o 2FA." />;
  }

  return (
    <SgStack gap={16}>
      <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
        <SgCard cardStyle="flat" title="Status">
          <SgStack gap={12}>
            <StatusBadge
              severity={status.enabled ? "success" : "danger"}
              value={status.enabled ? "ATIVO" : "DESATIVADO"}
            />
            <DetailLine label="Metodo principal" value={status.primaryMethod ?? "-"} />
            <DetailLine
              label="Metodos disponiveis"
              value={status.availableMethods.join(", ") || "-"}
            />
            <DetailLine
              label="Codigos de backup"
              value={String(status.unusedBackupCodesCount ?? 0)}
            />
          </SgStack>
        </SgCard>

        <SgCard
          cardStyle="flat"
          title={status.enabled ? "Desativar 2FA" : "Ativar 2FA"}
          description={
            status.enabled
              ? "Confirme sua identidade para desativar."
              : "Escolha o metodo e siga a confirmacao."
          }
        >
          {status.enabled ? (
            // <form> em volta pelo mesmo motivo da tela de perfil: campo de senha solto faz o
            // Chrome reclamar no console e atrapalha o gerenciador de senhas.
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleDisable();
              }}
            >
              <SgStack gap={12}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>
                  Informe <strong>apenas um</strong> destes para confirmar — nao precisa preencher
                  todos. Se o codigo do app nao estiver sendo aceito, use a senha ou um codigo de backup.
                </span>
                <SgInputPassword
                  maxLength={128}
                  id="tfa-disable-password"
                  label="Senha atual"
                  onChange={setDisablePassword}
                  showStrengthBar={false}
                  commonPasswordCheck={false}
                  upperRequired={false}
                  lowerRequired={false}
                  numberRequired={false}
                  specialCharacterRequired={false}
                  prohibitsRepeatedCharactersInSequence={false}
                  prohibitsSequentialAscCharacters={false}
                  prohibitsSequentialDescCharacters={false}
                  minSize={0}
                  inputProps={{ autoComplete: "current-password" }}
                />
                <OrSeparator />
                <SgInputText
                  id="tfa-disable-backup"
                  label="Codigo de backup"
                  inputProps={{ value: disableBackupCode }}
                  onChange={setDisableBackupCode}
                />
                {status.primaryMethod === "TOTP" ? (
                  <>
                    <OrSeparator />
                    <SgInputText
                      id="tfa-disable-code"
                      label="Codigo do app"
                      inputProps={{ inputMode: "numeric", value: disableCode }}
                      onChange={setDisableCode}
                    />
                  </>
                ) : null}
                <SgButton
                  type="submit"
                  appearance="outline"
                  label={pending ? "Desativando..." : "Desativar"}
                  leftIcon={<ShieldOff size={16} />}
                  severity="danger"
                />
              </SgStack>
            </form>
          ) : (
            <SgStack gap={12}>
              <SgCombobox
                id="tfa-method"
                label="Metodo"
                source={methodSource}
                value={method}
                onValueChange={(value) =>
                  setMethod((value ? String(value) : "TOTP") as TwoFactorMethod)
                }
              />
              <SgButton
                appearance="outline"
                label={pending ? "Processando..." : "Ativar"}
                leftIcon={<ShieldCheck size={16} />}
                onClick={() => void handleEnable()}
                severity="secondary"
              />
            </SgStack>
          )}
        </SgCard>
      </SgGrid>

      {feedback ? (
        <StatusBadge severity={feedback.severity} value={feedback.message} />
      ) : null}

      {/* Confirmacao TOTP: QR + codigo */}
      {!status.enabled && (enableResponse?.otpauthUrl || enableResponse?.qrCode?.base64) ? (
        <SgCard cardStyle="flat" title="Confirmar app autenticador">
          <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
            {enableResponse.otpauthUrl ? (
              // QR renderizado do otpauth:// com o logo SeedGrid no centro (correcao de erro H).
              <div
                style={{
                  width: 216,
                  height: 216,
                  borderRadius: 16,
                  border: "1px solid rgb(var(--sg-border, 226 232 240))",
                  background: "#fff",
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SgQRCode
                  value={enableResponse.otpauthUrl}
                  size={200}
                  errorCorrectionLevel="H"
                  logoSrc="/logo-seedgrid.svg"
                  logoAlt="SeedGrid"
                  logoSize={48}
                  logoPadding={5}
                  logoBackgroundColor="#fff"
                  logoBorderRadius={8}
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="QR code do 2FA"
                src={`data:image/png;base64,${enableResponse.qrCode?.base64 ?? ""}`}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                  borderRadius: 16,
                  border: "1px solid rgb(var(--sg-border, 226 232 240))",
                  background: "#fff",
                  padding: 8,
                }}
              />
            )}
            <SgStack gap={12}>
              {enableResponse.secret ? (
                <DetailLine label="Secret" value={enableResponse.secret} />
              ) : null}
              <SgInputOTP
                id="tfa-totp-code"
                label="Codigo do app"
                mask="999-999"
                value={totpCode}
                onRawChange={setTotpCode}
                onComplete={(value) => void handleConfirmTotp(value.replace(/\D/g, ""))}
              />
              <SgButton
                appearance="outline"
                label={pending ? "Confirmando..." : "Confirmar"}
                onClick={() => void handleConfirmTotp()}
                severity="secondary"
              />
            </SgStack>
          </SgGrid>
        </SgCard>
      ) : null}

      {/* Confirmacao EMAIL/WHATSAPP: codigo enviado */}
      {!status.enabled &&
      enableResponse?.status === "SETUP_CONFIRMATION_REQUIRED" ? (
        <SgCard
          cardStyle="flat"
          title="Confirmar codigo"
          description={
            enableResponse.metadata?.email
              ? `Codigo enviado para ${enableResponse.metadata.email}`
              : enableResponse.metadata?.whatsApp
                ? `Codigo enviado para ${enableResponse.metadata.whatsApp}`
                : "Informe o codigo recebido."
          }
        >
          <SgStack gap={12}>
            <SgInputOTP
              id="tfa-setup-code"
              label="Codigo"
              mask="999-999"
              value={setupCode}
              onRawChange={setSetupCode}
              onComplete={(value) => void handleConfirmSetup(value.replace(/\D/g, ""))}
            />
            <SgButton
              appearance="outline"
              label={pending ? "Confirmando..." : "Confirmar"}
              onClick={() => void handleConfirmSetup()}
              severity="secondary"
            />
          </SgStack>
        </SgCard>
      ) : null}

      {/* Codigos de backup gerados na ativacao */}
      {enableResponse?.backupCodes?.length ? (
        <SgCard
          cardStyle="flat"
          title="Codigos de backup"
          description="Guarde-os em local seguro. Cada codigo so pode ser usado uma vez."
        >
          <SgStack gap={12}>
            <SgButton
              appearance="outline"
              label="Baixar CSV"
              leftIcon={<Download size={16} />}
              onClick={downloadBackupCodes}
              severity="secondary"
            />
            <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
              {enableResponse.backupCodes.map((code) => (
                <div
                  key={code}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgb(var(--sg-border, 226 232 240))",
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    fontSize: 13,
                  }}
                >
                  {code}
                </div>
              ))}
            </SgGrid>
          </SgStack>
        </SgCard>
      ) : null}
    </SgStack>
  );
}

function DetailLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <SgStack gap={2}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </SgStack>
  );
}

/** Divisor "ou" entre os campos alternativos de confirmacao (basta preencher um). */
function OrSeparator() {
  const line = {
    flex: 1,
    height: 1,
    background: "rgb(var(--sg-border, 226 232 240))",
  } as const;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
      <span style={line} />
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        ou
      </span>
      <span style={line} />
    </div>
  );
}
