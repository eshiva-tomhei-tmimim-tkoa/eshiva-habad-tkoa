'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const PRESETS = [50, 100, 180, 360, 720, 1800];

export function DonateForm({ campaignId }: { campaignId: number }) {
  const tr = useTranslations('donate');
  const locale = useLocale();
  const [amount, setAmount] = useState(180);
  const [recurring, setRecurring] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');

  async function donate() {
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, amount, recurring, locale }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error?.message ?? 'Error');
      // Редирект на хостинговую форму оплаты Israel Toremet / IsraelGives.
      window.location.href = j.data.redirectUrl as string;
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <h3 style={{ marginBottom: 16 }}>{tr('makeDonation')}</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className="btn"
            style={{
              justifyContent: 'center',
              border: '1px solid var(--border)',
              background: amount === p ? 'var(--primary)' : 'transparent',
              color: amount === p ? '#fff' : 'var(--text)',
            }}
          >
            {p} ₪
          </button>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
        />
        {tr('monthly')}
      </label>
      <button onClick={donate} className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending'
          ? `${tr('redirecting')}…`
          : `${tr('donate')} ${amount} ₪${recurring ? ` ${tr('perMonth')}` : ''}`}
      </button>
      {status === 'error' && <div style={{ color: '#e5484d', marginTop: 8 }}>{error}</div>}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 16 }}>{tr('secure')}</p>
    </div>
  );
}
