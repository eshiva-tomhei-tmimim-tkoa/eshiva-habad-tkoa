import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { loginInputSchema } from '@yeshiva/types';
import { prisma } from '../db.js';
import { sendData, sendError, asyncHandler } from '../lib/respond.js';
import { setAuthCookie, clearAuthCookie } from '../lib/auth.js';
import { num } from '../lib/serialize.js';
import { flattenZod } from '../lib/validate.js';

export const authRouter: Router = Router();

// Ограничение попыток входа: 10 за 15 минут на IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 429, 'RATE_LIMIT', 'Слишком много попыток входа, попробуйте позже'),
});

// POST /api/admin/auth/login
authRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Проверьте email и пароль', flattenZod(parsed.error));
      return;
    }
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      sendError(res, 401, 'BAD_CREDENTIALS', 'Неверный email или пароль');
      return;
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    setAuthCookie(res, { sub: num(user.id), email: user.email, role: user.role });
    sendData(res, { id: num(user.id), email: user.email, role: user.role });
  }),
);

// POST /api/admin/auth/logout
authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  sendData(res, { ok: true });
});

// GET /api/admin/me реализован в adminRouter (под общим requireAuth).
