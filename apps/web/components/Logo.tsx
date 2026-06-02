// «Три башни» с намёком на звезду Давида (упрощённый SVG из прототипа).
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 4l4 8h-8l4-8z" fill="var(--accent)" />
        <rect x="8" y="20" width="9" height="22" rx="2" fill="var(--primary)" />
        <rect x="19.5" y="14" width="9" height="28" rx="2" fill="var(--primary-bright)" />
        <rect x="31" y="20" width="9" height="22" rx="2" fill="var(--primary)" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem' }}>
        Ешива «ХаБаД Ткоа»
      </span>
    </span>
  );
}
