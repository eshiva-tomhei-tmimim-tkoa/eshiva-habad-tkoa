'use client';
import { useState } from 'react';
import { ImgPlaceholder } from './PageHeader';
import { Icon } from './Icons';

export interface TeamCard {
  id: number;
  name: string;
  role: string;
  bio: string;
  tags: string[];
  photoUrl?: string;
}

export function TeamGrid({ members }: { members: TeamCard[] }) {
  const [selected, setSelected] = useState<TeamCard | null>(null);

  return (
    <>
      <div className="team-grid">
        {members.map((p, i) => (
          <article
            key={p.id}
            className={`team-card fade-up fade-up-${Math.min(i + 1, 5)}`}
            onClick={() => setSelected(p)}
          >
            <div className="team-portrait">
              <ImgPlaceholder label={p.name.split(' ')[0]} aspect="3/4" src={p.photoUrl} />
              <div className="team-portrait-overlay">
                <span className="team-portrait-tag mono">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="team-body">
              <h3 className="team-name">{p.name}</h3>
              <div className="team-role">{p.role}</div>
              <div className="team-tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="team-tag">{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Закрыть">
              <Icon.close />
            </button>
            <div className="modal-grid">
              <ImgPlaceholder
                label={selected.name.split(' ')[0]}
                aspect="3/4"
                src={selected.photoUrl}
              />
              <div>
                <div className="modal-role mono">{selected.role}</div>
                <h2 className="modal-name">{selected.name}</h2>
                <p className="modal-bio">{selected.bio}</p>
                <div className="team-tags" style={{ marginTop: 24 }}>
                  {selected.tags.map((tag) => (
                    <span key={tag} className="team-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
