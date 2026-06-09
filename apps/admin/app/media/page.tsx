'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { DashboardShell } from '../../components/DashboardShell';
import { api, uploadFile, uploadVideo, mediaSrc } from '../../lib/api';
import { MEDIA_SLOTS, type MediaSlotDef } from '../../lib/media-catalog';

type Kind = 'image' | 'video';
interface MediaRow {
  slug: string;
  kind: Kind;
  url: string;
  poster: string | null;
}
interface SlotState {
  kind: Kind;
  url: string;
  poster: string;
}

export default function MediaPage() {
  const [initial, setInitial] = useState<Record<string, SlotState> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<MediaRow[]>('/admin/media')
      .then((rows) => {
        const map: Record<string, SlotState> = {};
        for (const r of rows) map[r.slug] = { kind: r.kind, url: r.url, poster: r.poster ?? '' };
        setInitial(map);
      })
      .catch((e) => setError((e as Error).message ?? 'Ошибка загрузки'));
  }, []);

  return (
    <DashboardShell>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Медиа сайта
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        Для каждого блока выберите, что показывать — фото или видео. Видео можно добавить ссылкой
        (YouTube / Vimeo / прямой mp4) или загрузить файлом. Пустой слот показывает заглушку
        по умолчанию.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!initial ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 760 }}>
          {MEDIA_SLOTS.map((def) => (
            <SlotCard
              key={def.slug}
              def={def}
              initial={initial[def.slug] ?? { kind: 'image', url: '', poster: '' }}
            />
          ))}
        </Stack>
      )}
    </DashboardShell>
  );
}

function SlotCard({ def, initial }: { def: MediaSlotDef; initial: SlotState }) {
  const [kind, setKind] = useState<Kind>(initial.kind);
  const [url, setUrl] = useState(initial.url);
  const [poster, setPoster] = useState(initial.poster);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg({ t: 'err', m: (e as Error).message ?? 'Ошибка' });
    } finally {
      setBusy(false);
    }
  }

  const onPickImage = (f?: File) => f && withBusy(async () => setUrl(await uploadFile(f)));
  const onPickVideo = (f?: File) => f && withBusy(async () => setUrl(await uploadVideo(f)));
  const onPickPoster = (f?: File) => f && withBusy(async () => setPoster(await uploadFile(f)));

  const save = () =>
    withBusy(async () => {
      if (!url.trim()) {
        setMsg({ t: 'err', m: kind === 'image' ? 'Загрузите фото' : 'Укажите ссылку или загрузите видео' });
        return;
      }
      await api.put(`/admin/media/${encodeURIComponent(def.slug)}`, {
        kind,
        url: url.trim(),
        poster: poster.trim() || undefined,
      });
      setMsg({ t: 'ok', m: 'Сохранено' });
    });

  const clear = () =>
    withBusy(async () => {
      await api.del(`/admin/media/${encodeURIComponent(def.slug)}`);
      setUrl('');
      setPoster('');
      setKind('image');
      setMsg({ t: 'ok', m: 'Слот очищен — показывается заглушка по умолчанию' });
    });

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{def.title}</Typography>
        {def.help && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {def.help}
          </Typography>
        )}

        <ToggleButtonGroup
          exclusive
          size="small"
          value={kind}
          onChange={(_e, v) => v && setKind(v as Kind)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="image">Фото</ToggleButton>
          <ToggleButton value="video">Видео</ToggleButton>
        </ToggleButtonGroup>

        {kind === 'image' ? (
          <Stack spacing={1.5}>
            <Button variant="outlined" disabled={busy} onClick={() => imageRef.current?.click()}>
              Загрузить фото
            </Button>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaSrc(url)}
                alt=""
                style={{ maxHeight: 220, borderRadius: 8, objectFit: 'cover' }}
              />
            )}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <TextField
              label="Ссылка на видео (YouTube / Vimeo / mp4)"
              size="small"
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/…"
            />
            <Box>
              <Button variant="outlined" disabled={busy} onClick={() => videoRef.current?.click()}>
                …или загрузить видео-файл
              </Button>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => onPickVideo(e.target.files?.[0])}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="text" disabled={busy} onClick={() => posterRef.current?.click()}>
                Постер (превью)
              </Button>
              <input
                ref={posterRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onPickPoster(e.target.files?.[0])}
              />
              {poster && (
                <Link href={mediaSrc(poster)} target="_blank" rel="noopener" variant="caption">
                  постер загружен
                </Link>
              )}
            </Box>
            {url && (
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                Текущее видео: {url}
              </Typography>
            )}
          </Stack>
        )}

        {msg && (
          <Alert severity={msg.t === 'ok' ? 'success' : 'error'} sx={{ mt: 2 }} onClose={() => setMsg(null)}>
            {msg.m}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" disabled={busy} onClick={save}>
            Сохранить
          </Button>
          <Button variant="outlined" color="error" disabled={busy} onClick={clear}>
            Очистить
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
