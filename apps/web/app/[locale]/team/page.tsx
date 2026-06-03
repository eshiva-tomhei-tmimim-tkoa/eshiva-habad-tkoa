import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t, assetUrl } from '@/lib/api';
import { PageHeader, ImgPlaceholder } from '@/components/PageHeader';
import type { TeamMember } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('team');
  const team = await apiGet<TeamMember[]>('/team', []);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
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
              <ImgPlaceholder label={t(m.name, locale)} aspect="3/4" src={assetUrl(m.photoUrl)} />
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{t(m.name, locale)}</h3>
                <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: 12 }}>
                  {t(m.position.title, locale)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {m.subjects.map((s) => (
                    <span key={s.id} className="tag">
                      {t(s.title, locale)}
                    </span>
                  ))}
                </div>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{t(m.bio, locale)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
