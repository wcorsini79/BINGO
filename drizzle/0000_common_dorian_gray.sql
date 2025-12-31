CREATE TABLE `cards` (
	`id` varchar(36) NOT NULL,
	`playerId` varchar(36) NOT NULL,
	`numbers` text NOT NULL,
	`markedNumbers` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` varchar(36) NOT NULL,
	`roomId` varchar(36) NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`status` enum('connected','disconnected') NOT NULL DEFAULT 'connected',
	`hasWon` timestamp,
	`winPattern` enum('line','column','diagonal','full'),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` varchar(36) NOT NULL,
	`code` varchar(6) NOT NULL,
	`name` text NOT NULL,
	`status` enum('waiting','drawing','finished') NOT NULL DEFAULT 'waiting',
	`organizerId` varchar(36) NOT NULL,
	`drawnNumbers` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
