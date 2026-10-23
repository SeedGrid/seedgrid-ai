// Vinculos do usuario com empresas no cadastro (T5.7, plano 4.6/4.14). PURO: a tela de usuario
// mantem uma lista de rascunhos (empresa + perfis do vinculo) e este modulo a transforma no
// `memberships: [{ companyPublicId, rolePublicIds }]` que a API aceita. Tudo por `publicId`.
//
// Regras do contrato (o servidor valida; aqui so se evita enviar o que ele recusaria):
//  - as empresas do novo usuario sao um SUBCONJUNTO das do cadastrador: a tela so oferece as do
//    chamador (`GET /me/companies`) e este modulo descarta qualquer outra;
//  - lista vazia = so as roles globais (`rolePublicIds` do proprio usuario);
//  - `isRoot` nao faz parte da API (root nao e atribuivel).
import type { MyCompany } from "./my-companies";

export type MembershipDraft = {
  companyPublicId: string;
  rolePublicIds: string[];
  /** Nome da empresa, quando a leitura (`UserDTORes.memberships[].companyName`) o traz. So' exibicao. */
  companyName?: string;
};

/** Item de `memberships` no corpo do cadastro/edicao. */
export type MembershipEntry = { companyPublicId: string; rolePublicIds: string[] };

function uniqueStrings(values: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (typeof value === "string" && value.trim() && !out.includes(value)) {
      out.push(value);
    }
  }
  return out;
}

/**
 * ISOLAMENTO DO CONTRATO DE LEITURA (T5.13). `UserDTORes.memberships` chega como
 * `[{ companyPublicId, companyName, roles: [{ publicId, name }] }]`; se o contrato final diferir
 * (ex.: `rolePublicIds`, `company: { publicId }`), o ajuste e' SO' aqui - o resto da tela le
 * `MembershipDraft`. Aceita tambem o formato de escrita (`rolePublicIds`).
 * Le `memberships` de uma resposta (quando o backend a devolve). Nunca lanca; invalido = [].
 */
export function parseMemberships(raw: unknown): MembershipDraft[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const drafts: MembershipDraft[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const entry = item as { companyPublicId?: unknown; rolePublicIds?: unknown; roles?: unknown };
    if (typeof entry.companyPublicId !== "string" || !entry.companyPublicId.trim()) continue;
    if (drafts.some((d) => d.companyPublicId === entry.companyPublicId)) continue;
    // Aceita `rolePublicIds` (contrato) ou `roles: [{ publicId }]` (formato de leitura).
    const fromRoles = Array.isArray(entry.roles)
      ? entry.roles.map((r) =>
          typeof r === "object" && r !== null ? (r as { publicId?: unknown }).publicId : r,
        )
      : [];
    const rolePublicIds = uniqueStrings(
      Array.isArray(entry.rolePublicIds) ? entry.rolePublicIds : fromRoles,
    );
    const draft: MembershipDraft = { companyPublicId: entry.companyPublicId, rolePublicIds };
    const companyName = (item as { companyName?: unknown }).companyName;
    if (typeof companyName === "string" && companyName.trim()) draft.companyName = companyName.trim();
    drafts.push(draft);
  }
  return drafts;
}

/**
 * Vinculos que o editor de usuario mostra ao EDITAR. `known` = o backend devolveu `memberships` no
 * usuario (T5.12); sem isso (backend antigo) o editor comeca vazio e NAO envia `memberships` no
 * salvar, para nao parecer que os vinculos foram removidos nem sobrescrever o que nao foi lido.
 */
export function editorMemberships(userMemberships: readonly MembershipDraft[] | null | undefined): {
  memberships: MembershipDraft[];
  known: boolean;
} {
  return userMemberships == null
    ? { memberships: [], known: false }
    : { memberships: [...userMemberships], known: true };
}

/** Rotulo do vinculo: nome da lista do chamador, senao o nome vindo do usuario, senao o publicId. */
export function membershipCompanyLabel(
  draft: MembershipDraft,
  mine: readonly MyCompany[],
): string {
  return (
    mine.find((c) => c.publicId === draft.companyPublicId)?.name ??
    draft.companyName ??
    draft.companyPublicId
  );
}

/**
 * Define quais empresas estao marcadas. Empresa nova nasce sem perfis proprios (so as globais);
 * empresa que continua marcada mantem os perfis ja escolhidos; a desmarcada some.
 */
export function setMembershipCompanies(
  drafts: readonly MembershipDraft[],
  companyPublicIds: readonly string[],
): MembershipDraft[] {
  const wanted = uniqueStrings(companyPublicIds);
  return wanted.map(
    (id) =>
      drafts.find((d) => d.companyPublicId === id) ?? { companyPublicId: id, rolePublicIds: [] },
  );
}

/** Troca os perfis do vinculo de UMA empresa (as demais ficam como estao). */
export function setMembershipRoles(
  drafts: readonly MembershipDraft[],
  companyPublicId: string,
  rolePublicIds: readonly string[],
): MembershipDraft[] {
  return drafts.map((d) =>
    d.companyPublicId === companyPublicId
      ? { ...d, rolePublicIds: uniqueStrings(rolePublicIds) }
      : d,
  );
}

/**
 * Empresas que a tela oferece: as do chamador, menos as DESATIVADAS (nao se vincula usuario a
 * empresa desligada). Somente leitura continua oferecida (o vinculo existe; a escrita e que o
 * servidor recusa).
 */
export function offerableCompanies(mine: readonly MyCompany[]): MyCompany[] {
  return mine.filter((c) => c.accessMode !== "DISABLED");
}

/**
 * Corpo `memberships`: so empresas permitidas (as do chamador), sem repeticao, perfis sem repeticao
 * e so os que existem em `knownRolePublicIds` (quando informado; evita mandar perfil de integracao
 * ou removido). Ordem estavel = a da tela.
 */
export function toMembershipsPayload(
  drafts: readonly MembershipDraft[],
  allowedCompanyPublicIds: readonly string[],
  knownRolePublicIds?: readonly string[],
): MembershipEntry[] {
  const allowed = new Set(allowedCompanyPublicIds);
  const known = knownRolePublicIds ? new Set(knownRolePublicIds) : null;
  const out: MembershipEntry[] = [];
  for (const draft of drafts) {
    if (!allowed.has(draft.companyPublicId)) continue;
    if (out.some((e) => e.companyPublicId === draft.companyPublicId)) continue;
    const roles = uniqueStrings(draft.rolePublicIds).filter((id) => (known ? known.has(id) : true));
    out.push({ companyPublicId: draft.companyPublicId, rolePublicIds: roles });
  }
  return out;
}
