'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * Возврат донора с формы IsraelGives. Авто-учитывает пожертвование в нашей БД
 * (идемпотентно по donid) и даёт донору выбрать, показывать ли его в списке.
 */
export function DonateThanks() {
  const tr = useTranslations('donate');
  const sp = useSearchParams();
  const campaignId = Number(sp.get('cid'));
  const externalId = sp.get('donid') ?? '';
  const amount = Number(sp.get('sum'));
  const currency = sp.get('cur') ?? '';
  const name = sp.get('fname') ?? '';
  const trid = sp.get('trid') ?? '';

  const recordable = Boolean(externalId && campaignId && amount > 0);
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const started = useRef(false);

  // Учесть пожертвование один раз при загрузке (по умолчанию — видимым).
  useEffect(() => {
    if (started.current || !recordable) return;
    started.current = true;
    fetch(`${API_URL}/donations/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, externalId, amount, name, showInList: true }),
    })
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, [recordable, campaignId, externalId, amount, name]);

  async function toggle(next: boolean) {
    setShow(next);
    setSaving(true);
    try {
      await fetch(`${API_URL}/donations/${encodeURIComponent(externalId)}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInList: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 28, maxWidth: 520 }}>
      {name && (
        <p style={{ marginBottom: 12 }}>
          {tr('thanksHi')}, <strong>{name}</strong>!
        </p>
      )}
      {amount > 0 && (
        <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>
          {amount} {currency}
        </div>
      )}
      {trid && (
        <div className="mono" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
          {tr('thanksRef')}: {trid}
        </div>
      )}

      {recordable && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 20,
            opacity: ready ? 1 : 0.5,
          }}
        >
          <input
            type="checkbox"
            checked={show}
            disabled={!ready || saving}
            onChange={(e) => toggle(e.target.checked)}
          />
          {tr('thanksShowMe')}
        </label>
      )}

      <p style={{ color: 'var(--text-soft)', marginTop: 16 }}>{tr('thanksReceipt')}</p>
    </div>
  );
}
