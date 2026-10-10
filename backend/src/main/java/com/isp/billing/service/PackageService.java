package com.isp.billing.service;

import com.isp.billing.dto.PackageDto;
import com.isp.billing.entity.InternetPackage;
import com.isp.billing.entity.Reseller;
import com.isp.billing.repository.InternetPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageService {

    private final InternetPackageRepository packageRepository;

    public PackageService(InternetPackageRepository packageRepository) {
        this.packageRepository = packageRepository;
    }

    public List<PackageDto> getPackagesForReseller(Long resellerId) {
        return packageRepository.findByResellerId(resellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PackageDto> getActivePackagesForReseller(Long resellerId) {
        return packageRepository.findByResellerIdAndActiveTrue(resellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PackageDto createPackage(Reseller reseller, PackageDto dto) {
        InternetPackage p = new InternetPackage(
                reseller,
                dto.getName(),
                dto.getSpeedMbps(),
                dto.getMonthlyPrice(),
                dto.getDescription()
        );
        return mapToDto(packageRepository.save(p));
    }

    @Transactional
    public PackageDto updatePackage(Long id, Long resellerId, PackageDto dto) {
        InternetPackage p = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));
        if (!p.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized access to package");
        }
        p.setName(dto.getName());
        p.setSpeedMbps(dto.getSpeedMbps());
        p.setMonthlyPrice(dto.getMonthlyPrice());
        p.setDescription(dto.getDescription());
        p.setActive(dto.isActive());
        return mapToDto(packageRepository.save(p));
    }

    @Transactional
    public void deletePackage(Long id, Long resellerId) {
        InternetPackage p = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));
        if (!p.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized access to package");
        }
        p.setActive(false);
        packageRepository.save(p);
    }

    public PackageDto mapToDto(InternetPackage p) {
        PackageDto dto = new PackageDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSpeedMbps(p.getSpeedMbps());
        dto.setMonthlyPrice(p.getMonthlyPrice());
        dto.setDescription(p.getDescription());
        dto.setActive(p.isActive());
        return dto;
    }
}
