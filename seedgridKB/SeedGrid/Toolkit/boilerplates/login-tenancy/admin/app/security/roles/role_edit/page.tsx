"use client";

import {
  SgButton,
  SgCard,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  SgTreeView,
  toast,
  type SgTreeNode,
} from "@seedgrid/fe-components";
import { ArrowLeft, ChevronsDownUp, ChevronsUpDown, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { SgInputTextSearch } from "../../../components/SgInputTextSearch";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  MAPPED_PERMISSION_NAMES,
  PERMISSION_MENU_TREE,
  branchIds,
  filterTree,
} from "@/lib/permission-tree";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import type { PermissionOption, RoleEntry } from "@/lib/seedgrid-app-api";

type RoleEditorState = {
  name: string;
  description: string;
  active: boolean;
  forIntegration: boolean;
  permissionPublicIds: string[];
};

const EMPTY_EDITOR: RoleEditorState = {
  name: "",
  description: "",
  active: true,
  forIntegration: false,
  permissionPublicIds: [],
};

/** The seed "ADMIN" profile is protected and cannot be edited or deleted. */
function isProtectedAdminRoleName(name: string) {
  return name.trim().toUpperCase() === "ADMIN";
}

/** Backend exige o nome no padrao ^[A-Z_]+$ (UPPER_SNAKE_CASE, 5-30 chars). */
const ROLE_NAME_MAX_LENGTH = 30;
const ROLE_NAME_MIN_LENGTH = 5;

/**
 * Formata o nome do perfil enquanto o usuario digita, garantindo o padrao
 * `^[A-Z_]+$` esperado pelo backend:
 * - remove acentos (ex.: "Gestao" -> "GESTAO");
 * - converte para MAIUSCULAS;
 * - troca espacos e hifens por `_`;
 * - descarta qualquer caractere fora de `[A-Z_]`;
 * - colapsa `_` consecutivos e remove `_` inicial solto.
 * Ex.: "Gerente de Vendas" -> "GERENTE_DE_VENDAS".
 */
function formatRoleName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toUpperCase()
    .replace(/[\s-]+/g, "_") // espacos e hifens viram _
    .replace(/[^A-Z_]/g, "") // descarta caracteres invalidos
    .replace(/_+/g, "_") // colapsa _ duplicados
    .replace(/^_+/, "") // sem _ inicial solto
    .slice(0, ROLE_NAME_MAX_LENGTH);
}

export default function RoleEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <RoleEditPageContent />
    </Suspense>
  );
}

function RoleEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rolePublicId = searchParams.get("publicId");
  const isEditing = Boolean(rolePublicId);

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreateRoles = hasPermission(ADMIN_PERMISSIONS.rolesCreate);
  const canEditRoles = hasPermission(ADMIN_PERMISSIONS.rolesEdit);
  const canAccessPage = isEditing ? canEditRoles : canCreateRoles;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<RoleEditorState>(EMPTY_EDITOR);
  const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [protectedRole, setProtectedRole] = useState(false);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const checkedSet = useMemo(
    () => new Set(editor.permissionPublicIds),
    [editor.permissionPublicIds],
  );

  /**
   * Arvore completa, na hierarquia do menu (lib/permission-tree.ts). O rotulo da folha e o do
   * BOTAO seguido do nome tecnico entre parenteses: e o nome tecnico que voce precisa reconhecer
   * quando alguem diz "faltou AI_CONFIG_ROLLBACK", e e por ele que a busca casa.
   *
   * Permissao do mapa que o backend ainda nao conhece e pulada (ex.: migration nova que ainda nao
   * rodou neste ambiente); permissao do backend fora do mapa cai em "Outras permissoes", pra nunca
   * sumir permissao da tela por esquecimento no mapa.
   */
  const fullTree = useMemo<SgTreeNode[]>(() => {
    const byName = new Map(permissionOptions.map((option) => [option.name, option]));
    const label = (text: string, checked: number, total: number) =>
      checked > 0 ? `${text} — ${checked} de ${total}` : text;

    const nodes: SgTreeNode[] = [];
    for (const group of PERMISSION_MENU_TREE) {
      const screenNodes: SgTreeNode[] = [];
      let groupChecked = 0;
      let groupTotal = 0;

      for (const screen of group.screens) {
        const leaves: SgTreeNode[] = [];
        let screenChecked = 0;
        for (const action of screen.actions) {
          const option = byName.get(action.permission);
          if (!option) {
            continue;
          }
          leaves.push({ id: option.publicId, label: `${action.label} (${action.permission})` });
          if (checkedSet.has(option.publicId)) {
            screenChecked += 1;
          }
        }
        if (!leaves.length) {
          continue;
        }
        screenNodes.push({
          id: screen.id,
          label: label(screen.label, screenChecked, leaves.length),
          children: leaves,
        });
        groupChecked += screenChecked;
        groupTotal += leaves.length;
      }

      if (screenNodes.length) {
        nodes.push({
          id: group.id,
          label: label(group.label, groupChecked, groupTotal),
          children: screenNodes,
        });
      }
    }

    const orphans = permissionOptions
      .filter((option) => !MAPPED_PERMISSION_NAMES.has(option.name))
      .map((option) => ({ id: option.publicId, label: `${option.description} (${option.name})` }));
    if (orphans.length) {
      const checked = orphans.filter((leaf) => checkedSet.has(leaf.id)).length;
      nodes.push({
        id: "outras",
        label: label("Outras permissoes (fora do menu)", checked, orphans.length),
        children: orphans,
      });
    }
    return nodes;
  }, [permissionOptions, checkedSet]);

  const searching = permissionSearch.trim().length > 0;
  const visibleTree = useMemo(
    () => filterTree(fullTree, permissionSearch),
    [fullTree, permissionSearch],
  );
  // Buscando, a arvore abre sozinha no que casou: senao o resultado ficaria escondido dentro de um
  // galho fechado, que e o problema que a busca deveria resolver.
  const effectiveExpandedIds = useMemo(
    () => (searching ? branchIds(visibleTree) : expandedIds),
    [searching, visibleTree, expandedIds],
  );
  const allExpanded = !searching && expandedIds.length >= branchIds(fullTree).length;

  /** So os ids que sao permissao de verdade: a arvore devolve os galhos marcados junto. */
  function applyCheckedIds(ids: string[]) {
    const validIds = new Set(permissionOptions.map((option) => option.publicId));
    setEditor((current) => ({
      ...current,
      permissionPublicIds: ids.filter((id) => validIds.has(id)),
    }));
  }

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

      let permissions: PermissionOption[];
      try {
        permissions = await adminProxyClient.get<PermissionOption[]>(
          "/api/admin/security/permissions",
        );
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            extractApiErrorMessage(error) ?? "Falha ao carregar permissoes.",
          );
          setLoading(false);
        }
        return;
      }

      if (cancelled) {
        return;
      }

      setPermissionOptions(permissions);

      if (!isEditing || !rolePublicId) {
        setEditor(EMPTY_EDITOR);
        setLoading(false);
        return;
      }

      let role: RoleEntry;
      try {
        role = await adminProxyClient.get<RoleEntry>(
          `/api/admin/security/roles/${rolePublicId}`,
        );
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            extractApiErrorMessage(error) ?? "Falha ao carregar perfil.",
          );
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setProtectedRole(isProtectedAdminRoleName(role.name));
        setEditor({
          name: role.name,
          description: role.description,
          active: role.active,
          forIntegration: role.forIntegration,
          permissionPublicIds: role.permissions.map((permission) => permission.publicId),
        });
        setLoading(false);
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [accessLoading, canAccessPage, isEditing, rolePublicId]);

  async function submitRole() {
    if (protectedRole) {
      toast.error("Perfil administrador protegido nao pode ser alterado.");
      return;
    }

    if (!editor.name.trim()) {
      toast.error("Informe o nome do perfil.");
      return;
    }

    if (
      editor.name.length < ROLE_NAME_MIN_LENGTH ||
      editor.name.length > ROLE_NAME_MAX_LENGTH
    ) {
      toast.error(
        `O nome deve ter entre ${ROLE_NAME_MIN_LENGTH} e ${ROLE_NAME_MAX_LENGTH} caracteres (use MAIUSCULAS e _).`,
      );
      return;
    }

    if (!editor.description.trim()) {
      toast.error("Informe a descricao do perfil.");
      return;
    }

    setSubmitting(true);
    try {
      const path = isEditing
        ? `/api/admin/security/roles/${rolePublicId}`
        : "/api/admin/security/roles";
      const payload = {
        name: editor.name.trim(),
        description: editor.description.trim(),
        active: editor.active,
        forIntegration: editor.forIntegration,
        permissionPublicIds: editor.permissionPublicIds,
      };

      if (isEditing) {
        await adminProxyClient.put(path, { body: payload });
      } else {
        await adminProxyClient.post(path, { body: payload });
      }

      router.push(
        `/security/roles/role_list?saved=${isEditing ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao salvar perfil.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell
        eyebrow="Seguranca"
        title="Perfis"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={
              isEditing
                ? "Voce nao possui permissao para editar perfis."
                : "Voce nao possui permissao para criar perfis."
            }
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title={isEditing ? "Editar perfil" : "Novo perfil"}
      description={
        isEditing
          ? "Ajuste o perfil de acesso e as permissoes relacionadas."
          : "Crie um novo perfil de acesso para reutilizar nos cadastros."
      }
    >
      <SgCard
        cardStyle="outlined"
        title="Dados do perfil"
        description="Defina o nome, a descricao e as permissoes que formam este perfil."
      >
        <SgStack gap={12}>
          <SgButton
            appearance="ghost"
            label="Voltar para lista"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/security/roles/role_list")}
            severity="secondary"
          />

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={420} shape="rectangle" />
          ) : protectedRole ? (
            <StatusBadge
              severity="warning"
              value="Perfil administrador protegido: nao pode ser alterado nem excluido."
            />
          ) : (
            <SgStack gap={16}>
              <SgInputText
                id="role-name"
                label="Nome"
                hintText="Use MAIUSCULAS e _ (ex.: GERENTE_VENDAS)"
                maxLength={ROLE_NAME_MAX_LENGTH}
                minLength={ROLE_NAME_MIN_LENGTH}
                inputProps={{ value: editor.name }}
                onChange={(name) =>
                  setEditor((current) => ({
                    ...current,
                    name: formatRoleName(name),
                  }))
                }
              />
              <SgInputText
                id="role-description"
                label="Descricao"
                inputProps={{ value: editor.description }}
                onChange={(description) =>
                  setEditor((current) => ({ ...current, description }))
                }
              />
              <SgToggleSwitch
                id="role-active"
                checked={editor.active}
                label="Perfil ativo"
                onChange={(active) =>
                  setEditor((current) => ({ ...current, active }))
                }
              />
              <SgToggleSwitch
                id="role-integration"
                checked={editor.forIntegration}
                label="Uso para integracao"
                onChange={(forIntegration) =>
                  setEditor((current) => ({ ...current, forIntegration }))
                }
              />
              <SgInputTextSearch
                id="role-permissions-search"
                label="Buscar permissoes"
                minChars={1}
                placeholder="Por tela, botao ou permissao (ex.: publicar, AI_CONFIG_ROLLBACK)"
                prefixIcon={null}
                onChange={setPermissionSearch}
                onSearchChange={setPermissionSearch}
              />

              <SgStack align="center" direction="row" gap={12} justify="between" wrap>
                <StatusBadge
                  severity={editor.permissionPublicIds.length > 0 ? "info" : "neutral"}
                  value={`${editor.permissionPublicIds.length} permissao(oes) neste perfil`}
                />
                <SgButton
                  appearance="ghost"
                  label={allExpanded ? "Recolher tudo" : "Expandir tudo"}
                  leftIcon={
                    allExpanded ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />
                  }
                  onClick={() => setExpandedIds(allExpanded ? [] : branchIds(fullTree))}
                  severity="secondary"
                  disabled={searching}
                />
              </SgStack>

              <SgTreeView
                nodes={visibleTree}
                checkable
                checkedIds={editor.permissionPublicIds}
                onCheckedChange={applyCheckedIds}
                expandedIds={effectiveExpandedIds}
                onExpandedChange={(ids) => {
                  // Enquanto busca, quem manda na expansao e o resultado do filtro.
                  if (!searching) {
                    setExpandedIds(ids);
                  }
                }}
                branchLabelBehavior="toggle"
                emptyText="Nenhuma permissao para esse filtro."
                maxHeightClassName="max-h-[520px]"
                size="sm"
              />
              <SgButton
                appearance="outline"
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submitRole()}
                severity="secondary"
              />
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
