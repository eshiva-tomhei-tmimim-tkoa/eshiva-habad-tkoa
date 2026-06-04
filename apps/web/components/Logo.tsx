// «Три башни» с намёком на звезду Давида — геометрический знак из эталона.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-label="Yeshiva Chabad Tkoa"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        {/* центральная башня (самая высокая) */}
        <path d="M22 56 L22 24 L26 20 L26 14 L30 14 L30 10 L34 10 L34 14 L38 14 L38 20 L42 24 L42 56 Z" fill="color-mix(in oklab, currentColor 10%, transparent)" />
        {/* левая башня */}
        <path d="M6 56 L6 32 L10 28 L10 24 L14 24 L14 20 L18 20 L18 24 L22 24 L22 56 L6 56 Z" fill="color-mix(in oklab, currentColor 4%, transparent)" />
        {/* правая башня */}
        <path d="M42 24 L46 20 L46 24 L50 24 L50 20 L54 20 L54 24 L58 28 L58 32 L58 56 L42 56 Z" fill="color-mix(in oklab, currentColor 4%, transparent)" />
        {/* основание */}
        <line x1="4" y1="58" x2="60" y2="58" strokeWidth="2" />
      </g>
      {/* центральная точка — намёк на Маген Давид */}
      <g transform="translate(32 38)" fill="currentColor">
        <circle r="1.8" />
      </g>
    </svg>
  );
}
