import type { ReactNode } from 'react';
import { ImgPlaceholder } from './PageHeader';
import { MediaVideo } from './MediaVideo';
import { mediaSrc, type MediaMap } from '@/lib/api';

/**
 * Универсальный медиа-блок: по ключу slug берёт из карты медиа фото или видео.
 * Если слот пуст — рисует заглушку (с переданным overlay-children, напр. play).
 */
export function MediaBlock({
  media,
  slug,
  label,
  aspect = '4/5',
  meta,
  children,
}: {
  media: MediaMap;
  slug: string;
  label: string;
  aspect?: string;
  /** Подпись для видео (напр. «Видеоэкскурсия · 02:14»). */
  meta?: string;
  /** Overlay для пустого состояния (декоративная кнопка play и т.п.). */
  children?: ReactNode;
}) {
  const m = media[slug];

  if (m?.kind === 'image' && m.url) {
    return <ImgPlaceholder label={label} aspect={aspect} src={mediaSrc(m.url)} />;
  }
  if (m?.kind === 'video' && m.url) {
    return (
      <MediaVideo
        url={mediaSrc(m.url) ?? m.url}
        poster={m.poster ? mediaSrc(m.poster) : undefined}
        label={label}
        aspect={aspect}
        meta={meta}
      />
    );
  }
  return (
    <ImgPlaceholder label={label} aspect={aspect}>
      {children}
    </ImgPlaceholder>
  );
}
