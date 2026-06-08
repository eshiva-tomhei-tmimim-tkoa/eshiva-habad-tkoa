'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { api, ApiError } from '../lib/api';
import { ENTITIES, STANDALONE_PAGES } from '../lib/entities';

const DRAWER_WIDTH = 240;

interface Me {
  email: string;
  role: string;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Me>('/admin/me')
      .then((u) => setMe(u))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await api.post('/admin/auth/logout').catch(() => {});
    router.replace('/login');
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!me) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Ешива «ХаБаД Ткоа» — админка
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.85 }}>
            {me.email} · {me.role}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton selected={pathname === '/'} onClick={() => router.push('/')}>
              <ListItemText primary="Обзор" />
            </ListItemButton>
            <Divider />
            {ENTITIES.map((e) => (
              <ListItemButton
                key={e.key}
                selected={pathname === `/${e.key}`}
                onClick={() => router.push(`/${e.key}`)}
              >
                <ListItemText primary={e.title} />
              </ListItemButton>
            ))}
            <Divider />
            {STANDALONE_PAGES.map((p) => (
              <ListItemButton
                key={p.key}
                selected={pathname === p.href}
                onClick={() => router.push(p.href)}
              >
                <ListItemText primary={p.title} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
