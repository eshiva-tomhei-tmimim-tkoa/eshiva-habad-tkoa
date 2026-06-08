'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

const REVEAL_SELECTOR = [
  '.hero-eyebrow',
  '.hero-title',
  '.hero-desc',
  '.hero-cta',
  '.hero-media',
  '.rebbe-portrait-wrap',
  '.rebbe-content',
  '.mission-grid > *',
  '.mission-stats',
  '.pillar',
  '.study-cta-inner > *',
  '.study-cta-link',
  '.section-head',
  '.section-head-row',
  '.team-card',
  '.home-quote',
  '.donate-banner > *',
  '.hub-card',
  '.principle',
  '.tl-row',
  '.curr-tab',
  '.curr-detail',
  '.schd-filters',
  '.schd-item',
  '.stud-featured',
  '.stud-thumb',
  '.ach',
  '.contact-card',
  '.contact-map',
  '.quick-form',
  '.donate-progress',
  '.donate-form',
  '.donors-block',
  '.donor',
  '.footer-grid > *',
  '.footer-bottom',
].join(',');

function isNearViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < height * 0.92 && rect.bottom > 0;
}

export function MotionEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    const groups = new Map<Element, number>();
    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter(
      (el) => !el.closest('.mobile-nav') && el.dataset.motionBound !== 'true',
    );

    elements.forEach((el) => {
      const parent = el.parentElement;
      const index = parent ? groups.get(parent) ?? 0 : 0;

      if (parent) groups.set(parent, index + 1);
      el.dataset.motionBound = 'true';
      el.dataset.motionReveal = 'true';
      el.style.setProperty('--motion-delay', `${Math.min(index, 8) * 55}ms`);

      if (isNearViewport(el)) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    document.documentElement.classList.add('motion-ready');

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
