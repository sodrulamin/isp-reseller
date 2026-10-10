package com.isp.billing.repository;

import com.isp.billing.entity.InternetPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternetPackageRepository extends JpaRepository<InternetPackage, Long> {
    List<InternetPackage> findByResellerId(Long resellerId);
    List<InternetPackage> findByResellerIdAndActiveTrue(Long resellerId);
}
