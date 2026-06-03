import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import type { SubjectDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('curriculum');
  const subjects = await apiGet<SubjectDto[]>('/subjects', []);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="container-x" style={{ paddingBottom: 64, display: 'grid', gap: 20 }}>
        {subjects.map((s) => (
          <article key={s.id} className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span className="mono" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>
                {s.code}
              </span>
              <h3 style={{ fontSize: '1.4rem' }}>{t(s.title, locale)}</h3>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{s.hours}</span>
              {s.leadPerson && (
                <span style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                  · {t(s.leadPerson.name, locale)}
                </span>
              )}
            </div>
            {s.items.length > 0 && (
              <ul style={{ marginTop: 16, paddingInlineStart: 20, color: 'var(--text-soft)' }}>
                {s.items.map((it, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {t(it, locale)}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
