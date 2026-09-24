ALTER TABLE `event` ADD `reg_prefix` text;--> statement-breakpoint
-- SQLite requires a default for ADD COLUMN NOT NULL; the app always sets reg_id via generateRegId()
ALTER TABLE `event_rsvp` ADD `reg_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `event_rsvp` SET `reg_id` = upper(substr(hex(randomblob(2)), 1, 4)) WHERE `reg_id` = '';--> statement-breakpoint
CREATE UNIQUE INDEX `event_rsvp_reg_id_idx` ON `event_rsvp` (`event_id`,`reg_id`);--> statement-breakpoint
UPDATE `event_rsvp` SET `status` = CASE `status` WHEN 'approved' THEN 'confirmed' WHEN 'invalid' THEN 'rejected' ELSE `status` END;
