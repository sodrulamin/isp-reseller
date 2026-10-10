package com.isp.billing.service;

import com.isp.billing.dto.CreateResellerRequest;
import com.isp.billing.dto.ResellerDto;
import com.isp.billing.entity.InternetPackage;
import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.Role;
import com.isp.billing.entity.User;
import com.isp.billing.repository.InternetPackageRepository;
import com.isp.billing.repository.ResellerRepository;
import com.isp.billing.repository.SubscriberRepository;
import com.isp.billing.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResellerService {

    private final ResellerRepository resellerRepository;
    private final UserRepository userRepository;
    private final InternetPackageRepository packageRepository;
    private final SubscriberRepository subscriberRepository;
    private final PasswordEncoder passwordEncoder;

    public ResellerService(ResellerRepository resellerRepository,
                           UserRepository userRepository,
                           InternetPackageRepository packageRepository,
                           SubscriberRepository subscriberRepository,
                           PasswordEncoder passwordEncoder) {
        this.resellerRepository = resellerRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
        this.subscriberRepository = subscriberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ResellerDto> getAllResellers() {
        return resellerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ResellerDto getResellerDtoById(Long id) {
        Reseller r = resellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reseller not found with id: " + id));
        return mapToDto(r);
    }

    public Reseller getResellerById(Long id) {
        return resellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reseller not found with id: " + id));
    }

    @Transactional
    public ResellerDto createReseller(CreateResellerRequest req) {
        if (resellerRepository.existsByCode(req.getCode())) {
            throw new IllegalArgumentException("Reseller code already exists: " + req.getCode());
        }
        if (userRepository.existsByUsername(req.getAdminUsername())) {
            throw new IllegalArgumentException("Username already exists: " + req.getAdminUsername());
        }

        Reseller reseller = new Reseller(
                req.getName(),
                req.getCode().toLowerCase().trim(),
                req.getContactPerson(),
                req.getPhone(),
                req.getEmail(),
                req.getAddress(),
                req.getMotherIspName(),
                req.getMotherIspDisbursementPercentage() != null ? req.getMotherIspDisbursementPercentage() : new BigDecimal("49.00")
        );
        reseller = resellerRepository.save(reseller);

        // Create Reseller Admin User
        User adminUser = new User(
                req.getAdminUsername(),
                passwordEncoder.encode(req.getAdminPassword()),
                req.getAdminFullName() != null ? req.getAdminFullName() : req.getName() + " Admin",
                req.getEmail(),
                req.getPhone(),
                Role.ROLE_RESELLER_ADMIN,
                reseller
        );
        userRepository.save(adminUser);

        // Seed some starter packages for the new workspace
        seedStarterPackages(reseller);

        return mapToDto(reseller);
    }

    @Transactional
    public ResellerDto updateReseller(Long id, ResellerDto dto) {
        Reseller r = getResellerById(id);
        r.setName(dto.getName());
        r.setContactPerson(dto.getContactPerson());
        r.setPhone(dto.getPhone());
        r.setEmail(dto.getEmail());
        r.setAddress(dto.getAddress());
        if (dto.getMotherIspName() != null) {
            r.setMotherIspName(dto.getMotherIspName());
        }
        if (dto.getMotherIspDisbursementPercentage() != null) {
            r.setMotherIspDisbursementPercentage(dto.getMotherIspDisbursementPercentage());
        }
        if (dto.getStatus() != null) {
            r.setStatus(dto.getStatus());
        }
        return mapToDto(resellerRepository.save(r));
    }

    private void seedStarterPackages(Reseller reseller) {
        packageRepository.save(new InternetPackage(reseller, "Standard 20 Mbps", 20, new BigDecimal("800.00"), "Reliable home fiber package"));
        packageRepository.save(new InternetPackage(reseller, "Super 40 Mbps", 40, new BigDecimal("1200.00"), "Bufferless streaming and gaming"));
        packageRepository.save(new InternetPackage(reseller, "Ultra 80 Mbps", 80, new BigDecimal("2000.00"), "High capacity work from home & office"));
    }

    public ResellerDto mapToDto(Reseller r) {
        ResellerDto dto = new ResellerDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setCode(r.getCode());
        dto.setContactPerson(r.getContactPerson());
        dto.setPhone(r.getPhone());
        dto.setEmail(r.getEmail());
        dto.setAddress(r.getAddress());
        dto.setMotherIspName(r.getMotherIspName());
        dto.setMotherIspDisbursementPercentage(r.getMotherIspDisbursementPercentage());
        dto.setMotherIspResellerBalance(r.getMotherIspResellerBalance());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setSubscriberCount(subscriberRepository.countByResellerId(r.getId()));
        return dto;
    }
}
