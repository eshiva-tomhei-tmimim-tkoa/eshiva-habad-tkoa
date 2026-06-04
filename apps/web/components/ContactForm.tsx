'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from './Icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function ContactForm() {
  const tr = useTranslations('contacts');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error?.message ?? 'Error');
      }
      setStatus('ok');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  if (status === 'ok') {
    return (
      <div style={{ paddingTop: 8 }}>
        <h3 style={{ marginBottom: 8 }}>{tr('formThanks')}</h3>
        <p className="section-desc">{tr('formThanksDesc')}</p>
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field">
        <span className="field-l mono">{tr('formName')}</span>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-l mono">{tr('formEmail')}</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="field field-full">
        <span className="field-l mono">{tr('formPhone')}</span>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </label>
      <label className="field field-full">
        <span className="field-l mono">{tr('formMessage')}</span>
        <textarea
          rows={4}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {status === 'error' && <div className="field-full form-status-err">{error}</div>}
      <div className="field-full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          <span>{status === 'sending' ? tr('formSending') : tr('formSend')}</span>
          <span className="btn-arrow"><Icon.arrow /></span>
        </button>
      </div>
    </form>
  );
}
