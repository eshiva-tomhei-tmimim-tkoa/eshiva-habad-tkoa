import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import '../globals.css';
import { manrope, alef, jetbrainsMono } from '@/lib/fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Ешива «ХаБаД Ткоа»',
  description:
    'Учебное заведение в посёлке Ткоа (Гуш-Эцион, Израиль): Тора и хасидут, профессия, иврит и адаптация.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Установить тему до отрисовки (без мигания).
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      data-theme="light"
      className={`${manrope.variable} ${alef.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="app-shell">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
