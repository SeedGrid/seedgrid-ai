"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgInputNumber,
  SgInputText,
  SgStack,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { ArrowLeft, Copy, Download, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import type { ApiKeyCreateResponse, ApiKeyRoleOption } from "@/lib/seedgrid-app-api";

export default function ApiKeyEditPage() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreate = hasPermission(ADMIN_PERMISSIONS.apiKeysCreate);

  const [roleOptions, setRoleOptions] = useState<ApiKeyRoleOption[]>([]);
  const [name, setName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [expiresDays, setExpiresDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<ApiKeyCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (accessLoading || !canCreate) {
      return;
    }
    void (async () => {
      try {
        // So perfis de INTEGRACAO que este usuario pode usar na empresa corrente (GET /apikeys/roles).
        // O `/security/roles/options?audience=platform` de antes trazia tambem perfis de usuario.
        const roles = await adminProxyClient.get<ApiKeyRoleOption[]>("/api/admin/apikeys/roles");
        setRoleOptions(roles);
      } catch {
        setRoleOptions([]);
      }
    })();
  }, [accessLoading, canCreate]);

  // SgCombobox emite o `id` do item selecionado. O backend cria a chave por NOME do
  // role (POST /apikeys/role/{roleName}), entao o id precisa ser role.name — usar o
  // publicId aqui fazia o combobox enviar o UUID e o backend responder "Role not found".
  const roleSource: SgComboboxSource = roleOptions.map((role) => ({
    id: role.name,
    label: role.description ? `${role.name} — ${role.description}` : role.name,
  }));

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Informe um nome para a chave.");
      return;
    }
    if (!roleName) {
      toast.error("Selecione um perfil.");
      return;
    }
    setSubmitting(true);
    try {
      const parsedDays = Number.parseInt(expiresDays, 10);
      const response = await adminProxyClient.post<ApiKeyCreateResponse>("/api/admin/apikeys", {
        body: {
          roleName,
          name: name.trim(),
          expiresDays: Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : null,
        },
      });
      setCreated(response);
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? "Falha ao criar API key.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyKey() {
    if (!created) {
      return;
    }
    try {
      await navigator.clipboard.writeText(created.apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponivel: o usuario ainda pode baixar o .txt.
    }
  }

  function downloadKey() {
    if (!created) {
      return;
    }
    const content = [
      "SeedGrid App — API Key",
      `Nome: ${created.name}`,
      `Prefixo: ${created.prefix}`,
      "Guarde em local seguro. Esta chave nao sera exibida novamente.",
      "",
      created.apiKey,
      "",
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `seedgrid-apikey-${created.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (!accessLoading && !canCreate) {
    return (
      <Shell eyebrow="Seguranca" title="Nova API Key" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para criar API keys."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="Nova API Key"
      description="Gere uma chave de API para acesso programatico."
    >
      {created ? (
        <SgCard
          cardStyle="outlined"
          title="Chave criada"
          description="Copie e guarde agora — ela nao sera exibida novamente."
        >
          <SgStack gap={16}>
            <StatusBadge severity="warning" value="Esta chave e exibida uma unica vez." />
            <code
              style={{
                display: "block",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgb(var(--sg-border))",
                background: "rgb(var(--sg-surface))",
                color: "rgb(var(--sg-text))",
                fontSize: 14,
                wordBreak: "break-all",
              }}
            >
              {created.apiKey}
            </code>
            <SgStack direction="row" gap={12} wrap>
              <SgButton
                appearance="outline"
                label={copied ? "Copiado!" : "Copiar"}
                leftIcon={<Copy size={16} />}
                onClick={() => void copyKey()}
                severity="secondary"
              />
              <SgButton
                appearance="outline"
                label="Baixar .txt"
                leftIcon={<Download size={16} />}
                onClick={downloadKey}
                severity="secondary"
              />
              <SgButton
                appearance="solid"
                label="Concluir"
                onClick={() => router.push("/apikeys/apikey_list?saved=created")}
                severity="primary"
              />
            </SgStack>
          </SgStack>
        </SgCard>
      ) : (
        <SgCard cardStyle="outlined" title="Dados da chave" description="Nome, validade e perfil de acesso.">
          <SgStack gap={16}>
            <SgInputText
              id="apikey-name"
              label="Nome"
              placeholder="Ex.: Integracao ERP"
              inputProps={{ value: name }}
              onChange={setName}
            />
            <SgInputNumber
              id="apikey-expires-days"
              label="Validade (dias) — vazio = sem expiracao"
              decimals={0}
              minValue={1}
              inputProps={{ value: expiresDays }}
              onChange={setExpiresDays}
            />
            <SgCombobox
              id="apikey-role"
              label="Perfil"
              placeholder="Selecione o perfil"
              source={roleSource}
              value={roleName || null}
              onValueChange={(value) => setRoleName(value ? String(value) : "")}
            />
            <SgStack direction="row" gap={12} wrap>
              <SgButton
                appearance="outline"
                label="Voltar"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.push("/apikeys/apikey_list")}
                severity="secondary"
              />
              <SgButton
                appearance="solid"
                label={submitting ? "Criando..." : "Criar chave"}
                leftIcon={<KeyRound size={16} />}
                disabled={submitting}
                onClick={() => void handleCreate()}
                severity="primary"
              />
            </SgStack>
          </SgStack>
        </SgCard>
      )}
    </Shell>
  );
}
