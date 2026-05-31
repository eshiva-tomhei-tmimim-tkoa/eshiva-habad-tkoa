import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ешива «ХаБаД Ткоа»',
  description: 'Сайт Ешивы Хабад Любавич Ткоа',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
