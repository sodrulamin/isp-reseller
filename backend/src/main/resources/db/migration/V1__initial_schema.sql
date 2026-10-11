-- =============================================================================
-- Flyway Migration V1__initial_schema.sql
-- Baseline initial database schema for isp-reseller
-- =============================================================================

CREATE TABLE IF NOT EXISTS `resellers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(255) DEFAULT NULL,
  `code` VARCHAR(60) NOT NULL,
  `contact_person` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `mother_isp_disbursement_percentage` DECIMAL(5,2) NOT NULL DEFAULT 49.00,
  `mother_isp_name` VARCHAR(120) NOT NULL DEFAULT 'Default Mother ISP',
  `mother_isp_reseller_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resellers_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `active` BIT(1) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `role` ENUM('ROLE_RESELLER_ADMIN','ROLE_STAFF','ROLE_SUPER_ADMIN') NOT NULL,
  `username` VARCHAR(60) NOT NULL,
  `reseller_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  KEY `fk_users_reseller` (`reseller_id`),
  CONSTRAINT `fk_users_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `internet_packages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `active` BIT(1) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `monthly_price` DECIMAL(10,2) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `speed_mbps` INT DEFAULT NULL,
  `reseller_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_internet_packages_reseller` (`reseller_id`),
  CONSTRAINT `fk_internet_packages_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(255) DEFAULT NULL,
  `billing_cycle_day` INT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `current_billing_period_end` DATE NOT NULL,
  `current_billing_period_start` DATE NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `join_date` DATE NOT NULL,
  `mother_isp_rate_override` DECIMAL(5,2) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `next_billing_date` DATE NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `pppoe_password` VARCHAR(60) DEFAULT NULL,
  `pppoe_username` VARCHAR(60) DEFAULT NULL,
  `status` ENUM('ACTIVE','EXPIRED','SUSPENDED','TERMINATED') NOT NULL,
  `subscriber_code` VARCHAR(60) NOT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  `wallet_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `internet_package_id` BIGINT NOT NULL,
  `reseller_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_subscribers_internet_package` (`internet_package_id`),
  KEY `fk_subscribers_reseller` (`reseller_id`),
  CONSTRAINT `fk_subscribers_internet_package` FOREIGN KEY (`internet_package_id`) REFERENCES `internet_packages` (`id`),
  CONSTRAINT `fk_subscribers_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `billed_to_subscriber` BIT(1) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `customer_billed_amount` DECIMAL(10,2) NOT NULL,
  `customer_paid_amount` DECIMAL(10,2) NOT NULL,
  `item_type` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `payment_status` VARCHAR(30) NOT NULL,
  `purchase_cost` DECIMAL(10,2) NOT NULL,
  `purchase_date` DATE NOT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_equipments_reseller` (`reseller_id`),
  KEY `fk_equipments_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_equipments_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_equipments_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `billing_period_end` DATE DEFAULT NULL,
  `billing_period_start` DATE DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `due_amount` DECIMAL(10,2) NOT NULL,
  `due_date` DATE NOT NULL,
  `equipment_amount` DECIMAL(10,2) NOT NULL,
  `invoice_date` DATE NOT NULL,
  `invoice_number` VARCHAR(60) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `package_amount` DECIMAL(10,2) NOT NULL,
  `paid_amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_invoices_reseller` (`reseller_id`),
  KEY `fk_invoices_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_invoices_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_invoices_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mother_isp_payouts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `amount_paid` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `cycle_date` DATE NOT NULL,
  `disbursement_percentage` DECIMAL(5,2) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `package_price` DECIMAL(10,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_status` VARCHAR(30) NOT NULL DEFAULT 'PAID',
  `transaction_ref` VARCHAR(60) DEFAULT NULL,
  `internet_package_id` BIGINT DEFAULT NULL,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_payouts_package` (`internet_package_id`),
  KEY `fk_payouts_reseller` (`reseller_id`),
  KEY `fk_payouts_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_payouts_package` FOREIGN KEY (`internet_package_id`) REFERENCES `internet_packages` (`id`),
  CONSTRAINT `fk_payouts_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_payouts_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `service_tickets` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(500) NOT NULL,
  `issue_type` VARCHAR(60) NOT NULL,
  `operational_cost` DECIMAL(10,2) NOT NULL,
  `reported_date` DATETIME(6) NOT NULL,
  `resolution_notes` VARCHAR(500) DEFAULT NULL,
  `resolved_date` DATETIME(6) DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL,
  `technician_name` VARCHAR(100) DEFAULT NULL,
  `ticket_number` VARCHAR(60) NOT NULL,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tickets_reseller` (`reseller_id`),
  KEY `fk_tickets_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_tickets_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_tickets_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `subscriber_wallet_transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `balance_before` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(30) DEFAULT NULL,
  `payment_channel` VARCHAR(30) DEFAULT 'DIRECT_RESELLER',
  `mother_isp_retained_amount` DECIMAL(12,2) DEFAULT 0.00,
  `reseller_credited_amount` DECIMAL(12,2) DEFAULT 0.00,
  `transaction_reference` VARCHAR(60) DEFAULT NULL,
  `transaction_type` VARCHAR(40) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `transaction_date` DATETIME(6) NOT NULL,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_transactions_reseller` (`reseller_id`),
  KEY `fk_transactions_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_transactions_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_transactions_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
