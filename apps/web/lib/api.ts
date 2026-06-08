import type { Localized, Organization } from '@yeshiva/types';

// Клиентский URL API (доступен из браузера) — «зашивается» в бандл.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
// Серверный URL для SSR/ISR-фетча (внутренняя сеть Docker, напр. http://api:4000/api).
// Если не задан — используем публичный.
const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;

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
    const res = await fetch(`${SERVER_API_URL}${path}`, {
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

/**
 * Реквизиты ешивы — fallback при недоступности API. Совпадает с сидом миграции,
 * чтобы при потере связи с бэком web рендерился с теми же значениями, что и до
 * рефакторинга.
 */
export const ORG_FALLBACK: Organization = {
  brandName: { ru: 'Ешива ХаБаД Ткоа', he: 'ישיבת חב"ד תקוע', en: 'Yeshiva Chabad Tkoa' },
  brandSub: 'Yeshiva · Tkoa · IL',
  yechiText: 'יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד',
  address: {
    ru: 'Ткоа, Гуш-Эцион, Израиль',
    he: 'תקוע, גוש עציון, ישראל',
    en: 'Tkoa, Gush Etzion, Israel',
  },
  phoneMain: '+972-55-504-0828',
  phoneSecondary: '+972-53-552-0466',
  email: 'info@yeshiva-tkoa.org',
  mapLat: 31.6478,
  mapLng: 35.2148,
  hoursWeekday: '08:00 – 18:00',
  hoursFriday: { ru: 'до 14:00', he: 'עד 14:00', en: 'until 14:00' },
  hoursShabbat: { ru: 'выходной', he: 'שבת', en: 'closed' },
  legalStatus: '501(c)(3)',
  copyrightSuffix: {
    ru: 'Эрец Исроэль · Сделано с заботой',
    he: 'ארץ ישראל · נעשה באהבה',
    en: 'Eretz Israel · Made with care',
  },
  updatedAt: '1970-01-01T00:00:00.000Z',
};

export const getOrganization = (): Promise<Organization> =>
  apiGet<Organization>('/organization', ORG_FALLBACK);

/** Телефон → tel:-ссылка (убирает всё, кроме + и цифр). */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^+\d]/g, '')}`;

/** Тексты из SiteContent по группе страницы: { 'home.stat.1.num': { ru, he, en } }. */
export type ContentMap = Record<string, Localized>;

export const getContent = (group: string): Promise<ContentMap> =>
  apiGet<ContentMap>(`/content/${group}`, {});

/**
 * Достать строку из ContentMap с fallback. Если ключ отсутствует или пустой —
 * вернёт fallback. Это позволяет редактору в админке временно очистить значение
 * без падения сайта.
 */
export const cstr = (
  map: ContentMap,
  key: string,
  locale: 'ru' | 'he' | 'en',
  fallback: string,
): string => {
  const v = map[key];
  if (!v) return fallback;
  return v[locale] || v.ru || fallback;
};
