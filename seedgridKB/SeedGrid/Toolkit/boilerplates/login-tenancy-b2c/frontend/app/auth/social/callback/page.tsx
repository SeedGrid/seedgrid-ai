"use client";

import { SgButton, SgInputEmail, SgInputOTP, SgStack, toast } from "@seedgrid/fe-components";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

import { resolvePostLoginPath } from "@/lib/company-selection";
import { readError } from "@/lib/ported/clientError";
import { getSignupConfig, type SignupConfig } from "@/lib/ported/portedApi";
import { savePendingTwoFactor } from "@/lib/two-factor-pending";
import { AuthCard } from "../../AuthCard";
import { SocialLoginButtons } from "../../SocialLoginButtons";
import {
  buildConfirmBody,
  buildEmailBody,
  isRetryableCodeError,
  normalizeEmailCode,
  interpretSocialResponse,
  parseSocialReturn,
  socialErrorMessage,
  validateEmailCode,
  validateSocialEmail,
} from "../../socialLogin";

/**
 * Volta do login social (publica, sob `/auth/**`). O backend termina o fluxo com o provedor e redireciona para
 * ca com `?ticket=` (sucesso) ou `?status=` (EMAIL_REQUIRED | TERMS_REQUIRED | REJECTED). Com ticket, troca por
 * sessao (`POST /api/auth/social/exchange`, mesmo AuthResponse do login por senha, 2FA incluso).
 */
export default function SocialCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SocialCallbackContent />
    </Suspense>
  );
}

type Phase =
  | { name: "working" }
  | { name: "error"; message: string }
  | { name: "email"; pending: string }
  | { name: "code"; pending: string; email: string }
  | { name: "terms" };

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function problemCode(payload: unknown): string | null {
  const code = payload && typeof payload === "object" ? (payload as { code?: unknown }).code : null;
  return typeof code === "string" ? code : null;
}

function SocialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>({ name: "working" });
  const [config, setConfig] = useState<SignupConfig | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // StrictMode remonta o efeito; o ticket e' de uso unico, entao so' uma troca por carregamento.
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    const result = parseSocialReturn(searchParams);
    // A query carrega ticket/pending: sai da barra de enderecos e do historico antes de qualquer coisa.
    window.history.replaceState(null, "", window.location.pathname);

    if (result.kind === "ticket") {
      void exchange(result.ticket);
    } else if (result.kind === "emailRequired") {
      setPhase({ name: "email", pending: result.pending });
    } else if (result.kind === "termsRequired") {
      void getSignupConfig().then(setConfig);
      setPhase({ name: "terms" });
    } else if (result.kind === "rejected") {
      setPhase({ name: "error", message: socialErrorMessage(result.code) });
    } else {
      setPhase({ name: "error", message: socialErrorMessage(null) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exchange(ticket: string) {
    let response: Response;
    try {
      response = await fetch("/api/auth/social/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
      });
    } catch {
      setPhase({ name: "error", message: "Nao foi possivel conectar ao servidor. Tente novamente." });
      return;
    }
    const payload = await readJson(response);

    if (!response.ok) {
      setPhase({ name: "error", message: socialErrorMessage(problemCode(payload)) });
      return;
    }
    const outcome = interpretSocialResponse(payload);
    if (outcome.kind === "twoFactor") {
      savePendingTwoFactor({ tempToken: outcome.tempToken, method: outcome.method });
      router.replace("/auth/2fa/verify");
      return;
    }
    if (outcome.kind === "authenticated") {
      router.replace(resolvePostLoginPath(payload));
      router.refresh();
      return;
    }
    setPhase({ name: "error", message: socialErrorMessage(outcome.kind === "rejected" ? outcome.code : null) });
  }

  function finish(payload: unknown) {
    const outcome = interpretSocialResponse(payload);
    if (outcome.kind === "twoFactor") {
      savePendingTwoFactor({ tempToken: outcome.tempToken, method: outcome.method });
      router.replace("/auth/2fa/verify");
    } else if (outcome.kind === "authenticated") {
      router.replace(resolvePostLoginPath(payload));
      router.refresh();
    } else {
      setPhase({ name: "error", message: socialErrorMessage(outcome.kind === "rejected" ? outcome.code : null) });
    }
  }

  if (phase.name === "working") {
    return (
      <AuthShell title="Entrando...">
        <p className="text-center text-sm text-sg-muted">Concluindo o login. Aguarde um instante.</p>
      </AuthShell>
    );
  }

  if (phase.name === "email") {
    return (
      <EmailRequired
        pending={phase.pending}
        onSent={(email) => setPhase({ name: "code", pending: phase.pending, email })}
      />
    );
  }

  if (phase.name === "code") {
    return (
      <CodeStep
        pending={phase.pending}
        email={phase.email}
        onAuthenticated={(payload) => finish(payload)}
        onRestart={(message) => setPhase({ name: "error", message })}
      />
    );
  }

  if (phase.name === "terms") {
    return (
      <AuthShell title="Aceite os termos">
        <p className="mb-4 text-center text-sm text-sg-text">
          Para continuar é preciso aceitar a versão vigente dos termos. Escolha o provedor novamente.
        </p>
        <SocialLoginButtons config={config} intent="login" />
        <BackToLogin onClick={() => router.push("/login")} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Não foi possível entrar">
      <p className="text-center text-sm text-sg-text">{phase.message}</p>
      <BackToLogin onClick={() => router.push("/login")} />
    </AuthShell>
  );
}

function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
      <div className="w-full">
        <AuthCard title={title}>{children}</AuthCard>
      </div>
    </div>
  );
}

function BackToLogin({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-4 flex justify-center">
      <SgButton appearance="ghost" severity="primary" type="button" onClick={onClick}>
        Voltar ao login
      </SgButton>
    </div>
  );
}

function EmailRequired({ pending, onSent }: { pending: string; onSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const invalid = validateSocialEmail(email);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setBusy(true);
    try {
      const body = buildEmailBody(pending, email);
      const response = await fetch("/api/auth/social/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        const code = problemCode(payload);
        toast.error(code ? socialErrorMessage(code) : readError(JSON.stringify(payload)));
        return;
      }
      // O backend responde 200 tambem para REJECTED (com `code`): o `status` manda, nao o HTTP.
      const outcome = interpretSocialResponse(payload);
      if (outcome.kind === "rejected") {
        toast.error(socialErrorMessage(outcome.code));
        return;
      }
      onSent(body.email);
    } catch {
      toast.error("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Informe seu e-mail">
      <SgStack gap={12}>
        <p className="text-sm text-sg-text">
          O provedor não informou seu e-mail. Digite um e-mail seu: enviaremos um código de 6 dígitos para confirmar antes de
          criar a conta.
        </p>
        <SgInputEmail id="social-email" label="E-mail" required onChange={setEmail} />
        <SgButton severity="primary" appearance="solid" loading={busy} className="w-full" onClick={() => void submit()}>
          Enviar código
        </SgButton>
      </SgStack>
    </AuthShell>
  );
}

function CodeStep({
  pending,
  email,
  onAuthenticated,
  onRestart,
}: {
  pending: string;
  email: string;
  onAuthenticated: (payload: unknown) => void;
  onRestart: (message: string) => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lastSubmitted = useRef<string | null>(null);

  async function submit(raw: string) {
    const invalid = validateEmailCode(raw);
    if (invalid) {
      setMessage(invalid);
      return;
    }
    const body = buildConfirmBody(pending, raw);
    if (busy || lastSubmitted.current === body.code) {
      return;
    }
    lastSubmitted.current = body.code;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/social/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        const failure = problemCode(payload);
        onRestart(failure ? socialErrorMessage(failure) : readError(JSON.stringify(payload)));
        return;
      }
      const outcome = interpretSocialResponse(payload);
      if (outcome.kind === "rejected") {
        if (isRetryableCodeError(outcome.code)) {
          setMessage(socialErrorMessage(outcome.code));
          setCode("");
          return;
        }
        onRestart(socialErrorMessage(outcome.code));
        return;
      }
      onAuthenticated(payload);
    } catch {
      lastSubmitted.current = null;
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setMessage(null);
    try {
      const response = await fetch("/api/auth/social/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildEmailBody(pending, email)),
      });
      const payload = await readJson(response);
      const outcome = response.ok ? interpretSocialResponse(payload) : null;
      if (outcome?.kind === "rejected") {
        onRestart(socialErrorMessage(outcome.code));
        return;
      }
      lastSubmitted.current = null;
      setCode("");
      toast.success("Enviamos um novo código.");
    } catch {
      setMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <AuthShell title="Digite o código">
      <SgStack gap={12}>
        <p className="text-sm text-sg-text">
          Enviamos um código de 6 dígitos para <strong>{email}</strong>. Digite-o para concluir o login.
        </p>
        <SgInputOTP
          id="social-email-code"
          label="Código"
          mask="### ###"
          value={code}
          inputProps={{ autoComplete: "one-time-code", inputMode: "numeric" }}
          onChange={setCode}
          onRawChange={(raw) => {
            if (normalizeEmailCode(raw).length < 6) {
              lastSubmitted.current = null;
            }
          }}
          onComplete={(value) => void submit(value)}
        />
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
        <SgButton severity="primary" appearance="solid" loading={busy} className="w-full" onClick={() => void submit(code)}>
          Confirmar
        </SgButton>
        <SgButton appearance="ghost" severity="secondary" type="button" onClick={() => void resend()}>
          Reenviar código
        </SgButton>
      </SgStack>
    </AuthShell>
  );
}
