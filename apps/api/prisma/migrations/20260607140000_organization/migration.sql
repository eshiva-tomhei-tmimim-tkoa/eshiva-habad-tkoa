-- CreateTable: реквизиты ешивы (singleton, id=1)
CREATE TABLE `organization` (
  `id` BIGINT NOT NULL DEFAULT 1,
  `brand_name` JSON NOT NULL,
  `brand_sub` VARCHAR(64) NOT NULL,
  `yechi_text` TEXT NOT NULL,
  `address` JSON NOT NULL,
  `phone_main` VARCHAR(32) NOT NULL,
  `phone_secondary` VARCHAR(32) NULL,
  `email` VARCHAR(128) NOT NULL,
  `map_lat` DOUBLE NOT NULL,
  `map_lng` DOUBLE NOT NULL,
  `hours_weekday` VARCHAR(32) NOT NULL,
  `hours_friday` JSON NOT NULL,
  `hours_shabbat` JSON NOT NULL,
  `legal_status` VARCHAR(64) NOT NULL,
  `copyright_suffix` JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Сидовая запись с текущими значениями из захардкода Header/Footer/contacts.
INSERT INTO `organization` (
  `id`, `brand_name`, `brand_sub`, `yechi_text`,
  `address`, `phone_main`, `phone_secondary`, `email`,
  `map_lat`, `map_lng`,
  `hours_weekday`, `hours_friday`, `hours_shabbat`,
  `legal_status`, `copyright_suffix`, `updated_at`
) VALUES (
  1,
  JSON_OBJECT('ru', 'Ешива ХаБаД Ткоа', 'he', 'ישיבת חב"ד תקוע', 'en', 'Yeshiva Chabad Tkoa'),
  'Yeshiva · Tkoa · IL',
  'יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד',
  JSON_OBJECT('ru', 'Ткоа, Гуш-Эцион, Израиль', 'he', 'תקוע, גוש עציון, ישראל', 'en', 'Tkoa, Gush Etzion, Israel'),
  '+972-55-504-0828',
  '+972-53-552-0466',
  'info@yeshiva-tkoa.org',
  31.6478,
  35.2148,
  '08:00 – 18:00',
  JSON_OBJECT('ru', 'до 14:00', 'he', 'עד 14:00', 'en', 'until 14:00'),
  JSON_OBJECT('ru', 'выходной', 'he', 'שבת', 'en', 'closed'),
  '501(c)(3)',
  JSON_OBJECT('ru', 'Эрец Исроэль · Сделано с заботой', 'he', 'ארץ ישראל · נעשה באהבה', 'en', 'Eretz Israel · Made with care'),
  CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE id = id;
