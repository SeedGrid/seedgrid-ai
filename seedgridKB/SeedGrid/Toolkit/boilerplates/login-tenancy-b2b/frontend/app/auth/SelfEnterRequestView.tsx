"use client";

import {
  SgButton,
  SgCard,
  SgInputEmail,
  SgInputOTP,
  SgInputPassword,
  SgInputText,
  SgScreen,
} from "@seedgrid/fe-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { CreateEntryRequest } from "@/lib/self-enter";

type Phase = "form" | "code" | "pending";

type ApiMessage = {
  message?: string;
  detail?: string;
  title?: string;
  requestId?: string;
};

function readMessage(data: ApiMessage, fallback: string): string {
  return data.detail ?? data.message ?? data.title ?? fallback;
}

// Pagina PUBLICA de cadastro SEM convite (self-enter publico). Mesma rota do convite
// (/auth/self-enter): sem `token` na URL, e' este formulario que aparece. O link que a tela
// "Convidar usuario externo" mostra leva `?company=<publicId>` quando a empresa precisa ser
// identificada (banco compartilhado, conta cliente) — e esse valor vai no pedido como `company`.
//
// Fluxo: nome + e-mail + senha -> codigo de 6 digitos enviado por e-mail (com reenvio) ->
// aguardando aprovacao de quem administra a empresa.
export function SelfEnterRequestView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get("company")?.trim() || null;

  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitRequest() {
    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const body: CreateEntryRequest = {
        name: name.trim(),
        email: email.trim(),
        password,
        ...(company ? { company } : {}),
      };
      const res = await fetch("/api/self-enter/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as ApiMessage;

      if (!res.ok) {
        setError(readMessage(data, "Nao foi possivel enviar o cadastro."));
        return;
      }

      // Sem `requestId` o backend nao revela o motivo (e-mail ja cadastrado ou ja convidado):
      // resposta neutra, sem etapa de codigo.
      if (!data.requestId) {
        setPhase("pending");
        setInfo(
          "Se o e-mail puder ser cadastrado, voce recebera um codigo de confirmacao. " +
            "Se voce ja tem acesso, entre pelo login.",
        );
        return;
      }

      setRequestId(data.requestId);
      setPhase("code");
      setInfo("Enviamos um codigo de 6 digitos para o seu e-mail. Verifique tambem o spam.");
    } catch {
      setError("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCode(codeOverride?: string) {
    // codeOverride vem do onComplete do SgInputOTP: ao colar o codigo, o estado `code` ainda nao
    // foi atualizado nesse tick (mesmo cuidado do SignupForm).
    const value = (codeOverride ?? code).replace(/\D/g, "");
    if (!requestId || value.length !== 6) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/self-enter/requests/${encodeURIComponent(requestId)}/confirm-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as ApiMessage;

      if (!res.ok) {
        setError(readMessage(data, "Codigo invalido ou expirado."));
        return;
      }

      setPhase("pending");
      setInfo(
        "E-mail confirmado! Seu cadastro esta aguardando aprovacao. " +
          "Voce recebera um e-mail quando puder acessar.",
      );
    } catch {
      setError("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (!requestId) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(
        `/api/self-enter/requests/${encodeURIComponent(requestId)}/resend-email`,
        { method: "POST" },
      );
      const data = (await res.json().catch(() => ({}))) as ApiMessage;

      if (!res.ok) {
        setError(readMessage(data, "Nao foi possivel reenviar o codigo."));
        return;
      }
      setInfo("Novo codigo enviado. Verifique a caixa de entrada e o spam.");
    } catch {
      setError("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title={phase === "code" ? "Confirmar e-mail" : "Solicitar cadastro"}
        >
          {phase === "pending" ? (
            <>
              <div className="login-info">{info}</div>
              <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
            </>
          ) : null}

          {phase === "code" ? (
            <>
              <p className="lede">
                Confirme o cadastro de <strong>{email.trim()}</strong>.
              </p>
              {info ? <div className="login-info">{info}</div> : null}
              {error ? <div className="login-error">{error}</div> : null}
              <SgInputOTP
                id="self-enter-code"
                label="Codigo de confirmacao"
                hintText="Digite o codigo de 6 digitos enviado por e-mail"
                mask="999-999"
                inputProps={{ inputMode: "numeric" }}
                onRawChange={(raw) => setCode(raw)}
                onComplete={(value) => void confirmCode(value)}
              />
              <SgButton
                label={submitting ? "Confirmando..." : "Confirmar"}
                disabled={submitting || code.replace(/\D/g, "").length !== 6}
                onClick={() => void confirmCode()}
              />
              <SgButton
                appearance="ghost"
                label="Reenviar codigo"
                disabled={submitting}
                onClick={() => void resendCode()}
              />
            </>
          ) : null}

          {phase === "form" ? (
            <>
              <p className="lede">
                Preencha seus dados. Depois de confirmar o e-mail, o cadastro fica aguardando
                aprovacao.
              </p>
              {error ? <div className="login-error">{error}</div> : null}

              <SgInputText
                id="self-enter-request-name"
                label="Nome completo"
                required
                inputProps={{
                  value: name,
                  onChange: (event) => setName(event.target.value),
                }}
              />
              <SgInputEmail
                id="self-enter-request-email"
                label="E-mail"
                required
                inputProps={{ value: email }}
                onChange={(value) => setEmail(value)}
              />
              <SgInputPassword
                maxLength={128}
                id="self-enter-request-password"
                label="Senha"
                required
                minSize={8}
                showStrengthBar
                createNewPasswordButton
                onChange={(value) => setPassword(value)}
              />
              <SgInputPassword
                maxLength={128}
                id="self-enter-request-confirm"
                label="Confirmar senha"
                required
                // So confirmacao: sem barra de forca e sem politica; unica regra e coincidir.
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
                validation={(value) => (value === password ? null : "As senhas nao coincidem")}
                onChange={(value) => setConfirmPassword(value)}
              />
              <SgButton
                label={submitting ? "Enviando..." : "Solicitar cadastro"}
                disabled={submitting}
                onClick={() => void submitRequest()}
              />
              <SgButton
                appearance="ghost"
                label="Ja tenho acesso"
                onClick={() => router.push("/login")}
              />
            </>
          ) : null}
        </SgCard>
      </div>
    </SgScreen>
  );
}
