import type { Localized } from '@yeshiva/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** Общий тег кэша для всех данных из API — инвалидируется при сохранении в админке. */
export const CONTENT_TAG = 'content';

/** Резервный интервал ISR (сек). On-demand ревалидация — через /api/revalidate. */
const REVALIDATE_SECONDS = Number(process.env.REVALIDATE_SECONDS ?? 3600);

/**
 * Серверный GET к API. Данные кэшируются (ISR) и помечаются тегом CONTENT_TAG;
 * при недоступности API возвращает fallback, чтобы страница рендерилась даже
 * без бэкенда (не валит сборку/SSR).
 */
export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { data?: T };
    return (json.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Текущая локаль (этап 5 — только ru; переключатель — этап 7). */
export const t = (v: Localized | undefined | null, locale: 'ru' | 'he' | 'en' = 'ru'): string =>
  v ? (v[locale] || v.ru) : '';

/** Базовый URL API без суффикса /api — для абсолютных ссылок на /uploads. */
export const assetUrl = (p: string | null | undefined): string | undefined =>
  p ? `${API_URL.replace(/\/api$/, '')}${p}` : undefined;
