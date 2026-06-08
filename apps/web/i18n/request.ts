import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { routing, type AppLocale } from './routing';
import { getContent } from '../lib/api';

/**
 * Применяет переопределения из БД поверх плоских/вложенных дефолтов.
 *
 * Override хранится в `site_content` под `page_group='i18n'` с ключами вида
 * `home.eyebrow`. Здесь мы раскрываем точечный путь обратно в дерево, чтобы
 * `next-intl` нашёл значение по тем же ключам, что и без БД.
 */
function applyOverrides(
  messages: Record<string, unknown>,
  flat: Record<string, string>,
): Record<string, unknown> {
  for (const [path, value] of Object.entries(flat)) {
    if (!value) continue;
    const parts = path.split('.');
    const last = parts.pop();
    if (!last) continue;
    let cur: Record<string, unknown> = messages;
    for (const p of parts) {
      const next = cur[p];
      if (typeof next !== 'object' || next === null) {
        cur[p] = {};
      }
      cur = cur[p] as Record<string, unknown>;
    }
    cur[last] = value;
  }
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = routing.locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : routing.defaultLocale;

  const defaults = (await import(`../messages/${locale}.json`)).default as Record<string, unknown>;
  const overrides = await getContent('i18n');

  const flat: Record<string, string> = {};
  for (const [key, loc] of Object.entries(overrides)) {
    const v = loc[locale];
    if (v) flat[key] = v;
  }

  return {
    locale,
    messages: applyOverrides(defaults, flat) as AbstractIntlMessages,
  };
});
