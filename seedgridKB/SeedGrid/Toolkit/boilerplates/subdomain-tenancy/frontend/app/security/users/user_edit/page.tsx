"use client";

import {
  SgAvatar,
  SgButton,
  SgCard,
  SgCheckboxGroup,
  SgInputEmail,
  SgInputPassword,
  SgInputPhone,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgCheckboxGroupOption,
} from "@seedgrid/fe-components";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Shell } from "../../../components/Shell";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import { parseMyCompanies, type MyCompany } from "@/lib/my-companies";
import { isProtectedAccountUser, type RoleSummary, type UserEntry } from "@/lib/seedgrid-app-api";
import {
  editorMemberships,
  membershipCompanyLabel,
  offerableCompanies,
  setMembershipCompanies,
  setMembershipRoles,
  toMembershipsPayload,
  type MembershipDraft,
} from "@/lib/user-memberships";

type UserEditorState = {
  cargo: string;
  email: string;
  name: string;
  whatsApp: string;
  password: string;
  confirmPassword: string;
  active: boolean;
  root: boolean;
  changePasswordRequired: boolean;
  passwordExpiresAt: string | null;
  rolePublicIds: string[];
  // Empresas do usuario e os perfis dele em cada uma (T5.7). Perfis GLOBAIS ficam em `rolePublicIds`.
  memberships: MembershipDraft[];
  // Parceiro (LCK, Token, ...) que este operador representa - null = operador "interno"
  // (equipe SeedGrid), sem escopo, ve todas as contas.
};

const EMPTY_EDITOR: UserEditorState = {
  cargo: "",
  email: "",
  name: "",
  whatsApp: "",
  password: "",
  confirmPassword: "",
  active: true,
  root: false,
  changePasswordRequired: true,
  passwordExpiresAt: null,
  rolePublicIds: [],
  memberships: [],
};

/** Responsavel pela conta: ver isProtectedAccountUser. */
function isProtectedAdminUser(user: UserEntry) {
  return isProtectedAccountUser(user);
}

export default function UserEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <UserEditPageContent />
    </Suspense>
  );
}

function UserEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userPublicId = searchParams.get("publicId");
  const isEditing = Boolean(userPublicId);

  const { hasPermission, loading: accessLoading, currentCompany } = useAdminAccess();
  const canCreateUsers = hasPermission(ADMIN_PERMISSIONS.usersCreate);
  const canEditUsers = hasPermission(ADMIN_PERMISSIONS.usersEdit);
  const canAccessPage = isEditing ? canEditUsers : canCreateUsers;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<UserEditorState>(EMPTY_EDITOR);
  const [roleOptions, setRoleOptions] = useState<RoleSummary[]>([]);
  // Empresas do CHAMADOR (`GET /me/companies`): so elas sao oferecidas; o backend valida de novo.
  const [myCompanies, setMyCompanies] = useState<MyCompany[]>([]);
  // `UserDTORes.memberships` veio na leitura? Backend antigo = false: o salvar nao envia vinculos.
  const [membershipsKnown, setMembershipsKnown] = useState(true);
  // Locked to the loaded identity, not the editable e-mail field, so the
  // protection holds even while the admin updates its own e-mail.
  const [protectedAdmin, setProtectedAdmin] = useState(false);

  const roleChecklist = useMemo<SgCheckboxGroupOption[]>(
    () =>
      roleOptions.map((role) => ({
        label: role.name,
        value: role.publicId,
        description: role.description,
      })),
    [roleOptions],
  );

  const offeredCompanies = useMemo(() => offerableCompanies(myCompanies), [myCompanies]);
  const companyChecklist = useMemo<SgCheckboxGroupOption[]>(
    () => offeredCompanies.map((company) => ({ label: company.name, value: company.publicId })),
    [offeredCompanies],
  );

  useEffect(() => {
    if (accessLoading) {
      return;
    }

    if (!canAccessPage) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setStatusMessage(null);

      let roles: RoleSummary[];
      try {
        roles = await adminProxyClient.get<RoleSummary[]>(
          "/api/security/roles/options",
        );
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            extractApiErrorMessage(error) ?? "Falha ao carregar perfis.",
          );
          setLoading(false);
        }
        return;
      }

      if (cancelled) {
        return;
      }

      // Perfil de integracao (so' para API key) nao se atribui a usuario — o backend recusa —,
      // entao fica fora da lista de perfis da tela.
      setRoleOptions(roles.filter((role) => role.forIntegration !== true));

      // Empresas do chamador. Falha aqui nao bloqueia o cadastro: sem a lista a secao some e o
      // usuario fica so com os perfis globais.
      let mine: MyCompany[] = [];
      try {
        mine = parseMyCompanies(await adminProxyClient.get<unknown>("/api/me/companies"));
      } catch {
        mine = [];
      }
      if (cancelled) {
        return;
      }
      setMyCompanies(mine);

      if (!isEditing || !userPublicId) {
        // Usuario novo nasce vinculado a empresa corrente do cadastrador (pode trocar ou ampliar).
        const current = offerableCompanies(mine).find(
          (company) => company.publicId === currentCompany?.publicId,
        );
        setEditor({
          ...EMPTY_EDITOR,
          memberships: current ? [{ companyPublicId: current.publicId, rolePublicIds: [] }] : [],
        });
        setProtectedAdmin(false);
        setLoading(false);
        return;
      }

      let user: UserEntry;
      try {
        user = await adminProxyClient.get<UserEntry>(
          `/api/security/users/${userPublicId}`,
        );
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            extractApiErrorMessage(error) ?? "Falha ao carregar usuario.",
          );
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        const loadedMemberships = editorMemberships(user.memberships);
        setMembershipsKnown(loadedMemberships.known);
        setProtectedAdmin(isProtectedAdminUser(user));
        setEditor({
          email: user.email,
          name: user.name,
          cargo: typeof user.additionalAttributes?.cargo === "string" ? user.additionalAttributes.cargo : "",
          whatsApp: user.whatsApp,
          password: "",
          confirmPassword: "",
          active: user.active,
          root: isProtectedAccountUser(user),
          changePasswordRequired: user.changePasswordRequired,
          passwordExpiresAt: user.passwordExpiresAt ?? null,
          rolePublicIds: user.roles.map((role) => role.publicId),
          memberships: loadedMemberships.memberships,
        });
        setLoading(false);
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
    // `currentCompany` so define a pre-selecao do usuario NOVO; trocar de empresa recarrega a pagina.
  }, [accessLoading, canAccessPage, isEditing, userPublicId]);

  async function submitUser() {
    if (!editor.name.trim()) {
      toast.error("Informe o nome do usuario.");
      return;
    }

    if (!editor.email.trim()) {
      toast.error("Informe o e-mail do usuario.");
      return;
    }

    if (!isEditing && !editor.password.trim()) {
      toast.error("Informe a senha inicial do usuario.");
      return;
    }

    // So valida coincidencia quando ha senha (no editar, senha em branco = manter a atual).
    if (editor.password.trim() && editor.password !== editor.confirmPassword) {
      toast.error("As senhas nao coincidem.");
      return;
    }

    if (editor.cargo.trim().length > 100) {
      toast.error("Cargo deve ter no máximo 100 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const path = isEditing
        ? `/api/security/users/${userPublicId}`
        : "/api/security/users";
      const payload = {
        email: editor.email.trim(),
        name: editor.name.trim(),
        // O merge da extensão preserva outros atributos; null remove somente cargo.
        additionalAttributes: { cargo: editor.cargo.trim() || null },
        whatsApp: editor.whatsApp.trim(),
        password: editor.password.trim() || null,
        // The protected admin cannot be inactivated, lose root, or have its
        // profiles changed, regardless of the (locked) form controls.
        active: protectedAdmin ? true : editor.active,
        root: protectedAdmin ? true : editor.root,
        changePasswordRequired: editor.changePasswordRequired,
        rolePublicIds: editor.rolePublicIds,
        // Vinculos por publicId, so com empresas do chamador e perfis que existem na lista. Na
        // edicao com backend que nao devolveu os vinculos, a chave nem vai (vinculos intactos).
        ...(isEditing && !membershipsKnown
          ? {}
          : {
              memberships: toMembershipsPayload(
                editor.memberships,
                offeredCompanies.map((company) => company.publicId),
                roleOptions.map((role) => role.publicId),
              ),
            }),
      };

      if (isEditing) {
        await adminProxyClient.put(path, { body: payload });
      } else {
        await adminProxyClient.post(path, { body: payload });
      }

      router.push(
        `/security/users/user_list?saved=${isEditing ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao salvar usuario.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell
        eyebrow="Seguranca"
        title="Usuarios"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={
              isEditing
                ? "Voce nao possui permissao para editar usuarios."
                : "Voce nao possui permissao para criar usuarios."
            }
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title={isEditing ? "Editar usuario" : "Novo usuario"}
      description={
        isEditing
          ? "Atualize os dados de acesso e os perfis deste usuario."
          : "Cadastre um novo acesso para a equipe administrativa."
      }
    >
      <SgCard
        cardStyle="outlined"
        title="Dados do usuario"
        description="Defina os dados de acesso, os perfis e as empresas do usuario."
      >
        <SgStack gap={12}>
          <SgButton
            appearance="ghost"
            label="Voltar para lista"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/security/users/user_list")}
            severity="secondary"
          />

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={460} shape="rectangle" />
          ) : (
            <SgStack gap={16}>
              {isEditing && userPublicId ? (
                <UserAvatarField name={editor.name} publicId={userPublicId} />
              ) : null}

              {protectedAdmin ? (
                <StatusBadge
                  severity="warning"
                  value="Usuario administrador protegido: status ativo, acesso root e perfis nao podem ser alterados."
                />
              ) : null}

              <SgInputText
                id="user-name"
                label="Nome"
                required
                inputProps={{ value: editor.name }}
                onChange={(name) => setEditor((current) => ({ ...current, name }))}
              />
              <SgInputText
                id="user-cargo"
                label="Cargo"
                maxLength={100}
                inputProps={{ value: editor.cargo, placeholder: "Ex.: Analista" }}
                onChange={(cargo) => setEditor((current) => ({ ...current, cargo }))}
              />
              <SgInputEmail
                id="user-email"
                label="E-mail"
                required
                inputProps={{ value: editor.email }}
                onChange={(email) => setEditor((current) => ({ ...current, email }))}
              />
              <SgInputPhone
                id="user-whatsapp"
                label="WhatsApp"
                inputProps={{ value: editor.whatsApp }}
                onChange={(whatsApp) =>
                  setEditor((current) => ({ ...current, whatsApp }))
                }
              />
              <SgStack gap={4}>
                <SgInputPassword
                  maxLength={128}
                  id="user-password"
                  label={isEditing ? "Nova senha" : "Senha inicial"}
                  createNewPasswordButton
                  inputProps={{
                    // Impede o autofill do navegador de preencher a senha salva
                    // neste campo (que renderizava dots e ativava a barra de
                    // forca sem o usuario digitar nada).
                    name: "user-new-password",
                    autoComplete: "new-password",
                    placeholder: isEditing
                      ? "Deixe em branco para manter a senha atual"
                      : "Informe a senha inicial",
                  }}
                  onChange={(password) =>
                    setEditor((current) => ({ ...current, password }))
                  }
                  showStrengthBar={isEditing ? Boolean(editor.password) : true}
                />
                <SgInputPassword
                  maxLength={128}
                  id="user-confirm-password"
                  label="Confirmar senha"
                  // So confirmacao: sem barra de forca e sem politica (a politica ja e cobrada no
                  // campo de senha). Unica regra: coincidir com a senha.
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
                  inputProps={{
                    name: "user-confirm-password",
                    autoComplete: "new-password",
                    placeholder: "Repita a senha",
                  }}
                  validation={(value) =>
                    value === editor.password ? null : "As senhas nao coincidem"
                  }
                  onChange={(confirmPassword) =>
                    setEditor((current) => ({ ...current, confirmPassword }))
                  }
                />
                {isEditing ? (
                  <span className="text-xs text-muted-foreground">
                    Por razoes de seguranca, a senha atual nao e exibida. Deixe em
                    branco para manter a senha atual.
                  </span>
                ) : null}
              </SgStack>
              {/* Para o admin protegido, ativo e root ficam visiveis porem
                  somente leitura; trocar senha continua editavel. */}
              <SgToggleSwitch
                id="user-active"
                checked={editor.active}
                enabled={!protectedAdmin}
                label="Usuario ativo"
                onChange={(active) =>
                  setEditor((current) => ({ ...current, active }))
                }
              />
              <SgToggleSwitch
                id="user-root"
                checked={editor.root}
                enabled={!protectedAdmin}
                label="Acesso root"
                onChange={(root) =>
                  setEditor((current) => ({ ...current, root }))
                }
              />
              <SgToggleSwitch
                id="user-change-password"
                checked={editor.changePasswordRequired}
                label="Exigir troca de senha no proximo acesso"
                onChange={(changePasswordRequired) =>
                  setEditor((current) => ({ ...current, changePasswordRequired }))
                }
              />

              {isEditing && editor.passwordExpiresAt ? (
                <span className="text-xs text-muted-foreground">
                  {`Senha expira em ${formatDateTime(editor.passwordExpiresAt)}`}
                </span>
              ) : null}

              <SgCheckboxGroup
                id="user-roles"
                title="Perfis (valem em todas as empresas do usuario)"
                disabled={protectedAdmin}
                source={roleChecklist}
                value={editor.rolePublicIds}
                onChange={(value) =>
                  setEditor((current) => ({
                    ...current,
                    rolePublicIds: value.map(String),
                  }))
                }
              />

              {offeredCompanies.length > 0 ? (
                <SgStack gap={12}>
                  <SgCheckboxGroup
                    id="user-companies"
                    title="Empresas"
                    disabled={protectedAdmin}
                    source={companyChecklist}
                    value={editor.memberships.map((m) => m.companyPublicId)}
                    onChange={(value) =>
                      setEditor((current) => ({
                        ...current,
                        memberships: setMembershipCompanies(current.memberships, value.map(String)),
                      }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {isEditing
                      ? "Marque para vincular o usuario a uma empresa ou ajustar os perfis dele nela. Aparecem so as empresas as quais voce tem acesso."
                      : "O usuario novo so pode ser vinculado as empresas as quais voce tem acesso."}
                  </span>
                  {editor.memberships.some(
                    (m) => !offeredCompanies.some((c) => c.publicId === m.companyPublicId),
                  ) ? (
                    <span className="text-xs text-muted-foreground">
                      Vinculado tambem a:{" "}
                      {editor.memberships
                        .filter((m) => !offeredCompanies.some((c) => c.publicId === m.companyPublicId))
                        .map((m) => membershipCompanyLabel(m, myCompanies))
                        .join(", ")}
                      . Esses vinculos nao sao alterados por aqui.
                    </span>
                  ) : null}
                  {editor.memberships.map((membership) => {
                    const company = offeredCompanies.find(
                      (item) => item.publicId === membership.companyPublicId,
                    );
                    if (!company) {
                      return null;
                    }
                    return (
                      <SgCheckboxGroup
                        key={membership.companyPublicId}
                        id={`user-company-roles-${membership.companyPublicId}`}
                        title={`Perfis em ${company.name}`}
                        disabled={protectedAdmin}
                        source={roleChecklist}
                        value={membership.rolePublicIds}
                        onChange={(value) =>
                          setEditor((current) => ({
                            ...current,
                            memberships: setMembershipRoles(
                              current.memberships,
                              membership.companyPublicId,
                              value.map(String),
                            ),
                          }))
                        }
                      />
                    );
                  })}
                </SgStack>
              ) : null}

              <SgButton
                appearance="outline"
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submitUser()}
                severity="secondary"
              />
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Bola do avatar do usuario. Carrega a imagem atual de
 * /api/security/users/{publicId}/avatar e permite trocar arrastando uma
 * imagem por cima ou dando duplo clique (abre o seletor de arquivos).
 */
function UserAvatarField({
  publicId,
  name,
}: Readonly<{ publicId: string; name: string }>) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Versao para forcar o re-fetch da imagem apos um upload bem-sucedido.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    async function loadAvatar() {
      try {
        const response = await fetch(
          `/api/security/users/${publicId}/avatar`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) {
          setImageUrl(null);
          return;
        }
        const blob = await response.blob();
        if (blob.size === 0) {
          setImageUrl(null);
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }
        setImageUrl(null);
      }
    }

    void loadAvatar();
    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [publicId, version]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem.");
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        toast.error("Imagem muito grande (maximo 5 MB).");
        return;
      }

      setUploading(true);
      try {
        const base64 = await readAsBase64(file);
        await adminProxyClient.post(
          `/api/security/users/${publicId}/avatar`,
          {
            body: {
              filename: file.name,
              contentType: file.type,
              base64,
            },
          },
        );

        setVersion((current) => current + 1);
      } catch (uploadError) {
        toast.error(
          extractApiErrorMessage(uploadError) ?? "Falha ao enviar a imagem.",
        );
      } finally {
        setUploading(false);
      }
    },
    [publicId],
  );

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
    event.target.value = "";
  }

  return (
    <SgStack align="center" gap={4}>
      <div
        aria-label="Avatar do usuario. Arraste uma imagem ou de duplo clique para trocar."
        onDoubleClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        style={{
          borderRadius: "9999px",
          cursor: "pointer",
          outline: dragging ? "2px dashed rgb(var(--sg-primary-500, 99 102 241))" : "none",
          outlineOffset: 4,
          opacity: uploading ? 0.6 : 1,
          transition: "opacity 120ms ease",
        }}
        title="Arraste uma imagem ou de duplo clique para trocar"
      >
        <SgAvatar
          alt={name}
          bordered
          icon={!imageUrl ? <Camera size={24} /> : undefined}
          label={!imageUrl ? initials(name) : undefined}
          shape="circle"
          size="xl"
          src={imageUrl ?? undefined}
        />
      </div>

      <span className="text-xs text-muted-foreground">
        {uploading
          ? "Enviando..."
          : "Arraste uma imagem ou de duplo clique para trocar"}
      </span>

      <input
        accept="image/*"
        hidden
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
    </SgStack>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Le um File como base64 puro (sem o prefixo data:...;base64,). */
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}
