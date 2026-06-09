/**
 * Кольцевой буфер последних ошибок API (в памяти) + классификатор.
 *
 * Назначение — диагностическая страница в админке: показать, что за ошибка,
 * почему и как её решать. Буфер живёт в памяти процесса (очищается при
 * перезапуске контейнера) — для оперативной диагностики этого достаточно.
 */

export interface ErrorLogEntry {
  id: number;
  time: string;
  method: string;
  path: string;
  status: number;
  /** Короткий машинный код (UPLOAD_TOO_LARGE, BAD_JSON, INTERNAL…). */
  code: string;
  /** Человекочитаемое сообщение (то же, что ушло клиенту). */
  message: string;
  /** Имя класса исходной ошибки (MulterError, PrismaClientKnownRequestError…). */
  name?: string;
  /** Техническая деталь (err.message) — для разработчика. */
  detail?: string;
}

const MAX_ENTRIES = 200;
const buffer: ErrorLogEntry[] = [];
let seq = 1;

/** Записать ошибку в буфер (новые — в начале списка). */
export function recordError(entry: Omit<ErrorLogEntry, 'id' | 'time'>): void {
  buffer.unshift({ id: seq++, time: new Date().toISOString(), ...entry });
  if (buffer.length > MAX_ENTRIES) buffer.length = MAX_ENTRIES;
}

/** Последние ошибки (от новых к старым). */
export function getErrors(): ErrorLogEntry[] {
  return buffer;
}

/** Очистить буфер. */
export function clearErrors(): void {
  buffer.length = 0;
}

interface Classified {
  status: number;
  code: string;
  message: string;
}

/**
 * Классифицирует ошибку, дошедшую до центрального обработчика, в понятный
 * статус + код + сообщение. Возвращает 500/INTERNAL для всего нераспознанного.
 */
export function classifyError(err: unknown): Classified {
  const e = err as { name?: string; code?: string; type?: string; status?: number; message?: string };

  // Загрузка файлов (multer)
  if (e?.name === 'MulterError') {
    if (e.code === 'LIMIT_FILE_SIZE') {
      return {
        status: 413,
        code: 'UPLOAD_TOO_LARGE',
        message: 'Файл слишком большой. Максимальный размер изображения — 15 МБ.',
      };
    }
    if (e.code === 'LIMIT_UNEXPECTED_FILE') {
      return {
        status: 400,
        code: 'UPLOAD_UNEXPECTED_FIELD',
        message: 'Неожиданное поле файла при загрузке (ожидается поле «file»).',
      };
    }
    return {
      status: 400,
      code: 'UPLOAD_ERROR',
      message: `Ошибка загрузки файла: ${e.message ?? 'неизвестно'}.`,
    };
  }

  // Тело запроса
  if (e?.type === 'entity.too.large' || e?.status === 413) {
    return { status: 413, code: 'BODY_TOO_LARGE', message: 'Тело запроса слишком большое.' };
  }
  if (e?.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in (e as object))) {
    return { status: 400, code: 'BAD_JSON', message: 'Некорректный JSON в теле запроса.' };
  }

  // Prisma (коды вида P2002, P2025…)
  if (typeof e?.code === 'string' && /^P\d{4}$/.test(e.code)) {
    return {
      status: 400,
      code: `DB_${e.code}`,
      message: `Ошибка базы данных (${e.code}).`,
    };
  }

  return { status: 500, code: 'INTERNAL', message: 'Внутренняя ошибка сервера.' };
}
