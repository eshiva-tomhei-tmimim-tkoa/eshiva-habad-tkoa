/**
 * Общие типы монорепо — единый контракт между Express (api) и Next (web/admin).
 *
 * Этап 0: заглушки-наброски по контент-модели (CONTEXT §7 / ARCHITECTURE §2).
 * Этап 1: будут дополнены полями и zod-схемами валидации.
 */

/** Мультиязычное текстовое поле. Хранится в БД как JSON. */
export interface Localized {
  ru: string;
  he: string;
  en: string;
}

/** Категории блоков распорядка дня. */
export type DailyCategory = 'prayer' | 'study' | 'meal' | 'spirit' | 'personal';

/** Номер дня недели: 0 = Вс … 6 = Сб. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Роль пользователя админки. */
export type UserRole = 'admin' | 'editor';

/** Базовые поля контентных сущностей. */
export interface BaseEntity {
  id: number;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Должность (справочник): Рош Ешива, Шлиах, Мадрих… */
export interface Position {
  id: number;
  title: Localized;
  sortOrder: number;
}

/** Человек / член команды (people). */
export interface Person extends BaseEntity {
  name: Localized;
  positionId: number;
  bio: Localized;
  photoUrl: string | null;
}

/** Предмет Торы (subjects): Талмуд, Алоха, Хасидут… */
export interface Subject extends BaseEntity {
  code: string;
  title: Localized;
  hours: string;
  color: string;
  items: Localized[];
  leadPersonId: number | null;
}

/** Профессиональный курс (courses). */
export interface Course {
  id: number;
  title: Localized;
  description: Localized | null;
  provider: string | null;
  isPublished: boolean;
}

/** История ученика (students). */
export interface Student extends BaseEntity {
  name: Localized;
  quote: Localized;
  teacherId: number | null;
  story: Localized;
  duration: string;
  photoUrl: string | null;
}

/** Блок распорядка дня (daily_blocks). */
export interface DailyBlock {
  id: number;
  time: string;
  title: Localized;
  category: DailyCategory;
  description: Localized;
  sortOrder: number;
}

/** Слот расписания (schedule_slots). */
export interface ScheduleSlot {
  id: number;
  subjectId: number;
  personId: number;
  days: Weekday[];
  startTime: string;
  endTime: string;
}

/** Кампания пожертвований (campaign). */
export interface Campaign {
  id: number;
  title: Localized;
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  endsAt: string | null;
  isActive: boolean;
}

/** Донор кампании (donors). */
export interface Donor {
  id: number;
  campaignId: number;
  name: string;
  amount: number;
  donatedAt: string;
  isAnonymous: boolean;
}

/** Заявка с формы контактов (contact_messages). */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/** Произвольный редактируемый текст страницы (site_content). */
export interface SiteContent {
  id: number;
  contentKey: string;
  value: Localized;
  pageGroup: string;
}

/** Пользователь админки (users). */
export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

/** Единый успешный ответ API. */
export interface ApiSuccess<T> {
  data: T;
  meta?: { count?: number };
}

/** Единый ответ-ошибка API. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
