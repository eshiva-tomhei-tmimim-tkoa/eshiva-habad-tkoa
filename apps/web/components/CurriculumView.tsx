'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from './Icons';

export interface SubjectCard {
  id: number;
  code: string;
  title: string;
  teacher: string;
  hours: string;
  color: string;
  items: string[];
}

export function CurriculumView({
  subjects,
  contentLabel,
  scheduleCta,
}: {
  subjects: SubjectCard[];
  contentLabel: string;
  scheduleCta: string;
}) {
  const [active, setActive] = useState(0);
  const cur = subjects[active];
  if (!cur) return null;

  return (
    <div className="curr-layout">
      <div className="curr-list">
        {subjects.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`curr-tab ${active === i ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="curr-tab-code mono" style={{ color: c.color || 'var(--primary)' }}>
              {c.code}
            </span>
            <span className="curr-tab-title">{c.title}</span>
            <span className="curr-tab-arrow"><Icon.arrow /></span>
          </button>
        ))}
      </div>

      <div className="curr-detail" key={cur.id}>
        <div className="curr-detail-head">
          <div className="curr-code-big mono" style={{ color: cur.color || 'var(--primary)' }}>
            {cur.code}
          </div>
          <div>
            <h2 className="curr-title">{cur.title}</h2>
            <div className="curr-meta">
              {cur.teacher && (
                <span>
                  <Icon.book /> {cur.teacher}
                </span>
              )}
              {cur.hours && (
                <span>
                  <Icon.clock /> {cur.hours}
                </span>
              )}
            </div>
          </div>
        </div>

        {cur.items.length > 0 && (
          <div className="curr-body">
            <h4 className="curr-section-label mono">{contentLabel}</h4>
            <ul className="curr-items">
              {cur.items.map((item, i) => (
                <li key={i} className="curr-item">
                  <span className="curr-item-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="curr-actions">
          <Link href="/study/schedule" className="btn btn-secondary">
            <span className="btn-arrow"><Icon.calendar /></span>
            <span>{scheduleCta}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
