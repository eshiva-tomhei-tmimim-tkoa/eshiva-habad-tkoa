import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import type { DailyBlockDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function DailyPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('daily');
  const cat = await getTranslations('categories');
  const blocks = await apiGet<DailyBlockDto[]>('/daily', []);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="container-x" style={{ paddingBottom: 64, display: 'grid', gap: 12 }}>
        {blocks.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 20, padding: 18 }}
          >
            <div className="mono" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              {b.time}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.05rem' }}>{t(b.title, locale)}</h3>
                <span className="tag">{cat(b.category)}</span>
              </div>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: 4 }}>
                {t(b.description, locale)}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
