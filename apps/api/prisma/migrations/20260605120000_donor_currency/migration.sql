-- AlterTable: валюта пожертвования + сумма в шекелях (конвертация)
ALTER TABLE `donors`
  ADD COLUMN `currency` VARCHAR(8) NOT NULL DEFAULT 'ILS',
  ADD COLUMN `amount_ils` DECIMAL(12, 2) NULL;
