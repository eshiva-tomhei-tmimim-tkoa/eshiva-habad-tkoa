'use client';
import { useState } from 'react';
import { ImgPlaceholder } from './PageHeader';
import { Icon } from './Icons';

export interface StudentCard {
  id: number;
  name: string;
  quote: string;
  profession: string;
  teacher: string;
  story: string;
  duration: string;
  photoUrl?: string;
}

export interface Achievement {
  n: string;
  t: string;
  d: string;
}

export function StudentsView({
  students,
  labels,
  achievements,
}: {
  students: StudentCard[];
  labels: {
    profession: string;
    mentor: string;
    duration: string;
    video: string;
    achievements: string;
  };
  achievements: Achievement[];
}) {
  const [active, setActive] = useState(0);
  const s = students[active];

  if (!s) return null;

  return (
    <>
      {/* Featured */}
      <div className="stud-featured">
        <div className="stud-featured-media">
          <ImgPlaceholder label={`${labels.video} · ${s.name}`} aspect="4/3" src={s.photoUrl}>
            {!s.photoUrl && (
              <div className="stud-play-wrap">
                <button type="button" className="stud-play-btn" aria-label={labels.video}>
                  <Icon.play />
                </button>
                <div className="stud-play-label mono">
                  {labels.video} · {s.duration}
                </div>
              </div>
            )}
          </ImgPlaceholder>
        </div>
        <div className="stud-featured-body">
          <div className="stud-quote">
            <span className="quote-mark" aria-hidden>«</span>
            <p>{s.quote}</p>
          </div>
          <h2 className="stud-name">{s.name}</h2>
          <div className="stud-meta">
            {s.profession && (
              <div>
                <span className="stud-meta-l mono">{labels.profession}</span>
                <span>{s.profession}</span>
              </div>
            )}
            {s.teacher && (
              <div>
                <span className="stud-meta-l mono">{labels.mentor}</span>
                <span>{s.teacher}</span>
              </div>
            )}
            <div>
              <span className="stud-meta-l mono">{labels.duration}</span>
              <span>{s.duration}</span>
            </div>
          </div>
          <p className="stud-story">{s.story}</p>
        </div>
      </div>

      {/* Switcher */}
      <div className="stud-switcher">
        {students.map((st, i) => (
          <button
            key={st.id}
            type="button"
            className={`stud-thumb ${active === i ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            <ImgPlaceholder label={st.name.split(' ')[0]} aspect="1/1" src={st.photoUrl} />
            <div className="stud-thumb-info">
              <div className="stud-thumb-name">{st.name}</div>
              <div className="stud-thumb-prof mono">{st.profession.split(' · ')[0] || st.duration}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="achievements">
          <div className="section-eyebrow">{labels.achievements}</div>
          <div className="ach-grid">
            {achievements.map((a, i) => (
              <div key={a.t} className={`ach fade-up fade-up-${i + 1}`}>
                <div className="ach-n">{a.n}</div>
                <div className="ach-t">{a.t}</div>
                <div className="ach-d">{a.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
