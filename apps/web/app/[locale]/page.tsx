import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, getContent, getMedia, t, cstr, assetUrl } from '@/lib/api';
import { Btn } from '@/components/Btn';
import { ImgPlaceholder } from '@/components/PageHeader';
import { MediaBlock } from '@/components/MediaBlock';
import { Icon } from '@/components/Icons';
import { Link } from '@/i18n/navigation';
import type { TeamMember, CampaignDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300; // ISR: статика + ревалидация (мгновенная — по тегу из админки)

export default async function HomePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('home');
  const study = await getTranslations('study');

  const [team, campaign, content, media] = await Promise.all([
    apiGet<TeamMember[]>('/team', []),
    apiGet<CampaignDto | null>('/campaign', null),
    getContent('home'),
    getMedia(),
  ]);
  const pct = campaign ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) : 0;

  const pillars = [
    { title: tr('pillar1Title'), desc: tr('pillar1Desc') },
    { title: tr('pillar2Title'), desc: tr('pillar2Desc') },
    { title: tr('pillar3Title'), desc: tr('pillar3Desc') },
    { title: tr('pillar4Title'), desc: tr('pillar4Desc') },
  ];

  const stats = [
    { num: cstr(content, 'home.stat.1.num', locale, '47'), sup: cstr(content, 'home.stat.1.sup', locale, '+'), label: tr('stat1Label') },
    { num: cstr(content, 'home.stat.2.num', locale, '8'), sup: cstr(content, 'home.stat.2.sup', locale, ''), label: tr('stat2Label') },
    { num: cstr(content, 'home.stat.3.num', locale, '5'), sup: cstr(content, 'home.stat.3.sup', locale, ''), label: tr('stat3Label') },
    { num: cstr(content, 'home.stat.4.num', locale, '100'), sup: cstr(content, 'home.stat.4.sup', locale, '%'), label: tr('stat4Label') },
  ];

  const rebbeDate = cstr(content, 'home.rebbe.date', locale, '11 НИСАНА 5662 —');
  const rebbePlace = cstr(content, 'home.rebbe.place', locale, '770 Eastern Parkway');

  const studyLinks = [
    { href: '/study/daily', n: '01', title: study('dailyTitle') },
    { href: '/study/curriculum', n: '02', title: study('curriculumTitle') },
    { href: '/study/schedule', n: '03', title: study('scheduleTitle') },
  ];

  return (
    <div className="page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow fade-up">
                <span>{tr('eyebrow')}</span>
              </div>
              <h1 className="hero-title fade-up fade-up-1">
                {tr('titlePre')} <span className="accent">{tr('titleHighlight')}</span>
              </h1>
              <p className="hero-desc fade-up fade-up-2">{tr('lead')}</p>
              <div className="hero-cta fade-up fade-up-3">
                <Btn href="/enroll" icon={<Icon.arrow />}>
                  {tr('ctaEnroll')}
                </Btn>
                <Btn href="/study" variant="secondary" icon={<Icon.arrow />}>
                  {tr('ctaStudy')}
                </Btn>
                <Btn href="/donate" variant="ghost" icon={<Icon.heart />}>
                  {tr('ctaDonate')}
                </Btn>
              </div>
            </div>
            <div className="hero-media fade-up fade-up-4">
              <MediaBlock
                media={media}
                slug="home.hero"
                label={tr('heroMediaLabel')}
                aspect="4/5"
                meta={tr('heroVideoMeta')}
              >
                <div className="hero-media-overlay">
                  <button type="button" className="hero-play" aria-label="Видео">
                    <Icon.play />
                  </button>
                  <div className="hero-media-meta mono">{tr('heroVideoMeta')}</div>
                </div>
              </MediaBlock>
              <div className="hero-float-card">
                <div className="hero-float-l mono">{tr('heroFloatLabel')}</div>
                <div className="hero-float-v">{tr('heroFloatValue')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REBBE */}
      <section className="rebbe-section">
        <div className="container">
          <div className="rebbe-grid">
            <div className="rebbe-portrait-wrap">
              <div className="rebbe-portrait">
                {media['home.rebbe']?.url ? (
                  <MediaBlock media={media} slug="home.rebbe" label={tr('rebbeName')} aspect="4/5" />
                ) : (
                  <>
                <svg viewBox="0 0 400 500" className="rebbe-svg" aria-hidden>
                  <defs>
                    <linearGradient id="rb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-soft)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--bg-elev-2)" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="500" fill="url(#rb-bg)" />
                  <circle cx="200" cy="180" r="120" fill="var(--accent)" opacity="0.08" />
                  <path d="M 110 165 Q 110 110 200 105 Q 290 110 290 165 L 305 178 L 95 178 Z" fill="var(--text)" opacity="0.85" />
                  <ellipse cx="200" cy="178" rx="105" ry="10" fill="var(--text)" opacity="0.95" />
                  <ellipse cx="200" cy="225" rx="58" ry="62" fill="var(--text-soft)" opacity="0.35" />
                  <path d="M 142 250 Q 145 320 200 360 Q 255 320 258 250 Q 250 290 200 295 Q 150 290 142 250 Z" fill="var(--text)" opacity="0.75" />
                  <path d="M 80 380 Q 80 340 140 320 Q 200 340 260 320 Q 320 340 320 380 L 320 500 L 80 500 Z" fill="var(--text)" opacity="0.85" />
                </svg>
                <div className="rebbe-portrait-tag mono">{tr('rebbePortraitTag')}</div>
                  </>
                )}
              </div>
            </div>
            <div className="rebbe-content">
              <div className="section-eyebrow">{tr('rebbeEyebrow')}</div>
              <h2 className="rebbe-title">{tr('rebbeName')}</h2>
              <div className="rebbe-dates mono">{rebbeDate}</div>
              <p className="rebbe-quote">{tr('rebbeQuote')}</p>
              <p className="rebbe-text">{tr('rebbeText')}</p>
              <div className="rebbe-meta">
                <div className="rebbe-meta-item">
                  <div className="rebbe-meta-l mono">{rebbePlace}</div>
                  <div className="rebbe-meta-v">{tr('rebbePlaceValue')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mission">
        <div className="container">
          <div className="mission-grid">
            <div>
              <div className="section-eyebrow">{tr('missionEyebrow')}</div>
              <h2 className="section-title">{tr('missionTitle')}</h2>
            </div>
            <div className="mission-text">
              <p className="lead">{tr('missionP1')}</p>
              <p className="lead" style={{ marginTop: 16 }}>{tr('missionP2')}</p>
            </div>
          </div>

          <div className="mission-stats fade-up">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat-num">
                  {s.num}
                  {s.sup ? <sup>{s.sup}</sup> : null}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="pillars">
            {pillars.map((p, i) => (
              <div key={p.title} className={`pillar fade-up fade-up-${i + 1}`}>
                <div className="pillar-num mono">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="pillar-t">{p.title}</h3>
                <p className="pillar-d">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDY CTA */}
      <section className="study-cta">
        <div className="container">
          <div className="study-cta-inner">
            <div>
              <div className="section-eyebrow">{study('eyebrow')}</div>
              <h2 className="section-title" style={{ marginTop: 12 }}>{tr('studyCtaTitle')}</h2>
              <p className="section-desc" style={{ marginTop: 16 }}>{tr('studyCtaDesc')}</p>
            </div>
            <div className="study-cta-links">
              {studyLinks.map((l) => (
                <Link key={l.href} className="study-cta-link" href={l.href}>
                  <div>
                    <div className="study-cta-link-l mono">{l.n}</div>
                    <div className="study-cta-link-t">{l.title}</div>
                  </div>
                  <Icon.arrow />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM PREVIEW */}
      {team.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head-row">
              <div>
                <div className="section-eyebrow">{tr('mentorsTitle')}</div>
                <h2 className="section-title">{tr('mentorsSubtitle')}</h2>
              </div>
              <Btn href="/team" variant="ghost" icon={<Icon.arrow />}>{tr('allTeam')}</Btn>
            </div>
            <div className="team-preview-grid">
              {team.slice(0, 4).map((m, i) => (
                <Link key={m.id} className={`team-card fade-up fade-up-${i + 1}`} href="/team">
                  <div className="team-portrait">
                    <ImgPlaceholder
                      label={t(m.name, locale).split(' ')[0]}
                      aspect="3/4"
                      src={assetUrl(m.photoUrl)}
                    />
                  </div>
                  <div className="team-body">
                    <h3 className="team-name">{t(m.name, locale)}</h3>
                    <div className="team-role">{t(m.position.title, locale)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STUDENT QUOTE */}
      <section className="section">
        <div className="container-narrow">
          <div className="home-quote fade-up">
            <div className="home-quote-eyebrow mono">{tr('quoteEyebrow')}</div>
            <blockquote className="home-quote-text">{tr('quoteText')}</blockquote>
            <Btn href="/students" variant="ghost" icon={<Icon.arrow />}>{tr('quoteCta')}</Btn>
          </div>
        </div>
      </section>

      {/* DONATE BANNER */}
      {campaign && (
        <section className="section">
          <div className="container">
            <div className="donate-banner">
              <div className="donate-banner-content">
                <div
                  className="hero-eyebrow"
                  style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}
                >
                  <span>{tr('support')}</span>
                </div>
                <h2 className="section-title" style={{ marginTop: 16 }}>{tr('donateBannerTitle')}</h2>
                <p className="section-desc" style={{ marginTop: 16 }}>{tr('donateBannerDesc')}</p>
                <div className="hero-cta" style={{ marginTop: 28 }}>
                  <Btn href="/donate" icon={<Icon.heart />}>{tr('donateSupport')}</Btn>
                </div>
              </div>
              <div className="donate-banner-side">
                <div className="dbs-stat">
                  <div className="dbs-num">{pct}%</div>
                  <div className="dbs-l mono">{tr('ofGoal')}</div>
                </div>
                <div className="dbs-bar">
                  <div className="dbs-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="dbs-row">
                  <span>
                    <strong>{campaign.raisedAmount.toLocaleString('ru-RU')} ₪</strong> {tr('collected')}
                  </span>
                  <span className="mono">/ {campaign.goalAmount.toLocaleString('ru-RU')} ₪</span>
                </div>
                <div className="dbs-row" style={{ opacity: 0.7 }}>
                  <span>
                    {campaign.donorsCount} {tr('donors')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
