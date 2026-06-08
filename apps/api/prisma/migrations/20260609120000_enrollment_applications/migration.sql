-- CreateTable: заявки на обучение (внутренняя анкета записи)
CREATE TABLE `enrollment_applications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(64) NOT NULL,
  `last_name` VARCHAR(64) NOT NULL,
  `birth_date` VARCHAR(16) NOT NULL,
  `city` VARCHAR(128) NOT NULL,
  `jewishness` VARCHAR(16) NOT NULL,
  `rabbi_name` VARCHAR(128) NULL,
  `rabbi_phone` VARCHAR(32) NULL,
  `is_processed` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `enrollment_applications_is_processed_idx`(`is_processed`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
