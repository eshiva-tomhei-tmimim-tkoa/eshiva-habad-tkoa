import { apiGet, t, assetUrl } from '../lib/api';
import { Btn } from '../components/Btn';
import { ImgPlaceholder } from '../components/PageHeader';
import type { TeamMember, CampaignDto } from '../lib/dto';

export const dynamic = 'force-dynamic';

const PILLARS = [
  { title: 'Тора и хасидут', desc: 'Талмуд, алоха, хасидут и сихот Ребе с опытными наставниками.' },
  { title: 'Профессия', desc: 'Параллельно с учёбой — прикладные курсы и подготовка к работе.' },
  { title: 'Иврит и адаптация', desc: 'Язык и интеграция в жизнь Земли Израиля.' },
  { title: 'Опытные наставники', desc: 'Сочетание глубины Торы и практического опыта.' },
];

export default async function HomePage() {
  const team = await apiGet<TeamMember[]>('/team', []);
  const campaign = await apiGet<CampaignDto | null>('/campaign', null);
  const pct = campaign ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) : 0;

  return (
    <>
      {/* Hero */}
      <section className="container-x" style={{ paddingTop: 80, paddingBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Ешива Хабад Любавич · Ткоа</div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', maxWidth: 980 }}>
          Тора, профессия и Земля Израиля —{' '}
          <span style={{ color: 'var(--primary)' }}>в одном месте</span>
        </h1>
        <p style={{ color: 'var(--text-soft)', marginTop: 20, maxWidth: 640, fontSize: '1.15rem' }}>
          Универсальное учебное заведение для молодых людей из стран СНГ: учение Любавичского
          Ребе, профессия, иврит и адаптация под руководством опытных наставников.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <Btn href="/study" arrow>Учебный процесс</Btn>
          <Btn href="/donate" variant="secondary">Поддержать ешиву</Btn>
        </div>
      </section>

      {/* О Ребе */}
      <section className="container-x" style={{ paddingBlock: 32 }}>
        <div className="card" style={{ padding: 32, display: 'grid', gap: 12 }}>
          <div className="eyebrow">Идейная основа</div>
          <h2 style={{ fontSize: '1.8rem' }}>Учение Любавичского Ребе</h2>
          <p style={{ color: 'var(--text-soft)', maxWidth: 760 }}>
            В основе программы — учение Рабби Менахема Мендела Шнеерсона. Йехи Адонейну Морейну
            вэ-Рабейну Мелех ха-Мошиах ле-олам ва-эд.
          </p>
        </div>
      </section>

      {/* Миссия — 4 столпа */}
      <section className="container-x" style={{ paddingBlock: 48 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 24 }}>Четыре линии программы</h2>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {PILLARS.map((p, i) => (
            <div key={p.title} className="card" style={{ padding: 24 }}>
              <div className="mono" style={{ color: 'var(--primary)', marginBottom: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Превью команды */}
      {team.length > 0 && (
        <section className="container-x" style={{ paddingBlock: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '2rem' }}>Наши наставники</h2>
            <Btn href="/team" variant="ghost" arrow>Вся команда</Btn>
          </div>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              marginTop: 20,
            }}
          >
            {team.slice(0, 4).map((m) => (
              <div key={m.id} className="card" style={{ overflow: 'hidden' }}>
                <ImgPlaceholder
                  label={t(m.name)}
                  aspect="3/4"
                  src={assetUrl(m.photoUrl)}
                />
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: '1rem' }}>{t(m.name)}</h3>
                  <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                    {t(m.position.title)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Баннер пожертвований */}
      {campaign && (
        <section className="container-x" style={{ paddingBlock: 48 }}>
          <div className="card" style={{ padding: 32, background: 'var(--primary-soft)' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>{t(campaign.title)}</h2>
            <p style={{ color: 'var(--text-soft)', marginBottom: 16 }}>
              Собрано {campaign.raisedAmount.toLocaleString('ru-RU')} из{' '}
              {campaign.goalAmount.toLocaleString('ru-RU')} ₪ · {campaign.donorsCount} доноров
            </p>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: 'var(--bg-elev-2)',
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }} />
            </div>
            <Btn href="/donate" arrow>Поддержать</Btn>
          </div>
        </section>
      )}
    </>
  );
}
