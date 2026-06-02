'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/team', label: 'Команда' },
  { href: '/students', label: 'Ученики' },
  { href: '/study', label: 'Учёба' },
  { href: '/contacts', label: 'Контакты' },
];

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'light';
    setTheme(saved);
  }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

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
        <Link href="/" style={{ marginRight: 'auto' }}>
          <Logo />
        </Link>
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
          <Link href="/donate" className="btn btn-primary" style={{ marginLeft: 8, padding: '8px 18px' }}>
            Поддержать
          </Link>
          <button
            onClick={toggle}
            aria-label="Сменить тему"
            style={{
              marginLeft: 8,
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
