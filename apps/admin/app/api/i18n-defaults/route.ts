/**
 * GET /api/i18n-defaults — отдаёт исходные словари переводов из `apps/web/messages`.
 * Нужен странице `/admin/translations`, чтобы показать значения по умолчанию
 * рядом с полем override. Файлы лежат на том же томе (Docker app_workspace),
 * поэтому читаем их напрямую с диска.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LOCALES = ['ru', 'he', 'en'] as const;

/** Путь к web/messages. В контейнере: /app/apps/web/messages. */
function messagesDir(): string {
  // process.cwd() в admin внутри pnpm dev указывает на apps/admin.
  return path.resolve(process.cwd(), '..', 'web', 'messages');
}

export async function GET() {
  const dir = messagesDir();
  const out: Record<string, unknown> = {};
  try {
    for (const locale of LOCALES) {
      const file = path.join(dir, `${locale}.json`);
      const raw = await fs.readFile(file, 'utf-8');
      out[locale] = JSON.parse(raw);
    }
    return NextResponse.json({ data: out });
  } catch (e) {
    return NextResponse.json(
      { error: { code: 'READ_FAILED', message: (e as Error).message } },
      { status: 500 },
    );
  }
}
