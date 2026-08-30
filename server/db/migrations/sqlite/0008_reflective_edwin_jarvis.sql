DROP TABLE `event_registration`;--> statement-breakpoint
DROP TABLE `event_tier`;--> statement-breakpoint
DROP TABLE `event`;--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`venue` text,
	`date` integer NOT NULL,
	`capacity` integer,
	`fee` integer,
	`details` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_rsvp` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`full_name` text NOT NULL,
	`nickname` text,
	`email` text,
	`social_platform` text,
	`social_handle` text,
	`companions` text,
	`reg_fee` integer,
	`ref_no` text,
	`receipt_url` text,
	`status` text DEFAULT 'for_review' NOT NULL,
	`notes` text,
	`reviewed_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `event_rsvp_event_idx` ON `event_rsvp` (`event_id`);
