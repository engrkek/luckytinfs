ALTER TABLE `letter` ADD `sender_id` text;--> statement-breakpoint
CREATE INDEX `letter_sender_idx` ON `letter` (`sender_id`,`tour_stop`);