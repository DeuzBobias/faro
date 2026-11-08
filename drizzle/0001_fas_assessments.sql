CREATE TABLE `fas_assessments` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`answers` text NOT NULL,
	`score` integer NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fas_assessments_user_completed_idx` ON `fas_assessments` (`user_id`,`completed_at` DESC);
