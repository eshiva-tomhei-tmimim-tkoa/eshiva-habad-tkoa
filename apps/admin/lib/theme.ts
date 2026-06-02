'use client';
import { createTheme } from '@mui/material/styles';

// Палитра electric (CONTEXT §6) — админка в light-режиме.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2547d6' },
    secondary: { main: '#b88419' },
    background: { default: '#fafbff' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
  },
});
