/**
 * Конвертация сумм пожертвований в шекели (ILS).
 *
 * Курсы тянутся с бесплатного API (по умолчанию open.er-api.com, без ключа)
 * и кэшируются в памяти на сутки. При недоступности API используются
 * фиксированные курсы из .env (FX_FALLBACK_ILS). Конвертация — синхронная,
 * по текущему кэшу; обновление кэша запускается в фоне.
 *
 * Хранение в кэше: rates[X] = сколько единиц X за 1 ILS (формат open.er-api).
 * Перевод X → ILS: ils = amount / rates[X].
 */
const FX_API_URL = process.env.FX_API_URL ?? 'https://open.er-api.com/v6/latest/ILS';
const TTL_MS = Number(process.env.FX_TTL_MS ?? 24 * 60 * 60 * 1000);

interface RatesCache {
  perIls: Record<string, number>; // единиц валюты за 1 ILS
  fetchedAt: number;
}

/** Фиксированные курсы из .env: JSON «шекелей за 1 единицу валюты». */
function loadFallback(): Record<string, number> {
  const perIls: Record<string, number> = { ILS: 1 };
  const raw = process.env.FX_FALLBACK_ILS;
  if (raw) {
    try {
      const ilsPerUnit = JSON.parse(raw) as Record<string, number>;
      for (const [cur, ils] of Object.entries(ilsPerUnit)) {
        if (typeof ils === 'number' && ils > 0) perIls[cur.toUpperCase()] = 1 / ils;
      }
    } catch {
      console.warn('[fx] FX_FALLBACK_ILS не является корректным JSON — игнорирую');
    }
  }
  return perIls;
}

const cache: RatesCache = { perIls: loadFallback(), fetchedAt: 0 };
let inflight: Promise<void> | null = null;

/** Обновить кэш курсов, если он устарел. Безопасно дёргать часто (дедуп). */
export async function ensureRates(): Promise<void> {
  if (Date.now() - cache.fetchedAt < TTL_MS && Object.keys(cache.perIls).length > 1) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(FX_API_URL);
      const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
      if (json?.rates && (json.result === undefined || json.result === 'success')) {
        const perIls: Record<string, number> = { ILS: 1 };
        for (const [cur, rate] of Object.entries(json.rates)) {
          if (typeof rate === 'number' && rate > 0) perIls[cur.toUpperCase()] = rate;
        }
        // Сохраняем .env-фоллбэк для валют, которых нет в ответе API.
        cache.perIls = { ...loadFallback(), ...perIls };
        cache.fetchedAt = Date.now();
      }
    } catch (err) {
      console.warn('[fx] не удалось получить курсы, использую fallback:', (err as Error).message);
      // Оставляем текущий кэш/фоллбэк; помечаем время, чтобы не долбить API.
      if (cache.fetchedAt === 0) cache.fetchedAt = Date.now();
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Перевести сумму в шекели по текущему кэшу. Возвращает null, если валюта
 * неизвестна (нет курса) — вызывающий решает, что делать.
 */
export function convertToIls(amount: number, currency: string): number | null {
  const cur = (currency || 'ILS').toUpperCase();
  if (cur === 'ILS') return round2(amount);
  const rate = cache.perIls[cur];
  if (!rate || !(rate > 0)) return null;
  return round2(amount / rate);
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
