import { defineRouting } from 'next-intl/routing';

// ru — основной (без префикса), he/en — с префиксом.
export const routing = defineRouting({
  locales: ['ru', 'he', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
