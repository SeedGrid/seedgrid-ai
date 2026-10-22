"use client";

import { SgStack } from "@seedgrid/fe-components";

import { SeedGridLogoFull } from "./components/SeedGridLogoFull";
import { Shell } from "./components/Shell";

/** Home do produto: pagina protegida simples, ponto de partida das telas de negocio. */
export default function HomePage() {
  return (
    <Shell eyebrow="Inicio" title="Bem-vindo" description="Voce esta autenticado.">
      <SgStack align="center" gap={20} style={{ padding: "48px 0", textAlign: "center" }}>
        <SeedGridLogoFull />
        <p style={{ maxWidth: 520, fontSize: 15, opacity: 0.75 }}>
          Use o menu lateral para acessar as telas do produto.
        </p>
      </SgStack>
    </Shell>
  );
}
