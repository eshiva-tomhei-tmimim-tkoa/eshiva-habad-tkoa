import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t, assetUrl } from '@/lib/api';
import { Btn } from '@/components/Btn';
import { ImgPlaceholder } from '@/components/PageHeader';
import type { TeamMember, CampaignDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('home');

  const team = await apiGet<TeamMember[]>('/team', []);
  const campaign = await apiGet<CampaignDto | null>('/campaign', null);
  const pct = campaign ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) : 0;

  const pillars = [
    { title: tr('pillar1Title'), desc: tr('pillar1Desc') },
    { title: tr('pillar2Title'), desc: tr('pillar2Desc') },
    { title: tr('pillar3Title'), desc: tr('pillar3Desc') },
    { title: tr('pillar4Title'), desc: tr('pillar4Desc') },
  ];

  return (
    <>
      <section className="container-x" style={{ paddingTop: 80, paddingBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{tr('eyebrow')}</div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', maxWidth: 980 }}>
          {tr('titlePre')} <span style={{ color: 'var(--primary)' }}>{tr('titleHighlight')}</span>
        </h1>
        <p style={{ color: 'var(--text-soft)', marginTop: 20, maxWidth: 640, fontSize: '1.15rem' }}>
          {tr('lead')}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <Btn href="/study" arrow>{tr('ctaStudy')}</Btn>
          <Btn href="/donate" variant="secondary">{tr('ctaDonate')}</Btn>
        </div>
      </section>

      <section className="container-x" style={{ paddingBlock: 32 }}>
        <div className="card" style={{ padding: 32, display: 'grid', gap: 12 }}>
          <div className="eyebrow">{tr('rebbeEyebrow')}</div>
          <h2 style={{ fontSize: '1.8rem' }}>{tr('rebbeTitle')}</h2>
          <p style={{ color: 'var(--text-soft)', maxWidth: 760 }}>{tr('rebbeText')}</p>
        </div>
      </section>

      <section className="container-x" style={{ paddingBlock: 48 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 24 }}>{tr('pillarsTitle')}</h2>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {pillars.map((p, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="mono" style={{ color: 'var(--primary)', marginBottom: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {team.length > 0 && (
        <section className="container-x" style={{ paddingBlock: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '2rem' }}>{tr('mentorsTitle')}</h2>
            <Btn href="/team" variant="ghost" arrow>{tr('allTeam')}</Btn>
          </div>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              marginTop: 20,
            }}
          >
            {team.slice(0, 4).map((m) => (
              <div key={m.id} className="card" style={{ overflow: 'hidden' }}>
                <ImgPlaceholder label={t(m.name, locale)} aspect="3/4" src={assetUrl(m.photoUrl)} />
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: '1rem' }}>{t(m.name, locale)}</h3>
                  <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                    {t(m.position.title, locale)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {campaign && (
        <section className="container-x" style={{ paddingBlock: 48 }}>
          <div className="card" style={{ padding: 32, background: 'var(--primary-soft)' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>{t(campaign.title, locale)}</h2>
            <p style={{ color: 'var(--text-soft)', marginBottom: 16 }}>
              {tr('raised')} {campaign.raisedAmount.toLocaleString()} {tr('of')}{' '}
              {campaign.goalAmount.toLocaleString()} ₪ · {campaign.donorsCount} {tr('donors')}
            </p>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: 'var(--bg-elev-2)',
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }} />
            </div>
            <Btn href="/donate" arrow>{tr('support')}</Btn>
          </div>
        </section>
      )}
    </>
  );
}
