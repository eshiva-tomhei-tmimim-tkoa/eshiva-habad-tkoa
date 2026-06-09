/** Каталог редактируемых медиа-слотов сайта (фото или видео по ключу slug). */
export interface MediaSlotDef {
  slug: string;
  title: string;
  help?: string;
  /** Соотношение сторон превью (для подсказки). */
  aspect?: string;
}

export const MEDIA_SLOTS: MediaSlotDef[] = [
  {
    slug: 'home.hero',
    title: 'Главная — большое медиа (hero)',
    help: 'Фото или видео в первом экране. Для видео подойдёт ссылка YouTube/Vimeo или загруженный файл.',
    aspect: '4 / 5',
  },
  {
    slug: 'home.rebbe',
    title: 'Главная — портрет Ребе',
    help: 'Фото заменит схематичный силуэт. Если пусто — показывается силуэт по умолчанию.',
    aspect: '4 / 5',
  },
];
