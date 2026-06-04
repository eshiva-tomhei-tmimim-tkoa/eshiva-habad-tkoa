import type { CSSProperties, ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <section className="section" style={{ paddingBottom: 24 }}>
      <div className="container">
        <div className="section-head fade-up">
          {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
          <h1 className="section-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            {title}
          </h1>
          {desc && <p className="section-desc">{desc}</p>}
        </div>
      </div>
    </section>
  );
}

/**
 * Плейсхолдер под медиаконтент (фото/видео). Без `src` рисует диагональную
 * штриховку + пунктирную рамку и подпись-метку — обозначение места под медиа
 * (как в эталоне). С `src` показывает изображение, заполняя область.
 * `children` рендерится поверх (например, кнопка play).
 */
export function ImgPlaceholder({
  label,
  aspect = '4/3',
  src,
  style,
  children,
}: {
  label: string;
  aspect?: string;
  src?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={`img-placeholder${src ? ' has-img' : ''}`}
      style={{ aspectRatio: aspect, ...style }}
    >
      {src && <img src={src} alt={label} />}
      {children ?? (!src && <span className="img-placeholder-label">{label}</span>)}
    </div>
  );
}
