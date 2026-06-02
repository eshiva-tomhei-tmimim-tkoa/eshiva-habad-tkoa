import { apiGet, t } from '../../../lib/api';
import { PageHeader } from '../../../components/PageHeader';
import type { SubjectDto } from '../../../lib/dto';

export const dynamic = 'force-dynamic';

export default async function CurriculumPage() {
  const subjects = await apiGet<SubjectDto[]>('/subjects', []);
  return (
    <>
      <PageHeader
        eyebrow="Учебная программа"
        title="Пять дисциплин — единая система"
        desc="Каждый предмет ведёт опытный наставник. От простого текста — к комментариям ришоним и ахроним."
      />
      <section className="container-x" style={{ paddingBottom: 64, display: 'grid', gap: 20 }}>
        {subjects.map((s) => (
          <article key={s.id} className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span className="mono" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>
                {s.code}
              </span>
              <h3 style={{ fontSize: '1.4rem' }}>{t(s.title)}</h3>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{s.hours}</span>
              {s.leadPerson && (
                <span style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                  · {t(s.leadPerson.name)}
                </span>
              )}
            </div>
            {s.items.length > 0 && (
              <ul style={{ marginTop: 16, paddingLeft: 20, color: 'var(--text-soft)' }}>
                {s.items.map((it, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {t(it)}
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
