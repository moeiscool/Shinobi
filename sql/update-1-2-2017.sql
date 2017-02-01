USE ccio;
ALTER TABLE `Monitors` CHANGE COLUMN `protocol` `protocol` VARCHAR(50) NULL DEFAULT 'http' AFTER `ext`;