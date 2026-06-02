import { apiGet, t } from '../../../lib/api';
import { PageHeader } from '../../../components/PageHeader';
import { CATEGORY_LABELS, type DailyBlockDto } from '../../../lib/dto';

export const dynamic = 'force-dynamic';

export default async function DailyPage() {
  const blocks = await apiGet<DailyBlockDto[]>('/daily', []);
  return (
    <>
      <PageHeader
        eyebrow="Распорядок дня"
        title="Каждый день — структура, ритм и баланс"
        desc="Учёба, молитва, общая трапеза, спорт и личное время."
      />
      <section className="container-x" style={{ paddingBottom: 64, display: 'grid', gap: 12 }}>
        {blocks.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 20, padding: 18 }}
          >
            <div className="mono" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              {b.time}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.05rem' }}>{t(b.title)}</h3>
                <span className="tag">{CATEGORY_LABELS[b.category]}</span>
              </div>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: 4 }}>
                {t(b.description)}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
