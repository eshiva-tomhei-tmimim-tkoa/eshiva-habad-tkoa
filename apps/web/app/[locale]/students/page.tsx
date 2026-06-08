import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, getContent, t, cstr, assetUrl } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StudentsView, type StudentCard, type Achievement } from '@/components/StudentsView';
import type { StudentDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function StudentsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('students');
  const [students, content] = await Promise.all([
    apiGet<StudentDto[]>('/students', []),
    getContent('students'),
  ]);

  const cards: StudentCard[] = students.map((s) => ({
    id: s.id,
    name: t(s.name, locale),
    quote: t(s.quote, locale),
    profession: s.courses.map((c) => t(c.title, locale)).join(' · '),
    teacher: s.teacher ? t(s.teacher.name, locale) : '',
    story: t(s.story, locale),
    duration: s.duration,
    photoUrl: assetUrl(s.photoUrl),
  }));

  const achievements: Achievement[] = [
    { n: cstr(content, 'students.ach.1.num', locale, '47'), t: tr('ach1T'), d: tr('ach1D') },
    { n: cstr(content, 'students.ach.2.num', locale, '12'), t: tr('ach2T'), d: tr('ach2D') },
    { n: cstr(content, 'students.ach.3.num', locale, '9'), t: tr('ach3T'), d: tr('ach3D') },
    { n: cstr(content, 'students.ach.4.num', locale, '100%'), t: tr('ach4T'), d: tr('ach4D') },
  ];

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {cards.length > 0 ? (
            <StudentsView
              students={cards}
              labels={{
                profession: tr('courses'),
                mentor: tr('mentor'),
                duration: tr('duration'),
                video: tr('video'),
                achievements: tr('achievements'),
              }}
              achievements={achievements}
            />
          ) : (
            <p className="section-desc">{tr('empty')}</p>
          )}
        </div>
      </section>
    </>
  );
}
