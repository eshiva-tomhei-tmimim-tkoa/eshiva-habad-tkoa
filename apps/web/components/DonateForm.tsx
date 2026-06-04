'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Icon } from './Icons';

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
    <div className="donate-form">
      <h3 className="donate-form-title">{tr('makeDonation')}</h3>

      <div className="donate-toggle">
        <button
          type="button"
          className={`donate-toggle-btn ${!recurring ? 'active' : ''}`}
          onClick={() => setRecurring(false)}
        >
          {tr('oneTime')}
        </button>
        <button
          type="button"
          className={`donate-toggle-btn ${recurring ? 'active' : ''}`}
          onClick={() => setRecurring(true)}
        >
          {tr('monthly')}
        </button>
      </div>

      <div className="donate-presets">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`preset-btn ${amount === p ? 'active' : ''}`}
            onClick={() => setAmount(p)}
          >
            <span className="preset-amt">{p} ₪</span>
            {p === 180 && <span className="preset-tag mono">{tr('hai')}</span>}
            {p === 1800 && <span className="preset-tag mono">{tr('chai')}</span>}
          </button>
        ))}
      </div>

      <div className="donate-custom">
        <span className="donate-custom-l mono">{tr('customAmount')}</span>
        <div className="donate-input-wrap">
          <input
            type="number"
            className="donate-input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
          <span className="donate-currency">₪</span>
        </div>
      </div>

      <div className="donate-impact">
        <Icon.spark />
        <div>
          <strong>
            {amount} ₪ {recurring ? tr('perMonth') : ''}
          </strong>{' '}
          {tr('impactCovers')} {Math.max(1, Math.floor(amount / 30))} {tr('impactHours')}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary donate-cta"
        onClick={donate}
        disabled={status === 'sending'}
      >
        <span>
          {status === 'sending'
            ? `${tr('redirecting')}…`
            : `${tr('donate')} ${amount} ₪${recurring ? ` ${tr('perMonth')}` : ''}`}
        </span>
        <span className="btn-arrow"><Icon.heart /></span>
      </button>

      {status === 'error' && (
        <div className="form-status-err" style={{ marginTop: 12 }}>{error}</div>
      )}

      <div className="donate-trust mono">{tr('secure')}</div>
    </div>
  );
}
