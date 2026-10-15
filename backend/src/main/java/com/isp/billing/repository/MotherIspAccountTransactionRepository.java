package com.isp.billing.repository;

import com.isp.billing.entity.MotherIspAccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotherIspAccountTransactionRepository extends JpaRepository<MotherIspAccountTransaction, Long> {
    List<MotherIspAccountTransaction> findByResellerIdOrderByTransactionDateDesc(Long resellerId);
    List<MotherIspAccountTransaction> findAllByOrderByTransactionDateDesc();
}
