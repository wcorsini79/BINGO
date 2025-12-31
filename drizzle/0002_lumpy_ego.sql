ALTER TABLE `cards` MODIFY COLUMN `numbers` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cards` MODIFY COLUMN `markedNumbers` text NOT NULL DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `rooms` MODIFY COLUMN `drawnNumbers` text NOT NULL DEFAULT ('[]');