import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { ApiSuccess } from '@yeshiva/types';

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Этап 0: health-check. Публичные GET-роуты и admin CRUD — этапы 2–3.
app.get('/api/health', (_req, res) => {
  const payload: ApiSuccess<{ status: string; service: string; time: string }> = {
    data: { status: 'ok', service: 'yeshiva-api', time: new Date().toISOString() },
  };
  res.json(payload);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}/api`);
});
