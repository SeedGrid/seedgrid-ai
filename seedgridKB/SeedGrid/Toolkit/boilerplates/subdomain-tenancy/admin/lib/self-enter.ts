// Contrato de self-enter (auto-cadastro de USUÁRIO) — espelho de `@seedgrid/fe-self-enter`.
// Enquanto o pacote não está publicado no npm, mantemos os tipos aqui para o app buildar.
// Assim que `@seedgrid/fe-self-enter` for publicado, basta trocar estes tipos por:
//   import type { ... } from "@seedgrid/fe-self-enter";
// (o contrato é idêntico, incluindo o campo `roles` no convite — Opção C).

export type EntryRequestOrigin = "INVITE" | "PUBLIC";

export type EntryRequestStatus =
  | "PENDING_EMAIL"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

/** POST /self-enter/invitations — cria convite (admin). */
export interface CreateEntryInvitation {
  email: string;
  name: string;
  /**
   * publicIds das roles que o convidado recebe ao ser aprovado (Opção C). Opcional:
   * vazio → a aprovação usa a default-role do backend; preenchido → sobrepõe a default-role.
   */
  roles?: string[];
}

// `type` (não `interface`) de propósito: linhas do SgDatatable precisam ser atribuíveis
// a Record<string, unknown>, o que interfaces (abertas) não satisfazem.
/** Pedido de self-enter pendente de aprovação (EntryRequestDTORes). */
export type EntryRequestResponse = {
  id: string;
  email: string;
  name: string;
  origin: EntryRequestOrigin;
  status: EntryRequestStatus;
  requestedAt: string;
  expiresAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  invitedBy: string | null;
  invitationAcceptedAt: string | null;
};

/** Convite pendente (EntryRequestDTORes com origin=INVITE). */
export type InvitationEntry = EntryRequestResponse;
