import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { DonateForm } from '@/components/DonateForm';
import type { CampaignDto } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function DonatePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('donate');
  const campaign = await apiGet<CampaignDto | null>('/campaign', null);
  const pct = campaign ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) : 0;
  const avg =
    campaign && campaign.donorsCount > 0
      ? Math.round(campaign.raisedAmount / campaign.donorsCount)
      : 0;
  const barPct = Math.min(Math.max(pct, 0), 100);
  const numberLocale = locale === 'he' ? 'he-IL' : locale === 'en' ? 'en-US' : 'ru-RU';
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  const fmtCurrency = (amount: number, currency: string) => {
    const cur = (currency || 'ILS').toUpperCase();
    try {
      return new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency: cur,
        currencyDisplay: 'symbol',
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${fmt(amount)} ${cur}`;
    }
  };
  const dateFmt = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : locale === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <PageHeader
        eyebrow={tr('eyebrow')}
        title={campaign ? t(campaign.title, locale) : tr('titleFallback')}
        desc={tr('desc')}
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          {campaign && (
            <div className="donate-progress fade-up">
              <div className="dp-header">
                <div>
                  <div className="dp-eyebrow mono">{tr('campaignLabel')}</div>
                  <h2 className="dp-title">{tr('campaignGoal')}</h2>
                </div>
              </div>

              <div className="dp-bars">
                <div className="dp-stat">
                  <div className="dp-stat-l mono">{tr('collected')}</div>
                  <div className="dp-stat-v">{fmt(campaign.raisedAmount)} ₪</div>
                </div>
                <div className="dp-stat dp-stat-right">
                  <div className="dp-stat-l mono">{tr('goal')}</div>
                  <div className="dp-stat-v dp-stat-goal">{fmt(campaign.goalAmount)} ₪</div>
                </div>
              </div>

              <div className="dp-bar-track">
                <div className="dp-bar-fill" style={{ width: `${barPct}%` }} />
              </div>

              <div className="dp-progress-foot">
                <span className="dp-progress-label mono">{tr('ofGoal')}</span>
                <strong className="dp-bar-pct mono">{pct}%</strong>
              </div>

              <div className="dp-meta">
                <span>
                  <strong>{campaign.donorsCount}</strong> {tr('donors')}
                </span>
                {avg > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {tr('average')} — <strong>{fmt(avg)} ₪</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {campaign && <DonateForm campaignId={campaign.id} />}

          {campaign && campaign.donors.length > 0 && (
            <div className="donors-block fade-up fade-up-2">
              <div className="donors-head">
                <h3>{tr('recentDonors')}</h3>
                <span className="mono">
                  {campaign.donorsCount} {tr('donors')}
                </span>
              </div>
              <div className="donors-list">
                {campaign.donors.map((d) => (
                  <div key={d.id} className="donor">
                    <div className="donor-avatar">{initials(d.name)}</div>
                    <div className="donor-info">
                      <div className="donor-name">{d.name}</div>
                      <div className="donor-date mono">{dateFmt.format(new Date(d.donatedAt))}</div>
                    </div>
                    <div className="donor-amt mono">{fmtCurrency(d.amount, d.currency)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
