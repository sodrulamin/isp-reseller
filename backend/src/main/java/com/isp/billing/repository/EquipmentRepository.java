package com.isp.billing.repository;

import com.isp.billing.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByResellerIdOrderByPurchaseDateDesc(Long resellerId);
    List<Equipment> findByResellerIdAndSubscriberId(Long resellerId, Long subscriberId);

    // Sum purchase expenses incurred by reseller
    @Query("SELECT COALESCE(SUM(e.purchaseCost), 0) FROM Equipment e WHERE e.reseller.id = :resellerId AND e.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumPurchaseCostByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // Sum revenue received from subscribers for equipment
    @Query("SELECT COALESCE(SUM(e.customerPaidAmount), 0) FROM Equipment e WHERE e.reseller.id = :resellerId AND e.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumCustomerPaidAmountByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(e.purchaseCost), 0) FROM Equipment e WHERE e.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumTotalPurchaseCostByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(e.customerPaidAmount), 0) FROM Equipment e WHERE e.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumTotalCustomerPaidAmountByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
