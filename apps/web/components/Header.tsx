'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Logo } from './Logo';

const LOCALE_LABELS: Record<string, string> = { ru: 'RU', he: 'HE', en: 'EN' };

export function Header() {
  const tr = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'light');
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

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

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div
        className="container-x"
        style={{ display: 'flex', alignItems: 'center', gap: 16, height: 68 }}
      >
        <Link href="/" style={{ marginInlineEnd: 'auto' }}>
          <Logo />
        </Link>
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: active ? 'var(--primary)' : 'var(--text-soft)',
                  background: active ? 'var(--primary-soft)' : 'transparent',
                }}
              >
                {n.label}
              </Link>
            );
          })}
          <Link
            href="/donate"
            className="btn btn-primary"
            style={{ marginInlineStart: 8, padding: '8px 18px' }}
          >
            {tr('support')}
          </Link>

          {/* Переключатель языка */}
          <div style={{ display: 'flex', gap: 2, marginInlineStart: 8 }}>
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                style={{
                  padding: '6px 9px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: l === locale ? 'var(--primary)' : 'var(--bg-elev)',
                  color: l === locale ? '#fff' : 'var(--text-soft)',
                }}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            aria-label="theme"
            style={{
              marginInlineStart: 8,
              width: 38,
              height: 38,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--bg-elev)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? '🌙' : '☀'}
          </button>
        </nav>
      </div>
    </header>
  );
}
