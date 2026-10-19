// Estado temporario do desafio de 2FA durante o login. O login grava aqui e a
// pagina /auth/2fa/verify le. Usa sessionStorage: vive so na aba e some ao
// fechar, adequado para um tempToken efemero.

export const TWO_FACTOR_PENDING_KEY = "sg_admin_pending_2fa";

export type PendingTwoFactor = {
  tempToken: string;
  method: string | null;
};

export function savePendingTwoFactor(pending: PendingTwoFactor): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(TWO_FACTOR_PENDING_KEY, JSON.stringify(pending));
}

export function readPendingTwoFactor(): PendingTwoFactor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.sessionStorage.getItem(TWO_FACTOR_PENDING_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PendingTwoFactor;
    return parsed.tempToken ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingTwoFactor(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(TWO_FACTOR_PENDING_KEY);
}
