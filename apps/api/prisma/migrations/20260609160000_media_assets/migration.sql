-- CreateTable: медиа-слоты сайта (фото или видео под именованным ключом)
CREATE TABLE `media_assets` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(64) NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `poster` VARCHAR(1024) NULL,
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `media_assets_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
