"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgGrid,
  SgInputText,
  SgSkeleton,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Shell } from "../../../components/Shell";
import { CityPicker } from "../../../components/CityPicker";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  COMPANY_ACCESS_MODE_LABELS,
  COMPANY_PERSON_TYPE_LABELS,
  EMPTY_COMPANY_FORM,
  companyErrorFromThrown,
  digitsOnly,
  documentLabel,
  formFromEntry,
  validateCompanyForm,
  type CompanyAccessMode,
  type CompanyEntry,
  type CompanyForm,
  type CompanyPersonType,
} from "@/lib/companies";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

const PERSON_TYPE_ITEMS = (Object.keys(COMPANY_PERSON_TYPE_LABELS) as CompanyPersonType[]).map((type) => ({
  id: type,
  label: COMPANY_PERSON_TYPE_LABELS[type],
  value: type,
}));

export default function CompanyEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <CompanyEditPageContent />
    </Suspense>
  );
}

function CompanyEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyPublicId = searchParams.get("publicId");
  const isEditing = Boolean(companyPublicId);

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreateCompanies = hasPermission(ADMIN_PERMISSIONS.companiesCreate);
  const canEditCompanies = hasPermission(ADMIN_PERMISSIONS.companiesEdit);
  const canAccessPage = isEditing ? canEditCompanies : canCreateCompanies;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyForm>(EMPTY_COMPANY_FORM);
  // Estado de acesso e situacao so' aparecem (nao se editam aqui): accessMode e do billing/plataforma,
  // active muda pelo botao Inativar/Reativar da lista.
  const [accessMode, setAccessMode] = useState<CompanyAccessMode | null>(null);
  const [active, setActive] = useState<boolean | null>(null);

  function setField<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (accessLoading) {
      return;
    }
    if (!canAccessPage) {
      setLoading(false);
      return;
    }
    if (!isEditing || !companyPublicId) {
      setForm(EMPTY_COMPANY_FORM);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCompany() {
      setLoading(true);
      setStatusMessage(null);
      try {
        const company = await adminProxyClient.get<CompanyEntry>(`/api/security/companies/${companyPublicId}`);
        if (!cancelled) {
          setForm(formFromEntry(company));
          setAccessMode(company.accessMode);
          setActive(company.active);
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(companyErrorFromThrown(error, extractApiErrorMessage, "Falha ao carregar empresa."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCompany();

    return () => {
      cancelled = true;
    };
  }, [accessLoading, canAccessPage, isEditing, companyPublicId]);

  async function submitCompany() {
    const validationError = validateCompanyForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await adminProxyClient.put(`/api/security/companies/${companyPublicId}`, { body: form });
      } else {
        await adminProxyClient.post("/api/security/companies", { body: form });
      }
      router.push(`/security/companies/company_list?saved=${isEditing ? "updated" : "created"}`);
      router.refresh();
    } catch (error) {
      // COMPANY_QUOTA_EXCEEDED (402) ao criar, COMPANY_DOCUMENT_INVALID (400) etc.
      toast.error(companyErrorFromThrown(error, extractApiErrorMessage, "Falha ao salvar empresa."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell eyebrow="Seguranca" title="Empresas" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={
              isEditing
                ? "Voce nao possui permissao para editar empresas."
                : "Voce nao possui permissao para criar empresas."
            }
          />
        </SgCard>
      </Shell>
    );
  }

  const isPf = form.personType === "PF";

  return (
    <Shell
      eyebrow="Seguranca"
      title={isEditing ? "Editar empresa" : "Nova empresa"}
      description={
        isEditing
          ? "Ajuste os dados da empresa. Para inativar ou reativar, use a lista."
          : "Cadastre uma nova empresa na conta. O limite depende do seu plano."
      }
    >
      <SgCard
        cardStyle="outlined"
        title="Dados da empresa"
        description="Identificacao, endereco e representante legal."
      >
        <SgStack gap={12}>
          <SgButton
            appearance="ghost"
            label="Voltar para lista"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/security/companies/company_list")}
            severity="secondary"
          />

          {statusMessage ? <StatusBadge severity="info" value={statusMessage} /> : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={420} shape="rectangle" />
          ) : (
            <SgStack gap={16}>
              {isEditing && accessMode && active !== null ? (
                <SgStack direction="row" gap={8} wrap>
                  <StatusBadge
                    severity={active ? "success" : "danger"}
                    value={active ? "ATIVA" : "INATIVA"}
                  />
                  <StatusBadge
                    severity={accessMode === "ACTIVE" ? "success" : accessMode === "READ_ONLY" ? "warning" : "danger"}
                    value={`Estado: ${COMPANY_ACCESS_MODE_LABELS[accessMode]}`}
                  />
                </SgStack>
              ) : null}

              <SgGrid minItemWidth={220} gap={12}>
                <SgCombobox
                  id="company-person-type"
                  label="Tipo de pessoa"
                  source={PERSON_TYPE_ITEMS}
                  value={form.personType}
                  onValueChange={(value) => setField("personType", value === "PF" ? "PF" : "PJ")}
                />
                <SgInputText
                  id="company-cpf-cnpj"
                  label={isPf ? "CPF (opcional)" : documentLabel(form.personType)}
                  hintText="Somente numeros"
                  maxLength={18}
                  inputProps={{ value: form.cpfCnpj }}
                  onChange={(value) => setField("cpfCnpj", digitsOnly(value).slice(0, 14))}
                />
              </SgGrid>
              <SgInputText
                id="company-corporate-name"
                label={isPf ? "Nome" : "Razao social"}
                inputProps={{ value: form.corporateName }}
                onChange={(value) => setField("corporateName", value)}
              />
              <SgInputText
                id="company-trade-name"
                label="Nome fantasia"
                inputProps={{ value: form.tradeName }}
                onChange={(value) => setField("tradeName", value)}
              />

              <SgGrid minItemWidth={180} gap={12}>
                <SgInputText
                  id="company-postal-code"
                  label="CEP"
                  maxLength={9}
                  inputProps={{ value: form.addrPostalCode }}
                  onChange={(value) => setField("addrPostalCode", value)}
                />
                <SgInputText
                  id="company-street"
                  label="Logradouro"
                  inputProps={{ value: form.addrStreet }}
                  onChange={(value) => setField("addrStreet", value)}
                />
                <SgInputText
                  id="company-number"
                  label="Numero"
                  inputProps={{ value: form.addrNumber }}
                  onChange={(value) => setField("addrNumber", value)}
                />
              </SgGrid>
              <SgGrid minItemWidth={180} gap={12}>
                <SgInputText
                  id="company-complement"
                  label="Complemento"
                  inputProps={{ value: form.addrComplement }}
                  onChange={(value) => setField("addrComplement", value)}
                />
                <SgInputText
                  id="company-district"
                  label="Bairro"
                  inputProps={{ value: form.addrDistrict }}
                  onChange={(value) => setField("addrDistrict", value)}
                />
              </SgGrid>
              <CityPicker
                idPrefix="company"
                uf={form.addrState}
                cityId={form.cityId}
                cityName={form.cityName}
                legacyCityText={form.addrCity}
                onUfChange={(uf) =>
                  setForm((current) => ({ ...current, addrState: uf, cityId: null, cityName: "", addrCity: "" }))
                }
                onCityChange={(city) =>
                  setForm((current) => ({
                    ...current,
                    cityId: city?.id ?? null,
                    cityName: city?.name ?? "",
                    addrCity: city ? city.name : current.addrCity,
                  }))
                }
              />
              <SgInputText
                id="company-address-phone"
                label="Telefone"
                inputProps={{ value: form.addrPhone }}
                onChange={(value) => setField("addrPhone", value)}
              />

              {isPf ? null : (
                <>
                  <SgGrid minItemWidth={180} gap={12}>
                    <SgInputText
                      id="company-rep-first-name"
                      label="Representante: nome"
                      inputProps={{ value: form.repFirstName }}
                      onChange={(value) => setField("repFirstName", value)}
                    />
                    <SgInputText
                      id="company-rep-last-name"
                      label="Representante: sobrenome"
                      inputProps={{ value: form.repLastName }}
                      onChange={(value) => setField("repLastName", value)}
                    />
                    <SgInputText
                      id="company-rep-cpf"
                      label="Representante: CPF"
                      maxLength={14}
                      inputProps={{ value: form.repCpf }}
                      onChange={(value) => setField("repCpf", value)}
                    />
                  </SgGrid>
                  <SgGrid minItemWidth={180} gap={12}>
                    <SgInputText
                      id="company-rep-phone"
                      label="Representante: telefone"
                      inputProps={{ value: form.repPhone }}
                      onChange={(value) => setField("repPhone", value)}
                    />
                    <SgInputText
                      id="company-rep-whatsapp"
                      label="Representante: WhatsApp"
                      inputProps={{ value: form.repWhatsapp }}
                      onChange={(value) => setField("repWhatsapp", value)}
                    />
                    <SgInputText
                      id="company-rep-email"
                      label="Representante: e-mail"
                      inputProps={{ value: form.repEmail }}
                      onChange={(value) => setField("repEmail", value)}
                    />
                  </SgGrid>
                </>
              )}

              <SgButton
                appearance="outline"
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submitCompany()}
                severity="secondary"
                disabled={submitting}
              />
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
