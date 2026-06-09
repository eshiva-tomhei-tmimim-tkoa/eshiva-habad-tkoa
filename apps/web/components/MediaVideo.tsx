'use client';
import { useState } from 'react';
import { Icon } from './Icons';

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  return m?.[1] ?? null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m?.[1] ?? null;
}
const isFile = (url: string) => /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url);

/**
 * Видео в медиа-слоте: постер + кнопка play. По клику — встроенный плеер
 * (YouTube/Vimeo через iframe, либо <video> для загруженного файла, либо
 * открытие внешней ссылки в новой вкладке).
 */
export function MediaVideo({
  url,
  poster,
  label,
  aspect = '4/5',
  meta,
}: {
  url: string;
  poster?: string;
  label: string;
  aspect?: string;
  meta?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const yt = youtubeId(url);
  const vm = vimeoId(url);

  function play() {
    if (!yt && !vm && !isFile(url)) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    setPlaying(true);
  }

  if (playing && yt) {
    return (
      <div className="media-frame" style={{ aspectRatio: aspect }}>
        <iframe
          src={`https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`}
          title={label}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  if (playing && vm) {
    return (
      <div className="media-frame" style={{ aspectRatio: aspect }}>
        <iframe
          src={`https://player.vimeo.com/video/${vm}?autoplay=1`}
          title={label}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (playing) {
    return (
      <div className="media-frame" style={{ aspectRatio: aspect }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={url} poster={poster} controls autoPlay playsInline />
      </div>
    );
  }

  return (
    <div className="media-poster" style={{ aspectRatio: aspect }}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={label} />
      ) : (
        <div className="media-poster-fallback" aria-hidden />
      )}
      <div className="hero-media-overlay">
        <button type="button" className="hero-play" aria-label={label} onClick={play}>
          <Icon.play />
        </button>
        {meta && <div className="hero-media-meta mono">{meta}</div>}
      </div>
    </div>
  );
}
