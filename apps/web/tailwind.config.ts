import type { Config } from 'tailwindcss';

// Цвета берутся из CSS-переменных (палитра electric, light/dark по data-theme).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-elev-2': 'var(--bg-elev-2)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        text: 'var(--text)',
        'text-soft': 'var(--text-soft)',
        'text-dim': 'var(--text-dim)',
        primary: 'var(--primary)',
        'primary-soft': 'var(--primary-soft)',
        'primary-bright': 'var(--primary-bright)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        success: 'var(--success)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '16px',
        xl: '24px',
        full: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(10,14,31,0.04), 0 1px 3px rgba(10,14,31,0.06)',
        DEFAULT: '0 4px 12px rgba(10,14,31,0.06), 0 2px 4px rgba(10,14,31,0.04)',
        lg: '0 24px 48px -16px rgba(10,14,31,0.18), 0 8px 16px rgba(10,14,31,0.08)',
      },
      maxWidth: {
        container: '1280px',
        'container-narrow': '960px',
      },
    },
  },
  plugins: [],
};

export default config;
