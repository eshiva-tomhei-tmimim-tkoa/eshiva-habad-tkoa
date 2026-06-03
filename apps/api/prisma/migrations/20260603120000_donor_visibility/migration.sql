-- AlterTable: учёт пожертвований и управление видимостью донора
ALTER TABLE `donors`
  ADD COLUMN `is_public` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `provider` VARCHAR(32) NULL,
  ADD COLUMN `external_id` VARCHAR(64) NULL;

-- CreateIndex: идемпотентность учёта по id пожертвования провайдера
CREATE UNIQUE INDEX `donors_external_id_key` ON `donors`(`external_id`);

-- CreateIndex: фильтр публичного списка доноров
CREATE INDEX `donors_is_public_idx` ON `donors`(`is_public`);
