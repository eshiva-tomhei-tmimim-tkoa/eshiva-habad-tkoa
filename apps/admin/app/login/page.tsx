'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { api, ApiError } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/admin/auth/login', { email, password });
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка входа');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper sx={{ p: 4, width: 360, maxWidth: '100%' }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Вход в админку
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ешива «ХаБаД Ткоа»
        </Typography>
        <form onSubmit={onSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={busy}>
            {busy ? 'Вход…' : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
