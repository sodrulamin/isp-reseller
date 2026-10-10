package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletTransactionDto {
    private Long id;
    private Long subscriberId;
    private String subscriberName;
    private String subscriberCode;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String paymentMethod;
    private String paymentChannel;
    private BigDecimal motherIspRetainedAmount;
    private BigDecimal resellerCreditedAmount;
    private String transactionReference;
    private String notes;
    private LocalDateTime transactionDate;

    public WalletTransactionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getPaymentChannel() { return paymentChannel; }
    public void setPaymentChannel(String paymentChannel) { this.paymentChannel = paymentChannel; }

    public BigDecimal getMotherIspRetainedAmount() { return motherIspRetainedAmount; }
    public void setMotherIspRetainedAmount(BigDecimal motherIspRetainedAmount) { this.motherIspRetainedAmount = motherIspRetainedAmount; }

    public BigDecimal getResellerCreditedAmount() { return resellerCreditedAmount; }
    public void setResellerCreditedAmount(BigDecimal resellerCreditedAmount) { this.resellerCreditedAmount = resellerCreditedAmount; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}
