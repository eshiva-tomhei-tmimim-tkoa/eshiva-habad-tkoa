import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StudySubnav } from '@/components/StudySubnav';
import { ScheduleView, type ScheduleRow } from '@/components/ScheduleView';
import { WEEKDAYS, type ScheduleSlotDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function SchedulePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('schedule');
  const slots = await apiGet<ScheduleSlotDto[]>('/schedule', []);

  const rows: ScheduleRow[] = slots.map((s) => ({
    id: s.id,
    days: s.days,
    start: s.startTime,
    end: s.endTime,
    subject: t(s.subject.title, locale),
    teacher: t(s.person.name, locale),
  }));

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <StudySubnav active="schedule" />
          <ScheduleView
            slots={rows}
            weekdays={WEEKDAYS}
            labels={{
              day: tr('day'),
              all: tr('all'),
              teacher: tr('teacher'),
              allTeachers: tr('allTeachers'),
              lessons: tr('lessons'),
              empty: tr('empty'),
            }}
          />
        </div>
      </section>
    </>
  );
}
