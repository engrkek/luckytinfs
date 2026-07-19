ALTER TABLE `letter` ADD `tour_stop` text DEFAULT 'manila' NOT NULL;--> statement-breakpoint
CREATE INDEX `letter_stop_idx` ON `letter` (`tour_stop`);