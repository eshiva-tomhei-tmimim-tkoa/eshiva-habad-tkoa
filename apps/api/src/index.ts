import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { ApiSuccess } from '@yeshiva/types';
import { publicRouter } from './routes/public.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { sendError } from './lib/respond.js';

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Загруженные фото (этап 3: admin upload).
app.use('/uploads', express.static(uploadDir));

// Health-check.
app.get('/api/health', (_req, res) => {
  const payload: ApiSuccess<{ status: string; service: string; time: string }> = {
    data: { status: 'ok', service: 'yeshiva-api', time: new Date().toISOString() },
  };
  res.json(payload);
});

// Авторизация админки.
app.use('/api/admin/auth', authRouter);
// Защищённый CRUD админки.
app.use('/api/admin', adminRouter);
// Публичные роуты (чтение для сайта + формы).
app.use('/api', publicRouter);

// 404 для неизвестных /api/*.
app.use('/api', (_req, res) => {
  sendError(res, 404, 'NOT_FOUND', 'Маршрут не найден');
});

// Единый обработчик ошибок.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[api] error:', err);
  sendError(res, 500, 'INTERNAL', 'Внутренняя ошибка сервера');
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}/api`);
});
