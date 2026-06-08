import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getOrganization, t, telHref } from '@/lib/api';
import { Logo } from './Logo';

export async function Footer() {
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');
  const study = await getTranslations('study');
  const locale = (await getLocale()) as 'ru' | 'he' | 'en';
  const org = await getOrganization();
  const brandName = t(org.brandName, locale);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-block">
            <div className="brand">
              <Logo />
              <div>
                <div className="brand-name">{brandName}</div>
                <div className="brand-sub">{org.brandSub}</div>
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
              <span>{t(org.address, locale)}</span>
              <a href={telHref(org.phoneMain)}>{org.phoneMain}</a>
              <a href={`mailto:${org.email}`}>{org.email}</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {org.brandName.en} · {org.legalStatus}</span>
          <span>{t(org.copyrightSuffix, locale)}</span>
        </div>
      </div>
    </footer>
  );
}
