package com.isp.billing.repository;

import com.isp.billing.entity.SubscriberWalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SubscriberWalletTransactionRepository extends JpaRepository<SubscriberWalletTransaction, Long> {
    List<SubscriberWalletTransaction> findByResellerIdOrderByTransactionDateDesc(Long resellerId);
    List<SubscriberWalletTransaction> findBySubscriberIdOrderByTransactionDateDesc(Long subscriberId);
    List<SubscriberWalletTransaction> findByResellerIdAndSubscriberIdOrderByTransactionDateDesc(Long resellerId, Long subscriberId);

    // Sum deposits collected from subscribers (cash, online payments into wallet)
    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM SubscriberWalletTransaction w WHERE w.reseller.id = :resellerId AND w.transactionType = 'DEPOSIT' AND w.transactionDate BETWEEN :start AND :end")
    BigDecimal sumDepositsCollectedByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM SubscriberWalletTransaction w WHERE w.reseller.id = :resellerId AND w.transactionType = 'DEPOSIT' AND (w.paymentChannel = 'DIRECT_RESELLER' OR w.paymentChannel IS NULL) AND w.transactionDate BETWEEN :start AND :end")
    BigDecimal sumDirectDepositsCollectedByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM SubscriberWalletTransaction w WHERE w.reseller.id = :resellerId AND w.transactionType = 'DEPOSIT' AND w.paymentChannel = 'MOTHER_ISP_PORTAL' AND w.transactionDate BETWEEN :start AND :end")
    BigDecimal sumPortalDepositsByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(w.resellerCreditedAmount), 0) FROM SubscriberWalletTransaction w WHERE w.reseller.id = :resellerId AND w.transactionType = 'DEPOSIT' AND w.paymentChannel = 'MOTHER_ISP_PORTAL' AND w.transactionDate BETWEEN :start AND :end")
    BigDecimal sumPortalResellerShareByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM SubscriberWalletTransaction w WHERE w.transactionType = 'DEPOSIT' AND w.transactionDate BETWEEN :start AND :end")
    BigDecimal sumTotalDepositsCollectedByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
