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

type Phase = "form" | "confirm" | "done";

type ApiMessage = {
  message?: string;
  detail?: string;
  title?: string;
  requestId?: string;
};

function readMessage(data: ApiMessage, fallback: string): string {
  return data.detail ?? data.message ?? data.title ?? fallback;
}

// Pagina PUBLICA de cadastro pelo link publico (self-enter SEM convite): /auth/self-enter sem
// `token`. Fluxo: dados (nome + e-mail + senha) -> codigo de 6 digitos enviado por e-mail ->
// aguardando aprovacao de quem administra a conta. O pedido vai para a empresa do subdominio; o
// `?company=` opcional do link e' repassado so' por paridade com o login-tenancy.
export function SelfEnterRequestView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get("company");

  const [phase, setPhase] = useState<Phase>("form");
  const [message, setMessage] = useState<string | null>(null);
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
      setMessage("Preencha nome, e-mail e senha.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas nao coincidem.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/self-enter/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          company,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiMessage;

      if (!res.ok) {
        setMessage(readMessage(data, "Nao foi possivel enviar o cadastro."));
        return;
      }

      // Sem requestId o backend nao revela se o e-mail e valido (anti-enumeracao): nao ha' o que
      // confirmar aqui, so' orientar a olhar a caixa de entrada.
      if (!data.requestId) {
        setPhase("done");
        setInfo(
          "Se o e-mail for valido, voce recebera um codigo de confirmacao. " +
            "Depois de confirmado, o cadastro aguarda a aprovacao do administrador.",
        );
        return;
      }

      setRequestId(data.requestId);
      setPhase("confirm");
      setInfo(`Enviamos um codigo de 6 digitos para ${email.trim()}.`);
    } catch {
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCode(codeOverride?: string) {
    // codeOverride vem do onComplete do SgInputOTP: ao colar o codigo, o estado `code` ainda nao
    // foi atualizado nessa tick (mesmo cuidado do SignupForm).
    const value = (codeOverride ?? code).trim();
    if (!requestId || value.length !== 6) {
      return;
    }
    setSubmitting(true);
    setMessage(null);
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
        setMessage(readMessage(data, "Codigo invalido ou expirado."));
        return;
      }

      setPhase("done");
      setInfo(
        "E-mail confirmado! Seu cadastro esta aguardando a aprovacao do administrador. " +
          "Voce recebera um aviso quando o acesso for liberado.",
      );
    } catch {
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (!requestId) {
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/self-enter/requests/${encodeURIComponent(requestId)}/resend-email`,
        { method: "POST" },
      );
      const data = (await res.json().catch(() => ({}))) as ApiMessage;

      if (!res.ok) {
        setMessage(readMessage(data, "Nao foi possivel reenviar o codigo."));
        return;
      }

      setInfo("Novo codigo enviado. Verifique a caixa de entrada e o spam.");
    } catch {
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title={phase === "confirm" ? "Confirmar e-mail" : "Solicitar acesso"}
        >
          {phase === "done" ? (
            <>
              <div className="login-info">{info}</div>
              <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
            </>
          ) : null}

          {phase === "confirm" ? (
            <>
              {info ? <p className="lede">{info}</p> : null}
              {message ? <div className="login-error">{message}</div> : null}

              <SgInputOTP
                id="self-enter-code"
                label="Codigo de confirmacao"
                hintText="Digite o codigo de 6 digitos enviado por e-mail"
                mask="999-999"
                inputProps={{ inputMode: "numeric" }}
                onRawChange={(raw) => setCode(raw)}
                onComplete={(value) => void confirmCode(value.replace(/\D/g, ""))}
              />
              <SgButton
                label={submitting ? "Confirmando..." : "Confirmar"}
                disabled={submitting || code.length !== 6}
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
                Preencha seus dados. Depois de confirmar o e-mail, o cadastro aguarda a aprovacao
                do administrador.
              </p>
              {message ? <div className="login-error">{message}</div> : null}

              <SgInputText
                id="self-enter-request-name"
                label="Nome completo"
                required
                inputProps={{ value: name }}
                onChange={setName}
              />
              <SgInputEmail
                id="self-enter-request-email"
                label="E-mail"
                required
                validateOnBlur
                inputProps={{ value: email }}
                onChange={setEmail}
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
                label={submitting ? "Enviando..." : "Solicitar acesso"}
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
