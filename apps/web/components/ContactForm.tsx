'use client';
import { useState, type FormEvent } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-elev)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
};

export function ContactForm() {
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
        throw new Error(j?.error?.message ?? 'Ошибка отправки');
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
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 8 }}>Спасибо!</h3>
        <p style={{ color: 'var(--text-soft)' }}>Сообщение отправлено. Мы свяжемся с вами.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: 28, display: 'grid', gap: 14 }}>
      <input
        style={inputStyle}
        placeholder="Имя"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        style={inputStyle}
        placeholder="Телефон (необязательно)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
        placeholder="Сообщение"
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      {status === 'error' && <div style={{ color: '#e5484d' }}>{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Отправка…' : 'Отправить'}
      </button>
    </form>
  );
}
