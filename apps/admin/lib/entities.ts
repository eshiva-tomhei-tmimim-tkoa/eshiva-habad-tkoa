import type { Localized } from '@yeshiva/types';

/** Описание поля формы. */
export type FieldDef =
  | { type: 'text'; key: string; label: string; required?: boolean }
  | { type: 'localized'; key: string; label: string }
  | { type: 'localizedArray'; key: string; label: string }
  | { type: 'number'; key: string; label: string }
  | { type: 'boolean'; key: string; label: string }
  | { type: 'time'; key: string; label: string }
  | { type: 'image'; key: string; label: string }
  | { type: 'enum'; key: string; label: string; options: { value: string; label: string }[] }
  | { type: 'ref'; key: string; label: string; ref: string; nullable?: boolean }
  | { type: 'multiref'; key: string; label: string; ref: string; syncPath: string };

export interface ColumnDef {
  field: string;
  header: string;
  /** Достать отображаемое значение из строки. */
  value: (row: Record<string, unknown>) => string;
  width?: number;
}

export interface EntityDef {
  key: string; // сегмент маршрута и ключ в карте
  title: string; // заголовок в навигации
  endpoint: string; // CRUD-эндпоинт, напр. /admin/team
  columns: ColumnDef[];
  fields: FieldDef[];
  reorderable?: boolean;
  /** Поля M:N, синхронизируемые отдельным PUT после сохранения записи. */
  manyRefs?: { key: string; syncPath: (id: number) => string }[];
}

const ru = (v: unknown): string => (v as Localized | undefined)?.ru ?? '';

const DAILY_CATEGORIES = [
  { value: 'prayer', label: 'Молитва' },
  { value: 'study', label: 'Изучение' },
  { value: 'meal', label: 'Трапеза' },
  { value: 'spirit', label: 'Духовное' },
  { value: 'personal', label: 'Личное' },
];

export const ENTITIES: EntityDef[] = [
  {
    key: 'team',
    title: 'Команда',
    endpoint: '/admin/team',
    reorderable: true,
    manyRefs: [{ key: 'subjectIds', syncPath: (id) => `/admin/team/${id}/subjects` }],
    columns: [
      { field: 'name', header: 'Имя', value: (r) => ru(r.name), width: 220 },
      {
        field: 'position',
        header: 'Должность',
        value: (r) => ru((r.position as { title?: Localized } | undefined)?.title),
        width: 180,
      },
      {
        field: 'subjects',
        header: 'Предметы',
        value: (r) => ((r.subjects as { code: string }[]) ?? []).map((s) => s.code).join(', '),
        width: 160,
      },
      { field: 'isPublished', header: 'Публ.', value: (r) => (r.isPublished ? 'да' : 'нет'), width: 80 },
    ],
    fields: [
      { type: 'localized', key: 'name', label: 'Имя' },
      { type: 'ref', key: 'positionId', label: 'Должность', ref: 'positions' },
      { type: 'localized', key: 'bio', label: 'Биография' },
      { type: 'multiref', key: 'subjectIds', label: 'Предметы', ref: 'subjects', syncPath: 'subjects' },
      { type: 'image', key: 'photoUrl', label: 'Фото' },
      { type: 'number', key: 'sortOrder', label: 'Порядок' },
      { type: 'boolean', key: 'isPublished', label: 'Опубликовано' },
    ],
  },
  {
    key: 'positions',
    title: 'Должности',
    endpoint: '/admin/positions',
    reorderable: true,
    columns: [
      { field: 'title', header: 'Название', value: (r) => ru(r.title), width: 280 },
      { field: 'sortOrder', header: 'Порядок', value: (r) => String(r.sortOrder ?? ''), width: 100 },
    ],
    fields: [
      { type: 'localized', key: 'title', label: 'Название' },
      { type: 'number', key: 'sortOrder', label: 'Порядок' },
    ],
  },
  {
    key: 'subjects',
    title: 'Предметы',
    endpoint: '/admin/subjects',
    reorderable: true,
    columns: [
      { field: 'code', header: 'Код', value: (r) => String(r.code ?? ''), width: 80 },
      { field: 'title', header: 'Название', value: (r) => ru(r.title), width: 200 },
      { field: 'hours', header: 'Часы', value: (r) => String(r.hours ?? ''), width: 120 },
      {
        field: 'leadPerson',
        header: 'Ведущий',
        value: (r) => ru((r.leadPerson as { name?: Localized } | undefined)?.name),
        width: 200,
      },
    ],
    fields: [
      { type: 'text', key: 'code', label: 'Код (TLM/HAL…)', required: true },
      { type: 'localized', key: 'title', label: 'Название' },
      { type: 'text', key: 'hours', label: 'Часы (напр. «12 ч / неделя»)' },
      { type: 'text', key: 'color', label: 'Цвет (CSS-токен/hex)' },
      { type: 'localizedArray', key: 'items', label: 'Пункты программы' },
      { type: 'ref', key: 'leadPersonId', label: 'Ведущий', ref: 'team', nullable: true },
      { type: 'number', key: 'sortOrder', label: 'Порядок' },
      { type: 'boolean', key: 'isPublished', label: 'Опубликовано' },
    ],
  },
  {
    key: 'students',
    title: 'Ученики',
    endpoint: '/admin/students',
    reorderable: true,
    manyRefs: [{ key: 'courseIds', syncPath: (id) => `/admin/students/${id}/courses` }],
    columns: [
      { field: 'name', header: 'Имя', value: (r) => ru(r.name), width: 200 },
      { field: 'duration', header: 'В ешиве', value: (r) => String(r.duration ?? ''), width: 120 },
      {
        field: 'teacher',
        header: 'Наставник',
        value: (r) => ru((r.teacher as { name?: Localized } | undefined)?.name),
        width: 200,
      },
      {
        field: 'courses',
        header: 'Курсы',
        value: (r) => ((r.courses as { title: Localized }[]) ?? []).map((c) => c.title.ru).join(', '),
        width: 220,
      },
    ],
    fields: [
      { type: 'localized', key: 'name', label: 'Имя' },
      { type: 'localized', key: 'quote', label: 'Цитата' },
      { type: 'localized', key: 'story', label: 'История' },
      { type: 'text', key: 'duration', label: 'В ешиве (напр. «3 года»)' },
      { type: 'ref', key: 'teacherId', label: 'Наставник', ref: 'team', nullable: true },
      { type: 'multiref', key: 'courseIds', label: 'Курсы', ref: 'courses', syncPath: 'courses' },
      { type: 'image', key: 'photoUrl', label: 'Фото' },
      { type: 'number', key: 'sortOrder', label: 'Порядок' },
      { type: 'boolean', key: 'isPublished', label: 'Опубликовано' },
    ],
  },
  {
    key: 'courses',
    title: 'Курсы',
    endpoint: '/admin/courses',
    columns: [
      { field: 'title', header: 'Название', value: (r) => ru(r.title), width: 280 },
      { field: 'provider', header: 'Площадка', value: (r) => String(r.provider ?? ''), width: 180 },
    ],
    fields: [
      { type: 'localized', key: 'title', label: 'Название' },
      { type: 'localized', key: 'description', label: 'Описание' },
      { type: 'text', key: 'provider', label: 'Внешняя площадка' },
      { type: 'boolean', key: 'isPublished', label: 'Опубликовано' },
    ],
  },
  {
    key: 'daily',
    title: 'Распорядок',
    endpoint: '/admin/daily',
    reorderable: true,
    columns: [
      { field: 'time', header: 'Время', value: (r) => String(r.time ?? ''), width: 100 },
      { field: 'title', header: 'Название', value: (r) => ru(r.title), width: 220 },
      { field: 'category', header: 'Категория', value: (r) => String(r.category ?? ''), width: 120 },
    ],
    fields: [
      { type: 'time', key: 'time', label: 'Время (HH:MM)' },
      { type: 'localized', key: 'title', label: 'Название' },
      { type: 'enum', key: 'category', label: 'Категория', options: DAILY_CATEGORIES },
      { type: 'localized', key: 'description', label: 'Описание' },
      { type: 'number', key: 'sortOrder', label: 'Порядок' },
    ],
  },
  {
    key: 'schedule',
    title: 'Расписание',
    endpoint: '/admin/schedule',
    columns: [
      {
        field: 'subject',
        header: 'Предмет',
        value: (r) => ru((r.subject as { title?: Localized } | undefined)?.title),
        width: 180,
      },
      {
        field: 'person',
        header: 'Преподаватель',
        value: (r) => ru((r.person as { name?: Localized } | undefined)?.name),
        width: 200,
      },
      { field: 'startTime', header: 'Начало', value: (r) => String(r.startTime ?? ''), width: 90 },
      { field: 'endTime', header: 'Конец', value: (r) => String(r.endTime ?? ''), width: 90 },
      {
        field: 'days',
        header: 'Дни',
        value: (r) => ((r.days as number[]) ?? []).join(','),
        width: 120,
      },
    ],
    fields: [
      { type: 'ref', key: 'subjectId', label: 'Предмет', ref: 'subjects' },
      { type: 'ref', key: 'personId', label: 'Преподаватель', ref: 'team' },
      { type: 'text', key: 'days', label: 'Дни (числа через запятую, 0=Вс)' },
      { type: 'time', key: 'startTime', label: 'Начало (HH:MM)' },
      { type: 'time', key: 'endTime', label: 'Конец (HH:MM)' },
    ],
  },
  {
    key: 'content',
    title: 'Тексты страниц',
    endpoint: '/admin/content',
    columns: [
      { field: 'contentKey', header: 'Ключ', value: (r) => String(r.contentKey ?? ''), width: 220 },
      { field: 'pageGroup', header: 'Страница', value: (r) => String(r.pageGroup ?? ''), width: 140 },
      { field: 'value', header: 'Значение (ru)', value: (r) => ru(r.value), width: 280 },
    ],
    fields: [
      { type: 'text', key: 'contentKey', label: 'Ключ (home.hero.title)', required: true },
      { type: 'text', key: 'pageGroup', label: 'Страница (home/study…)', required: true },
      { type: 'localized', key: 'value', label: 'Значение' },
    ],
  },
  {
    key: 'donors',
    title: 'Доноры',
    endpoint: '/admin/donors',
    columns: [
      { field: 'name', header: 'Имя', value: (r) => String(r.name ?? ''), width: 200 },
      { field: 'amount', header: 'Сумма', value: (r) => String(r.amount ?? ''), width: 120 },
      {
        field: 'donatedAt',
        header: 'Дата',
        value: (r) => String(r.donatedAt ?? '').slice(0, 10),
        width: 140,
      },
    ],
    fields: [
      { type: 'number', key: 'campaignId', label: 'ID кампании' },
      { type: 'text', key: 'name', label: 'Имя (или «Аноним»)', required: true },
      { type: 'number', key: 'amount', label: 'Сумма' },
      { type: 'text', key: 'donatedAt', label: 'Дата (YYYY-MM-DD)' },
      { type: 'boolean', key: 'isAnonymous', label: 'Аноним' },
    ],
  },
];

export const ENTITY_MAP: Record<string, EntityDef> = Object.fromEntries(
  ENTITIES.map((e) => [e.key, e]),
);
