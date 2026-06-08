'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { Localized } from '@yeshiva/types';
import { DashboardShell } from '../../components/DashboardShell';
import { api } from '../../lib/api';

type Defaults = Record<'ru' | 'he' | 'en', Record<string, unknown>>;

/** Развернуть вложенный объект в плоский { 'a.b.c': 'value' }. */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, path));
    } else if (typeof v === 'string') {
      out[path] = v;
    }
  }
  return out;
}

const EMPTY_LOC: Localized = { ru: '', he: '', en: '' };

export default function TranslationsPage() {
  const [defaults, setDefaults] = useState<Defaults | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Localized>>({});
  // Локальные правки текущей сессии (key → Localized).
  const [edits, setEdits] = useState<Record<string, Localized>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [namespace, setNamespace] = useState<string>('nav');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      // Через relative URL обращаемся к собственному API-route admin (Next.js)
      fetch('/api/i18n-defaults').then((r) => r.json()),
      api.get<Record<string, Localized>>('/content/i18n'),
    ])
      .then(([defResp, ovr]) => {
        if (!alive) return;
        if ('error' in defResp) {
          setError(`Не удалось загрузить дефолтные словари: ${defResp.error.message}`);
        } else {
          setDefaults(defResp.data as Defaults);
        }
        setOverrides(ovr ?? {});
      })
      .catch((e) => setError((e as Error).message ?? 'Ошибка загрузки'))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Плоская карта ru-дефолтов: список всех ключей. Используем ru как источник
  // правды для набора ключей (he/en могут отставать).
  const ruFlat = useMemo(
    () => (defaults ? flatten(defaults.ru) : {}),
    [defaults],
  );
  const heFlat = useMemo(
    () => (defaults ? flatten(defaults.he) : {}),
    [defaults],
  );
  const enFlat = useMemo(
    () => (defaults ? flatten(defaults.en) : {}),
    [defaults],
  );

  // Уникальные namespaces (первый сегмент ключа).
  const namespaces = useMemo(() => {
    const set = new Set<string>();
    for (const k of Object.keys(ruFlat)) set.add(k.split('.')[0] ?? '');
    return Array.from(set).sort();
  }, [ruFlat]);

  // Ключи текущего namespace, отфильтрованные по подстроке.
  const visibleKeys = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return Object.keys(ruFlat)
      .filter((k) => k.startsWith(`${namespace}.`))
      .filter((k) => !q || k.toLowerCase().includes(q) || (ruFlat[k] ?? '').toLowerCase().includes(q));
  }, [ruFlat, namespace, filter]);

  // Текущее значение override (с учётом локальных правок).
  function currentOverride(key: string): Localized {
    return edits[key] ?? overrides[key] ?? EMPTY_LOC;
  }

  function setOverride(key: string, locale: 'ru' | 'he' | 'en', value: string) {
    setEdits((s) => {
      const prev = s[key] ?? overrides[key] ?? EMPTY_LOC;
      return { ...s, [key]: { ...prev, [locale]: value } };
    });
    setOk(false);
  }

  async function save() {
    setSaving(true);
    setError('');
    setOk(false);
    try {
      const items = Object.entries(edits).map(([contentKey, value]) => ({
        contentKey,
        pageGroup: 'i18n',
        value,
      }));
      if (items.length === 0) {
        setError('Нет изменений');
        return;
      }
      await api.put('/admin/content/batch', { items });
      // После сохранения сливаем edits в overrides.
      setOverrides((s) => {
        const next = { ...s };
        for (const [k, v] of Object.entries(edits)) {
          if (!v.ru && !v.he && !v.en) delete next[k];
          else next[k] = v;
        }
        return next;
      });
      setEdits({});
      setOk(true);
    } catch (e) {
      setError((e as Error).message ?? 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  const editCount = Object.keys(edits).length;

  return (
    <DashboardShell>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Переводы UI
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        Подписи интерфейса сайта (меню, кнопки, заголовки). Слева в каждой
        строке — значение по умолчанию, справа — поле override для каждого
        языка. Очистите все три поля override, чтобы вернуть значение по
        умолчанию.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {ok && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setOk(false)}>
          Сохранено
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Tabs
            value={namespace}
            onChange={(_, v) => setNamespace(v as string)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {namespaces.map((ns) => (
              <Tab key={ns} value={ns} label={ns} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Фильтр по ключу или тексту"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 320 }}
            />
            <Typography variant="body2" color="text.secondary">
              {visibleKeys.length} {plural(visibleKeys.length, ['ключ', 'ключа', 'ключей'])}
              {editCount > 0 && ` · ${editCount} ${plural(editCount, ['изменение', 'изменения', 'изменений'])}`}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled={saving || editCount === 0}
              onClick={save}
            >
              {saving ? 'Сохранение…' : `Сохранить (${editCount})`}
            </Button>
          </Box>

          <Stack spacing={1.5}>
            {visibleKeys.map((key) => {
              const ov = currentOverride(key);
              return (
                <Box
                  key={key}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '260px 1fr 1fr 1fr',
                    gap: 1.5,
                    alignItems: 'start',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: edits[key] ? 'action.hover' : 'background.paper',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {key}
                    </Typography>
                  </Box>
                  <KeyRow
                    locale="ru"
                    defaultValue={ruFlat[key] ?? ''}
                    override={ov.ru}
                    onChange={(v) => setOverride(key, 'ru', v)}
                  />
                  <KeyRow
                    locale="he"
                    defaultValue={heFlat[key] ?? ''}
                    override={ov.he}
                    onChange={(v) => setOverride(key, 'he', v)}
                  />
                  <KeyRow
                    locale="en"
                    defaultValue={enFlat[key] ?? ''}
                    override={ov.en}
                    onChange={(v) => setOverride(key, 'en', v)}
                  />
                </Box>
              );
            })}
          </Stack>
        </Stack>
      )}
    </DashboardShell>
  );
}

function KeyRow({
  locale,
  defaultValue,
  override,
  onChange,
}: {
  locale: 'ru' | 'he' | 'en';
  defaultValue: string;
  override: string;
  onChange: (v: string) => void;
}) {
  const isHe = locale === 'he';
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {locale.toUpperCase()} по умолчанию
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 0.5,
          color: 'text.secondary',
          minHeight: 22,
          wordBreak: 'break-word',
        }}
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {defaultValue || <i>—</i>}
      </Typography>
      <TextField
        size="small"
        fullWidth
        multiline
        placeholder="override"
        value={override}
        onChange={(e) => onChange(e.target.value)}
        dir={isHe ? 'rtl' : 'ltr'}
      />
    </Box>
  );
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}
