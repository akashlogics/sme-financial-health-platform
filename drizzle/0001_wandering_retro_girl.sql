CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`businessId` int,
	`actionType` varchar(100) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int,
	`description` text,
	`status` enum('success','failure','partial') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`changes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankingConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`accountNumber` varchar(50) NOT NULL,
	`accountType` varchar(50),
	`apiType` varchar(50) NOT NULL,
	`encryptedCredentials` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncDate` timestamp,
	`syncStatus` enum('pending','syncing','success','failed') NOT NULL DEFAULT 'pending',
	`syncErrorMessage` text,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankingConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` enum('manufacturing','retail','services','agriculture','logistics','ecommerce','healthcare','education','hospitality','other') NOT NULL,
	`registrationNumber` varchar(100),
	`gstNumber` varchar(15),
	`panNumber` varchar(10),
	`financialYearStart` int NOT NULL DEFAULT 4,
	`businessType` enum('sole_proprietor','partnership','pvt_ltd','llp','other') NOT NULL,
	`employeeCount` int,
	`annualTurnover` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `costOptimization` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`analysisId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`currentCost` decimal(15,2) NOT NULL,
	`recommendedCost` decimal(15,2) NOT NULL,
	`savingsPotential` decimal(15,2) NOT NULL,
	`savingsPercentage` decimal(8,2) NOT NULL,
	`recommendation` text NOT NULL,
	`implementationDifficulty` enum('easy','medium','hard') NOT NULL,
	`timelineMonths` int,
	`priority` enum('high','medium','low') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `costOptimization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`financialDataId` int NOT NULL,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`expirationDate` timestamp,
	`creditScore` decimal(5,2),
	`creditTier` enum('excellent','good','fair','poor','very_poor'),
	`riskTier` enum('very_low','low','medium','high','very_high'),
	`currentRatio` decimal(8,2),
	`quickRatio` decimal(8,2),
	`debtToEquityRatio` decimal(8,2),
	`profitMargin` decimal(8,2),
	`returnOnAssets` decimal(8,2),
	`returnOnEquity` decimal(8,2),
	`assetTurnover` decimal(8,2),
	`debtServiceCoverageRatio` decimal(8,2),
	`analysisResults` json,
	`aiInsights` text,
	`riskFactors` json,
	`opportunities` json,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`dataType` enum('balance_sheet','profit_loss','cash_flow','bank_statement','gst_return','other') NOT NULL,
	`period` varchar(50) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(20) NOT NULL,
	`fileSize` int NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`rawData` json,
	`validationStatus` enum('pending','valid','invalid','partial') NOT NULL DEFAULT 'pending',
	`validationErrors` json,
	`source` enum('manual_upload','banking_api','gst_api','accounting_software') NOT NULL DEFAULT 'manual_upload',
	`uploadedBy` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`analysisId` int,
	`reportTitle` varchar(255) NOT NULL,
	`reportType` enum('investor_ready','bank_loan','tax_compliance','custom') NOT NULL,
	`reportFormat` enum('pdf','html','excel') NOT NULL DEFAULT 'pdf',
	`language` enum('en','hi') NOT NULL DEFAULT 'en',
	`s3Key` varchar(500),
	`reportContent` json,
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financialReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gstRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`gstNumber` varchar(15) NOT NULL,
	`filingPeriod` varchar(20) NOT NULL,
	`filingDate` timestamp,
	`filingStatus` enum('not_filed','filed','amended','cancelled') NOT NULL,
	`complianceScore` decimal(5,2),
	`totalTaxLiability` decimal(15,2),
	`totalTaxPaid` decimal(15,2),
	`taxDue` decimal(15,2),
	`deductionOpportunities` json,
	`filingGaps` json,
	`lastVerifiedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gstRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `industryBenchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`industry` varchar(100) NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`averageValue` decimal(15,2),
	`medianValue` decimal(15,2),
	`percentile25` decimal(15,2),
	`percentile75` decimal(15,2),
	`percentile90` decimal(15,2),
	`dataSource` varchar(255),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `industryBenchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(100) NOT NULL,
	`configValue` text NOT NULL,
	`configType` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','advisor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `languagePreference` enum('en','hi') DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` varchar(50) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `auditLogs` (`businessId`);--> statement-breakpoint
CREATE INDEX `actionType_idx` ON `auditLogs` (`actionType`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `bankingConnections` (`businessId`);--> statement-breakpoint
CREATE INDEX `bankName_idx` ON `bankingConnections` (`bankName`);--> statement-breakpoint
CREATE INDEX `ownerId_idx` ON `businesses` (`ownerId`);--> statement-breakpoint
CREATE INDEX `industry_idx` ON `businesses` (`industry`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `costOptimization` (`businessId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `costOptimization` (`category`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `financialAnalysis` (`businessId`);--> statement-breakpoint
CREATE INDEX `creditScore_idx` ON `financialAnalysis` (`creditScore`);--> statement-breakpoint
CREATE INDEX `creditTier_idx` ON `financialAnalysis` (`creditTier`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `financialData` (`businessId`);--> statement-breakpoint
CREATE INDEX `dataType_idx` ON `financialData` (`dataType`);--> statement-breakpoint
CREATE INDEX `period_idx` ON `financialData` (`period`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `financialReports` (`businessId`);--> statement-breakpoint
CREATE INDEX `reportType_idx` ON `financialReports` (`reportType`);--> statement-breakpoint
CREATE INDEX `businessId_idx` ON `gstRecords` (`businessId`);--> statement-breakpoint
CREATE INDEX `gstNumber_idx` ON `gstRecords` (`gstNumber`);--> statement-breakpoint
CREATE INDEX `filingPeriod_idx` ON `gstRecords` (`filingPeriod`);--> statement-breakpoint
CREATE INDEX `industry_idx` ON `industryBenchmarks` (`industry`);--> statement-breakpoint
CREATE INDEX `metricName_idx` ON `industryBenchmarks` (`metricName`);--> statement-breakpoint
CREATE INDEX `configKey_idx` ON `systemConfig` (`configKey`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);