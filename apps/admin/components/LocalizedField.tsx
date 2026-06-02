'use client';
import { Box, TextField, Typography } from '@mui/material';
import type { Localized } from '@yeshiva/types';

const EMPTY: Localized = { ru: '', he: '', en: '' };

export function LocalizedField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Localized | undefined;
  onChange: (v: Localized) => void;
  multiline?: boolean;
}) {
  const v = value ?? EMPTY;
  const set = (locale: keyof Localized, text: string) => onChange({ ...v, [locale]: text });
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mt: 0.5 }}>
        <TextField
          label="RU"
          size="small"
          fullWidth
          multiline={multiline}
          value={v.ru}
          onChange={(e) => set('ru', e.target.value)}
        />
        <TextField
          label="HE"
          size="small"
          fullWidth
          multiline={multiline}
          dir="rtl"
          value={v.he}
          onChange={(e) => set('he', e.target.value)}
        />
        <TextField
          label="EN"
          size="small"
          fullWidth
          multiline={multiline}
          value={v.en}
          onChange={(e) => set('en', e.target.value)}
        />
      </Box>
    </Box>
  );
}
