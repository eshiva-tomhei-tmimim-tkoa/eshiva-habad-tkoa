import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@yeshiva/types';
import { sendError } from './respond.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const COOKIE_NAME = 'yeshiva_token';
const TOKEN_TTL = '7d';

export interface AuthPayload {
  sub: number;
  email: string;
  role: UserRole;
}

/** Расширяем Request полем user (заполняется requireAuth). */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/** Подписать JWT и положить в httpOnly-cookie. */
export function setAuthCookie(res: Response, payload: AuthPayload): void {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

/** Удалить cookie авторизации. */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/** Middleware: требует валидный токен; кладёт payload в req.user. */
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[COOKIE_NAME];
  if (!token) {
    sendError(res, 401, 'UNAUTHORIZED', 'Требуется авторизация');
    return;
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
    next();
  } catch {
    sendError(res, 401, 'UNAUTHORIZED', 'Недействительный токен');
  }
};

/** Middleware-фабрика: требует одну из ролей. */
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 403, 'FORBIDDEN', 'Недостаточно прав');
      return;
    }
    next();
  };
