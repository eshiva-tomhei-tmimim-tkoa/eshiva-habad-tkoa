/**
 * Описание сгруппированных по страницам сайта форм редактирования SiteContent.
 * Удобный UX поверх сырой таблицы /admin/content: редактор видит понятные
 * лейблы («Число в статистике №1»), а не голые contentKey.
 *
 * Дефолты должны совпадать с фолбэками в `apps/web/lib/api.ts:cstr(...)`, иначе
 * пустое значение в БД покажет один текст, а перед сидом — другой.
 */

export type ContentFieldType = 'text' | 'localized';

export interface ContentField {
  /** contentKey в таблице site_content. */
  key: string;
  /** Отображаемая подпись поля. */
  label: string;
  /** Подсказка под полем. */
  helper?: string;
  type: ContentFieldType;
}

export interface ContentSection {
  title: string;
  fields: ContentField[];
}

export interface ContentGroupDef {
  /** Сегмент URL: /admin/content/<slug>. */
  slug: string;
  /** Заголовок раздела в админке и в sidebar. */
  title: string;
  /** Имя соответствующей pageGroup в site_content. */
  pageGroup: string;
  /** Описание над формой. */
  description: string;
  sections: ContentSection[];
}

export const CONTENT_GROUPS: ContentGroupDef[] = [
  {
    slug: 'home',
    title: 'Главная',
    pageGroup: 'home',
    description:
      'Числа в статистике hero-блока и подпись блока про Любавичского Ребе. Тексты блоков, которые есть в трёх языках, редактируются как «локализованные» (RU/HE/EN).',
    sections: [
      {
        title: 'Статистика hero — числа над лейблами',
        fields: [
          { key: 'home.stat.1.num', label: 'Число №1 (по умолчанию 47)', type: 'localized' },
          { key: 'home.stat.1.sup', label: 'Подстрочный знак №1 (по умолчанию +)', type: 'localized' },
          { key: 'home.stat.2.num', label: 'Число №2 (по умолчанию 8)', type: 'localized' },
          { key: 'home.stat.2.sup', label: 'Подстрочный знак №2', type: 'localized' },
          { key: 'home.stat.3.num', label: 'Число №3 (по умолчанию 5)', type: 'localized' },
          { key: 'home.stat.3.sup', label: 'Подстрочный знак №3', type: 'localized' },
          { key: 'home.stat.4.num', label: 'Число №4 (по умолчанию 100)', type: 'localized' },
          { key: 'home.stat.4.sup', label: 'Подстрочный знак №4 (по умолчанию %)', type: 'localized' },
        ],
      },
      {
        title: 'Блок про Ребе',
        fields: [
          {
            key: 'home.rebbe.date',
            label: 'Дата над цитатой',
            type: 'localized',
            helper: 'Дата отображается над цитатой Ребе. Например: «11 НИСАНА 5662 —».',
          },
          {
            key: 'home.rebbe.place',
            label: 'Место под текстом',
            type: 'localized',
            helper: 'Например: «770 Eastern Parkway».',
          },
        ],
      },
    ],
  },
  {
    slug: 'students',
    title: 'Ученики',
    pageGroup: 'students',
    description:
      'Числа в блоке Achievements на странице «Истории учеников». Тексты под числами берутся из словарей переводов и редактируются разработчиком.',
    sections: [
      {
        title: 'Achievements — числа над лейблами',
        fields: [
          { key: 'students.ach.1.num', label: 'Число №1 (по умолчанию 47)', type: 'localized' },
          { key: 'students.ach.2.num', label: 'Число №2 (по умолчанию 12)', type: 'localized' },
          { key: 'students.ach.3.num', label: 'Число №3 (по умолчанию 9)', type: 'localized' },
          { key: 'students.ach.4.num', label: 'Число №4 (по умолчанию 100%)', type: 'localized' },
        ],
      },
    ],
  },
];

export const CONTENT_GROUP_MAP: Record<string, ContentGroupDef> = Object.fromEntries(
  CONTENT_GROUPS.map((g) => [g.slug, g]),
);
