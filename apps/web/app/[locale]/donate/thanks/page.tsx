import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

/**
 * Возврат донора после оплаты на Israel Toremet / IsraelGives.
 * IsraelGives подставляет в successurl данные платежа:
 * sum, cur, fname, lname, freq, trid (id транзакции), donid (id пожертвования).
 */
export default async function DonateThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tr = await getTranslations('donate');

  const one = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;
  const sum = one(sp.sum);
  const cur = one(sp.cur);
  const trid = one(sp.trid);
  const name = one(sp.fname);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('thanksTitle')} desc={tr('thanksDesc')} />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <div className="card" style={{ padding: 28, maxWidth: 520 }}>
          {name && (
            <p style={{ marginBottom: 12 }}>
              {tr('thanksHi')}, <strong>{name}</strong>!
            </p>
          )}
          {sum && (
            <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>
              {sum} {cur ?? ''}
            </div>
          )}
          {trid && (
            <div className="mono" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
              {tr('thanksRef')}: {trid}
            </div>
          )}
          <p style={{ color: 'var(--text-soft)', marginTop: 16 }}>{tr('thanksReceipt')}</p>
          <Link
            href={`/${locale}`}
            className="btn btn-primary"
            style={{ marginTop: 20, display: 'inline-flex' }}
          >
            {tr('thanksHome')}
          </Link>
        </div>
      </section>
    </>
  );
}
