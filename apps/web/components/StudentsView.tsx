'use client';
import { useEffect, useState } from 'react';
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
    more: string;
    close: string;
  };
  achievements: Achievement[];
}) {
  // Индекс открытой карточки (null — модалка закрыта).
  const [active, setActive] = useState<number | null>(null);
  const s = active != null ? students[active] : null;

  // Esc закрывает модалку; блокируем прокрутку фона, пока она открыта.
  useEffect(() => {
    if (s == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [s]);

  return (
    <>
      {/* Сетка карточек учеников */}
      <div className="students-grid">
        {students.map((st, i) => (
          <button
            key={st.id}
            type="button"
            className={`student-card fade-up fade-up-${Math.min(i + 1, 5)}`}
            onClick={() => setActive(i)}
          >
            <div className="student-card-media">
              <ImgPlaceholder label={st.name.split(' ')[0]} aspect="4/3" src={st.photoUrl} />
            </div>
            <div className="student-card-body">
              <h3 className="student-card-name">{st.name}</h3>
              <div className="student-card-prof mono">
                {st.profession.split(' · ')[0] || st.duration}
              </div>
              <span className="student-card-more">
                {labels.more}
                <Icon.arrow />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Модалка с полной биографией */}
      {s && (
        <div className="modal-bg" onClick={() => setActive(null)}>
          <div className="modal student-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setActive(null)}
              aria-label={labels.close}
            >
              <Icon.close />
            </button>
            <div className="student-modal-grid">
              <div className="student-modal-media">
                <ImgPlaceholder
                  label={`${labels.video} · ${s.name}`}
                  aspect="4/5"
                  src={s.photoUrl}
                >
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
              <div className="student-modal-body">
                <div className="stud-quote">
                  <span className="quote-mark" aria-hidden>
                    «
                  </span>
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
          </div>
        </div>
      )}

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
