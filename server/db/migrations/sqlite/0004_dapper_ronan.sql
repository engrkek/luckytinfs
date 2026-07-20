PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_letter` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient` text NOT NULL,
	`tour_stop` text DEFAULT 'honolulu' NOT NULL,
	`sender_name` text DEFAULT 'Anonymous' NOT NULL,
	`sender_email` text,
	`body` text NOT NULL,
	`design` text NOT NULL,
	`visibility` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`reviewed_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_letter`("id", "recipient", "tour_stop", "sender_name", "sender_email", "body", "design", "visibility", "status", "admin_notes", "reviewed_by", "created_at", "updated_at") SELECT "id", "recipient", "tour_stop", "sender_name", "sender_email", "body", "design", "visibility", "status", "admin_notes", "reviewed_by", "created_at", "updated_at" FROM `letter`;--> statement-breakpoint
DROP TABLE `letter`;--> statement-breakpoint
ALTER TABLE `__new_letter` RENAME TO `letter`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `letter_feed_idx` ON `letter` (`recipient`,`tour_stop`);--> statement-breakpoint
CREATE INDEX `letter_stop_idx` ON `letter` (`tour_stop`);--> statement-breakpoint
UPDATE `letter` SET `tour_stop` = 'honolulu' WHERE `tour_stop` = 'manila';