package com.isp.billing.repository;

import com.isp.billing.entity.Reseller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ResellerRepository extends JpaRepository<Reseller, Long> {
    Optional<Reseller> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT COALESCE(SUM(r.motherIspResellerBalance), 0) FROM Reseller r")
    BigDecimal sumTotalMotherIspResellerBalance();
}
