package com.isp.billing.repository;

import com.isp.billing.entity.MotherIspPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MotherIspPayoutRepository extends JpaRepository<MotherIspPayout, Long> {
    List<MotherIspPayout> findByResellerIdOrderByPaymentDateDesc(Long resellerId);
    List<MotherIspPayout> findAllByOrderByPaymentDateDesc();
    List<MotherIspPayout> findByResellerIdAndPaymentDateBetweenOrderByPaymentDateDesc(Long resellerId, LocalDate start, LocalDate end);
    boolean existsBySubscriberIdAndCycleDate(Long subscriberId, LocalDate cycleDate);
    List<MotherIspPayout> findBySubscriberIdAndCycleDate(Long subscriberId, LocalDate cycleDate);
    void deleteBySubscriberIdAndCycleDate(Long subscriberId, LocalDate cycleDate);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM MotherIspPayout p WHERE p.reseller.id = :resellerId AND p.paymentDate BETWEEN :start AND :end")
    BigDecimal sumAmountPaidByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM MotherIspPayout p WHERE p.paymentDate BETWEEN :start AND :end")
    BigDecimal sumTotalAmountPaidByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
