"use client";

// Marca do SeedGrid App (grade modular + documento/grafico). As partes escuras
// usam `currentColor` (herda a cor de texto do tema via --sg-text), entao adaptam ao
// modo claro/escuro. O laranja da marca e o branco das barras sao fixos. Renderizado
// via brand.image do SgMenu; o texto "SeedGrid App" vem do brand.title.
export function SeedGridLogo({
  className,
  height = 40,
}: {
  readonly className?: string;
  readonly height?: number;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="SeedGrid App"
      className={className}
      style={{ color: "rgb(var(--sg-text))", height, width: "auto" }}
    >
      <g transform="translate(54 54)">
        <g fill="currentColor">
          <rect x="0" y="0" width="116" height="116" rx="16" />
          <rect x="144" y="0" width="116" height="116" rx="16" />
          <rect x="0" y="144" width="116" height="116" rx="16" />
          <rect x="0" y="288" width="116" height="116" rx="16" />
          <rect x="144" y="288" width="116" height="116" rx="16" />
          <rect x="288" y="288" width="116" height="116" rx="16" />
        </g>
        <rect x="144" y="144" width="116" height="116" rx="16" fill="#B65F3A" />
        <path
          d="M288 0h102l62 62v174a24 24 0 0 1-24 24H288a24 24 0 0 1-24-24V24a24 24 0 0 1 24-24Z"
          fill="#B65F3A"
        />
        <path d="M390 0v46a16 16 0 0 0 16 16h46Z" fill="#D98763" />
        <g fill="#FFFFFF">
          <rect x="302" y="144" width="28" height="74" rx="8" />
          <rect x="348" y="110" width="28" height="108" rx="8" />
          <rect x="394" y="78" width="28" height="140" rx="8" />
        </g>
        <rect x="288" y="284" width="130" height="24" rx="12" fill="currentColor" />
      </g>
    </svg>
  );
}
