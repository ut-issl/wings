CREATE DATABASE IF NOT EXISTS `wings`;
USE `wings`;

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
  `MigrationId` varchar(95) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Components` (
  `Id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `TcPacketKey` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `TmPacketKey` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LocalDirPath` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Operations` (
  `Id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PathNumber` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `CreatedAt` datetime NOT NULL,
  `IsRunning` tinyint(1) NOT NULL,
  `IsTmtcConnected` tinyint(1) NOT NULL,
  `FileLocation` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `TmtcTarget` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ComponentId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Operations_ComponentId` (`ComponentId`),
  CONSTRAINT `FK_Operations_Components_ComponentId` FOREIGN KEY (`ComponentId`) REFERENCES `Components` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `CommandLogs` (
  `SentAt` datetime(1) NOT NULL,
  `OperationId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ExecType` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ExecTime` int unsigned NOT NULL,
  `ExecTimeDouble` double DEFAULT NULL,
  `CmdName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param1` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param2` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param3` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param4` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param5` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Param6` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`OperationId`,`SentAt`),
  CONSTRAINT `FK_CommandLogs_Operations_OperationId` FOREIGN KEY (`OperationId`) REFERENCES `Operations` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
	('20220330061702_InitialModels', '6.0.0');

INSERT INTO `Components` (`Id`, `Name`, `TcPacketKey`, `TmPacketKey`, `LocalDirPath`) VALUES
	('77bd0ce9-453a-4b8a-b474-d8be2faa3e8b', 'MOBC', 'OBC', 'OBC', 'TlmCmd/OBC'),
  ('984ac2f4-c04d-03cc-a3b1-8270affed10a', 'SECONDARY_OBC', 'SECONDARY_OBC', 'SECONDARY_OBC', 'TlmCmd/SECONDARY_OBC'),
	('ff0cab42-7002-46f8-abbc-45d0ef82eb87', 'ISSL_COMMON', 'ISSL_COMMON', 'ISSL_COMMON', 'TlmCmd/ISSL_COMMON');
