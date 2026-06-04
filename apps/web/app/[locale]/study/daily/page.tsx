import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { DailyTimeline, type DailyItem } from '@/components/DailyTimeline';
import type { DailyBlockDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function DailyPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('daily');
  const cat = await getTranslations('categories');
  const blocks = await apiGet<DailyBlockDto[]>('/daily', []);

  const items: DailyItem[] = blocks.map((b) => ({
    id: b.id,
    time: b.time,
    title: t(b.title, locale),
    category: b.category,
    desc: t(b.description, locale),
  }));

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <DailyTimeline
            blocks={items}
            allLabel={tr('all')}
            categoryLabels={{
              prayer: cat('prayer'),
              study: cat('study'),
              meal: cat('meal'),
              spirit: cat('spirit'),
              personal: cat('personal'),
            }}
          />
        </div>
      </section>
    </>
  );
}
