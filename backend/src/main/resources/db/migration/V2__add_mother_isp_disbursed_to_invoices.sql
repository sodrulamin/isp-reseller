-- =============================================================================
-- Migration V2: Add mother_isp_disbursed column to invoices table
-- =============================================================================
ALTER TABLE `invoices` ADD COLUMN `mother_isp_disbursed` BIT(1) NOT NULL DEFAULT 0;
