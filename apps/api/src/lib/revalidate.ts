/**
 * Уведомление публичного сайта (web) о смене контента → on-demand ISR.
 * Вызывается после успешных мутаций в админке. Ошибки не критичны:
 * сайт всё равно подтянет данные по таймеру (REVALIDATE_SECONDS).
 */
const WEB_REVALIDATE_URL = process.env.WEB_REVALIDATE_URL; // напр. http://web:3000/api/revalidate
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function triggerRevalidate(): Promise<void> {
  if (!WEB_REVALIDATE_URL || !REVALIDATE_SECRET) return; // не настроено — пропускаем
  try {
    await fetch(WEB_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'x-revalidate-secret': REVALIDATE_SECRET },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[api] revalidate failed:', (err as Error).message);
  }
}
