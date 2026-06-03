import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from './Logo';

export async function Footer() {
  const tr = await getTranslations('footer');
  const nav = await getTranslations('nav');
  return (
    <footer style={{ borderTop: '1px solid var(--border-soft)', marginTop: 80 }}>
      <div
        className="container-x"
        style={{
          paddingBlock: 48,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <Logo />
          <p style={{ color: 'var(--text-soft)', marginTop: 12, fontSize: '0.9rem' }}>{tr('about')}</p>
        </div>
        <div style={{ display: 'grid', gap: 6, fontSize: '0.9rem' }}>
          <strong style={{ marginBottom: 4 }}>{tr('sections')}</strong>
          <Link href="/team" style={{ color: 'var(--text-soft)' }}>{nav('team')}</Link>
          <Link href="/students" style={{ color: 'var(--text-soft)' }}>{nav('students')}</Link>
          <Link href="/study" style={{ color: 'var(--text-soft)' }}>{tr('study')}</Link>
          <Link href="/donate" style={{ color: 'var(--text-soft)' }}>{tr('donate')}</Link>
        </div>
        <div style={{ display: 'grid', gap: 6, fontSize: '0.9rem' }}>
          <strong style={{ marginBottom: 4 }}>{tr('contacts')}</strong>
          <span style={{ color: 'var(--text-soft)' }}>Tkoa, Gush Etzion, Israel</span>
          <a href="tel:+972535520466" style={{ color: 'var(--text-soft)' }}>+972-53-552-0466</a>
          <a href="mailto:info@yeshiva-tkoa.org" style={{ color: 'var(--text-soft)' }}>
            info@yeshiva-tkoa.org
          </a>
        </div>
      </div>
      <div
        className="container-x"
        style={{ paddingBottom: 32, color: 'var(--text-dim)', fontSize: '0.8rem' }}
      >
        © {new Date().getFullYear()} Ешива «ХаБаД Ткоа» · 501(c)(3)
      </div>
    </footer>
  );
}
