PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expense` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`event_id` text,
	`title` text NOT NULL,
	`description` text,
	`category_id` text,
	`supplier_id` text,
	`amount` integer NOT NULL,
	`method` text,
	`channel_id` text,
	`spent_at` integer NOT NULL,
	`payment_url` text,
	`receipt_url` text,
	`notes` text,
	`created_by` text NOT NULL,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_expense`("id", "campaign_id", "event_id", "title", "description", "category_id", "supplier_id", "amount", "method", "channel_id", "spent_at", "payment_url", "receipt_url", "notes", "created_by", "updated_by", "created_at", "updated_at") SELECT "id", "campaign_id", NULL, "title", "description", "category_id", "supplier_id", "amount", "method", "channel_id", "created_at", "payment_url", "receipt_url", "notes", "created_by", "updated_by", "created_at", "updated_at" FROM `expense`;--> statement-breakpoint
DROP TABLE `expense`;--> statement-breakpoint
ALTER TABLE `__new_expense` RENAME TO `expense`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `expense_spent_at_idx` ON `expense` (`spent_at`);