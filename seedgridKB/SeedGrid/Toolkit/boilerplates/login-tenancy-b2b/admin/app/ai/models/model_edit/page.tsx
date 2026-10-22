"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgDatatable,
  SgDialog,
  SgInputCurrency,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgComboboxSource,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { StatusBadge } from "../../../components/StatusBadge";
import { formatDateTime, parseDecimalInput } from "@/lib/format";
import type { AiModelEntry, AiModelPrice } from "@/lib/seedgrid-app-api";

type ModelEditorState = {
  provider: string;
  model: string;
  label: string;
  currency: string;
  active: boolean;
};

const EMPTY_EDITOR: ModelEditorState = {
  provider: "openai",
  model: "",
  label: "",
  currency: "USD",
  active: true,
};

const CURRENCY_SOURCE: SgComboboxSource = [
  { id: "USD", label: "USD", value: "USD" },
  { id: "BRL", label: "BRL", value: "BRL" },
  { id: "EUR", label: "EUR", value: "EUR" },
];

export default function AiModelEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <AiModelEditPageContent />
    </Suspense>
  );
}

function AiModelEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelPublicId = searchParams.get("publicId");
  const isEditing = Boolean(modelPublicId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<ModelEditorState>(EMPTY_EDITOR);

  useEffect(() => {
    if (!isEditing || !modelPublicId) {
      setEditor(EMPTY_EDITOR);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadModel() {
      setLoading(true);
      setStatusMessage(null);
      // O backend nao expoe GET por id; busca a lista e seleciona o modelo.
      const response = await fetch("/api/admin/ai/models", { cache: "no-store" });
      if (!response.ok) {
        if (!cancelled) {
          setStatusMessage("Falha ao carregar modelo.");
          setLoading(false);
        }
        return;
      }
      const result = (await response.json()) as { models: AiModelEntry[] };
      const model = result.models?.find((item) => item.id === modelPublicId);
      if (!cancelled) {
        if (!model) {
          setStatusMessage("Modelo nao encontrado.");
        } else {
          setEditor({
            provider: model.provider ?? "",
            model: model.model,
            label: model.label ?? "",
            currency: model.currency || "USD",
            active: model.active,
          });
        }
        setLoading(false);
      }
    }

    void loadModel();

    return () => {
      cancelled = true;
    };
  }, [isEditing, modelPublicId]);

  async function submitModel() {
    if (!editor.model.trim()) {
      toast.error("Informe o identificador do modelo (ex.: gpt-5.1).");
      return;
    }

    const payload = {
      provider: editor.provider.trim() || null,
      model: editor.model.trim(),
      label: editor.label.trim() || null,
      currency: editor.currency || "USD",
      active: editor.active,
    };

    setSubmitting(true);
    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/ai/models/${modelPublicId}`
          : "/api/admin/ai/models",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao salvar modelo.");
        return;
      }

      router.push(
        `/ai/models/model_list?saved=${isEditing ? "updated" : "created"}`,
      );
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell
      eyebrow="Inteligencia Artificial"
      title={isEditing ? "Editar modelo" : "Novo modelo"}
      description={
        isEditing
          ? "Atualize os dados e a precificacao do modelo selecionado."
          : "Cadastre um modelo de linguagem e a sua precificacao por milhao de tokens."
      }
    >
      <SgCard
        cardStyle="outlined"
        title={isEditing ? "Dados do modelo" : "Cadastro do modelo"}
        description="O identificador do modelo deve ser exatamente o esperado pelo provedor (ex.: gpt-5.1, gpt-4.1-nano)."
      >
        <SgStack gap={12}>
          <SgStack align="center" direction="row" gap={12} wrap>
            <SgButton
              appearance="ghost"
              label="Voltar para lista"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.push("/ai/models/model_list")}
              severity="secondary"
            />
          </SgStack>

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={420} shape="rectangle" />
          ) : (
            <ModelForm
              editor={editor}
              isEditing={isEditing}
              submitting={submitting}
              onChange={setEditor}
              onSubmit={() => void submitModel()}
            />
          )}
        </SgStack>
      </SgCard>

      {isEditing && modelPublicId ? (
        <div style={{ marginTop: 16 }}>
          <ModelPrices modelPublicId={modelPublicId} currency={editor.currency || "USD"} />
        </div>
      ) : null}
    </Shell>
  );
}

// Historico de precos do modelo + lancamento de um preco novo (vira o vigente).
function ModelPrices({
  modelPublicId,
  currency,
}: {
  modelPublicId: string;
  currency: string;
}) {
  const [prices, setPrices] = useState<AiModelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ input: "", cached: "", output: "", sourceUrl: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/ai/models/${modelPublicId}/prices`, {
      cache: "no-store",
    });
    if (response.ok) {
      const result = (await response.json()) as { prices: AiModelPrice[] };
      setPrices(result.prices ?? []);
    }
    setLoading(false);
  }, [modelPublicId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function launch() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/ai/models/${modelPublicId}/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPricePerMillion: form.input.trim() ? parseDecimalInput(form.input) : null,
          cachedInputPricePerMillion: form.cached.trim() ? parseDecimalInput(form.cached) : null,
          outputPricePerMillion: form.output.trim() ? parseDecimalInput(form.output) : null,
          sourceUrl: form.sourceUrl.trim() || null,
        }),
      });
      if (!response.ok) {
        setError((await response.text()) || "Falha ao lancar preco.");
        return;
      }
      setDialogOpen(false);
      setForm({ input: "", cached: "", output: "", sourceUrl: "" });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  const columns: SgDatatableColumn<AiModelPrice>[] = useMemo(() => [
    {
      columnId: "price-valid",
      header: "Vigente desde",
      body: (row) => formatDateTime(row.validFrom),
    },
    {
      columnId: "price-input",
      header: "Entrada /1M",
      align: "right",
      body: (row) => (row.inputPricePerMillion == null ? "-" : String(row.inputPricePerMillion)),
    },
    {
      columnId: "price-cached",
      header: "Cache entrada /1M",
      align: "right",
      body: (row) =>
        row.cachedInputPricePerMillion == null ? "-" : String(row.cachedInputPricePerMillion),
    },
    {
      columnId: "price-output",
      header: "Saida /1M",
      align: "right",
      body: (row) => (row.outputPricePerMillion == null ? "-" : String(row.outputPricePerMillion)),
    },
    { columnId: "price-currency", header: "Moeda", body: (row) => row.currency },
    {
      columnId: "price-approved",
      header: "Aprovado por",
      body: (row) => row.approvedBy ?? "-",
    },
  ], []);

  return (
    <SgCard
      cardStyle="outlined"
      title="Precos"
      description="Historico de precos (por 1M de tokens). Lancar um preco novo o torna o vigente."
    >
      <SgStack gap={12}>
        <div>
          <SgButton
            appearance="outline"
            label="Lancar novo preco"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setError(null);
              setDialogOpen(true);
            }}
            severity="primary"
          />
        </div>
        {loading ? (
          <SgSkeleton borderRadius={16} height={200} shape="rectangle" />
        ) : prices.length === 0 ? (
          <StatusBadge severity="info" value="Nenhum preco lancado ainda." />
        ) : (
          <SgDatatable columns={columns} value={prices} />
        )}
      </SgStack>

      <SgDialog open={dialogOpen} onOpenChange={setDialogOpen} closeable closeOnEsc>
        <SgStack gap={12}>
          <h3 style={{ margin: 0 }}>Lancar novo preco</h3>
          <SgInputCurrency
            id="price-input-new"
            label="Preco entrada (por 1M tokens)"
            currency={currency}
            decimals={4}
            minValue={0}
            inputProps={{ value: form.input }}
            onChange={(input) => setForm((c) => ({ ...c, input }))}
          />
          <SgInputCurrency
            id="price-cached-new"
            label="Preco cache de entrada (por 1M tokens)"
            currency={currency}
            decimals={4}
            minValue={0}
            inputProps={{ value: form.cached }}
            onChange={(cached) => setForm((c) => ({ ...c, cached }))}
          />
          <SgInputCurrency
            id="price-output-new"
            label="Preco saida (por 1M tokens)"
            currency={currency}
            decimals={4}
            minValue={0}
            inputProps={{ value: form.output }}
            onChange={(output) => setForm((c) => ({ ...c, output }))}
          />
          <SgInputText
            id="price-source-new"
            label="Fonte (URL opcional)"
            inputProps={{ value: form.sourceUrl }}
            onChange={(sourceUrl) => setForm((c) => ({ ...c, sourceUrl }))}
          />
          {error ? <StatusBadge severity="danger" value={error} /> : null}
          <SgButton
            appearance="outline"
            label={submitting ? "Lancando..." : "Lancar"}
            leftIcon={<Save size={16} />}
            onClick={() => void launch()}
            severity="secondary"
          />
        </SgStack>
      </SgDialog>
    </SgCard>
  );
}

type ModelFormProps = {
  editor: ModelEditorState;
  isEditing: boolean;
  submitting: boolean;
  onChange: Dispatch<SetStateAction<ModelEditorState>>;
  onSubmit: () => void;
};

function ModelForm({
  editor,
  isEditing,
  submitting,
  onChange,
  onSubmit,
}: ModelFormProps) {
  return (
    <SgStack gap={12}>
      <SgInputText
        id="model-provider"
        label="Provedor"
        hintText="Provedor do modelo (ex.: openai)."
        inputProps={{ value: editor.provider }}
        onChange={(provider) => onChange((current) => ({ ...current, provider }))}
      />
      <SgInputText
        id="model-model"
        label="Identificador do modelo"
        hintText="Valor exato usado na chamada ao provedor (ex.: gpt-5.1). Unico."
        enabled={!isEditing}
        inputProps={{ value: editor.model }}
        onChange={(model) => onChange((current) => ({ ...current, model }))}
      />
      <SgInputText
        id="model-label"
        label="Rotulo"
        hintText="Nome amigavel para exibicao (ex.: GPT-5.1)."
        inputProps={{ value: editor.label }}
        onChange={(label) => onChange((current) => ({ ...current, label }))}
      />
      {/* Preco NAO e mais editado aqui: e lancado/versionado na secao "Precos" abaixo. */}
      <div style={{ width: 140 }}>
        <SgCombobox
          id="model-currency"
          label="Moeda"
          source={CURRENCY_SOURCE}
          value={editor.currency || null}
          onValueChange={(value) =>
            onChange((current) => ({
              ...current,
              currency: value ? String(value) : "USD",
            }))
          }
        />
      </div>
      <SgToggleSwitch
        id="model-active"
        checked={editor.active}
        label="Modelo ativo"
        onChange={(checked) =>
          onChange((current) => ({ ...current, active: checked }))
        }
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
