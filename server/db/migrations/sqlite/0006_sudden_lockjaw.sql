CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`title` text NOT NULL,
	`description` text,
	`venue` text,
	`max_guests` integer,
	`start_date` text NOT NULL,
	`end_date` text,
	`image_urls` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_registration` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`donor_id` text NOT NULL,
	`tier_id` text,
	`amount` integer,
	`channel_id` text,
	`proof_url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`checked_in_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`donor_id`) REFERENCES `donor`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tier_id`) REFERENCES `event_tier`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_registration_eventId_donorId_unique` ON `event_registration` (`event_id`,`donor_id`);--> statement-breakpoint
CREATE TABLE `event_tier` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`items` text NOT NULL,
	`image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action
);
