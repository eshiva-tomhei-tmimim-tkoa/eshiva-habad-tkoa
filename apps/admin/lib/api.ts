'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface ApiErrorShape {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, body: ApiErrorShape) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
}

/** Базовый fetch к API: cookie-сессия (credentials), единый разбор { data } / { error }. */
async function request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    credentials: 'include',
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json?.error as ApiErrorShape) ?? { code: 'UNKNOWN', message: `HTTP ${res.status}` };
    throw new ApiError(res.status, err);
  }
  return json?.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** Загрузка файла (multipart) → { photoUrl }. */
export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json?.error as ApiErrorShape) ?? { code: 'UNKNOWN', message: `HTTP ${res.status}` };
    throw new ApiError(res.status, err);
  }
  return (json.data as { photoUrl: string }).photoUrl;
}

/** Загрузка видео или фото (большой лимит) для медиа-слотов → { url }. */
export async function uploadVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/admin/upload/video`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json?.error as ApiErrorShape) ?? { code: 'UNKNOWN', message: `HTTP ${res.status}` };
    throw new ApiError(res.status, err);
  }
  return (json.data as { url: string }).url;
}

export const apiBase = API_URL;

/** URL медиа в админке: внешние — как есть, /uploads/… — абсолютным к API. */
export const mediaSrc = (url: string | null | undefined): string =>
  !url ? '' : /^https?:\/\//i.test(url) ? url : `${API_URL.replace(/\/api$/, '')}${url}`;
