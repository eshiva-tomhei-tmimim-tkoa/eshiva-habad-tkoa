import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CONTENT_TAG } from '@/lib/api';

/**
 * On-demand ISR-ревалидация. Вызывается сервером API после сохранения контента
 * в админке. Защищён общим секретом (заголовок x-revalidate-secret или ?secret=).
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.headers.get('x-revalidate-secret') ??
    new URL(request.url).searchParams.get('secret') ??
    '';

  if (!secret || provided !== secret) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Неверный секрет ревалидации' } },
      { status: 401 },
    );
  }

  revalidateTag(CONTENT_TAG);
  return NextResponse.json({ revalidated: true, tag: CONTENT_TAG, now: Date.now() });
}
