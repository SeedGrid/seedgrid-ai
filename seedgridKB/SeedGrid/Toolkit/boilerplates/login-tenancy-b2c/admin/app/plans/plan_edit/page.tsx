"use client";

import {
  SgButton,
  SgCard,
  SgInputNumber,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
} from "@seedgrid/fe-components";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import type { PlanEntry } from "@/lib/seedgrid-app-api";

type PlanEditorState = {
  publicId: string | null;
  name: string;
  description: string;
  active: boolean;
  // A partir de qual % de consumo do ciclo o client oferece upgrade/assinatura.
  upgradePromptThresholdPercent: string;
  // Faixas de alerta de cota (% RESTANTE): amarelo <= warning, vermelho <= critical.
  quotaWarningRemainingPercent: string;
  quotaCriticalRemainingPercent: string;
};

const EMPTY_EDITOR: PlanEditorState = {
  publicId: null,
  name: "",
  description: "",
  active: true,
  upgradePromptThresholdPercent: "20",
  quotaWarningRemainingPercent: "20",
  quotaCriticalRemainingPercent: "10",
};

export default function PlanEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <PlanEditPageContent />
    </Suspense>
  );
}

function PlanEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planPublicId = searchParams.get("publicId");
  const isEditing = Boolean(planPublicId);

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreatePlans = hasPermission(ADMIN_PERMISSIONS.plansCreate);
  const canEditPlans = hasPermission(ADMIN_PERMISSIONS.plansEdit);
  const canAccessPage = isEditing ? canEditPlans : canCreatePlans;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<PlanEditorState>(EMPTY_EDITOR);

  useEffect(() => {
    if (accessLoading) {
      return;
    }

    if (!canAccessPage) {
      setLoading(false);
      return;
    }

    if (!isEditing || !planPublicId) {
      setEditor(EMPTY_EDITOR);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPlan() {
      setLoading(true);
      setStatusMessage(null);

      const response = await fetch(`/api/admin/plans/${planPublicId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();
        if (!cancelled) {
          setStatusMessage(text || "Falha ao carregar plano.");
          setLoading(false);
        }
        return;
      }

      const plan = (await response.json()) as PlanEntry;
      if (!cancelled) {
        setEditor({
          publicId: plan.publicId,
          name: plan.name,
          description: plan.description ?? "",
          active: plan.active,
          upgradePromptThresholdPercent: String(
            plan.upgradePromptThresholdPercent ?? 20,
          ),
          quotaWarningRemainingPercent: String(
            plan.quotaWarningRemainingPercent ?? 20,
          ),
          quotaCriticalRemainingPercent: String(
            plan.quotaCriticalRemainingPercent ?? 10,
          ),
        });
        setLoading(false);
      }
    }

    void loadPlan();

    return () => {
      cancelled = true;
    };
  }, [accessLoading, canAccessPage, isEditing, planPublicId]);

  async function submitPlan() {
    // O codigo agora e interno e auto-gerado no backend a partir do nome.
    if (!editor.name.trim()) {
      toast.error("Informe o nome do plano.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        isEditing ? `/api/admin/plans/${planPublicId}` : "/api/admin/plans",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editor.name.trim(),
            description: editor.description.trim() || null,
            active: editor.active,
            upgradePromptThresholdPercent:
              Number.parseInt(editor.upgradePromptThresholdPercent, 10) || 20,
            quotaWarningRemainingPercent:
              Number.parseInt(editor.quotaWarningRemainingPercent, 10) || 20,
            quotaCriticalRemainingPercent:
              Number.parseInt(editor.quotaCriticalRemainingPercent, 10) || 10,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao salvar plano.");
        return;
      }

      router.push(`/plans/plan_list?saved=${isEditing ? "updated" : "created"}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell
        eyebrow="Comercial"
        title="Planos"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={
              isEditing
                ? "Voce nao possui permissao para editar planos."
                : "Voce nao possui permissao para criar planos."
            }
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Comercial"
      title={isEditing ? "Editar plano" : "Novo plano"}
      description={
        isEditing
          ? "Atualize as informacoes do plano selecionado."
          : "Preencha os dados para cadastrar um novo plano."
      }
    >
      <SgCard
        cardStyle="outlined"
        title={isEditing ? "Dados do plano" : "Cadastro do plano"}
        description={
          isEditing
            ? "Atualize os dados do plano, incluindo o codigo de negocio."
            : "Informe os dados principais do plano, comecando pelo codigo de negocio (ex.: BASICO, PREMIUM)."
        }
      >
        <SgStack gap={12}>
          <SgStack align="center" direction="row" gap={12} wrap>
            <SgButton
              appearance="ghost"
              label="Voltar para lista"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.push("/plans/plan_list")}
              severity="secondary"
            />
          </SgStack>

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={320} shape="rectangle" />
          ) : (
            <PlanForm
              editor={editor}
              isEditing={isEditing}
              submitting={submitting}
              onChange={setEditor}
              onSubmit={() => void submitPlan()}
            />
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}

type PlanFormProps = {
  editor: PlanEditorState;
  isEditing: boolean;
  submitting: boolean;
  onChange: Dispatch<SetStateAction<PlanEditorState>>;
  onSubmit: () => void;
};

function PlanForm({ editor, isEditing, submitting, onChange, onSubmit }: PlanFormProps) {
  return (
    <SgStack gap={12}>
      {isEditing && editor.publicId != null ? (
        <SgInputText
          id="plan-id"
          label="ID"
          hintText="Identificador publico do plano. Gerado automaticamente e nao editavel."
          enabled={false}
          inputProps={{ value: editor.publicId }}
          onChange={() => undefined}
        />
      ) : null}
      {/* Codigo removido: e interno e gerado automaticamente no backend a partir do nome. */}
      <SgInputText
        id="plan-name"
        label="Nome"
        inputProps={{ value: editor.name }}
        onChange={(name) => onChange((current) => ({ ...current, name }))}
      />
      <SgInputText
        id="plan-description"
        label="Descricao"
        inputProps={{ value: editor.description }}
        onChange={(description) => onChange((current) => ({ ...current, description }))}
      />
      <SgInputNumber
        id="plan-upgrade-threshold"
        label="% de consumo para oferecer upgrade"
        hintText="A partir deste % do ciclo consumido, o app do cliente exibe o convite para assinar/fazer upgrade."
        decimals={0}
        minValue={1}
        maxValue={100}
        inputProps={{ value: editor.upgradePromptThresholdPercent }}
        onChange={(upgradePromptThresholdPercent) =>
          onChange((current) => ({ ...current, upgradePromptThresholdPercent }))
        }
      />
      <SgInputNumber
        id="plan-quota-warning"
        label="% restante para alerta amarelo"
        hintText="Quando a cota restante cair ate este %, o app mostra o alerta de consumo em amarelo."
        decimals={0}
        minValue={1}
        maxValue={100}
        inputProps={{ value: editor.quotaWarningRemainingPercent }}
        onChange={(quotaWarningRemainingPercent) =>
          onChange((current) => ({ ...current, quotaWarningRemainingPercent }))
        }
      />
      <SgInputNumber
        id="plan-quota-critical"
        label="% restante para alerta vermelho"
        hintText="Quando a cota restante cair ate este % (menor que o amarelo), o alerta fica vermelho."
        decimals={0}
        minValue={1}
        maxValue={100}
        inputProps={{ value: editor.quotaCriticalRemainingPercent }}
        onChange={(quotaCriticalRemainingPercent) =>
          onChange((current) => ({ ...current, quotaCriticalRemainingPercent }))
        }
      />
      <SgToggleSwitch
        id="plan-active"
        checked={editor.active}
        label="Plano ativo"
        onChange={(checked) => onChange((current) => ({ ...current, active: checked }))}
      />
      <SgButton
        appearance="outline"
        label={submitting ? "Salvando..." : "Salvar"}
        leftIcon={<Save size={16} />}
        onClick={onSubmit}
        severity="secondary"
      />
    </SgStack>
  );
}
