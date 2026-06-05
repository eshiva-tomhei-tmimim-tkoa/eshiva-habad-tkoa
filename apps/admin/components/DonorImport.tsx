'use client';
import { useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Alert,
  MenuItem,
  TextField,
  CircularProgress,
  Table as MTable,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';
import { apiBase } from '../lib/api';

// Целевые поля донора, на которые сопоставляются колонки файла.
const TARGETS = [
  { key: 'name', label: 'Имя', required: true },
  { key: 'amount', label: 'Сумма', required: true },
  { key: 'donatedAt', label: 'Дата', required: true },
  { key: 'externalId', label: 'Внешний ID (дедуп)', required: false },
] as const;

type TargetKey = (typeof TARGETS)[number]['key'];

interface ParseResult {
  sheetName: string;
  headers: string[];
  guess: Record<string, string | null>;
  rows: Record<string, unknown>[];
  totalRows: number;
}

interface Campaign {
  id: number;
  title: { ru: string; he: string; en: string };
  currency: string;
  isActive: boolean;
}

interface CommitResult {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
}

/** "₪1,800.00" / "1.800,00" / "300 ILS" → число. Возвращает NaN, если не число. */
function parseAmount(v: unknown): number {
  if (typeof v === 'number') return v;
  if (v == null) return NaN;
  let s = String(v).trim().replace(/[^\d.,-]/g, '');
  if (!s) return NaN;
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    // Десятичный разделитель — тот, что правее.
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (hasComma) {
    // Одна запятая с 1–2 цифрами после — десятичная; иначе разделитель тысяч.
    s = /,\d{1,2}$/.test(s) ? s.replace(',', '.') : s.replace(/,/g, '');
  }
  return parseFloat(s);
}

/** Разные форматы даты → ISO YYYY-MM-DD. null, если не распознано. */
function parseDate(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  // ISO или то, что понимает Date.
  const direct = new Date(s);
  if (!isNaN(direct.getTime()) && /\d{4}/.test(s)) return direct.toISOString().slice(0, 10);
  // DD/MM/YYYY или DD.MM.YYYY (европейский/российский формат).
  const m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y!.length === 2 ? `20${y}` : y;
    const iso = `${year}-${mo!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return iso;
  }
  return null;
}

export function DonorImport({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState<number | ''>('');
  const [mapping, setMapping] = useState<Record<TargetKey, string>>({
    name: '',
    amount: '',
    donatedAt: '',
    externalId: '',
  });

  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setResult(null);
    setParsing(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const [pRes, cRes] = await Promise.all([
        fetch(`${apiBase}/admin/donors/import/parse`, {
          method: 'POST',
          credentials: 'include',
          body: form,
        }),
        fetch(`${apiBase}/admin/campaigns`, { credentials: 'include' }),
      ]);
      const pJson = await pRes.json().catch(() => null);
      if (!pRes.ok) throw new Error(pJson?.error?.message ?? 'Не удалось разобрать файл');
      const data = pJson.data as ParseResult;
      setParsed(data);
      setMapping({
        name: data.guess.name ?? '',
        amount: data.guess.amount ?? '',
        donatedAt: data.guess.donatedAt ?? '',
        externalId: data.guess.externalId ?? '',
      });
      const cJson = await cRes.json().catch(() => null);
      const list = (cJson?.data as Campaign[]) ?? [];
      setCampaigns(list);
      const active = list.find((c) => c.isActive) ?? list[0];
      if (active) setCampaignId(active.id);
    } catch (err) {
      setError((err as Error).message);
      setParsed(null);
    } finally {
      setParsing(false);
    }
  }

  // Построить нормализованные строки + статистику пропусков (на клиенте).
  const prepared = useMemo(() => {
    if (!parsed) return { donors: [], invalid: 0 };
    const donors: {
      name: string;
      amount: number;
      donatedAt: string;
      externalId?: string;
    }[] = [];
    let invalid = 0;
    for (const row of parsed.rows) {
      const name = mapping.name ? String(row[mapping.name] ?? '').trim() : '';
      const amount = mapping.amount ? parseAmount(row[mapping.amount]) : NaN;
      const donatedAt = mapping.donatedAt ? parseDate(row[mapping.donatedAt]) : null;
      const externalId =
        mapping.externalId && row[mapping.externalId] != null
          ? String(row[mapping.externalId]).trim().slice(0, 64)
          : undefined;
      if (!name || !(amount > 0) || !donatedAt) {
        invalid += 1;
        continue;
      }
      donors.push({ name, amount, donatedAt, ...(externalId ? { externalId } : {}) });
    }
    return { donors, invalid };
  }, [parsed, mapping]);

  const canImport =
    !!parsed && mapping.name && mapping.amount && mapping.donatedAt && campaignId !== '' && prepared.donors.length > 0;

  async function commit() {
    if (!canImport) return;
    setCommitting(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/admin/donors/import/commit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, donors: prepared.donors }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Ошибка импорта');
      setResult(json.data as CommitResult);
      onImported();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCommitting(false);
    }
  }

  const previewRows = parsed?.rows.slice(0, 8) ?? [];

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Импорт доноров из Excel / Wix</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {result ? (
          <Alert severity="success">
            Импорт завершён: добавлено <b>{result.inserted}</b>, обновлено <b>{result.updated}</b>,
            пропущено дублей <b>{result.skipped}</b> (из {result.total}).
          </Alert>
        ) : (
          <Stack spacing={2}>
            {/* Шаг 1 — файл */}
            <Box>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={onFile}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" onClick={() => fileRef.current?.click()} disabled={parsing}>
                  Выбрать файл (.xlsx / .xls / .csv)
                </Button>
                {parsing && <CircularProgress size={20} />}
                {fileName && (
                  <Typography variant="body2" color="text.secondary">
                    {fileName}
                    {parsed ? ` · строк: ${parsed.totalRows}` : ''}
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Поддерживаются выгрузки из Wix и любые таблицы — колонки сопоставляются вручную ниже.
              </Typography>
            </Box>

            {parsed && (
              <>
                {/* Шаг 2 — кампания + сопоставление колонок */}
                <TextField
                  select
                  label="Кампания (куда импортировать)"
                  value={campaignId}
                  onChange={(e) => setCampaignId(Number(e.target.value))}
                  size="small"
                  sx={{ maxWidth: 420 }}
                >
                  {campaigns.length === 0 && <MenuItem value="">Нет кампаний</MenuItem>}
                  {campaigns.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.title.ru} {c.isActive ? '· активная' : ''}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="subtitle2">Сопоставление колонок</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {TARGETS.map((t) => (
                    <TextField
                      key={t.key}
                      select
                      label={t.required ? `${t.label} *` : t.label}
                      value={mapping[t.key]}
                      onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                      size="small"
                      sx={{ minWidth: 220 }}
                      error={t.required && !mapping[t.key]}
                    >
                      <MenuItem value="">— не задано —</MenuItem>
                      {parsed.headers.map((h) => (
                        <MenuItem key={h} value={h}>
                          {h}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                </Stack>

                <Alert severity={prepared.invalid > 0 ? 'warning' : 'info'}>
                  К импорту готово строк: <b>{prepared.donors.length}</b>
                  {prepared.invalid > 0 && (
                    <> · будет пропущено (нет имени/суммы/даты): <b>{prepared.invalid}</b></>
                  )}
                </Alert>

                {/* Превью */}
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
                  <MTable size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {parsed.headers.map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewRows.map((row, i) => (
                        <TableRow key={i}>
                          {parsed.headers.map((h) => (
                            <TableCell key={h} sx={{ whiteSpace: 'nowrap' }}>
                              {row[h] == null ? '' : String(row[h])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </MTable>
                </TableContainer>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{result ? 'Закрыть' : 'Отмена'}</Button>
        {!result && (
          <Button variant="contained" onClick={commit} disabled={!canImport || committing}>
            {committing ? 'Импорт…' : `Импортировать (${prepared.donors.length})`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
