package com.isp.billing.repository;

import com.isp.billing.entity.Subscriber;
import com.isp.billing.entity.SubscriberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    List<Subscriber> findByResellerId(Long resellerId);
    List<Subscriber> findByResellerIdAndStatus(Long resellerId, SubscriberStatus status);
    Optional<Subscriber> findByResellerIdAndSubscriberCode(Long resellerId, String subscriberCode);
    long countByResellerId(Long resellerId);
    long countByResellerIdAndStatus(Long resellerId, SubscriberStatus status);
    long countByStatus(SubscriberStatus status);

    // Find subscribers whose billing renewal is due
    @Query("SELECT s FROM Subscriber s WHERE s.status = 'ACTIVE' AND s.nextBillingDate <= :date")
    List<Subscriber> findSubscribersDueForRenewal(@Param("date") LocalDate date);

    @Query("SELECT s FROM Subscriber s WHERE s.reseller.id = :resellerId AND s.status = 'ACTIVE' AND s.nextBillingDate <= :date")
    List<Subscriber> findSubscribersDueForRenewalByReseller(@Param("resellerId") Long resellerId, @Param("date") LocalDate date);
}
