package com.isp.billing.dto;

import com.isp.billing.entity.SubscriberStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SubscriberDto {
    private Long id;
    private Long resellerId;
    private String subscriberCode;
    private String name;
    private String phone;
    private String email;
    private String address;
    private Long packageId;
    private String packageName;
    private BigDecimal packagePrice;
    private Integer packageSpeed;
    private LocalDate joinDate;
    private int billingCycleDay;
    private LocalDate currentBillingPeriodStart;
    private LocalDate currentBillingPeriodEnd;
    private LocalDate nextBillingDate;
    private BigDecimal motherIspRateOverride;
    private BigDecimal effectiveMotherIspRate;
    private BigDecimal motherIspMonthlyPayout;
    private BigDecimal walletBalance;
    private SubscriberStatus status;
    private String pppoeUsername;
    private String ipAddress;
    private String notes;

    public SubscriberDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResellerId() { return resellerId; }
    public void setResellerId(Long resellerId) { this.resellerId = resellerId; }

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

    public Long getPackageId() { return packageId; }
    public void setPackageId(Long packageId) { this.packageId = packageId; }

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public BigDecimal getPackagePrice() { return packagePrice; }
    public void setPackagePrice(BigDecimal packagePrice) { this.packagePrice = packagePrice; }

    public Integer getPackageSpeed() { return packageSpeed; }
    public void setPackageSpeed(Integer packageSpeed) { this.packageSpeed = packageSpeed; }

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

    public BigDecimal getEffectiveMotherIspRate() { return effectiveMotherIspRate; }
    public void setEffectiveMotherIspRate(BigDecimal effectiveMotherIspRate) { this.effectiveMotherIspRate = effectiveMotherIspRate; }

    public BigDecimal getMotherIspMonthlyPayout() { return motherIspMonthlyPayout; }
    public void setMotherIspMonthlyPayout(BigDecimal motherIspMonthlyPayout) { this.motherIspMonthlyPayout = motherIspMonthlyPayout; }

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public SubscriberStatus getStatus() { return status; }
    public void setStatus(SubscriberStatus status) { this.status = status; }

    public String getPppoeUsername() { return pppoeUsername; }
    public void setPppoeUsername(String pppoeUsername) { this.pppoeUsername = pppoeUsername; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
