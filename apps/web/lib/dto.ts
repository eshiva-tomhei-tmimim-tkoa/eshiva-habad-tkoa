import type { Localized } from '@yeshiva/types';

export interface TeamMember {
  id: number;
  name: Localized;
  bio: Localized;
  photoUrl: string | null;
  position: { id: number; title: Localized };
  subjects: { id: number; code: string; title: Localized }[];
}

export interface SubjectDto {
  id: number;
  code: string;
  title: Localized;
  hours: string;
  color: string;
  items: Localized[];
  leadPerson: { id: number; name: Localized } | null;
}

export interface StudentDto {
  id: number;
  name: Localized;
  quote: Localized;
  story: Localized;
  duration: string;
  photoUrl: string | null;
  teacher: { id: number; name: Localized } | null;
  courses: { id: number; title: Localized }[];
}

export interface DailyBlockDto {
  id: number;
  time: string;
  title: Localized;
  category: 'prayer' | 'study' | 'meal' | 'spirit' | 'personal';
  description: Localized;
}

export interface ScheduleSlotDto {
  id: number;
  days: number[];
  startTime: string;
  endTime: string;
  subject: { id: number; code: string; title: Localized; color: string };
  person: { id: number; name: Localized };
}

export interface CampaignDto {
  id: number;
  title: Localized;
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  donorsCount: number;
  donors: {
    id: number;
    name: string;
    amount: number;
    currency: string;
    amountIls: number | null;
    donatedAt: string;
  }[];
}

export const CATEGORY_LABELS: Record<DailyBlockDto['category'], string> = {
  prayer: 'Молитва',
  study: 'Изучение',
  meal: 'Трапеза',
  spirit: 'Духовное',
  personal: 'Личное',
};

export const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
