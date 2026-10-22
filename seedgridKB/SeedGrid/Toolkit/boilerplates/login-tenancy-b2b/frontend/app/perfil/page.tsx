"use client";

import {
  SgButton,
  SgCard,
  SgInputPassword,
  SgInputPhone,
  SgInputText,
  SgPageControl,
  SgPageControlPage,
  SgSkeleton,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { messageForHttpStatus, readApiErrorMessage } from "@seedgrid/fe-core";
import { Save, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAdminAccess } from "../components/AdminAccessProvider";
import { Shell } from "../components/Shell";
import { TwoFactorManager } from "../components/TwoFactorManager";
import type { MyProfile } from "@/lib/seedgrid-app-api";

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

async function messageFor(response: Response): Promise<string> {
  const payload = (await readJson(response)) as ProblemPayload | null;
  return readApiErrorMessage(payload) ?? messageForHttpStatus(response.status);
}

/** Le um File como base64 puro (sem o prefixo data:...;base64,). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return letters.join("").toUpperCase() || "?";
}

export default function ProfilePage() {
  // O menu lateral mostra a foto a partir do `me`; sem o refresh, subir/remover a foto so'
  // aparecia la' na proxima navegacao.
  const { refresh: refreshAccess } = useAdminAccess();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [savingData, setSavingData] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me/profile", { cache: "no-store" });
      if (response.ok) {
        const p = (await response.json()) as MyProfile;
        setProfile(p);
        setName(p.name ?? "");
        setWhatsApp(p.whatsApp ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveData() {
    if (!name.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    setSavingData(true);
    try {
      const response = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), whatsApp: whatsApp.trim() }),
      });
      if (!response.ok) {
        toast.error(await messageFor(response));
        return;
      }
      setProfile((await response.json()) as MyProfile);
      refreshAccess();
      toast.success("Dados atualizados.");
    } finally {
      setSavingData(false);
    }
  }

  async function savePassword() {
    if (!currentPassword) {
      toast.error("Informe a senha atual.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmacao nao confere com a nova senha.");
      return;
    }
    setSavingPwd(true);
    try {
      const response = await fetch("/api/me/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        toast.error(await messageFor(response));
        return;
      }
      toast.success("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    setAvatarBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch("/api/me/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          base64,
        }),
      });
      if (!response.ok) {
        toast.error(await messageFor(response));
        return;
      }
      setProfile((await response.json()) as MyProfile);
      refreshAccess();
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    try {
      const response = await fetch("/api/me/profile/avatar", { method: "DELETE" });
      if (!response.ok) {
        toast.error(await messageFor(response));
        return;
      }
      setProfile((await response.json()) as MyProfile);
      refreshAccess();
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <Shell
      eyebrow="Conta"
      title="Meu perfil"
      description="Seus dados, foto e senha de acesso."
    >
      {/* Perfil, senha e 2FA em abas: sao tres assuntos independentes, e empilhados so' faziam a
          pagina crescer. Mesma divisao do report-client (views/profile/ProfileView.tsx). */}
      <SgPageControl ariaLabel="Secoes do perfil" defaultActivePageId="perfil" size="sm">
        <SgPageControlPage id="perfil" title="Perfil" hint="Nome, WhatsApp e foto">
          <SgCard cardStyle="outlined" title="Dados" description="Nome, WhatsApp e foto do seu usuario.">
            {loading ? (
              <SgSkeleton height={180} />
            ) : (
              <SgStack direction="row" gap={24} wrap>
                {/* Avatar: clique/duplo-clique abre o seletor; arrastar imagem tambem envia. */}
                <SgStack align="center" gap={8}>
                  <button
                    type="button"
                    title="Clique ou arraste uma imagem"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      void handleFile(e.dataTransfer.files?.[0]);
                    }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: `2px solid ${dragOver ? "hsl(217 91% 60%)" : "rgba(148,163,184,0.5)"}`,
                      background: "rgba(148,163,184,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: avatarBusy ? 0.6 : 1,
                    }}
                  >
                    {profile?.avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarDataUrl}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span>{initialsOf(profile?.name ?? "")}</span>
                    )}
                  </button>
                  <SgStack direction="row" gap={8}>
                    <SgButton
                      appearance="outline"
                      label="Enviar foto"
                      leftIcon={<Upload size={14} />}
                      size="sm"
                      disabled={avatarBusy}
                      onClick={() => fileInputRef.current?.click()}
                      severity="secondary"
                    />
                    {profile?.avatarDataUrl ? (
                      <SgButton
                        appearance="ghost"
                        label="Remover"
                        leftIcon={<Trash2 size={14} />}
                        size="sm"
                        disabled={avatarBusy}
                        onClick={() => void removeAvatar()}
                        severity="danger"
                      />
                    ) : null}
                  </SgStack>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      void handleFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </SgStack>

                <SgStack gap={12} style={{ flex: 1, minWidth: 260 }}>
                  <SgInputText
                    id="profile-name"
                    label="Nome"
                    inputProps={{ value: name }}
                    onChange={setName}
                  />
                  <SgInputPhone
                    id="profile-whatsapp"
                    label="WhatsApp"
                    inputProps={{ value: whatsApp }}
                    onChange={setWhatsApp}
                  />
                  <SgInputText
                    id="profile-email"
                    label="E-mail"
                    hintText="O e-mail e sua identidade de acesso e nao pode ser alterado aqui."
                    inputProps={{ value: profile?.email ?? "", readOnly: true, disabled: true }}
                  />

                  <SgStack direction="row" justify="end">
                    <SgButton
                      appearance="outline"
                      label={savingData ? "Salvando..." : "Salvar dados"}
                      leftIcon={<Save size={16} />}
                      loading={savingData}
                      onClick={() => void saveData()}
                      severity="secondary"
                    />
                  </SgStack>
                </SgStack>
              </SgStack>
            )}
          </SgCard>

        </SgPageControlPage>

        <SgPageControlPage id="senha" title="Senha" hint="Trocar a senha de acesso">
          <SgCard
            cardStyle="outlined"
            title="Senha"
            description="Troque a sua senha de acesso. Voce continua logado apos a troca."
          >
            {/* <form> de verdade (com o e-mail como username escondido): sem ele o Chrome loga
                "Password field is not contained in a form" e o gerenciador de senhas nao sabe
                distinguir a senha atual da nova. O submit tambem faz o Enter funcionar. */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void savePassword();
              }}
            >
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={profile?.email ?? ""}
                readOnly
                hidden
              />
              <SgStack gap={12} style={{ maxWidth: 460 }}>
                <SgInputPassword
                  maxLength={128}
                  id="profile-current-password"
                  label="Senha atual"
                  onChange={setCurrentPassword}
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
                  inputProps={{ autoComplete: "current-password" }}
                />
                {/* Nova senha: regras/barra de forca ajudam a cumprir a politica. */}
                <SgInputPassword
                  maxLength={128}
                  id="profile-new-password"
                  label="Nova senha"
                  onChange={setNewPassword}
                  showStrengthBar
                  createNewPasswordButton
                  inputProps={{ autoComplete: "new-password" }}
                />
                <SgInputPassword
                  maxLength={128}
                  id="profile-confirm-password"
                  label="Confirmar nova senha"
                  onChange={setConfirmPassword}
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

                <SgStack direction="row" justify="end">
                  <SgButton
                    type="submit"
                    appearance="outline"
                    label={savingPwd ? "Salvando..." : "Alterar senha"}
                    leftIcon={<Save size={16} />}
                    loading={savingPwd}
                    severity="secondary"
                  />
                </SgStack>
              </SgStack>
            </form>
          </SgCard>

        </SgPageControlPage>

        <SgPageControlPage id="2fa" title="Seguranca (2FA)" hint="Autenticacao de dois fatores">
          <SgCard
            cardStyle="outlined"
            title="Autenticacao em dois fatores (2FA)"
            description="Ative ou desative uma segunda camada de seguranca no seu login."
          >
            {/* key=whatsApp persistido: remonta (e recarrega /2fa/status) quando o WhatsApp muda,
                pra sumir/reaparecer o metodo WHATSAPP sem precisar sair e voltar da tela. */}
            <TwoFactorManager key={profile?.whatsApp ?? ""} />
          </SgCard>
        </SgPageControlPage>
      </SgPageControl>
    </Shell>
  );
}
