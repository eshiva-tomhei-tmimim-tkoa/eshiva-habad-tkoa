import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from './Logo';

export async function Footer() {
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');
  const study = await getTranslations('study');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-block">
            <div className="brand">
              <Logo />
              <div>
                <div className="brand-name">Ешива ХаБаД Ткоа</div>
                <div className="brand-sub">Yeshiva · Tkoa · IL</div>
              </div>
            </div>
            <p className="footer-blurb">{footer('about')}</p>
          </div>

          <div>
            <h4>{footer('sections')}</h4>
            <div className="footer-list">
              <Link href="/">{nav('home')}</Link>
              <Link href="/team">{nav('team')}</Link>
              <Link href="/students">{nav('students')}</Link>
              <Link href="/study">{nav('study')}</Link>
            </div>
          </div>

          <div>
            <h4>{footer('study')}</h4>
            <div className="footer-list">
              <Link href="/study/daily">{study('dailyTitle')}</Link>
              <Link href="/study/curriculum">{study('curriculumTitle')}</Link>
              <Link href="/study/schedule">{study('scheduleTitle')}</Link>
            </div>
          </div>

          <div>
            <h4>{footer('contacts')}</h4>
            <div className="footer-list">
              <span>Tkoa, Gush Etzion, Israel</span>
              <a href="tel:+972535520466">+972-53-552-0466</a>
              <a href="mailto:info@yeshiva-tkoa.org">info@yeshiva-tkoa.org</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Yeshiva Chabad Tkoa · 501(c)(3)</span>
          <span>Эрец Исроэль · Made with care</span>
        </div>
      </div>
    </footer>
  );
}
