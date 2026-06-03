import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { WEEKDAYS, type ScheduleSlotDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function SchedulePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('schedule');
  const slots = await apiGet<ScheduleSlotDto[]>('/schedule', []);

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {slots.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 140px 120px',
                gap: 16,
                padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 600 }}>{t(s.subject.title, locale)}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                {t(s.person.name, locale)}
              </div>
              <div className="mono" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                {s.startTime}–{s.endTime}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {s.days.map((d) => (
                  <span key={d} className="tag" style={{ padding: '2px 7px' }}>
                    {WEEKDAYS[d]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
