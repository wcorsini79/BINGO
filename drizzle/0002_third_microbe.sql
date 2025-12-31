ALTER TABLE `cards` MODIFY COLUMN `markedNumbers` json NOT NULL;--> statement-breakpoint
ALTER TABLE `rooms` MODIFY COLUMN `drawnNumbers` json NOT NULL;