import { apiGet, t, assetUrl } from '../../lib/api';
import { PageHeader, ImgPlaceholder } from '../../components/PageHeader';
import type { TeamMember } from '../../lib/dto';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const team = await apiGet<TeamMember[]>('/team', []);
  return (
    <>
      <PageHeader
        eyebrow="Наша команда"
        title="Опытные наставники с большим опытом жизни в Земле Израиля"
        desc="Каждый преподаватель сочетает академическую глубину Торы с практическим опытом жизни в Израиле и работы в светской профессии."
      />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          }}
        >
          {team.map((m) => (
            <article key={m.id} className="card" style={{ overflow: 'hidden' }}>
              <ImgPlaceholder label={t(m.name)} aspect="3/4" src={assetUrl(m.photoUrl)} />
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{t(m.name)}</h3>
                <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: 12 }}>
                  {t(m.position.title)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {m.subjects.map((s) => (
                    <span key={s.id} className="tag">
                      {t(s.title)}
                    </span>
                  ))}
                </div>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{t(m.bio)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
