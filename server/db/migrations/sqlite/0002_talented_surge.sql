CREATE TABLE `letter` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient` text NOT NULL,
	`sender_name` text DEFAULT 'Anonymous' NOT NULL,
	`sender_email` text,
	`body` text NOT NULL,
	`design` text NOT NULL,
	`visibility` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`reviewed_by` text,
	`featured_on` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `letter_feed_idx` ON `letter` (`recipient`,`featured_on`);