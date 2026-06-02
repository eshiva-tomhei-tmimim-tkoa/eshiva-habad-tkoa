'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Alert,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Localized } from '@yeshiva/types';
import { api, ApiError, uploadFile, apiBase } from '../lib/api';
import { ENTITY_MAP, type EntityDef, type FieldDef } from '../lib/entities';
import { LocalizedField } from './LocalizedField';

type Row = Record<string, unknown>;
const EMPTY_LOC: Localized = { ru: '', he: '', en: '' };

const refLabel = (row: Row): string => {
  const name = row.name as Localized | undefined;
  const title = row.title as Localized | undefined;
  return name?.ru ?? title?.ru ?? (row.code as string) ?? `#${row.id}`;
};

// Имя вложенного объекта для ref-поля: positionId→position, subjectIds→subjects.
const nestedKey = (fieldKey: string): string =>
  fieldKey.endsWith('Ids')
    ? `${fieldKey.slice(0, -3)}s`
    : fieldKey.endsWith('Id')
      ? fieldKey.slice(0, -2)
      : fieldKey;

function initialValue(field: FieldDef, row: Row | null): unknown {
  if (row) {
    switch (field.type) {
      case 'ref': {
        const obj = row[nestedKey(field.key)] as { id: number } | null | undefined;
        return obj?.id ?? null;
      }
      case 'multiref': {
        const arr = (row[nestedKey(field.key)] as { id: number }[] | undefined) ?? [];
        return arr.map((x) => x.id);
      }
      case 'text':
        if (field.key === 'days') return ((row.days as number[]) ?? []).join(',');
        return row[field.key] ?? '';
      case 'localized':
        return (row[field.key] as Localized) ?? EMPTY_LOC;
      case 'localizedArray':
        return (row[field.key] as Localized[]) ?? [];
      default:
        return row[field.key];
    }
  }
  // Значения по умолчанию для создания.
  switch (field.type) {
    case 'localized':
      return { ...EMPTY_LOC };
    case 'localizedArray':
      return [];
    case 'multiref':
      return [];
    case 'ref':
      return null;
    case 'boolean':
      return field.key === 'isPublished';
    case 'number':
      return 0;
    case 'enum':
      return field.options[0]?.value ?? '';
    default:
      return '';
  }
}

export function EntityForm({
  entity,
  row,
  onClose,
  onSaved,
}: {
  entity: EntityDef;
  row: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Row>({});
  const [options, setOptions] = useState<Record<string, Row[]>>({});
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadKeyRef = useRef<string>('');

  // Инициализация значений формы.
  useEffect(() => {
    const init: Row = {};
    for (const f of entity.fields) init[f.key] = initialValue(f, row);
    setValues(init);
  }, [entity, row]);

  // Загрузка опций для ref/multiref.
  const refKeys = useMemo(
    () =>
      Array.from(
        new Set(
          entity.fields
            .filter((f) => f.type === 'ref' || f.type === 'multiref')
            .map((f) => (f as { ref: string }).ref),
        ),
      ),
    [entity],
  );
  useEffect(() => {
    let active = true;
    Promise.all(
      refKeys.map(async (rk) => {
        const def = ENTITY_MAP[rk];
        if (!def) return [rk, []] as const;
        const list = await api.get<Row[]>(def.endpoint).catch(() => []);
        return [rk, list] as const;
      }),
    ).then((pairs) => {
      if (active) setOptions(Object.fromEntries(pairs));
    });
    return () => {
      active = false;
    };
  }, [refKeys]);

  const set = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  async function onUpload(file: File) {
    try {
      const url = await uploadFile(file);
      set(uploadKeyRef.current, url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка загрузки');
    }
  }

  async function onSave() {
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      // Сборка payload.
      const payload: Row = {};
      for (const f of entity.fields) {
        const val = values[f.key];
        if (f.type === 'number') payload[f.key] = Number(val);
        else if (f.type === 'ref') payload[f.key] = val ? Number(val) : null;
        else if (f.type === 'multiref') continue; // синхронизируется отдельно
        else if (f.type === 'text' && f.key === 'days')
          payload[f.key] = String(val)
            .split(',')
            .map((s) => Number(s.trim()))
            .filter((n) => !Number.isNaN(n));
        else payload[f.key] = val;
      }

      const saved = row
        ? await api.put<{ id: number }>(`${entity.endpoint}/${row.id}`, payload)
        : await api.post<{ id: number }>(entity.endpoint, payload);

      // Синхронизация M:N.
      if (entity.manyRefs) {
        for (const mr of entity.manyRefs) {
          await api.put(mr.syncPath(saved.id), { ids: values[mr.key] ?? [] });
        }
      }
      onSaved();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.fields) setFieldErrors(e.fields);
      } else {
        setError('Ошибка сохранения');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{row ? 'Редактирование' : 'Создание'} · {entity.title}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {entity.fields.map((f) => (
            <FieldInput
              key={f.key}
              field={f}
              value={values[f.key]}
              error={fieldErrors[f.key]}
              options={f.type === 'ref' || f.type === 'multiref' ? options[(f as { ref: string }).ref] ?? [] : []}
              onChange={(v) => set(f.key, v)}
              onUploadClick={() => {
                uploadKeyRef.current = f.key;
                fileRef.current?.click();
              }}
            />
          ))}
        </Stack>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
            e.target.value = '';
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={onSave} disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FieldInput({
  field,
  value,
  error,
  options,
  onChange,
  onUploadClick,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  options: Row[];
  onChange: (v: unknown) => void;
  onUploadClick: () => void;
}) {
  switch (field.type) {
    case 'localized':
      return (
        <LocalizedField
          label={field.label}
          value={value as Localized}
          multiline
          onChange={onChange}
        />
      );
    case 'localizedArray': {
      const items = (value as Localized[]) ?? [];
      return (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {field.label}
          </Typography>
          {items.map((it, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LocalizedField
                  label={`#${i + 1}`}
                  value={it}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = v;
                    onChange(next);
                  }}
                />
              </Box>
              <IconButton onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" onClick={() => onChange([...items, { ru: '', he: '', en: '' }])}>
            + пункт
          </Button>
        </Box>
      );
    }
    case 'text':
      return (
        <TextField
          label={field.label}
          fullWidth
          size="small"
          required={field.required}
          error={!!error}
          helperText={error}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <TextField
          label={field.label}
          type="number"
          fullWidth
          size="small"
          error={!!error}
          helperText={error}
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
      );
    case 'time':
      return (
        <TextField
          label={field.label}
          fullWidth
          size="small"
          placeholder="08:30"
          error={!!error}
          helperText={error}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'boolean':
      return (
        <FormControlLabel
          control={<Switch checked={!!value} onChange={(e) => onChange(e.target.checked)} />}
          label={field.label}
        />
      );
    case 'enum':
      return (
        <FormControl fullWidth size="small" error={!!error}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'ref':
      return (
        <FormControl fullWidth size="small" error={!!error}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            label={field.label}
            value={value == null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          >
            {field.nullable && <MenuItem value="">— не задано —</MenuItem>}
            {options.map((o) => (
              <MenuItem key={String(o.id)} value={String(o.id)}>
                {refLabel(o)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'multiref': {
      const selected = (value as number[]) ?? [];
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{field.label}</InputLabel>
          <Select
            multiple
            label={field.label}
            value={selected.map(String)}
            input={<OutlinedInput label={field.label} />}
            onChange={(e) => {
              const v = e.target.value as string[];
              onChange(v.map(Number));
            }}
            renderValue={(sel) =>
              (sel as string[])
                .map((id) => {
                  const o = options.find((x) => String(x.id) === id);
                  return o ? refLabel(o) : id;
                })
                .join(', ')
            }
          >
            {options.map((o) => (
              <MenuItem key={String(o.id)} value={String(o.id)}>
                <Checkbox checked={selected.map(String).includes(String(o.id))} />
                <ListItemText primary={refLabel(o)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    case 'image':
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {field.label}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${apiBase.replace(/\/api$/, '')}${value as string}`}
                alt=""
                style={{ height: 64, borderRadius: 8 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                нет фото
              </Typography>
            )}
            <Button variant="outlined" size="small" onClick={onUploadClick}>
              Загрузить
            </Button>
            {!!value && (
              <Button size="small" color="inherit" onClick={() => onChange(null)}>
                Убрать
              </Button>
            )}
          </Stack>
        </Box>
      );
    default:
      return null;
  }
}
