'use client';
import { useEffect, useState } from 'react';
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
import type { Localized, Organization, OrganizationInput } from '@yeshiva/types';
import { DashboardShell } from '../../components/DashboardShell';
import { LocalizedField } from '../../components/LocalizedField';
import { api } from '../../lib/api';

const EMPTY_LOC: Localized = { ru: '', he: '', en: '' };

type State = OrganizationInput;

const EMPTY: State = {
  brandName: EMPTY_LOC,
  brandSub: '',
  yechiText: '',
  address: EMPTY_LOC,
  phoneMain: '',
  phoneSecondary: '',
  email: '',
  mapLat: 0,
  mapLng: 0,
  hoursWeekday: '',
  hoursFriday: EMPTY_LOC,
  hoursShabbat: EMPTY_LOC,
  legalStatus: '',
  copyrightSuffix: EMPTY_LOC,
};

export default function OrganizationPage() {
  const [state, setState] = useState<State>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    api
      .get<Organization>('/admin/organization')
      .then((org) =>
        setState({
          brandName: org.brandName,
          brandSub: org.brandSub,
          yechiText: org.yechiText,
          address: org.address,
          phoneMain: org.phoneMain,
          phoneSecondary: org.phoneSecondary ?? '',
          email: org.email,
          mapLat: org.mapLat,
          mapLng: org.mapLng,
          hoursWeekday: org.hoursWeekday,
          hoursFriday: org.hoursFriday,
          hoursShabbat: org.hoursShabbat,
          legalStatus: org.legalStatus,
          copyrightSuffix: org.copyrightSuffix,
        }),
      )
      .catch((e) => setError((e as Error).message ?? 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setOk(false);
  }

  async function save() {
    setSaving(true);
    setError('');
    setOk(false);
    try {
      await api.put<Organization>('/admin/organization', {
        ...state,
        phoneSecondary: state.phoneSecondary?.trim() ? state.phoneSecondary : null,
      });
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
        Реквизиты ешивы
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Бренд, контакты и реквизиты, которые показываются в шапке, подвале и на странице
        «Контакты». Изменения применяются на сайт после ревалидации (обычно сразу).
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
          <Section title="Бренд">
            <LocalizedField
              label="Название (на разных языках)"
              value={state.brandName}
              onChange={(v) => set('brandName', v)}
            />
            <TextField
              label="Подзаголовок"
              size="small"
              fullWidth
              value={state.brandSub}
              onChange={(e) => set('brandSub', e.target.value)}
              helperText="Например: Yeshiva · Tkoa · IL"
            />
            <TextField
              label="Текст «Yechi» (баннер в шапке)"
              size="small"
              fullWidth
              multiline
              minRows={2}
              dir="rtl"
              value={state.yechiText}
              onChange={(e) => set('yechiText', e.target.value)}
            />
          </Section>

          <Section title="Адрес и контакты">
            <LocalizedField
              label="Адрес"
              value={state.address}
              onChange={(v) => set('address', v)}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Основной телефон"
                size="small"
                value={state.phoneMain}
                onChange={(e) => set('phoneMain', e.target.value)}
              />
              <TextField
                label="Дополнительный телефон"
                size="small"
                value={state.phoneSecondary ?? ''}
                onChange={(e) => set('phoneSecondary', e.target.value)}
                helperText="Оставьте пустым, если только один номер"
              />
            </Box>
            <TextField
              label="Email"
              size="small"
              fullWidth
              type="email"
              value={state.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Section>

          <Section title="Координаты карты">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Широта (lat)"
                size="small"
                type="number"
                inputProps={{ step: 0.0001 }}
                value={state.mapLat}
                onChange={(e) => set('mapLat', Number(e.target.value))}
              />
              <TextField
                label="Долгота (lng)"
                size="small"
                type="number"
                inputProps={{ step: 0.0001 }}
                value={state.mapLng}
                onChange={(e) => set('mapLng', Number(e.target.value))}
              />
            </Box>
          </Section>

          <Section title="Часы работы">
            <TextField
              label="Будни (Вс–Чт)"
              size="small"
              fullWidth
              value={state.hoursWeekday}
              onChange={(e) => set('hoursWeekday', e.target.value)}
              helperText="Например: 08:00 – 18:00"
            />
            <LocalizedField
              label="Пятница"
              value={state.hoursFriday}
              onChange={(v) => set('hoursFriday', v)}
            />
            <LocalizedField
              label="Шаббат"
              value={state.hoursShabbat}
              onChange={(v) => set('hoursShabbat', v)}
            />
          </Section>

          <Section title="Юридическое и копирайт">
            <TextField
              label="Юридический статус"
              size="small"
              fullWidth
              value={state.legalStatus}
              onChange={(e) => set('legalStatus', e.target.value)}
              helperText="Например: 501(c)(3)"
            />
            <LocalizedField
              label="Подпись копирайта"
              value={state.copyrightSuffix}
              onChange={(v) => set('copyrightSuffix', v)}
            />
          </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}
