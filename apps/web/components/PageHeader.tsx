export function PageHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <section className="container-x" style={{ paddingTop: 64, paddingBottom: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', maxWidth: 900 }}>{title}</h1>
      {desc && (
        <p style={{ color: 'var(--text-soft)', marginTop: 16, maxWidth: 720, fontSize: '1.1rem' }}>
          {desc}
        </p>
      )}
    </section>
  );
}

export function ImgPlaceholder({
  label,
  aspect = '4/3',
  src,
}: {
  label: string;
  aspect?: string;
  src?: string;
}) {
  return (
    <div
      style={{
        aspectRatio: aspect,
        borderRadius: 16,
        background: src
          ? `center/cover no-repeat url(${src})`
          : 'linear-gradient(135deg, var(--primary-soft), var(--bg-elev-2))',
        border: '1px solid var(--border-soft)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        overflow: 'hidden',
      }}
    >
      {!src && label}
    </div>
  );
}
