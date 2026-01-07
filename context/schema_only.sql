DROP TABLE IF EXISTS `administrations`;
CREATE TABLE `administrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `value` int NOT NULL,
  `detail` text COLLATE utf8mb4_general_ci NOT NULL,
  `payer` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `vehicle_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_520284c3068e78fdbfe381d3c6f` (`vehicle_id`),
  KEY `FK_ea7bc054678030a79df93683d39` (`user_id`),
  CONSTRAINT `FK_520284c3068e78fdbfe381d3c6f` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `FK_ea7bc054678030a79df93683d39` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `arls`;
CREATE TABLE `arls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_50ce349869e06f222e0fdab622` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `communication_companies`;
CREATE TABLE `communication_companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_755727012d8458e46c4fe467b4` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nit` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ed61d4dcafb6fe0f595f5e0cbd` (`nit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identification` bigint NOT NULL,
  `issued_in` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `firstName` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `lastName` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `license` bigint NOT NULL,
  `category` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_on` date NOT NULL,
  `blood_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `photo` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `eps_id` int NOT NULL,
  `arl_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c644eed4c6c157691e3a2e420c` (`identification`),
  KEY `FK_4d7dfc38619ea2a804149a13cea` (`eps_id`),
  KEY `FK_27ca7f7a8eb714cc238068c17ec` (`arl_id`),
  CONSTRAINT `FK_27ca7f7a8eb714cc238068c17ec` FOREIGN KEY (`arl_id`) REFERENCES `arls` (`id`),
  CONSTRAINT `FK_4d7dfc38619ea2a804149a13cea` FOREIGN KEY (`eps_id`) REFERENCES `eps` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `drivers_vehicles`;
CREATE TABLE `drivers_vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permit_expires_on` date DEFAULT NULL,
  `note` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soat` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soat_expires_on` date DEFAULT NULL,
  `operation_card` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operation_card_expires_on` date DEFAULT NULL,
  `contractual_expires_on` date DEFAULT NULL,
  `extra_contractual_expires_on` date DEFAULT NULL,
  `technical_mechanic_expires_on` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `driver_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_82f825b433bd326ceb120bc14f` (`driver_id`,`vehicle_id`),
  KEY `FK_978d2102d741ff400ff9bcca5da` (`vehicle_id`),
  CONSTRAINT `FK_978d2102d741ff400ff9bcca5da` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_b769eb0e25154378450f4de7e9f` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `driver_state_history` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `previous_state` int(11) NOT NULL,
  `new_state` int(11) NOT NULL,
  `reason` text NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vehicle_state_history` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `previous_state` int(11) NOT NULL,
  `new_state` int(11) NOT NULL,
  `reason` text NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `drivers_vehicles_history`;
CREATE TABLE `drivers_vehicles_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_record_id` int NOT NULL,
  `permit_expires_on` date DEFAULT NULL,
  `note` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soat` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soat_expires_on` date DEFAULT NULL,
  `operation_card` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operation_card_expires_on` date DEFAULT NULL,
  `contractual_expires_on` date DEFAULT NULL,
  `extra_contractual_expires_on` date DEFAULT NULL,
  `technical_mechanic_expires_on` date DEFAULT NULL,
  `original_created_at` datetime NOT NULL,
  `original_updated_at` datetime NOT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `changed_by` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `history_created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `driver_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7f50905c0020fc2926cf3459f51` (`driver_id`),
  KEY `FK_485f57918d023b11fc3bc92722d` (`vehicle_id`),
  CONSTRAINT `FK_485f57918d023b11fc3bc92722d` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `FK_7f50905c0020fc2926cf3459f51` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `eps`;
CREATE TABLE `eps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1fc10b5597eda85b0e1171eed9` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `insurers`;
CREATE TABLE `insurers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_99b0c4a6ec4f3c6d4d058f2d9d` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `makes`;
CREATE TABLE `makes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d59cb129eb7b945050392c649c` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `owners`;
CREATE TABLE `owners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `identification` bigint NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `company_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_98f380835c392b24b195993f04` (`identification`),
  KEY `FK_8bb9ffd6b77e75566677ec9bbf3` (`company_id`),
  CONSTRAINT `FK_8bb9ffd6b77e75566677ec9bbf3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `permissions` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `company_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a894a560d274a270f087c72ba0` (`user`),
  KEY `FK_7ae6334059289559722437bcc1c` (`company_id`),
  CONSTRAINT `FK_7ae6334059289559722437bcc1c` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plate` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `internal_number` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `make_id` int NOT NULL,
  `insurer_id` int DEFAULT NULL,
  `communication_company_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `engine_number` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `chassis_number` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `line` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `entry_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `IDX_ec7181ebdab798d97070122a5b` (`plate`) USING BTREE,
  KEY `FK_3d245ae9fc35c8a10ff1caf0581` (`make_id`),
  KEY `FK_9e4cb08797949ba7de2f2524de4` (`insurer_id`),
  KEY `FK_46e9b71498f79e8f9e333572c79` (`communication_company_id`),
  KEY `FK_490a6fd6eb12a0a64e87b534dd9` (`owner_id`),
  KEY `FK_e11ef2dcd880132d31bd9f92c2a` (`company_id`),
  CONSTRAINT `FK_3d245ae9fc35c8a10ff1caf0581` FOREIGN KEY (`make_id`) REFERENCES `makes` (`id`),
  CONSTRAINT `FK_46e9b71498f79e8f9e333572c79` FOREIGN KEY (`communication_company_id`) REFERENCES `communication_companies` (`id`),
  CONSTRAINT `FK_490a6fd6eb12a0a64e87b534dd9` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`),
  CONSTRAINT `FK_9e4cb08797949ba7de2f2524de4` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`),
  CONSTRAINT `FK_e11ef2dcd880132d31bd9f92c2a` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
