import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ApiError, ApiSuccess } from '@yeshiva/types';

/** Успешный ответ в едином формате { data, meta }. */
export function sendData<T>(res: Response, data: T, meta?: ApiSuccess<T>['meta']): void {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };
  res.json(body);
}

/** Ответ-ошибка в едином формате { error }. */
export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): void {
  const body: ApiError = { error: fields ? { code, message, fields } : { code, message } };
  res.status(status).json(body);
}

/** Обёртка async-роутов: прокидывает ошибки в error-middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
