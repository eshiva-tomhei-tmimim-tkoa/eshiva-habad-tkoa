import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { DonateForm } from '@/components/DonateForm';
import type { CampaignDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function DonatePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('donate');
  const campaign = await apiGet<CampaignDto | null>('/campaign', null);
  const pct = campaign ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow={tr('eyebrow')}
        title={campaign ? t(campaign.title, locale) : tr('titleFallback')}
        desc={tr('desc')}
      />
      <section
        className="container-x"
        style={{
          paddingBottom: 64,
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
          {campaign && (
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                  {campaign.raisedAmount.toLocaleString()} ₪
                </span>
                <span style={{ color: 'var(--text-soft)' }}>
                  {tr('of')} {campaign.goalAmount.toLocaleString()} ₪
                </span>
              </div>
              <div
                style={{
                  height: 12,
                  borderRadius: 999,
                  background: 'var(--bg-elev-2)',
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                {pct}% · {campaign.donorsCount} {tr('donors')}
              </div>
            </div>
          )}
          {campaign && campaign.donors.length > 0 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 16 }}>{tr('recentDonors')}</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {campaign.donors.map((d) => (
                  <div
                    key={d.id}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}
                  >
                    <span>{d.name}</span>
                    <span className="mono" style={{ color: 'var(--primary)' }}>
                      {d.amount.toLocaleString()} ₪
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {campaign && <DonateForm campaignId={campaign.id} />}
      </section>
    </>
  );
}
