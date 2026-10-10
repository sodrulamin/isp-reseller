package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MotherIspPayoutDto {
    private Long id;
    private Long resellerId;
    private String resellerName;
    private Long subscriberId;
    private String subscriberName;
    private String subscriberCode;
    private String packageName;
    private LocalDate cycleDate;
    private BigDecimal packagePrice;
    private BigDecimal disbursementPercentage;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private String paymentStatus;
    private String transactionRef;
    private String notes;
    private LocalDateTime createdAt;

    public MotherIspPayoutDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResellerId() { return resellerId; }
    public void setResellerId(Long resellerId) { this.resellerId = resellerId; }

    public String getResellerName() { return resellerName; }
    public void setResellerName(String resellerName) { this.resellerName = resellerName; }

    public Long getSubscriberId() { return subscriberId; }
    public void setSubscriberId(Long subscriberId) { this.subscriberId = subscriberId; }

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public String getSubscriberCode() { return subscriberCode; }
    public void setSubscriberCode(String subscriberCode) { this.subscriberCode = subscriberCode; }

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public LocalDate getCycleDate() { return cycleDate; }
    public void setCycleDate(LocalDate cycleDate) { this.cycleDate = cycleDate; }

    public BigDecimal getPackagePrice() { return packagePrice; }
    public void setPackagePrice(BigDecimal packagePrice) { this.packagePrice = packagePrice; }

    public BigDecimal getDisbursementPercentage() { return disbursementPercentage; }
    public void setDisbursementPercentage(BigDecimal disbursementPercentage) { this.disbursementPercentage = disbursementPercentage; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
