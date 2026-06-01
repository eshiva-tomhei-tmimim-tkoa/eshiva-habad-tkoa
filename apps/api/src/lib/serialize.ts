import type { Prisma } from '@prisma/client';
import type { Localized } from '@yeshiva/types';

/** BigInt PK → number (наш объём заведомо в пределах Number). */
export const num = (v: bigint): number => Number(v);

/** Prisma Decimal → number. */
export const dec = (v: Prisma.Decimal): number => v.toNumber();

/** JSON-поле БД → Localized (тексты хранятся как { ru, he, en }). */
export const loc = (v: Prisma.JsonValue): Localized => v as unknown as Localized;

/** JSON-массив Localized (например subjects.items). */
export const locArray = (v: Prisma.JsonValue): Localized[] => v as unknown as Localized[];

/** JSON-массив номеров дней (schedule_slots.days). */
export const dayArray = (v: Prisma.JsonValue): number[] => v as unknown as number[];

/** Колонка TIME (Prisma отдаёт Date с временем в UTC) → "HH:MM". */
export const timeHHMM = (d: Date): string => {
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};
