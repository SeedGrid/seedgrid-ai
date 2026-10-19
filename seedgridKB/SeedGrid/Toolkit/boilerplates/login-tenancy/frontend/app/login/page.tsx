"use client";

import {
  SgButton,
  SgCard,
  SgInputEmail,
  SgInputPassword,
  SgScreen,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import type { AdminLoginResponse } from "@/lib/admin-auth";
import { savePendingTwoFactor } from "@/lib/two-factor-pending";
import { SeedGridLogoFull } from "../components/SeedGridLogoFull";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (searchParams.get("confirmed") === "1") {
      setInfoMessage(
        "E-mail confirmado. Entre com a senha provisoria para seguir para a troca obrigatoria de senha.",
      );
    }
  }, [searchParams]);

  // `?expired=1`: quem chegou aqui expulso pelo AdminAccessProvider (sessao vencida e refresh
  // recusado). Mesmo cuidado do `useSavedToast`: um ref garante "uma vez so" mesmo com o
  // StrictMode remontando o efeito, e a URL e' limpa pra um F5 nao repetir o aviso.
  const expired = searchParams.get("expired");
  const expiredShownRef = useRef(false);
  useEffect(() => {
    if (expired !== "1" || expiredShownRef.current) {
      return;
    }
    expiredShownRef.current = true;
    toast.error("Sessao expirada. Efetue login novamente.");
    router.replace(pathname, { scroll: false });
  }, [expired, pathname, router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    startTransition(async () => {
      let response: Response;
      try {
        response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: email.trim(), password }),
        });
      } catch {
        setErrorMessage(
          "Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.",
        );
        return;
      }

      const payload = ((await readJson(response)) ?? {}) as
        | AdminLoginResponse
        | { message?: string };

      if (!response.ok) {
        // O PasswordChangeRequiredFilter (ext-security) pode bloquear ate' a PROPRIA chamada
        // pos-login com esse codigo (nao so' a flag de sucesso tratada abaixo). Sem isso, a
        // tela mostrava o JSON cru do erro em vez de abrir a troca de senha.
        if (isPasswordChangeRequiredError(payload)) {
          router.push("/change-password");
          router.refresh();
          return;
        }
        setErrorMessage(extractMessage(payload) ?? "Falha ao autenticar no admin.");
        return;
      }

      if (isTwoFactorRequired(payload)) {
        // Guarda o desafio e segue para a pagina dedicada de verificacao.
        savePendingTwoFactor({
          tempToken: payload.tempToken,
          method: payload.method ?? null,
        });
        router.push("/auth/2fa/verify");
        return;
      }

      if (
        "changePasswordRequired" in payload &&
        payload.changePasswordRequired === true
      ) {
        router.push("/change-password");
        router.refresh();
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <div className="login-brand-and-card">
          <div className="login-brand">
            <SeedGridLogoFull height={56} />
          </div>
          <SgCard
            cardStyle="elevated"
            description="Use uma conta com role ADMIN para acessar o backoffice."
            title="Entrar no Admin Web"
          >
          <form onSubmit={onSubmit}>
            <SgStack gap={16}>
              <SgInputEmail
                id="login-email"
                label="Email"
                onChange={setEmail}
                required
              />
              {/* No login nao queremos as regras de criacao de senha (barra de forca,
                  minimo, maiuscula etc.) — so o campo com hide/show e clear. Desligamos
                  a politica; o SgInputPassword segue cuidando do toggle de visibilidade. */}
              <SgInputPassword
                maxLength={128}
                id="login-password"
                label="Senha"
                onChange={setPassword}
                required
                showStrengthBar={false}
                commonPasswordCheck={false}
                upperRequired={false}
                lowerRequired={false}
                numberRequired={false}
                specialCharacterRequired={false}
                prohibitsRepeatedCharactersInSequence={false}
                prohibitsSequentialAscCharacters={false}
                prohibitsSequentialDescCharacters={false}
                minSize={1}
              />
              <SgButton
                appearance="ghost"
                label="Esqueci a senha"
                onClick={() => router.push("/auth/forgot-password")}
                severity="secondary"
                type="button"
              />
              {/* Signup e reenvio de confirmacao: o report-admin nao tem (backoffice nao cadastra
                  empresa), o report-client tem — sao as entradas do `SignupForm` portado. O
                  "Nao recebi o e-mail" abre o formulario direto na etapa de confirmacao, que e' o
                  `initialStage="confirm"` que o proprio SignupForm ja' previa. */}
              <SgButton
                appearance="ghost"
                label="Criar conta"
                onClick={() => router.push("/auth/signup")}
                severity="secondary"
                type="button"
              />
              <SgButton
                appearance="ghost"
                label="Nao recebi o e-mail de confirmacao"
                onClick={() => router.push("/auth/signup?stage=confirm")}
                severity="secondary"
                type="button"
              />
              {infoMessage ? <div className="login-info">{infoMessage}</div> : null}
              {errorMessage ? (
                <div className="login-error">{errorMessage}</div>
              ) : null}
              <SgButton
                label={pending ? "Processando..." : "Entrar"}
                type="submit"
              />
            </SgStack>
          </form>
          </SgCard>
        </div>
      </div>
    </SgScreen>
  );
}

// Safely parse a JSON response body. Returns null when the body is empty or
// not valid JSON (e.g. the API is down and the server returned no payload),
// so callers can fall back to a friendly message instead of throwing.
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Extrai a mensagem amigavel do corpo de erro da API. O backend usa RFC7807
// (application/problem+json), entao a mensagem vem em `detail` (ou nas `violations`
// de validacao), nao em `message`. Mantemos `message` como fallback para respostas
// que o proxy Next monta manualmente (ex.: 502/503 de conectividade).
function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const problem = payload as {
    detail?: unknown;
    title?: unknown;
    message?: unknown;
    violations?: unknown;
  };

  if (Array.isArray(problem.violations)) {
    const joined = problem.violations
      .map((violation) => {
        const message =
          violation && typeof violation === "object" && "message" in violation
            ? (violation as { message?: unknown }).message
            : undefined;
        return typeof message === "string" ? message : "";
      })
      .filter((message) => message.trim().length > 0)
      .join(" ");
    if (joined.trim().length > 0) {
      return joined;
    }
  }

  for (const field of ["detail", "title", "message"] as const) {
    const value = problem[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

// Corpo nativo do PasswordChangeRequiredFilter (ext-security): { code, message }, distinto do
// problem+json usual (nao tem detail/title/violations).
function isPasswordChangeRequiredError(payload: unknown): boolean {
  return (
    !!payload &&
    typeof payload === "object" &&
    "code" in payload &&
    (payload as { code?: unknown }).code === "PASSWORD_CHANGE_REQUIRED"
  );
}

function isTwoFactorRequired(
  payload: AdminLoginResponse | { message?: string },
): payload is Extract<AdminLoginResponse, { status: "2F_REQUIRED" }> {
  return (
    "status" in payload &&
    payload.status === "2F_REQUIRED" &&
    "tempToken" in payload &&
    typeof payload.tempToken === "string"
  );
}
