package com.isp.billing.dto;

import com.isp.billing.entity.SubscriberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateSubscriberRequest {
    private String subscriberCode;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String email;
    private String address;

    @NotNull
    private Long packageId;

    // Join date (defaults to today if null)
    private LocalDate joinDate;

    // Optional override for mother ISP rate
    private BigDecimal motherIspRateOverride;

    // Optional initial deposit amount
    private BigDecimal initialDeposit = BigDecimal.ZERO;

    private Integer billingCycleDay;
    private LocalDate nextBillingDate;
    private LocalDate currentBillingPeriodStart;
    private LocalDate currentBillingPeriodEnd;
    private SubscriberStatus status;

    @NotBlank(message = "PPPoE username is mandatory")
    private String pppoeUsername;
    private String pppoePassword;
    private String ipAddress;
    private String notes;

    public CreateSubscriberRequest() {}

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

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public BigDecimal getMotherIspRateOverride() { return motherIspRateOverride; }
    public void setMotherIspRateOverride(BigDecimal motherIspRateOverride) { this.motherIspRateOverride = motherIspRateOverride; }

    public BigDecimal getInitialDeposit() { return initialDeposit; }
    public void setInitialDeposit(BigDecimal initialDeposit) { this.initialDeposit = initialDeposit; }

    public String getPppoeUsername() { return pppoeUsername; }
    public void setPppoeUsername(String pppoeUsername) { this.pppoeUsername = pppoeUsername; }

    public String getPppoePassword() { return pppoePassword; }
    public void setPppoePassword(String pppoePassword) { this.pppoePassword = pppoePassword; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getBillingCycleDay() { return billingCycleDay; }
    public void setBillingCycleDay(Integer billingCycleDay) { this.billingCycleDay = billingCycleDay; }

    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }

    public LocalDate getCurrentBillingPeriodStart() { return currentBillingPeriodStart; }
    public void setCurrentBillingPeriodStart(LocalDate currentBillingPeriodStart) { this.currentBillingPeriodStart = currentBillingPeriodStart; }

    public LocalDate getCurrentBillingPeriodEnd() { return currentBillingPeriodEnd; }
    public void setCurrentBillingPeriodEnd(LocalDate currentBillingPeriodEnd) { this.currentBillingPeriodEnd = currentBillingPeriodEnd; }

    public SubscriberStatus getStatus() { return status; }
    public void setStatus(SubscriberStatus status) { this.status = status; }
}
