'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const PRESETS = [50, 100, 180, 360, 720, 1800];

export function DonateForm({ campaignId }: { campaignId: number }) {
  const [amount, setAmount] = useState(180);
  const [recurring, setRecurring] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'pending' | 'error'>('idle');
  const [error, setError] = useState('');

  async function donate() {
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, amount, recurring }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error?.message ?? 'Ошибка');
      }
      setStatus('pending');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <h3 style={{ marginBottom: 16 }}>Сделать пожертвование</h3>
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
        Ежемесячно
      </label>
      {status === 'pending' ? (
        <div style={{ color: 'var(--success)' }}>
          Намерение создано. Подключение платёжного провайдера — на этапе 6.
        </div>
      ) : (
        <button onClick={donate} className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? '…' : `Пожертвовать ${amount} ₪${recurring ? ' / мес' : ''}`}
        </button>
      )}
      {status === 'error' && <div style={{ color: '#e5484d', marginTop: 8 }}>{error}</div>}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 16 }}>
        Защищённый платёж · 501(c)(3) · tax-deductible
      </p>
    </div>
  );
}
