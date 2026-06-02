'use client';
import { Box, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '../components/DashboardShell';
import { ENTITIES } from '../lib/entities';

export default function DashboardHome() {
  const router = useRouter();
  return (
    <DashboardShell>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Обзор
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Управление контентом сайта. Выберите раздел.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        }}
      >
        {ENTITIES.map((e) => (
          <Card key={e.key}>
            <CardActionArea onClick={() => router.push(`/${e.key}`)}>
              <CardContent>
                <Typography variant="h6">{e.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.endpoint}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </DashboardShell>
  );
}
