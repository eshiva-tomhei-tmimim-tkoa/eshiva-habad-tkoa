import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { Btn } from '@/components/Btn';
import { Icon } from '@/components/Icons';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export default async function StudyHubPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('study');

  const cards = [
    { href: '/study/daily', tag: '01', title: tr('dailyTitle'), desc: tr('dailyDesc'), meta: tr('dailyMeta') },
    { href: '/study/curriculum', tag: '02', title: tr('curriculumTitle'), desc: tr('curriculumDesc'), meta: tr('curriculumMeta') },
    { href: '/study/schedule', tag: '03', title: tr('scheduleTitle'), desc: tr('scheduleDesc'), meta: tr('scheduleMeta') },
  ];

  const principles = [
    { n: '01', t: tr('principle1T'), d: tr('principle1D') },
    { n: '02', t: tr('principle2T'), d: tr('principle2D') },
    { n: '03', t: tr('principle3T'), d: tr('principle3D') },
    { n: '04', t: tr('principle4T'), d: tr('principle4D') },
  ];

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="hub-grid">
            {cards.map((c, i) => (
              <Link key={c.href} className={`hub-card card card-link fade-up fade-up-${i + 1}`} href={c.href}>
                <div className="hub-card-tag mono">{c.tag} / 03</div>
                <h3 className="hub-card-title">{c.title}</h3>
                <p className="hub-card-desc">{c.desc}</p>
                <div className="hub-card-foot">
                  <span className="hub-card-meta mono">{c.meta}</span>
                  <span className="hub-card-arrow"><Icon.arrow /></span>
                </div>
              </Link>
            ))}
          </div>

          <div className="principles">
            <div className="principles-head">
              <div className="section-eyebrow">{tr('principlesEyebrow')}</div>
              <h2 className="section-title">{tr('principlesTitle')}</h2>
            </div>
            <div className="principles-grid">
              {principles.map((p, i) => (
                <div key={p.n} className={`principle fade-up fade-up-${i + 1}`}>
                  <div className="principle-num mono">{p.n}</div>
                  <h4 className="principle-t">{p.t}</h4>
                  <p className="principle-d">{p.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="study-enroll fade-up">
            <div>
              <h2 className="section-title">{tr('enrollCtaTitle')}</h2>
              <p className="section-desc" style={{ marginTop: 12 }}>{tr('enrollCtaDesc')}</p>
            </div>
            <Btn href="/enroll" icon={<Icon.arrow />}>{tr('enrollCta')}</Btn>
          </div>
        </div>
      </section>
    </>
  );
}
