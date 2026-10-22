// Contrato REST do login social (modulo opcional `seedgrid-security-social` + `/me/identities` do security).
//
// Mesma convencao do `login-tenancy-paths.ts`: front e back falam o MESMO contrato. Mudou um path no
// backend? Atualize aqui tambem. O navegador NUNCA chama estes paths direto: passa pelo BFF
// (`app/api/auth/social/**` e `app/api/me/identities/**`).

const seg = (value: string): string => encodeURIComponent(value);

export const SocialPaths = {
  /** GET: inicia o fluxo no provedor e, ao final, volta ao `returnTo` com `ticket` ou `status`. */
  login: (provider: string) => `/public/auth/social/${seg(provider)}/login`,
  /** POST {ticket}: troca o ticket de uso unico pelo mesmo AuthResponse do login por senha. */
  exchange: "/public/auth/social/exchange",
  /** POST {pendingToken, email}: provedor sem e-mail (Facebook); envia a confirmacao (SocialLoginResponseDTO). */
  email: "/public/social/email",
  /** POST {pendingToken, code}: confirma o e-mail com o codigo de 6 digitos enviado a ele; com sucesso devolve AUTHENTICATED + auth (SocialLoginResponseDTO). */
  emailConfirm: "/public/social/confirm-email",
  /** GET (lista) e DELETE (desvincular) dos metodos de entrada do usuario logado. */
  identities: "/me/identities",
  identity: (publicId: string) => `/me/identities/${seg(publicId)}`,
} as const;
