'use client';
import { useState } from 'react';
import type { DailyBlockDto } from '@/lib/dto';

type Category = DailyBlockDto['category'];

export interface DailyItem {
  id: number;
  time: string;
  title: string;
  category: Category;
  desc: string;
}

const CATEGORY_COLOR: Record<Category, string> = {
  prayer: 'var(--primary)',
  study: 'var(--accent)',
  meal: 'var(--success)',
  spirit: 'var(--primary-bright)',
  personal: 'var(--text-dim)',
};

const ORDER: Category[] = ['prayer', 'study', 'meal', 'spirit', 'personal'];

export function DailyTimeline({
  blocks,
  categoryLabels,
  allLabel,
}: {
  blocks: DailyItem[];
  categoryLabels: Record<Category, string>;
  allLabel: string;
}) {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const visible = filter === 'all' ? blocks : blocks.filter((b) => b.category === filter);

  return (
    <>
      <div className="filter-row fade-up">
        <button
          type="button"
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {allLabel} <span className="chip-count mono">{blocks.length}</span>
        </button>
        {ORDER.map((k) => {
          const count = blocks.filter((b) => b.category === k).length;
          if (count === 0) return null;
          return (
            <button
              key={k}
              type="button"
              className={`chip ${filter === k ? 'active' : ''}`}
              onClick={() => setFilter(k)}
            >
              <span className="chip-dot" style={{ background: CATEGORY_COLOR[k] }} />
              {categoryLabels[k]} <span className="chip-count mono">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="timeline">
        {visible.map((b, i) => {
          const color = CATEGORY_COLOR[b.category];
          return (
            <div key={b.id} className={`tl-row fade-up fade-up-${Math.min(i + 1, 5)}`}>
              <div className="tl-time mono">{b.time}</div>
              <div className="tl-rail">
                <div className="tl-node" style={{ background: color }} />
              </div>
              <div className="tl-card">
                <div className="tl-card-head">
                  <h3 className="tl-title">{b.title}</h3>
                  <span className="tl-cat" style={{ color }}>
                    <span className="tl-cat-dot" style={{ background: color }} />
                    {categoryLabels[b.category]}
                  </span>
                </div>
                <p className="tl-desc">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
