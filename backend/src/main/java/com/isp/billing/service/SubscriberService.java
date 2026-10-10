package com.isp.billing.service;

import com.isp.billing.dto.CreateSubscriberRequest;
import com.isp.billing.dto.SubscriberDto;
import com.isp.billing.dto.WalletDepositRequest;
import com.isp.billing.entity.*;
import com.isp.billing.repository.InternetPackageRepository;
import com.isp.billing.repository.SubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriberService {

    private final SubscriberRepository subscriberRepository;
    private final InternetPackageRepository packageRepository;
    private final BillingService billingService;

    public SubscriberService(SubscriberRepository subscriberRepository,
                             InternetPackageRepository packageRepository,
                             BillingService billingService) {
        this.subscriberRepository = subscriberRepository;
        this.packageRepository = packageRepository;
        this.billingService = billingService;
    }

    public List<SubscriberDto> getSubscribersForReseller(Long resellerId) {
        return subscriberRepository.findByResellerId(resellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SubscriberDto getSubscriberDto(Long id, Long resellerId) {
        Subscriber s = getSubscriber(id, resellerId);
        return mapToDto(s);
    }

    public Subscriber getSubscriber(Long id, Long resellerId) {
        Subscriber s = subscriberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!s.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return s;
    }

    @Transactional
    public SubscriberDto createSubscriber(Reseller reseller, CreateSubscriberRequest req) {
        InternetPackage pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new IllegalArgumentException("Package not found with id: " + req.getPackageId()));
        if (!pkg.getReseller().getId().equals(reseller.getId())) {
            throw new IllegalArgumentException("Package does not belong to this workspace");
        }

        LocalDate joinDate = req.getJoinDate() != null ? req.getJoinDate() : LocalDate.now();
        int cycleDay = joinDate.getDayOfMonth();

        String code = req.getSubscriberCode();
        if (code == null || code.isBlank()) {
            long count = subscriberRepository.countByResellerId(reseller.getId()) + 1;
            code = String.format("SUB-%s-%04d", reseller.getCode().toUpperCase(), count);
        }

        Subscriber subscriber = new Subscriber();
        subscriber.setReseller(reseller);
        subscriber.setSubscriberCode(code);
        subscriber.setName(req.getName());
        subscriber.setPhone(req.getPhone());
        subscriber.setEmail(req.getEmail());
        subscriber.setAddress(req.getAddress());
        subscriber.setInternetPackage(pkg);
        subscriber.setJoinDate(joinDate);
        subscriber.setBillingCycleDay(cycleDay);
        subscriber.setCurrentBillingPeriodStart(joinDate);
        subscriber.setCurrentBillingPeriodEnd(joinDate.plusMonths(1).minusDays(1));
        subscriber.setNextBillingDate(joinDate.plusMonths(1));
        subscriber.setMotherIspRateOverride(req.getMotherIspRateOverride());
        subscriber.setWalletBalance(BigDecimal.ZERO);
        subscriber.setStatus(SubscriberStatus.ACTIVE);
        subscriber.setPppoeUsername(req.getPppoeUsername());
        subscriber.setPppoePassword(req.getPppoePassword());
        subscriber.setIpAddress(req.getIpAddress());
        subscriber.setNotes(req.getNotes());

        subscriber = subscriberRepository.save(subscriber);

        // If customer provided an initial advance payment deposit
        if (req.getInitialDeposit() != null && req.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            WalletDepositRequest depositReq = new WalletDepositRequest();
            depositReq.setAmount(req.getInitialDeposit());
            depositReq.setPaymentMethod("CASH");
            depositReq.setNotes("Initial subscription signup deposit");
            billingService.depositToWallet(subscriber.getId(), reseller.getId(), depositReq);
            // reload updated balance
            subscriber = subscriberRepository.findById(subscriber.getId()).orElse(subscriber);
        }

        // Initialize Month 1: Calculate mother ISP payout & debit wallet / invoice cycle
        billingService.processMonthlyCycleRenewal(subscriber, joinDate);

        return mapToDto(subscriber);
    }

    @Transactional
    public SubscriberDto updateSubscriber(Long id, Long resellerId, CreateSubscriberRequest req) {
        Subscriber s = getSubscriber(id, resellerId);
        s.setName(req.getName());
        s.setPhone(req.getPhone());
        s.setEmail(req.getEmail());
        s.setAddress(req.getAddress());
        s.setPppoeUsername(req.getPppoeUsername());
        s.setPppoePassword(req.getPppoePassword());
        s.setIpAddress(req.getIpAddress());
        s.setNotes(req.getNotes());
        s.setMotherIspRateOverride(req.getMotherIspRateOverride());

        if (req.getPackageId() != null && !req.getPackageId().equals(s.getInternetPackage().getId())) {
            InternetPackage newPkg = packageRepository.findById(req.getPackageId())
                    .orElseThrow(() -> new IllegalArgumentException("Package not found"));
            s.setInternetPackage(newPkg);
        }

        return mapToDto(subscriberRepository.save(s));
    }

    @Transactional
    public SubscriberDto updateStatus(Long id, Long resellerId, SubscriberStatus status) {
        Subscriber s = getSubscriber(id, resellerId);
        s.setStatus(status);
        return mapToDto(subscriberRepository.save(s));
    }

    public SubscriberDto mapToDto(Subscriber s) {
        SubscriberDto dto = new SubscriberDto();
        dto.setId(s.getId());
        dto.setResellerId(s.getReseller().getId());
        dto.setSubscriberCode(s.getSubscriberCode());
        dto.setName(s.getName());
        dto.setPhone(s.getPhone());
        dto.setEmail(s.getEmail());
        dto.setAddress(s.getAddress());
        dto.setPackageId(s.getInternetPackage().getId());
        dto.setPackageName(s.getInternetPackage().getName());
        dto.setPackagePrice(s.getInternetPackage().getMonthlyPrice());
        dto.setPackageSpeed(s.getInternetPackage().getSpeedMbps());
        dto.setJoinDate(s.getJoinDate());
        dto.setBillingCycleDay(s.getBillingCycleDay());
        dto.setCurrentBillingPeriodStart(s.getCurrentBillingPeriodStart());
        dto.setCurrentBillingPeriodEnd(s.getCurrentBillingPeriodEnd());
        dto.setNextBillingDate(s.getNextBillingDate());
        dto.setMotherIspRateOverride(s.getMotherIspRateOverride());

        BigDecimal rate = s.getMotherIspRateOverride() != null ? s.getMotherIspRateOverride() : s.getReseller().getMotherIspDisbursementPercentage();
        dto.setEffectiveMotherIspRate(rate);

        BigDecimal monthlyPayout = s.getInternetPackage().getMonthlyPrice().multiply(rate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        dto.setMotherIspMonthlyPayout(monthlyPayout);

        dto.setWalletBalance(s.getWalletBalance());
        dto.setStatus(s.getStatus());
        dto.setPppoeUsername(s.getPppoeUsername());
        dto.setIpAddress(s.getIpAddress());
        dto.setNotes(s.getNotes());
        return dto;
    }
}
