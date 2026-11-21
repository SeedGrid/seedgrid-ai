// Acao de cada tipo de notificacao do sino ao ser aberta (P186.F3.T1 / P180.F2.T15). O sino so conhece o registro
// (registerNotificationAction do @seedgrid/fe-components); quem decide o que abrir/baixar e o host, aqui.
// Regra de seguranca: o payload traz SO o id do recurso (nunca URL nem caminho); a rota vem deste modulo e quem
// confere permissao e dono do recurso e o BFF/backend na rota chamada. O item so e clicavel quando o backend marca
// actionable=true E o tipo esta registrado; sem isso ele continua informativo (o clique so marca como lida).

export type NotificationLike = {
  type: string;
  payload?: Record<string, unknown> | null;
};

export type NotificationHostConfig = {
  /** Rota do BFF que baixa o export; recebe o id: `<downloadBase>/<id>/download`. */
  downloadBase: string;
  /** Tela da lista de backups (para onde backup.failed leva). */
  listPath: string;
};

export type NotificationActionDeps = {
  fetchFn: (input: string, init?: { credentials?: "same-origin" | "include" }) => Promise<Response>;
  saveBlob: (blob: Blob, filename: string) => void;
  navigate: (path: string) => void;
};

type RegisterFn = (
  type: string,
  action: { label?: string; run: (notification: NotificationLike) => void | Promise<void> },
) => () => void;

export const BACKUP_NOTIFICATION_CONFIG: NotificationHostConfig = {
  downloadBase: "/api/admin/exports",
  listPath: "/exports/export_list",
};

// Id publico do recurso: so caracteres seguros de um segmento de caminho (uuid, ulid, slug).
const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;

export function exportIdFrom(notification: NotificationLike): string | null {
  const value = notification.payload?.exportPublicId;
  return typeof value === "string" && SAFE_ID.test(value) ? value : null;
}

export function exportDownloadUrl(config: NotificationHostConfig, notification: NotificationLike): string | null {
  const id = exportIdFrom(notification);
  return id ? `${config.downloadBase}/${encodeURIComponent(id)}/download` : null;
}

export function filenameFromDisposition(header: string | null, fallback: string): string {
  const match = header ? /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header) : null;
  if (!match) {
    return fallback;
  }
  try {
    return decodeURIComponent(match[1]).replace(/[\\/]/g, "_");
  } catch {
    return match[1].replace(/[\\/]/g, "_");
  }
}

/** Mensagem legivel para uma resposta de download que nao veio como arquivo (410, 403, HTML de login, erro). */
export async function readDownloadError(response: Response): Promise<string> {
  if (response.status === 410) {
    return "O arquivo deste backup expirou. Gere um novo backup.";
  }
  if (response.status === 401) {
    return "Sua sessão expirou. Entre novamente.";
  }
  if (response.status === 403) {
    return "Você não tem permissão para baixar este backup.";
  }
  if (response.status === 404) {
    return "Backup não encontrado.";
  }
  let detail = "";
  try {
    const type = response.headers.get("Content-Type") ?? "";
    if (type.includes("json")) {
      const body = (await response.json()) as { detail?: string; message?: string; title?: string };
      detail = body.detail || body.message || body.title || "";
    }
  } catch {
    detail = "";
  }
  return detail || `Não foi possível baixar o backup (erro ${response.status}).`;
}

/** Baixa o export da notificacao pelo BFF; confere a resposta ANTES de salvar e lanca mensagem legivel se falhar. */
export async function downloadExport(
  config: NotificationHostConfig,
  notification: NotificationLike,
  deps: Pick<NotificationActionDeps, "fetchFn" | "saveBlob">,
): Promise<void> {
  const url = exportDownloadUrl(config, notification);
  if (!url) {
    throw new Error("Esta notificação não tem um backup para baixar.");
  }
  const response = await deps.fetchFn(url, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(await readDownloadError(response));
  }
  const type = response.headers.get("Content-Type") ?? "";
  if (type.includes("text/html")) {
    // Sessao vencida devolve a pagina de login com 200: nao e o arquivo.
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  const id = exportIdFrom(notification) ?? "backup";
  const blob = await response.blob();
  deps.saveBlob(blob, filenameFromDisposition(response.headers.get("Content-Disposition"), `export-${id}.zip`));
}

/** Registra as acoes de backup no sino; devolve a funcao que desfaz o registro (use no cleanup do useEffect). */
export function registerBackupNotificationActions(
  register: RegisterFn,
  config: NotificationHostConfig,
  deps: NotificationActionDeps,
): () => void {
  const undo = [
    // backup.finished -> baixa o export pela mesma rota do botao "Baixar" da tela de backup.
    register("backup.finished", {
      label: "Baixar backup",
      run: (notification) => downloadExport(config, notification, deps),
    }),
    // backup.failed -> leva a tela de backup (la esta o motivo da falha).
    register("backup.failed", {
      label: "Ver backups",
      run: () => deps.navigate(config.listPath),
    }),
  ];
  return () => undo.forEach((fn) => fn());
}

/** Implementacao de navegador das dependencias (so roda no cliente, dentro do useEffect do Shell). */
export function browserNotificationDeps(navigate: (path: string) => void): NotificationActionDeps {
  return {
    fetchFn: (input, init) => fetch(input, init),
    navigate,
    saveBlob: (blob, filename) => {
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    },
  };
}
