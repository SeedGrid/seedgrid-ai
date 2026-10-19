"use client";

// COPIADO, LITERAL, de seedgrid-report-client/src/components/UserSelectionChecklist.tsx.
// Sem alteracao nenhuma alem do "use client" (exigencia do App Router).

import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

export type SelectableUser = {
  publicId: string;
  name: string;
  email: string;
};

interface UserSelectionChecklistProps {
  /** Id unico do SgCheckboxGroup (varios podem coexistir na mesma pagina/dialog). */
  readonly id: string;
  readonly users: readonly SelectableUser[];
  /**
   * Usuarios sempre ativos, exibidos marcados e travados (nao dá pra desmarcar) — tipicamente o
   * responsavel pelo cadastro da empresa. Contam pro total de vagas do plano mas NAO entram na
   * validacao de {@code requiredCount}/{@code selected} (essa e' so' sobre os selecionaveis).
   */
  readonly lockedUsers?: readonly SelectableUser[];
  readonly requiredCount: number;
  readonly selected: readonly string[];
  readonly onChange: (selected: string[]) => void;
  /** Prefixo do titulo (ex.: "Selecionados", "Ficam ativos"). Default: "Selecionados". */
  readonly countLabel?: string;
  /** Mensagem quando a contagem nao bate. Default generico; cada tela pode customizar o texto. */
  readonly mismatchMessage?: string;
  /** Sufixo no label dos usuarios travados. Default: "sempre ativo". */
  readonly lockedHint?: string;
}

/**
 * Checklist reutilizavel de "escolher exatamente N usuarios" — usado em qualquer tela que
 * precise dessa selecao (downgrade entre planos pagos, checkout com menos vagas, reativar
 * usuario estourando o limite do plano, etc.). So' a lista + validacao de contagem; o texto de
 * contexto (por que a selecao e' necessaria, o que acontece com quem nao for selecionado) fica a
 * cargo de cada tela que usa este componente.
 */
export function UserSelectionChecklist({
  id,
  users,
  lockedUsers = [],
  requiredCount,
  selected,
  onChange,
  countLabel = "Selecionados",
  mismatchMessage,
  lockedHint = "sempre ativo",
}: UserSelectionChecklistProps) {
  const countMatches = selected.length === requiredCount;
  const lockedIds = lockedUsers.map((u) => u.publicId);
  const options: SgCheckboxGroupOption[] = [
    ...lockedUsers.map(
      (user): SgCheckboxGroupOption => ({
        label: `${user.name} (${user.email}) · ${lockedHint}`,
        value: user.publicId,
        disabled: true,
      }),
    ),
    ...users.map(
      (user): SgCheckboxGroupOption => ({
        label: `${user.name} (${user.email})`,
        value: user.publicId,
      }),
    ),
  ];
  // Os travados sempre entram marcados no `value` controlado (pra renderizar checked+disabled),
  // mas nunca fazem parte do `selected` que o pai controla/valida.
  const value = [...lockedIds, ...selected];

  return (
    <div className="flex flex-col gap-2">
      <SgCheckboxGroup
        id={id}
        title={`${countLabel}: ${selected.length}/${requiredCount}`}
        source={options}
        value={value}
        onChange={(next) => {
          const nextIds = next.map(String).filter((v) => !lockedIds.includes(v));
          onChange(nextIds);
        }}
      />
      {!countMatches ? (
        <p className="text-xs text-amber-700">
          {mismatchMessage ?? `Selecione exatamente ${requiredCount} usuário(s) para continuar.`}
        </p>
      ) : null}
    </div>
  );
}
