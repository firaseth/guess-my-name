CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentGiven` boolean NOT NULL,
	`consentVersion` varchar(20) NOT NULL DEFAULT '1.0',
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `face_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`embeddingId` varchar(64),
	`qualityScore` decimal(3,2),
	`faceDetected` boolean NOT NULL DEFAULT true,
	`registeredName` varchar(255) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `face_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `face_registrations_embeddingId_unique` UNIQUE(`embeddingId`)
);
--> statement-breakpoint
CREATE TABLE `match_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`queryPhotoUrl` varchar(500) NOT NULL,
	`matchedUserId` int,
	`matchedName` varchar(255),
	`similarityScore` decimal(5,4),
	`confidenceLevel` enum('low','medium','high'),
	`wasAccurate` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `match_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 1,
	`windowStart` timestamp NOT NULL,
	`windowEnd` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limit_logs_id` PRIMARY KEY(`id`)
);
