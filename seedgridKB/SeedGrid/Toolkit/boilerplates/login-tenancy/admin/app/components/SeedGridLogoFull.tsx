"use client";

// Logo COMPLETO do SeedGrid App (marca + wordmark), fiel ao logo-seedgrid.svg:
// mesma geometria, fonte, pesos e espacamento. As partes escuras usam `currentColor`
// (herda --sg-text), entao acompanham o tema claro/escuro sem precisar de fundo branco.
// O laranja/dogear e o branco das barras sao fixos. Usado acima do card de login.
export function SeedGridLogoFull({
  className,
  height = 56,
}: {
  readonly className?: string;
  readonly height?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 300"
      role="img"
      aria-label="SeedGrid App"
      className={className}
      style={{ color: "rgb(var(--sg-text))", height, width: "auto" }}
    >
      <g transform="translate(45 43)">
        <g fill="currentColor">
          <rect x="0" y="0" width="58" height="58" rx="8" />
          <rect x="72" y="0" width="58" height="58" rx="8" />
          <rect x="0" y="72" width="58" height="58" rx="8" />
          <rect x="0" y="144" width="58" height="58" rx="8" />
          <rect x="72" y="144" width="58" height="58" rx="8" />
          <rect x="144" y="144" width="58" height="58" rx="8" />
        </g>
        <rect x="72" y="72" width="58" height="58" rx="8" fill="#B65F3A" />
        <path
          d="M144 0h51l31 31v87a12 12 0 0 1-12 12h-70a12 12 0 0 1-12-12V12a12 12 0 0 1 12-12Z"
          fill="#B65F3A"
        />
        <path d="M195 0v23a8 8 0 0 0 8 8h23Z" fill="#D98763" />
        <g fill="#FFFFFF">
          <rect x="151" y="72" width="14" height="37" rx="4" />
          <rect x="174" y="55" width="14" height="54" rx="4" />
          <rect x="197" y="39" width="14" height="70" rx="4" />
        </g>
        <rect x="144" y="142" width="65" height="12" rx="6" fill="currentColor" />
      </g>

      <g
        fontFamily="Inter, Montserrat, Arial, sans-serif"
        dominantBaseline="middle"
      >
        <text
          x="315"
          y="151"
          fill="currentColor"
          fontSize="112"
          fontWeight="650"
          letterSpacing="-5"
        >
          SeedGrid
        </text>
        <text
          x="805"
          y="157"
          fill="currentColor"
          fillOpacity="0.55"
          fontSize="79"
          fontWeight="400"
          letterSpacing="-2"
        >
          Report
        </text>
      </g>
    </svg>
  );
}
