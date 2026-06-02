import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { manrope, alef, jetbrainsMono } from '../lib/fonts';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'Ешива «ХаБаД Ткоа»',
  description:
    'Учебное заведение в посёлке Ткоа (Гуш-Эцион, Израиль): Тора и хасидут, профессия, иврит и адаптация, опытные наставники.',
};

// Установить тему до отрисовки, чтобы избежать мигания.
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      data-theme="light"
      className={`${manrope.variable} ${alef.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
