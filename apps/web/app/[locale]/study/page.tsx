import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { Btn } from '@/components/Btn';
import type { AppLocale } from '@/i18n/routing';

export default async function StudyHubPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('study');

  const links = [
    { href: '/study/daily', title: tr('dailyTitle'), desc: tr('dailyDesc') },
    { href: '/study/curriculum', title: tr('curriculumTitle'), desc: tr('curriculumDesc') },
    { href: '/study/schedule', title: tr('scheduleTitle'), desc: tr('scheduleDesc') },
  ];

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {links.map((l) => (
            <div key={l.href} className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{l.title}</h3>
              <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>{l.desc}</p>
              <Btn href={l.href} variant="ghost" arrow>
                {tr('open')}
              </Btn>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
