CREATE TABLE `perk_claim` (
	`id` text PRIMARY KEY NOT NULL,
	`donor_id` text NOT NULL,
	`campaign_id` text NOT NULL,
	`recipient_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`courier` text NOT NULL,
	`size` text,
	`notes` text,
	`shipping_fee` integer,
	`channel_id` text,
	`ref_no` text,
	`proof_url` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`tracking_no` text,
	`payment_email_sent_at` integer,
	`reviewed_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`donor_id`) REFERENCES `donor`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `perk_claim_donorId_campaignId_unique` ON `perk_claim` (`donor_id`,`campaign_id`);--> statement-breakpoint
ALTER TABLE `tier` ADD `sizes` text;