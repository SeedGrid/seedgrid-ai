"use client";

import {
  SgButton,
  SgCard,
  SgInputPassword,
  SgScreen,
  SgStack,
} from "@seedgrid/fe-components";
import { messageForHttpStatus, readApiErrorMessage } from "@seedgrid/fe-core";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("A confirmacao da nova senha nao confere.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const payload = (await readJson(response)) as
        | { detail?: string; title?: string; message?: string; error?: string; violations?: { message?: string }[] }
        | null;

      if (!response.ok) {
        setErrorMessage(readApiErrorMessage(payload) ?? messageForHttpStatus(response.status));
        return;
      }

      setInfoMessage("Senha alterada. Faca login novamente com a nova senha.");
      router.push("/login");
      router.refresh();
    });
  }

  // Escape do "trap": se o token expirou (ou o usuario quer entrar com outra conta),
  // limpa a sessao (cookies token+refresh+must-change) e libera o /login. Sem isso, o
  // middleware mantem o usuario preso nesta tela enquanto houver cookie de sessao.
  function onBackToLogin() {
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignora erro de rede — segue pro login de qualquer forma
      }
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          description="A API marcou sua conta para troca obrigatoria de senha antes de continuar."
          title="Alterar senha"
        >
          <form onSubmit={onSubmit}>
            <SgStack gap={16}>
              <SgInputPassword
                maxLength={128}
                id="current-password"
                label="Senha atual"
                onChange={setCurrentPassword}
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
              {/* Nova senha: aqui as regras/barra de forca ajudam o usuario a cumprir a politica. */}
              <SgInputPassword
                maxLength={128}
                id="new-password"
                label="Nova senha"
                onChange={setNewPassword}
                required
                showStrengthBar
                createNewPasswordButton
              />
              <SgInputPassword
                maxLength={128}
                id="confirm-new-password"
                label="Confirmar nova senha"
                onChange={setConfirmNewPassword}
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
              {infoMessage ? <div className="login-info">{infoMessage}</div> : null}
              {errorMessage ? <div className="login-error">{errorMessage}</div> : null}
              <SgButton
                label={pending ? "Salvando..." : "Salvar nova senha"}
                type="submit"
              />
              <SgButton
                appearance="ghost"
                label="Sair e voltar ao login"
                type="button"
                onClick={onBackToLogin}
              />
            </SgStack>
          </form>
        </SgCard>
      </div>
    </SgScreen>
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
