'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Localized } from '@yeshiva/types';
import { DashboardShell } from '../../../components/DashboardShell';
import { LocalizedField } from '../../../components/LocalizedField';
import { api } from '../../../lib/api';
import { CONTENT_GROUP_MAP, type ContentField } from '../../../lib/content-schema';

const EMPTY_LOC: Localized = { ru: '', he: '', en: '' };

type Values = Record<string, Localized | string>;

export default function ContentGroupPage() {
  const params = useParams<{ group: string }>();
  const def = CONTENT_GROUP_MAP[params.group];

  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!def) return;
    setLoading(true);
    // Публичный эндпоинт /content/:group возвращает уже плоскую карту key→Localized.
    api
      .get<Record<string, Localized>>(`/content/${def.pageGroup}`)
      .then((map) => {
        const initial: Values = {};
        for (const section of def.sections) {
          for (const f of section.fields) {
            const existing = map[f.key];
            initial[f.key] = f.type === 'text' ? existing?.ru ?? '' : existing ?? EMPTY_LOC;
          }
        }
        setValues(initial);
      })
      .catch((e) => setError((e as Error).message ?? 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [def]);

  if (!def) {
    return (
      <DashboardShell>
        <Alert severity="warning">Неизвестный раздел: {params.group}</Alert>
      </DashboardShell>
    );
  }

  function setField(key: string, v: Localized | string) {
    setValues((s) => ({ ...s, [key]: v }));
    setOk(false);
  }

  async function save() {
    setSaving(true);
    setError('');
    setOk(false);
    try {
      const items: { contentKey: string; pageGroup: string; value: Localized }[] = [];
      for (const section of def.sections) {
        for (const f of section.fields) {
          const v = values[f.key];
          const value: Localized =
            f.type === 'text' ? { ru: String(v ?? ''), he: '', en: '' } : ((v as Localized) ?? EMPTY_LOC);
          // Пропускаем полностью пустые поля — пусть в БД лежат только осознанные значения.
          if (!value.ru && !value.he && !value.en) continue;
          items.push({ contentKey: f.key, pageGroup: def.pageGroup, value });
        }
      }
      if (items.length === 0) {
        setError('Нет значений для сохранения');
        return;
      }
      await api.put('/admin/content/batch', { items });
      setOk(true);
    } catch (e) {
      setError((e as Error).message ?? 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Контент: {def.title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
        {def.description}
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
        <Stack spacing={3} sx={{ maxWidth: 960 }}>
          {def.sections.map((section) => (
            <Box key={section.title}>
              <Typography variant="overline" color="text.secondary">
                {section.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {section.fields.map((f) => (
                  <FieldRow
                    key={f.key}
                    field={f}
                    value={values[f.key]}
                    onChange={(v) => setField(f.key, v)}
                  />
                ))}
              </Stack>
            </Box>
          ))}

          <Box>
            <Button variant="contained" disabled={saving} onClick={save}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </Box>
        </Stack>
      )}
    </DashboardShell>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: ContentField;
  value: Localized | string | undefined;
  onChange: (v: Localized | string) => void;
}) {
  if (field.type === 'localized') {
    return (
      <Box>
        <LocalizedField
          label={field.label}
          value={(value as Localized) ?? EMPTY_LOC}
          onChange={(v) => onChange(v)}
        />
        {field.helper && (
          <Typography variant="caption" color="text.secondary">
            {field.helper}
          </Typography>
        )}
      </Box>
    );
  }
  return (
    <TextField
      label={field.label}
      size="small"
      fullWidth
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      helperText={field.helper}
    />
  );
}
