package com.isp.billing.service;

import com.isp.billing.dto.CreateEquipmentRequest;
import com.isp.billing.dto.EquipmentDto;
import com.isp.billing.dto.WalletDepositRequest;
import com.isp.billing.entity.Equipment;
import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.Subscriber;
import com.isp.billing.entity.SubscriberWalletTransaction;
import com.isp.billing.repository.EquipmentRepository;
import com.isp.billing.repository.SubscriberRepository;
import com.isp.billing.repository.SubscriberWalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final SubscriberRepository subscriberRepository;
    private final SubscriberWalletTransactionRepository walletTransactionRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            SubscriberRepository subscriberRepository,
                            SubscriberWalletTransactionRepository walletTransactionRepository) {
        this.equipmentRepository = equipmentRepository;
        this.subscriberRepository = subscriberRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    public List<EquipmentDto> getEquipmentsForReseller(Long resellerId) {
        return equipmentRepository.findByResellerIdOrderByPurchaseDateDesc(resellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EquipmentDto createEquipment(Reseller reseller, CreateEquipmentRequest req) {
        Equipment eq = new Equipment();
        eq.setReseller(reseller);
        eq.setName(req.getName());
        eq.setItemType(req.getItemType());
        eq.setSerialNumber(req.getSerialNumber());
        eq.setPurchaseCost(req.getPurchaseCost());
        eq.setPurchaseDate(req.getPurchaseDate() != null ? req.getPurchaseDate() : LocalDate.now());
        eq.setStatus(req.getStatus() != null ? req.getStatus() : "IN_STOCK");
        eq.setNotes(req.getNotes());

        if (req.getSubscriberId() != null) {
            Subscriber sub = subscriberRepository.findById(req.getSubscriberId())
                    .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
            if (!sub.getReseller().getId().equals(reseller.getId())) {
                throw new IllegalArgumentException("Unauthorized");
            }
            eq.setSubscriber(sub);
            eq.setStatus("DEPLOYED");
            eq.setBilledToSubscriber(req.isBilledToSubscriber());

            if (req.isBilledToSubscriber()) {
                BigDecimal billed = req.getCustomerBilledAmount() != null ? req.getCustomerBilledAmount() : BigDecimal.ZERO;
                BigDecimal paid = req.getCustomerPaidAmount() != null ? req.getCustomerPaidAmount() : BigDecimal.ZERO;
                eq.setCustomerBilledAmount(billed);
                eq.setCustomerPaidAmount(paid);

                if (paid.compareTo(billed) >= 0 && billed.compareTo(BigDecimal.ZERO) > 0) {
                    eq.setPaymentStatus("PAID");
                } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
                    eq.setPaymentStatus("PARTIAL");
                } else {
                    eq.setPaymentStatus("DUE");
                }

                // If billed and not immediately paid via cash, charge against subscriber wallet
                if (billed.compareTo(paid) > 0) {
                    BigDecimal due = billed.subtract(paid);
                    BigDecimal balanceBefore = sub.getWalletBalance();
                    BigDecimal balanceAfter = balanceBefore.subtract(due);
                    sub.setWalletBalance(balanceAfter);
                    subscriberRepository.save(sub);

                    SubscriberWalletTransaction tx = new SubscriberWalletTransaction(
                            reseller,
                            sub,
                            "EQUIPMENT_CHARGE",
                            due,
                            balanceBefore,
                            balanceAfter,
                            "WALLET_DEBIT",
                            "EQ-CHG-" + System.currentTimeMillis(),
                            "Charge for equipment: " + eq.getName() + " (" + eq.getItemType() + ")"
                    );
                    walletTransactionRepository.save(tx);
                }
            } else {
                eq.setCustomerBilledAmount(BigDecimal.ZERO);
                eq.setCustomerPaidAmount(BigDecimal.ZERO);
                eq.setPaymentStatus("ABSORBED_BY_RESELLER");
            }
        }

        return mapToDto(equipmentRepository.save(eq));
    }

    @Transactional
    public EquipmentDto assignEquipmentToSubscriber(Long equipmentId, Long resellerId, Long subscriberId,
                                                    boolean billedToSubscriber, BigDecimal billedAmount, BigDecimal paidAmount) {
        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
        if (!eq.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Subscriber sub = subscriberRepository.findById(subscriberId)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!sub.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        eq.setSubscriber(sub);
        eq.setStatus("DEPLOYED");
        eq.setBilledToSubscriber(billedToSubscriber);

        if (billedToSubscriber) {
            BigDecimal billed = billedAmount != null ? billedAmount : BigDecimal.ZERO;
            BigDecimal paid = paidAmount != null ? paidAmount : BigDecimal.ZERO;
            eq.setCustomerBilledAmount(billed);
            eq.setCustomerPaidAmount(paid);

            if (paid.compareTo(billed) >= 0) {
                eq.setPaymentStatus("PAID");
            } else {
                eq.setPaymentStatus("DUE");
                BigDecimal due = billed.subtract(paid);
                BigDecimal balanceBefore = sub.getWalletBalance();
                BigDecimal balanceAfter = balanceBefore.subtract(due);
                sub.setWalletBalance(balanceAfter);
                subscriberRepository.save(sub);

                SubscriberWalletTransaction tx = new SubscriberWalletTransaction(
                        eq.getReseller(),
                        sub,
                        "EQUIPMENT_CHARGE",
                        due,
                        balanceBefore,
                        balanceAfter,
                        "WALLET_DEBIT",
                        "EQ-CHG-" + System.currentTimeMillis(),
                        "Charge for assigned equipment: " + eq.getName()
                );
                walletTransactionRepository.save(tx);
            }
        } else {
            eq.setCustomerBilledAmount(BigDecimal.ZERO);
            eq.setCustomerPaidAmount(BigDecimal.ZERO);
            eq.setPaymentStatus("ABSORBED_BY_RESELLER");
        }

        return mapToDto(equipmentRepository.save(eq));
    }

    public EquipmentDto mapToDto(Equipment eq) {
        EquipmentDto dto = new EquipmentDto();
        dto.setId(eq.getId());
        dto.setName(eq.getName());
        dto.setItemType(eq.getItemType());
        dto.setSerialNumber(eq.getSerialNumber());
        dto.setPurchaseCost(eq.getPurchaseCost());
        dto.setPurchaseDate(eq.getPurchaseDate());
        if (eq.getSubscriber() != null) {
            dto.setSubscriberId(eq.getSubscriber().getId());
            dto.setSubscriberName(eq.getSubscriber().getName());
            dto.setSubscriberCode(eq.getSubscriber().getSubscriberCode());
        }
        dto.setBilledToSubscriber(eq.isBilledToSubscriber());
        dto.setCustomerBilledAmount(eq.getCustomerBilledAmount());
        dto.setCustomerPaidAmount(eq.getCustomerPaidAmount());
        dto.setPaymentStatus(eq.getPaymentStatus());
        dto.setStatus(eq.getStatus());
        dto.setNotes(eq.getNotes());
        return dto;
    }
}
