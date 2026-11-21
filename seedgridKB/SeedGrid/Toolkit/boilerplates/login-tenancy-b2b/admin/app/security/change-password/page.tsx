"use client";

import {
  SgButton,
  SgCard,
  SgInputPassword,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { messageForHttpStatus, readApiErrorMessage } from "@seedgrid/fe-core";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Shell } from "../../components/Shell";

export default function SecurityChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  async function changePassword() {

    if (!currentPassword.trim()) {
      toast.error("Informe a senha atual.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("A confirmacao da nova senha nao confere.");
      return;
    }

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const payload = (await readJson(response)) as ProblemPayload | null;

    if (!response.ok) {
      toast.error(readApiErrorMessage(payload) ?? messageForHttpStatus(response.status));
      return;
    }

    toast.success("Senha alterada. Faca login novamente com a nova senha.");
    router.push("/login");
    router.refresh();
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="Alterar senha"
      description="Atualize a senha de acesso da sua conta."
    >
      <SgCard
        cardStyle="outlined"
        title="Nova senha"
        description="Por seguranca, apos a troca voce sera redirecionado para um novo login."
      >
        <form onSubmit={(event) => event.preventDefault()}>
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
            {/* Nova senha: regras/barra de forca ajudam a cumprir a politica. */}
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
              label="Redigite a nova senha"
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

            <SgButton
              appearance="outline"
              label="Salvar"
              leftIcon={<Save size={16} />}
              severity="secondary"
              onClick={() => changePassword()}
              type="submit"
            />
          </SgStack>
        </form>
      </SgCard>
    </Shell>
  );
}

type ProblemPayload = {
  detail?: string;
  title?: string;
  message?: string;
  error?: string;
  violations?: { message?: string }[];
};

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
