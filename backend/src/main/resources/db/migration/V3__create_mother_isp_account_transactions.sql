-- =============================================================================
-- Migration V3: Create Mother ISP Account Transactions Ledger Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS `mother_isp_account_transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `reseller_id` BIGINT NOT NULL,
  `subscriber_id` BIGINT DEFAULT NULL,
  `transaction_type` VARCHAR(40) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `balance_before` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(30) DEFAULT NULL,
  `transaction_ref` VARCHAR(80) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `transaction_date` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_misp_tx_reseller` (`reseller_id`),
  KEY `fk_misp_tx_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_misp_tx_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`),
  CONSTRAINT `fk_misp_tx_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
