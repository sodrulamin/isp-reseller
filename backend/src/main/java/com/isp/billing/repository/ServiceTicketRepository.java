package com.isp.billing.repository;

import com.isp.billing.entity.ServiceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {
    List<ServiceTicket> findByResellerIdOrderByReportedDateDesc(Long resellerId);
    List<ServiceTicket> findByResellerIdAndSubscriberId(Long resellerId, Long subscriberId);

    // Sum physical service operational costs for reseller
    @Query("SELECT COALESCE(SUM(t.operationalCost), 0) FROM ServiceTicket t WHERE t.reseller.id = :resellerId AND t.reportedDate BETWEEN :start AND :end")
    BigDecimal sumOperationalCostByResellerAndDateRange(@Param("resellerId") Long resellerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
