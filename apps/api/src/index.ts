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
import { classifyError, recordError } from './lib/errorLog.js';
import { ensureRates } from './lib/fx.js';

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');

app.use(cors({ origin: corsOrigins, credentials: true }));
// Лимит увеличен для массового импорта доноров (commit присылает все строки).
app.use(express.json({ limit: '20mb' }));
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

// Единый обработчик ошибок: классифицируем, пишем в диагностический буфер
// (для страницы «Логи» в админке) и отдаём понятный статус/сообщение.
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { status, code, message } = classifyError(err);
  const e = err as { name?: string; message?: string };
  recordError({
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message,
    name: e?.name,
    detail: e?.message,
  });
  // 5xx — полный стек в консоль; ожидаемые 4xx — короткое предупреждение.
  if (status >= 500) console.error('[api] error:', err);
  else console.warn(`[api] ${code} (${status}): ${e?.message ?? message}`);
  sendError(res, status, code, message);
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}/api`);
  // Прогрев кэша валютных курсов (не блокирует старт).
  void ensureRates();
});
