import {
  SgBadge,
  type SgBadgeCustomColors,
  type SgBadgeSeverity,
} from "@seedgrid/fe-components";

type StatusBadgeProps = {
  value: string | number;
  severity?: SgBadgeSeverity;
};

// O tema do admin-web nao define `--tertiary`/`--destructive`, entao as
// severidades `success`/`danger` do SgBadge caem em cores neutras (lavadas).
// Forcamos verde/vermelho aqui para que ATIVO/INATIVO leiam de imediato.
const SEVERITY_COLORS: Partial<Record<SgBadgeSeverity, SgBadgeCustomColors>> = {
  success: { bg: "hsl(142 71% 45%)" },
  danger: { bg: "hsl(0 84% 60%)" },
  warning: { bg: "hsl(38 92% 50%)" },
  info: { bg: "hsl(217 91% 60%)" },
  secondary: { bg: "hsl(215 16% 47%)" },
  // Mesmo problema de tema do comentario acima: sem override, "neutral" cai lavado/apagado.
  neutral: { bg: "hsl(215 16% 47%)" },
};

function inferSeverity(value: string): SgBadgeSeverity {
  const normalized = value.toUpperCase();

  if (
    normalized.includes("FAILED") ||
    normalized.includes("SUSPENSA") ||
    normalized.includes("NEGATIVO") ||
    normalized.includes("ALTO")
  ) {
    return "danger";
  }

  if (
    normalized.includes("ACTIVE") ||
    normalized.includes("ATIVA") ||
    normalized.includes("PAID") ||
    normalized.includes("NORMAL")
  ) {
    return "success";
  }

  if (normalized.includes("ARCHIVED")) {
    return "secondary";
  }

  return "warning";
}

export function StatusBadge({ value, severity }: Readonly<StatusBadgeProps>) {
  const text = String(value);
  const resolvedSeverity = severity ?? inferSeverity(text);

  return (
    <SgBadge
      badgeStyle="soft"
      customColors={SEVERITY_COLORS[resolvedSeverity]}
      rounded
      severity={resolvedSeverity}
      value={text}
    />
  );
}
