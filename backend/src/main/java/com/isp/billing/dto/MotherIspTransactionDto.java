package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MotherIspTransactionDto {
    private Long id;
    private Long resellerId;
    private String resellerName;
    private Long subscriberId;
    private String subscriberName;
    private String subscriberCode;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String paymentMethod;
    private String transactionRef;
    private String notes;
    private LocalDateTime transactionDate;

    public MotherIspTransactionDto() {}

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

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }

    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}
