ALTER TABLE `account` ADD `issuer` text;--> statement-breakpoint
UPDATE `account` SET `issuer` = `provider_id` WHERE `issuer` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `account_issuer_accountId_uidx` ON `account` (`issuer`,`account_id`);--> statement-breakpoint
ALTER TABLE `event` ADD `slug` text;--> statement-breakpoint
UPDATE `event` SET `slug` = lower(replace(trim(`name`), ' ', '-')) || '-' || substr(`id`, 1, 6) WHERE `slug` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `event_name_unique` ON `event` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_slug_unique` ON `event` (`slug`);
