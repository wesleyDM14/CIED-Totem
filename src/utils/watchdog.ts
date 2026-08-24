/**
 * Watchdogs de operação 24/7 sem supervisão.
 *
 * O totem roda numa Raspberry Pi numa clínica, sem ninguém para reiniciar o
 * equipamento fisicamente se algo travar (memory leak lento, chunk antigo em
 * cache depois de um deploy, estado inconsistente etc). Estas duas rotinas
 * cobrem os cenários mais prováveis de "totem travado por dias":
 *
 * 1. Um recarregamento diário preventivo, de madrugada (baixo movimento),
 *    para limpar qualquer estado acumulado (memória, listeners, sockets).
 * 2. Um listener global para erros de carregamento de chunk dinâmico —
 *    comum quando a aba fica aberta por dias e um novo deploy invalida os
 *    arquivos JS antigos que o navegador tinha em cache.
 */

const DAILY_RELOAD_START_HOUR = 3;
const DAILY_RELOAD_END_HOUR = 4;
const DAILY_RELOAD_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Verifica a cada minuto se o horário local está dentro da janela de baixo
 * movimento (3h-4h) e, em caso positivo, recarrega a página uma única vez
 * por dia.
 */
export const startDailyReloadWatchdog = (): void => {
    let lastReloadDay: number | null = null;

    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        const today = now.getDate();

        const withinWindow = hour >= DAILY_RELOAD_START_HOUR && hour < DAILY_RELOAD_END_HOUR;

        if (withinWindow && lastReloadDay !== today) {
            lastReloadDay = today;
            window.location.reload();
        }
    }, DAILY_RELOAD_CHECK_INTERVAL_MS);
};

const CHUNK_LOAD_ERROR_PATTERN =
    /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script/i;

const isChunkLoadErrorMessage = (message: unknown): boolean => {
    return typeof message === "string" && CHUNK_LOAD_ERROR_PATTERN.test(message);
};

/**
 * Registra listeners globais que detectam falhas de carregamento de chunk
 * (import() dinâmico apontando para um arquivo que não existe mais no
 * servidor após um novo deploy) e forçam um reload da página, já que não há
 * como recuperar dessa falha em runtime.
 */
export const startChunkLoadErrorWatchdog = (): void => {
    window.addEventListener("error", (event: ErrorEvent) => {
        if (isChunkLoadErrorMessage(event.message)) {
            window.location.reload();
        }
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
        const reason = event.reason as { message?: unknown } | string | undefined;
        const message = typeof reason === "string" ? reason : reason?.message;
        if (isChunkLoadErrorMessage(message)) {
            window.location.reload();
        }
    });
};
