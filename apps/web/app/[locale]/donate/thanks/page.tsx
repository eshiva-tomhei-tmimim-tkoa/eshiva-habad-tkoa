import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { DonateThanks } from '@/components/DonateThanks';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

/**
 * Возврат донора после оплаты на Israel Toremet / IsraelGives.
 * Логика учёта/видимости — в клиентском DonateThanks (использует параметры
 * возврата: cid, sum, cur, fname, trid, donid).
 */
export default async function DonateThanksPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('donate');

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('thanksTitle')} desc={tr('thanksDesc')} />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <Suspense>
          <DonateThanks />
        </Suspense>
      </section>
    </>
  );
}
