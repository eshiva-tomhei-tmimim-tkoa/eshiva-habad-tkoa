'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from './Icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type Jewishness = 'halacha' | 'giyur' | '';

interface EnrollState {
  firstName: string;
  lastName: string;
  birthDate: string;
  city: string;
  jewishness: Jewishness;
  rabbiName: string;
  rabbiPhone: string;
}

const EMPTY: EnrollState = {
  firstName: '',
  lastName: '',
  birthDate: '',
  city: '',
  jewishness: '',
  rabbiName: '',
  rabbiPhone: '',
};

export function EnrollForm() {
  const tr = useTranslations('enroll');
  const [form, setForm] = useState<EnrollState>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (patch: Partial<EnrollState>) => setForm((f) => ({ ...f, ...patch }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error?.message ?? 'Error');
      }
      setStatus('ok');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  if (status === 'ok') {
    return (
      <div className="enroll-done fade-up">
        <div className="enroll-done-icon">
          <Icon.spark />
        </div>
        <h3>{tr('thanks')}</h3>
        <p className="section-desc">{tr('thanksDesc')}</p>
      </div>
    );
  }

  return (
    <form className="form-grid enroll-form" onSubmit={onSubmit}>
      <label className="field">
        <span className="field-l mono">{tr('firstName')}</span>
        <input
          type="text"
          required
          value={form.firstName}
          onChange={(e) => set({ firstName: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-l mono">{tr('lastName')}</span>
        <input
          type="text"
          required
          value={form.lastName}
          onChange={(e) => set({ lastName: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-l mono">{tr('birthDate')}</span>
        <input
          type="date"
          required
          value={form.birthDate}
          onChange={(e) => set({ birthDate: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-l mono">{tr('city')}</span>
        <input
          type="text"
          required
          value={form.city}
          onChange={(e) => set({ city: e.target.value })}
        />
      </label>
      <label className="field field-full">
        <span className="field-l mono">{tr('jewishness')}</span>
        <select
          required
          className="enroll-select"
          value={form.jewishness}
          onChange={(e) => set({ jewishness: e.target.value as Jewishness })}
        >
          <option value="" disabled>
            {tr('jewishnessPlaceholder')}
          </option>
          <option value="halacha">{tr('jewishnessHalacha')}</option>
          <option value="giyur">{tr('jewishnessGiyur')}</option>
        </select>
      </label>
      <label className="field">
        <span className="field-l mono">{tr('rabbiName')}</span>
        <input
          type="text"
          value={form.rabbiName}
          onChange={(e) => set({ rabbiName: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-l mono">{tr('rabbiPhone')}</span>
        <input
          type="tel"
          value={form.rabbiPhone}
          onChange={(e) => set({ rabbiPhone: e.target.value })}
        />
      </label>
      {status === 'error' && <div className="field-full form-status-err">{error}</div>}
      <div className="field-full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          <span>{status === 'sending' ? tr('sending') : tr('submit')}</span>
          <span className="btn-arrow">
            <Icon.arrow />
          </span>
        </button>
      </div>
    </form>
  );
}
