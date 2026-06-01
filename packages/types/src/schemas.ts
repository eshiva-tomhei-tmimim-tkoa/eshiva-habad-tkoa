/**
 * Zod-схемы валидации входных данных API.
 * Источник правды для форм (web) и валидации запросов (Express).
 */
import { z } from 'zod';

/** Мультиязычное поле: ru обязателен, he/en можно дозаполнить позже. */
export const localizedSchema = z.object({
  ru: z.string().min(1),
  he: z.string().default(''),
  en: z.string().default(''),
});

export const dailyCategorySchema = z.enum(['prayer', 'study', 'meal', 'spirit', 'personal']);
export const weekdaySchema = z.number().int().min(0).max(6);
export const userRoleSchema = z.enum(['admin', 'editor']);

/** Время в формате HH:MM (24ч). */
export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ожидается время в формате HH:MM');

// ---------- Публичные формы ----------

/** POST /api/contact */
export const contactInputSchema = z.object({
  name: z.string().min(1).max(128),
  email: z.string().email().max(255),
  phone: z.string().max(32).optional(),
  message: z.string().min(1).max(5000),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

/** POST /api/donations */
export const donationInputSchema = z.object({
  campaignId: z.number().int().positive(),
  amount: z.number().positive(),
  name: z.string().max(128).optional(),
  isAnonymous: z.boolean().default(false),
  recurring: z.boolean().default(false),
});
export type DonationInput = z.infer<typeof donationInputSchema>;

// ---------- Авторизация ----------

/** POST /api/admin/auth/login */
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

// ---------- Сущности контента (admin CRUD) ----------

export const personInputSchema = z.object({
  name: localizedSchema,
  positionId: z.number().int().positive(),
  bio: localizedSchema,
  photoUrl: z.string().max(512).nullable().optional(),
  subjectIds: z.array(z.number().int().positive()).default([]),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
export type PersonInput = z.infer<typeof personInputSchema>;

export const subjectInputSchema = z.object({
  code: z.string().min(1).max(8),
  title: localizedSchema,
  hours: z.string().max(32),
  color: z.string().max(32),
  items: z.array(localizedSchema).default([]),
  leadPersonId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
export type SubjectInput = z.infer<typeof subjectInputSchema>;

export const studentInputSchema = z.object({
  name: localizedSchema,
  quote: localizedSchema,
  teacherId: z.number().int().positive().nullable().optional(),
  story: localizedSchema,
  duration: z.string().max(32),
  photoUrl: z.string().max(512).nullable().optional(),
  courseIds: z.array(z.number().int().positive()).default([]),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
export type StudentInput = z.infer<typeof studentInputSchema>;

export const scheduleSlotInputSchema = z.object({
  subjectId: z.number().int().positive(),
  personId: z.number().int().positive(),
  days: z.array(weekdaySchema).min(1),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
});
export type ScheduleSlotInput = z.infer<typeof scheduleSlotInputSchema>;
