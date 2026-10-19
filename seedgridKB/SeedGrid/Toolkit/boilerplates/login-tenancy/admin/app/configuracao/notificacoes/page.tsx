"use client";

import {
  SgButton,
  SgCheckboxGroup,
  SgCombobox,
  SgInputEmail,
  SgInputPhone,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
} from "@seedgrid/fe-components";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

// value null: o destinatario so recebe quando o atributo estiver ausente/em branco no evento.
type ConditionalRecipient = { channel: string; address: string; attribute: string; value: string | null };
type Rule = {
  enabled: boolean;
  channels: string[];
  emails: string[];
  phones: string[];
  whatsappChannelId: string | null;
  // Backend anterior aos destinatarios condicionais nao manda o campo.
  conditionalRecipients?: ConditionalRecipient[];
};
type RoutingAttribute = { key: string; label: string; options: { value: string; label: string }[] };
type EventEntry = {
  definition: {
    code: string;
    group: string;
    label: string;
    description: string;
    variables: string[];
    subjectTemplate: string;
    bodyTemplate: string;
  };
  configuration: Rule;
};
type EventResponse = { channels: string[]; events: EventEntry[]; routingAttributes?: RoutingAttribute[] };

const ABSENT = "__absent__";

/*
 * Telefone: a extension guarda em E.164 (+5516981295353); a tela mostra e edita no formato nacional do
 * SgInputPhone ((16) 98129-5353). Numero de fora do Brasil, ja' digitado com "+", segue como esta'.
 */
const onlyDigits = (value: string) => value.replace(/\D/g, "");

function phoneToE164(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return `+${onlyDigits(trimmed)}`;
  const digits = onlyDigits(trimmed);
  return digits ? `+55${digits}` : "";
}

function phoneFromE164(value: string): string {
  return value.startsWith("+55") ? value.slice(3) : value;
}

/** O que a extension aceita: + e de 8 a 15 digitos, sem zero na frente do DDI. */
const isE164 = (value: string) => /^\+[1-9][0-9]{7,14}$/.test(value);

/** Lista editavel de e-mails ou telefones, um campo por destinatario. */
function RecipientList({ id, kind, values, onChange }: {
  id: string;
  kind: "EMAIL" | "WHATSAPP";
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const change = (index: number, value: string) => onChange(values.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(values.filter((_, i) => i !== index));
  const label = kind === "EMAIL" ? "E-mail" : "Telefone WhatsApp";
  return (
    <SgStack gap={8}>
      {values.map((value, index) => (
        <SgStack key={index} direction="row" gap={8} align="center">
          <div style={{ flex: 1, minWidth: 220 }}>
            {kind === "EMAIL" ? (
              <SgInputEmail
                id={`${id}-${index}`}
                label={label}
                inputProps={{ value }}
                onChange={(next) => change(index, next.trim())}
              />
            ) : (
              <SgInputPhone
                id={`${id}-${index}`}
                label={label}
                inputProps={{ value: phoneFromE164(value) }}
                onChange={(next) => change(index, phoneToE164(next))}
              />
            )}
          </div>
          <SgButton
            appearance="ghost"
            severity="danger"
            iconOnly
            aria-label={`Remover ${label.toLowerCase()}`}
            leftIcon={<Trash2 size={16} />}
            onClick={() => remove(index)}
          />
        </SgStack>
      ))}
      <div>
        <SgButton
          appearance="outline"
          label={kind === "EMAIL" ? "Adicionar e-mail" : "Adicionar telefone"}
          leftIcon={<Plus size={16} />}
          onClick={() => onChange([...values, ""])}
        />
      </div>
    </SgStack>
  );
}

function ConditionalRecipients({ code, channels, attributes, rows, onChange }: {
  code: string;
  channels: string[];
  attributes: RoutingAttribute[];
  rows: ConditionalRecipient[];
  onChange: (rows: ConditionalRecipient[]) => void;
}) {
  const change = (index: number, patch: Partial<ConditionalRecipient>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend>Destinatários condicionais</legend>
      <SgStack gap={12}>
        <small>Recebem o evento só quando o atributo tem o valor escolhido. &quot;Sem valor (ausente)&quot; recebe só os eventos em que o atributo não existe.</small>
        {rows.map((row, index) => {
          const attribute = attributes.find((item) => item.key === row.attribute);
          const options = attribute?.options ?? [];
          const valueSource = [
            { id: ABSENT, label: "Sem valor (ausente)" },
            ...options.map((option) => ({ id: option.value, label: option.label })),
            ...(row.value !== null && !options.some((option) => option.value === row.value)
              ? [{ id: row.value, label: `${row.value} (não listado)` }]
              : []),
          ];
          return (
            <SgStack key={index} direction="row" gap={12} wrap>
              <div style={{ width: 150 }}>
                <SgCombobox
                  id={`${code}-conditional-${index}-channel`}
                  label="Canal"
                  source={channels.map((channel) => ({ id: channel, label: channel }))}
                  value={row.channel || null}
                  // Trocar o canal troca o tipo de endereco: o anterior nao serve mais.
                  onValueChange={(value) => change(index, { channel: value ? String(value) : "", address: "" })}
                />
              </div>
              <div style={{ minWidth: 220, flex: 1 }}>
                {row.channel === "WHATSAPP" ? (
                  <SgInputPhone
                    id={`${code}-conditional-${index}-address`}
                    label="Telefone WhatsApp"
                    inputProps={{ value: phoneFromE164(row.address) }}
                    onChange={(address) => change(index, { address: phoneToE164(address) })}
                  />
                ) : (
                  <SgInputEmail
                    id={`${code}-conditional-${index}-address`}
                    label="E-mail"
                    inputProps={{ value: row.address }}
                    onChange={(address) => change(index, { address: address.trim() })}
                  />
                )}
              </div>
              <div style={{ width: 180 }}>
                <SgCombobox
                  id={`${code}-conditional-${index}-attribute`}
                  label="Atributo"
                  source={attributes.map((item) => ({ id: item.key, label: item.label }))}
                  value={row.attribute || null}
                  onValueChange={(value) => change(index, { attribute: value ? String(value) : "", value: null })}
                />
              </div>
              <div style={{ width: 220 }}>
                <SgCombobox
                  id={`${code}-conditional-${index}-value`}
                  label="Valor"
                  source={valueSource}
                  value={row.value ?? ABSENT}
                  onValueChange={(value) => change(index, { value: value && value !== ABSENT ? String(value) : null })}
                />
              </div>
              <SgButton
                appearance="ghost"
                severity="danger"
                iconOnly
                aria-label="Remover destinatário condicional"
                leftIcon={<Trash2 size={16} />}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              />
            </SgStack>
          );
        })}
        <div>
          <SgButton
            appearance="outline"
            label="Adicionar destinatário condicional"
            leftIcon={<Plus size={16} />}
            onClick={() => onChange([
              ...rows,
              { channel: channels[0] ?? "EMAIL", address: "", attribute: attributes[0]?.key ?? "", value: null },
            ])}
          />
        </div>
      </SgStack>
    </fieldset>
  );
}

/** Confere antes de enviar o que a extension recusaria, com a mensagem apontando o campo. */
function validationError(rule: Rule): string | null {
  const phones = [...rule.phones, ...(rule.conditionalRecipients ?? [])
    .filter((row) => row.channel === "WHATSAPP")
    .map((row) => row.address)];
  const invalidPhone = phones.find((phone) => phone !== "" && !isE164(phone));
  if (invalidPhone) {
    return `Telefone inválido: ${phoneFromE164(invalidPhone)}. Informe DDD + número (ex.: (16) 98129-5353).`;
  }
  return null;
}

/** Linhas vazias (campo adicionado e nao preenchido) nao vao para o backend. */
function toPayload(rule: Rule): Rule {
  return {
    ...rule,
    emails: rule.emails.filter(Boolean),
    phones: rule.phones.filter(Boolean),
    conditionalRecipients: (rule.conditionalRecipients ?? []).filter((row) => row.address),
  };
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [channels, setChannels] = useState<string[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [routingAttributes, setRoutingAttributes] = useState<RoutingAttribute[]>([]);
  const [status, setStatus] = useState<{ severity: "info" | "success" | "warning" | "danger"; value: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminProxyClient.get<EventResponse | null>("/api/admin/notifications/events");
      if (!data) {
        setStatus({ severity: "warning", value: "Não foi possível carregar as notificações. Verifique a permissão NOTIFICATION_READ e se o backend está atualizado." });
        return;
      }
      setChannels(data.channels ?? []);
      setEvents(data.events ?? []);
      setRoutingAttributes(data.routingAttributes ?? []);
      setStatus(null);
    } catch (error) {
      setStatus({ severity: "danger", value: extractApiErrorMessage(error) ?? "Falha ao carregar as configurações de notificação." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function update(code: string, change: Partial<Rule>) {
    setEvents((current) => current.map((entry) => entry.definition.code === code
      ? { ...entry, configuration: { ...entry.configuration, ...change } }
      : entry));
  }

  async function save(entry: EventEntry) {
    const invalid = validationError(entry.configuration);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    const code = entry.definition.code;
    setBusyCode(code);
    try {
      await adminProxyClient.put(`/api/admin/notifications/events/${encodeURIComponent(code)}`, {
        body: toPayload(entry.configuration),
      });
      toast.success("Configuração de notificação salva.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao salvar a configuração.");
    } finally {
      setBusyCode(null);
    }
  }

  return (
    <Shell eyebrow="Configuração" title="Notificações" description="Escolha os eventos disponíveis e configure canais e destinatários para cada um.">
      {status ? <StatusBadge severity={status.severity} value={status.value} /> : null}
      {loading ? <SgSkeleton borderRadius={16} height={320} shape="rectangle" /> : events.length === 0 ? (
        <p>Nenhuma extensão registrou eventos notificáveis.</p>
      ) : (
        <SgStack gap={16}>
          {events.map(({ definition, configuration }) => (
            <section key={definition.code} style={{ maxWidth: 820, border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
              <SgStack gap={12}>
                <div>
                  <small>{definition.group}</small>
                  <h2 style={{ margin: "4px 0" }}>{definition.label}</h2>
                  <p style={{ margin: 0 }}>{definition.description}</p>
                  <small>{definition.code}</small>
                </div>
                <SgToggleSwitch
                  id={`${definition.code}-enabled`}
                  checked={configuration.enabled}
                  label="Ativar este evento"
                  onChange={(enabled) => update(definition.code, { enabled })}
                />
                <SgCheckboxGroup
                  id={`${definition.code}-channels`}
                  title="Canais"
                  orientation="horizontal"
                  source={channels.map((channel) => ({ label: channel, value: channel }))}
                  value={configuration.channels}
                  onChange={(value) => update(definition.code, { channels: value.map(String) })}
                />
                {configuration.channels.includes("EMAIL") ? (
                  <RecipientList
                    id={`${definition.code}-email`}
                    kind="EMAIL"
                    values={configuration.emails}
                    onChange={(emails) => update(definition.code, { emails })}
                  />
                ) : null}
                {configuration.channels.includes("WHATSAPP") ? <>
                  <RecipientList
                    id={`${definition.code}-phone`}
                    kind="WHATSAPP"
                    values={configuration.phones}
                    onChange={(phones) => update(definition.code, { phones })}
                  />
                  <SgInputText
                    id={`${definition.code}-whatsapp-channel`}
                    label="Identificador do canal WhatsApp"
                    inputProps={{ value: configuration.whatsappChannelId ?? "" }}
                    onChange={(value) => update(definition.code, { whatsappChannelId: value.trim() || null })}
                  />
                </> : null}
                {routingAttributes.length > 0 ? (
                  <ConditionalRecipients
                    code={definition.code}
                    channels={channels}
                    attributes={routingAttributes}
                    rows={configuration.conditionalRecipients ?? []}
                    onChange={(conditionalRecipients) => update(definition.code, { conditionalRecipients })}
                  />
                ) : null}
                <SgButton label={busyCode === definition.code ? "Salvando..." : "Salvar evento"} leftIcon={<Save size={16} />} disabled={busyCode !== null} onClick={() => void save({ definition, configuration })} severity="primary" />
              </SgStack>
            </section>
          ))}
        </SgStack>
      )}
    </Shell>
  );
}
