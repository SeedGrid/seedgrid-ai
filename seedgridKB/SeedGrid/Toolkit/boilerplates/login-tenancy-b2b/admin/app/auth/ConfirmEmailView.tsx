"use client";

import { SgButton, SgCard, SgScreen } from "@seedgrid/fe-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Status = "loading" | "success" | "error";

// View compartilhada pelas rotas /auth/welcome e /auth/confirm-email. Ao montar, le o
// token da query, chama o proxy de confirmacao e, em caso de sucesso, redireciona para
// o login com contexto para a troca de senha obrigatoria do primeiro acesso.
//
// `afterSuccess`: pra onde mandar o usuario apos confirmar.
// - "admin-login" (/auth/welcome): quem se cadastra por aqui E' usuario do admin-web
//   (staff/plataforma) — redireciona pro /login normalmente.
// - "desktop-app" (/auth/confirm-email): usado SO' pelo e-mail de ativacao de "novo
//   usuario" do report-CLIENT (MeUserResource#sendActivationEmail) — esse usuario NUNCA
//   loga no admin-web (so' no app desktop), entao mandar pro /login so' confundia (ele
//   achava que era ali que devia entrar). Fica na propria tela, sem redirecionar.
export function ConfirmEmailView({
  title,
  afterSuccess = "admin-login",
}: {
  readonly title: string;
  readonly afterSuccess?: "admin-login" | "desktop-app";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);
  // StrictMode monta o efeito duas vezes em dev; evita confirmar/redirecionar em duplicidade.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Link invalido: token nao informado.");
      return;
    }

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      try {
        const response = await fetch(
          `/api/auth/confirm-email?token=${encodeURIComponent(token)}`,
        );
        const payload = (await response.json().catch(() => ({}))) as {
          message?: string;
          detail?: string;
          title?: string;
        };

        if (!response.ok) {
          setStatus("error");
          // 404 = token nao encontrado: tipicamente o link ja foi usado (e-mail ja
          // confirmado) ou expirou. Mostramos uma mensagem clara em vez do texto tecnico.
          if (response.status === 404) {
            setMessage(
              "Este link de confirmacao ja foi usado ou expirou. " +
                "Se a sua conta ja esta confirmada, basta fazer login.",
            );
          } else {
            setMessage(
              payload.detail ??
                payload.message ??
                payload.title ??
                "Nao foi possivel confirmar o e-mail.",
            );
          }
          return;
        }

        setStatus("success");
        if (afterSuccess === "desktop-app") {
          setMessage(
            "E-mail confirmado com sucesso! Abra o aplicativo SeedGrid App no seu " +
              "computador e entre com a senha provisoria para definir sua nova senha.",
          );
          // Sem redirecionamento: este usuario nao tem acesso ao admin-web, so' ao app
          // desktop — mandar pro /login daqui so' confundia.
        } else {
          setMessage(
            payload.message ??
              "E-mail confirmado com sucesso! Entre com a senha provisoria para definir sua nova senha.",
          );
          redirectTimer = setTimeout(() => {
            router.push("/login?confirmed=1");
            router.refresh();
          }, 1800);
        }
      } catch {
        setStatus("error");
        setMessage(
          "Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.",
        );
      }
    })();

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [token, router, afterSuccess]);

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard cardStyle="elevated" title={title}>
          {status === "loading" ? (
            <p className="lede">Confirmando seu e-mail...</p>
          ) : null}

          {status === "success" ? (
            <>
              <div className="login-info">{message}</div>
              {afterSuccess === "desktop-app" ? null : (
                <p className="lede">Redirecionando para o login...</p>
              )}
            </>
          ) : null}

          {status === "error" ? (
            <>
              <div className="login-error">{message}</div>
              <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
            </>
          ) : null}
        </SgCard>
      </div>
    </SgScreen>
  );
}
