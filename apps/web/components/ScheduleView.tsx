'use client';
import { useMemo, useState } from 'react';

export interface ScheduleRow {
  id: number;
  days: number[];
  start: string;
  end: string;
  subject: string;
  teacher: string;
}

function durationMin(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function ScheduleView({
  slots,
  weekdays,
  labels,
}: {
  slots: ScheduleRow[];
  /** Полные подписи дней недели (индекс 0..6). */
  weekdays: string[];
  labels: {
    day: string;
    all: string;
    teacher: string;
    allTeachers: string;
    lessons: string;
    empty: string;
  };
}) {
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [teacherFilter, setTeacherFilter] = useState('all');

  const teachers = useMemo(() => [...new Set(slots.map((s) => s.teacher))].filter(Boolean), [slots]);
  // Дни, реально присутствующие в расписании (для чипов фильтра).
  const days = useMemo(() => {
    const set = new Set<number>();
    slots.forEach((s) => s.days.forEach((d) => set.add(d)));
    return [...set].sort((a, b) => a - b);
  }, [slots]);

  const filtered = slots.filter((s) => {
    if (dayFilter !== 'all' && !s.days.includes(dayFilter)) return false;
    if (teacherFilter !== 'all' && s.teacher !== teacherFilter) return false;
    return true;
  });

  return (
    <>
      <div className="schd-filters fade-up">
        <div className="schd-filter-group">
          <span className="schd-label mono">{labels.day}</span>
          <div className="schd-day-row">
            <button
              type="button"
              className={`day-btn ${dayFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDayFilter('all')}
            >
              {labels.all}
            </button>
            {days.map((d) => (
              <button
                key={d}
                type="button"
                className={`day-btn ${dayFilter === d ? 'active' : ''}`}
                onClick={() => setDayFilter(d)}
              >
                {weekdays[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="schd-filter-group">
          <span className="schd-label mono">{labels.teacher}</span>
          <select
            className="schd-select"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          >
            <option value="all">{labels.allTeachers}</option>
            {teachers.map((tch) => (
              <option key={tch} value={tch}>
                {tch}
              </option>
            ))}
          </select>
        </div>

        <div className="schd-result mono">
          {filtered.length} {labels.lessons}
        </div>
      </div>

      <div className="schd-list">
        {filtered.length === 0 && <div className="schd-empty">{labels.empty}</div>}
        {filtered.map((s, i) => (
          <div key={s.id} className={`schd-item fade-up fade-up-${Math.min(i + 1, 5)}`}>
            <div className="schd-time">
              <div className="schd-start mono">{s.start}</div>
              <div className="schd-bar-wrap">
                <div
                  className="schd-bar"
                  style={{ width: `${Math.min((durationMin(s.start, s.end) / 150) * 100, 100)}%` }}
                />
              </div>
              <div className="schd-end mono">{s.end}</div>
            </div>
            <div className="schd-info">
              <div className="schd-subj">{s.subject}</div>
              <div className="schd-teacher">{s.teacher}</div>
            </div>
            <div className="schd-days">
              {days.map((d) => (
                <span key={d} className={`day-pip ${s.days.includes(d) ? 'on' : ''}`}>
                  {weekdays[d]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
