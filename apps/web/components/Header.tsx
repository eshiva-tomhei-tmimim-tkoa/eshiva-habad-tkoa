'use client';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useUIStore } from '@/store/ui';
import { Logo } from './Logo';
import { Icon } from './Icons';

const LOCALE_LABELS: Record<string, string> = { ru: 'RU', he: 'HE', en: 'EN' };

export function Header() {
  const tr = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Глобальный UI-стейт (Zustand): тема и мобильное меню.
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const hydrateTheme = useUIStore((s) => s.hydrateTheme);
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUIStore((s) => s.setMobileNav);

  // Подтянуть сохранённую тему из localStorage после маунта (на сервере её нет).
  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const NAV = [
    { href: '/', label: tr('home') },
    { href: '/team', label: tr('team') },
    { href: '/students', label: tr('students') },
    { href: '/study', label: tr('study') },
    { href: '/contacts', label: tr('contacts') },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Ешива ХаБаД Ткоа">
            <Logo />
            <div>
              <div className="brand-name">Ешива ХаБаД Ткоа</div>
              <div className="brand-sub">Yeshiva · Tkoa · IL</div>
            </div>
          </Link>

          <nav className="nav">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${isActive(n.href) ? 'active' : ''}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="header-side">
            <div className="lang-switcher">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  className={`lang-btn ${l === locale ? 'active' : ''}`}
                  onClick={() => switchLocale(l)}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              {theme === 'light' ? <Icon.moon /> : <Icon.sun />}
            </button>

            <Link href="/donate" className="donate-btn">
              <Icon.heart />
              <span>{tr('support')}</span>
            </Link>

            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
            >
              <Icon.menu />
            </button>
          </div>
        </div>

        <div className="yechi-banner" dir="rtl" lang="he" aria-label="Yechi Adoneinu">
          <div className="container">
            <div className="yechi-inner">
              <span className="yechi-deco" aria-hidden>◆</span>
              <span className="yechi-text">יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד</span>
              <span className="yechi-deco" aria-hidden>◆</span>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-header">
            <div className="brand">
              <Logo />
              <div className="brand-name">ХаБаД Ткоа</div>
            </div>
            <button
              type="button"
              className="menu-toggle"
              style={{ display: 'inline-flex' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Закрыть"
            >
              <Icon.close />
            </button>
          </div>
          <div className="mobile-nav-list">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={isActive(n.href) ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/donate" onClick={() => setMobileOpen(false)}>
              {tr('support')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
