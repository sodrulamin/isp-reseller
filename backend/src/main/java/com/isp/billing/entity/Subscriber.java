package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscribers")
public class Subscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @Column(nullable = false, length = 60)
    private String subscriberCode;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 255)
    private String address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "internet_package_id", nullable = false)
    private InternetPackage internetPackage;

    // Join date defines the billing cycle!
    @Column(nullable = false)
    private LocalDate joinDate;

    // Day of the month when billing cycle renews (e.g. 15 for 15th of each month)
    @Column(nullable = false)
    private int billingCycleDay;

    @Column(nullable = false)
    private LocalDate currentBillingPeriodStart;

    @Column(nullable = false)
    private LocalDate currentBillingPeriodEnd;

    @Column(nullable = false)
    private LocalDate nextBillingDate;

    // Optional override for mother ISP rate for this specific subscriber
    @Column(precision = 5, scale = 2)
    private BigDecimal motherIspRateOverride;

    // Subscriber wallet: positive means advance payment, negative means overdue/delayed payment
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubscriberStatus status = SubscriberStatus.ACTIVE;

    @Column(length = 60)
    private String pppoeUsername;

    @Column(length = 60)
    private String pppoePassword;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 255)
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Subscriber() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public String getSubscriberCode() { return subscriberCode; }
    public void setSubscriberCode(String subscriberCode) { this.subscriberCode = subscriberCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public InternetPackage getInternetPackage() { return internetPackage; }
    public void setInternetPackage(InternetPackage internetPackage) { this.internetPackage = internetPackage; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public int getBillingCycleDay() { return billingCycleDay; }
    public void setBillingCycleDay(int billingCycleDay) { this.billingCycleDay = billingCycleDay; }

    public LocalDate getCurrentBillingPeriodStart() { return currentBillingPeriodStart; }
    public void setCurrentBillingPeriodStart(LocalDate currentBillingPeriodStart) { this.currentBillingPeriodStart = currentBillingPeriodStart; }

    public LocalDate getCurrentBillingPeriodEnd() { return currentBillingPeriodEnd; }
    public void setCurrentBillingPeriodEnd(LocalDate currentBillingPeriodEnd) { this.currentBillingPeriodEnd = currentBillingPeriodEnd; }

    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }

    public BigDecimal getMotherIspRateOverride() { return motherIspRateOverride; }
    public void setMotherIspRateOverride(BigDecimal motherIspRateOverride) { this.motherIspRateOverride = motherIspRateOverride; }

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public SubscriberStatus getStatus() { return status; }
    public void setStatus(SubscriberStatus status) { this.status = status; }

    public String getPppoeUsername() { return pppoeUsername; }
    public void setPppoeUsername(String pppoeUsername) { this.pppoeUsername = pppoeUsername; }

    public String getPppoePassword() { return pppoePassword; }
    public void setPppoePassword(String pppoePassword) { this.pppoePassword = pppoePassword; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
