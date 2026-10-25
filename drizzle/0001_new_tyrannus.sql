CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`humanPageId` int NOT NULL,
	`botPageId` int NOT NULL,
	`activeMode` enum('human','bot','auto') NOT NULL DEFAULT 'auto',
	`status` enum('draft','active','paused') NOT NULL DEFAULT 'draft',
	`createdBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `conversion_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(128) NOT NULL,
	`landingPageId` int,
	`provider` enum('meta','tiktok') NOT NULL,
	`eventName` varchar(100) NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`response` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversion_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversion_events_event_provider_unique` UNIQUE(`eventId`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `landing_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`type` enum('game','seo','selling') NOT NULL DEFAULT 'selling',
	`status` enum('draft','live','paused') NOT NULL DEFAULT 'draft',
	`title` varchar(255) NOT NULL,
	`description` text,
	`contentJson` text NOT NULL,
	`customCss` text,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `landing_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `landing_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `landing_pixels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`landingPageId` int NOT NULL,
	`provider` enum('meta','tiktok','line') NOT NULL,
	`pixelId` varchar(255) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `landing_pixels_id` PRIMARY KEY(`id`),
	CONSTRAINT `landing_pixels_page_provider_unique` UNIQUE(`landingPageId`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `workspace_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','editor','analyst') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `landing_pages_status_idx` ON `landing_pages` (`status`);