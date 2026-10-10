package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipments")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @Column(nullable = false, length = 100)
    private String name; // e.g., "TP-Link Archer C6", "Huawei GPON ONU", "100m Optical Patch Cord"

    @Column(nullable = false, length = 50)
    private String itemType; // ROUTER, ONU, OPTICAL_FIBER, CABLE, CONNECTOR, MEDIA_CONVERTER, OTHER

    @Column(length = 100)
    private String serialNumber;

    // Reseller Expense: How much reseller paid to buy this equipment
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchaseCost;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    // Assigned subscriber (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id")
    private Subscriber subscriber;

    // Whether subscriber is billed or if reseller absorbed the cost
    @Column(nullable = false)
    private boolean billedToSubscriber = false;

    // Revenue collected from subscriber for this equipment (if any)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal customerBilledAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal customerPaidAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String paymentStatus = "NOT_BILLED"; // NOT_BILLED, PAID, DUE, WAIVED

    @Column(nullable = false, length = 30)
    private String status = "IN_STOCK"; // IN_STOCK, DEPLOYED, DEFECTIVE, RETIRED

    @Column(length = 255)
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Equipment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public Subscriber getSubscriber() { return subscriber; }
    public void setSubscriber(Subscriber subscriber) { this.subscriber = subscriber; }

    public boolean isBilledToSubscriber() { return billedToSubscriber; }
    public void setBilledToSubscriber(boolean billedToSubscriber) { this.billedToSubscriber = billedToSubscriber; }

    public BigDecimal getCustomerBilledAmount() { return customerBilledAmount; }
    public void setCustomerBilledAmount(BigDecimal customerBilledAmount) { this.customerBilledAmount = customerBilledAmount; }

    public BigDecimal getCustomerPaidAmount() { return customerPaidAmount; }
    public void setCustomerPaidAmount(BigDecimal customerPaidAmount) { this.customerPaidAmount = customerPaidAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
