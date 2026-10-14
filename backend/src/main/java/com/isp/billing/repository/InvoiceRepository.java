package com.isp.billing.repository;

import com.isp.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByResellerIdOrderByInvoiceDateDesc(Long resellerId);
    List<Invoice> findBySubscriberIdOrderByInvoiceDateDesc(Long subscriberId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsBySubscriberIdAndBillingPeriodStartBetween(Long subscriberId, LocalDate start, LocalDate end);
    boolean existsBySubscriberIdAndInvoiceDateBetween(Long subscriberId, LocalDate start, LocalDate end);
}
