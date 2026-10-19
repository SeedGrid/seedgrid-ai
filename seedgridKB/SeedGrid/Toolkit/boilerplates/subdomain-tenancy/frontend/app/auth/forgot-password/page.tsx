"use client";

import {
  SgButton,
  SgCard,
  SgInputEmail,
  SgInputPassword,
  SgScreen,
  SgStack,
} from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setErrorMessage("Informe o e-mail.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("A confirmacao da nova senha nao confere.");
      return;
    }

    startTransition(async () => {
      let response: Response;
      try {
        response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), newPassword }),
        });
      } catch {
        setErrorMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
        return;
      }

      const payload = (await readJson(response)) as ProblemPayload | null;

      if (!response.ok) {
        setErrorMessage(extractMessage(payload) ?? "Falha ao solicitar a troca de senha.");
        return;
      }

      setInfoMessage(
        "Enviamos um e-mail de confirmacao. Abra o link para concluir a troca de senha.",
      );
    });
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title="Esqueci a senha"
          description="Informe seu e-mail e a nova senha. Voce recebera um link para confirmar a troca."
        >
          <form onSubmit={onSubmit}>
            <SgStack gap={16}>
              <SgInputEmail
                id="forgot-email"
                label="E-mail"
                onChange={setEmail}
                required
                inputProps={{ autoComplete: "email" }}
              />
              <SgInputPassword
                maxLength={128}
                id="forgot-new-password"
                label="Nova senha"
                onChange={setNewPassword}
                required
                showStrengthBar
                createNewPasswordButton
                inputProps={{ autoComplete: "new-password" }}
              />
              <SgInputPassword
                maxLength={128}
                id="forgot-confirm-password"
                label="Confirmar nova senha"
                onChange={setConfirmPassword}
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
                inputProps={{ autoComplete: "new-password" }}
              />
              {infoMessage ? <div className="login-info">{infoMessage}</div> : null}
              {errorMessage ? <div className="login-error">{errorMessage}</div> : null}
              <SgButton
                label={pending ? "Enviando..." : "Solicitar troca de senha"}
                type="submit"
              />
              <SgButton
                appearance="ghost"
                label="Voltar para o login"
                onClick={() => router.push("/login")}
                severity="secondary"
                type="button"
              />
            </SgStack>
          </form>
        </SgCard>
      </div>
    </SgScreen>
  );
}

type ProblemPayload = {
  detail?: string;
  title?: string;
  message?: string;
  violations?: { message?: string }[];
};

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractMessage(payload: ProblemPayload | null): string | null {
  if (!payload) {
    return null;
  }
  if (Array.isArray(payload.violations) && payload.violations.length > 0) {
    const joined = payload.violations
      .map((violation) => violation.message?.trim() ?? "")
      .filter((message) => message.length > 0)
      .join(" ");
    if (joined.length > 0) {
      return joined;
    }
  }
  return payload.detail ?? payload.message ?? payload.title ?? null;
}
