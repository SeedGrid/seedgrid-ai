"use client";

// PORTADO do `seedgrid-report-client`: src/views/auth/AuthCard.tsx
//
// A tela veio LITERAL — JSX, estado, validacao, mensagens e ordem das chamadas sao os mesmos.
// Trocou-se APENAS o transporte:
//   - nada. E' copia literal — o arquivo nao tinha import de Tauri nenhum.
//
// "use client" no topo porque no Next isto e' componente de cliente (o original ja' era: era um
// SPA inteiro no browser do Tauri).

import { SgWhistleHost } from "@seedgrid/fe-components";
import type { ReactNode } from "react";

interface AuthCardProps {
  readonly title: string;
  /**
   * Quando `true`, o card ocupa toda a largura do contêiner pai (ex.: a tela de seleção de
   * empresa, onde nomes longos precisam caber no combo e no dropdown). O contêiner em
   * `AuthScreen` é quem aplica a largura máxima maior nesse caso; aqui só removemos qualquer
   * restrição interna para o card preencher o espaço disponível.
   */
  readonly wide?: boolean;
  readonly children: ReactNode;
}

/** Shared card chrome for the auth screens. */
export function AuthCard({ title, wide = false, children }: AuthCardProps) {
  return (
    <div className={`rounded-sg border border-sg-border bg-sg-surface p-6 shadow-sm${wide ? " w-full" : ""}`}>
      <h1 className="mb-5 text-center text-2xl font-semibold text-sg-text">{title}</h1>
      {/* Area INLINE dos avisos publicados por sgWhistle (ex.: "CNPJ ja cadastrado" no signup).
          O SgWhistleHost nao e um overlay flutuante: ele desenha exatamente onde e montado, sem
          portal nem position:fixed. Montado no topo do card, o aviso aparece junto do formulario
          a que se refere — montado na raiz da aplicacao, ficava abaixo da tela inteira, fora da
          area visivel. Fica aqui, no chrome compartilhado, para valer em toda tela de auth. */}
      <SgWhistleHost className="mb-4 empty:mb-0" newestOnTop />
      {children}
    </div>
  );
}

interface AuthMessageProps {
  readonly tone?: "error" | "success" | "muted";
  readonly children: ReactNode;
}

export function AuthMessage({ tone = "muted", children }: AuthMessageProps) {
  const toneClass =
    tone === "error"
      ? "text-sg-error-700"
      : tone === "success"
        ? "text-sg-success-700"
        : "text-sg-muted";
  return <p className={`mt-3 text-center text-sm ${toneClass}`}>{children}</p>;
}
