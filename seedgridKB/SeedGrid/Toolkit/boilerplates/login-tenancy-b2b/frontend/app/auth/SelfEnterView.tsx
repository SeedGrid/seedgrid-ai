"use client";

import {
  SgButton,
  SgCard,
  SgInputPassword,
  SgInputPhone,
  SgInputText,
  SgScreen,
} from "@seedgrid/fe-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SelfEnterRequestView } from "./SelfEnterRequestView";

type Invitation = {
  requestId: string;
  email: string;
  name: string;
  status: string;
  invitationExpiresAt: string | null;
};

type Phase = "loading" | "form" | "invalid" | "done";

// Pagina PUBLICA de conclusao do convite (self-enter). Ao montar, valida o token via proxy publico;
// se valido, mostra o form (nome + WhatsApp + senha + confirmacao) para o convidado completar o
// cadastro. No submit, chama o complete e o pedido vai para aprovacao do admin.
//
// DIVERGENCIA do admin: sem `token` na URL nao e' "link invalido" — e' o cadastro PUBLICO (sem
// convite), em `SelfEnterRequestView`. Link publico: /auth/self-enter?company=<publicId>.
export function SelfEnterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [invite, setInvite] = useState<Invitation | null>(null);
  const [name, setName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // StrictMode monta o efeito duas vezes em dev; evita validar em duplicidade.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    // Sem token: quem desenha a tela e' o SelfEnterRequestView (cadastro publico).
    if (!token) {
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`/api/self-enter/${encodeURIComponent(token)}`);
        const data = (await res.json().catch(() => ({}))) as
          | (Invitation & { message?: string; detail?: string; title?: string })
          | Record<string, never>;

        if (!res.ok) {
          setPhase("invalid");
          setMessage(
            res.status === 404
              ? "Este convite ja foi usado ou expirou. Peca um novo convite ao administrador."
              : ("detail" in data && data.detail) ||
                  ("message" in data && data.message) ||
                  ("title" in data && data.title) ||
                  "Convite invalido.",
          );
          return;
        }

        setInvite(data as Invitation);
        setName((data as Invitation).name ?? "");
        setPhase("form");
      } catch {
        setPhase("invalid");
        setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
      }
    })();
  }, [token]);

  async function submit() {
    if (!token) {
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas nao coincidem.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/self-enter/${encodeURIComponent(token)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: invite?.email,
          whatsApp: whatsApp.trim(),
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        detail?: string;
        title?: string;
      };

      if (!res.ok) {
        setMessage(
          data.detail ?? data.message ?? data.title ?? "Nao foi possivel concluir o cadastro.",
        );
        return;
      }

      setPhase("done");
      setMessage(
        data.message ??
          "Cadastro enviado! Aguarde a aprovacao do administrador para acessar a plataforma.",
      );
    } catch {
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <SelfEnterRequestView />;
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard cardStyle="elevated" title="Concluir cadastro">
          {phase === "loading" ? <p className="lede">Validando convite...</p> : null}

          {phase === "invalid" ? (
            <>
              <div className="login-error">{message}</div>
              <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
            </>
          ) : null}

          {phase === "done" ? (
            <>
              <div className="login-info">{message}</div>
              <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
            </>
          ) : null}

          {phase === "form" ? (
            <>
              <p className="lede">
                Convite para <strong>{invite?.email}</strong>. Complete seus dados:
              </p>
              {message ? <div className="login-error">{message}</div> : null}

              <SgInputText
                id="self-enter-name"
                label="Nome completo"
                required
                inputProps={{
                  value: name,
                  onChange: (event) => setName(event.target.value),
                }}
              />
              <SgInputPhone
                id="self-enter-whatsapp"
                label="WhatsApp"
                inputProps={{
                  value: whatsApp,
                  onChange: (event) => setWhatsApp(event.target.value),
                }}
              />
              <SgInputPassword
                maxLength={128}
                id="self-enter-password"
                label="Senha"
                required
                minSize={8}
                showStrengthBar
                createNewPasswordButton
                onChange={(value) => setPassword(value)}
              />
              <SgInputPassword
                maxLength={128}
                id="self-enter-confirm"
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
                label={submitting ? "Enviando..." : "Concluir cadastro"}
                disabled={submitting}
                onClick={() => void submit()}
              />
            </>
          ) : null}
        </SgCard>
      </div>
    </SgScreen>
  );
}
