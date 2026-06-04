import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { CurriculumView, type SubjectCard } from '@/components/CurriculumView';
import type { SubjectDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('curriculum');
  const subjects = await apiGet<SubjectDto[]>('/subjects', []);

  const cards: SubjectCard[] = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    title: t(s.title, locale),
    teacher: s.leadPerson ? t(s.leadPerson.name, locale) : '',
    hours: s.hours,
    color: s.color,
    items: s.items.map((it) => t(it, locale)),
  }));

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {cards.length > 0 ? (
            <CurriculumView
              subjects={cards}
              contentLabel={tr('content')}
              scheduleCta={tr('seeSchedule')}
            />
          ) : (
            <p className="section-desc">{tr('empty')}</p>
          )}
        </div>
      </section>
    </>
  );
}
