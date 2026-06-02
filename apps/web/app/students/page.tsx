import { apiGet, t, assetUrl } from '../../lib/api';
import { PageHeader, ImgPlaceholder } from '../../components/PageHeader';
import type { StudentDto } from '../../lib/dto';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const students = await apiGet<StudentDto[]>('/students', []);
  return (
    <>
      <PageHeader
        eyebrow="Наши ученики"
        title="Истории тех, кто учится у нас"
        desc="Кто-то готовится к смихе, кто-то параллельно осваивает профессию. Объединяет одно — Тора и Земля Израиля."
      />
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
            <ImgPlaceholder label={t(s.name)} aspect="4/3" src={assetUrl(s.photoUrl)} />
            <div>
              <p style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
                «{t(s.quote)}»
              </p>
              <h3 style={{ fontSize: '1.2rem' }}>{t(s.name)}</h3>
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
                {s.teacher && <span>Наставник: {t(s.teacher.name)}</span>}
                <span>В ешиве: {s.duration}</span>
                {s.courses.length > 0 && (
                  <span>Курсы: {s.courses.map((c) => t(c.title)).join(', ')}</span>
                )}
              </div>
              <p style={{ color: 'var(--text-soft)' }}>{t(s.story)}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
