export function formatCurrency(value: number | string, currency = "BRL") {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(numericValue);
}

/**
 * Data PURA (sem hora) no formato brasileiro: "2026-08-15" -> "15/08/2026".
 *
 * Nao passa por `new Date`: string ISO de data pura e' interpretada como UTC, e em fuso negativo
 * (America/Sao_Paulo) a formatacao local devolve o dia ANTERIOR — a cotacao do dia 15 apareceria
 * como 14. Para campos com hora, use formatDateTime.
 */
export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function parseDecimalInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=.*\.)/g, "");
  const decimal = normalized.replace(",", ".");
  const parsed = Number.parseFloat(decimal);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}
