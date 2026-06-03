import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t, assetUrl } from '@/lib/api';
import { PageHeader, ImgPlaceholder } from '@/components/PageHeader';
import type { StudentDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function StudentsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('students');
  const students = await apiGet<StudentDto[]>('/students', []);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="container-x" style={{ paddingBottom: 64, display: 'grid', gap: 24 }}>
        {students.map((s) => (
          <article
            key={s.id}
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(220px, 320px) 1fr',
              gap: 24,
              padding: 24,
            }}
          >
            <ImgPlaceholder label={t(s.name, locale)} aspect="4/3" src={assetUrl(s.photoUrl)} />
            <div>
              <p style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
                «{t(s.quote, locale)}»
              </p>
              <h3 style={{ fontSize: '1.2rem' }}>{t(s.name, locale)}</h3>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  color: 'var(--text-soft)',
                  fontSize: '0.85rem',
                  marginBlock: 8,
                }}
              >
                {s.teacher && <span>{tr('mentor')}: {t(s.teacher.name, locale)}</span>}
                <span>{tr('duration')}: {s.duration}</span>
                {s.courses.length > 0 && (
                  <span>{tr('courses')}: {s.courses.map((c) => t(c.title, locale)).join(', ')}</span>
                )}
              </div>
              <p style={{ color: 'var(--text-soft)' }}>{t(s.story, locale)}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
