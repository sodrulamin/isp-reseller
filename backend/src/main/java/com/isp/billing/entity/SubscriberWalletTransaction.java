package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriber_wallet_transactions")
public class SubscriberWalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private Subscriber subscriber;

    // DEPOSIT (advance or due recovery), MONTHLY_FEE_DEDUCTION, EQUIPMENT_CHARGE, ADJUSTMENT
    @Column(nullable = false, length = 40)
    private String transactionType;

    // Positive for credit/deposit into wallet, negative for deduction
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceBefore;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAfter;

    @Column(length = 30)
    private String paymentMethod; // CASH, BKASH, NAGAD, ROCKET, BANK_TRANSFER, SYSTEM

    @Column(length = 60)
    private String transactionReference;

    @Column(length = 255)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    public SubscriberWalletTransaction() {}

    public SubscriberWalletTransaction(Reseller reseller, Subscriber subscriber, String transactionType,
                                       BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter,
                                       String paymentMethod, String transactionReference, String notes) {
        this.reseller = reseller;
        this.subscriber = subscriber;
        this.transactionType = transactionType;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.notes = notes;
        this.transactionDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public Subscriber getSubscriber() { return subscriber; }
    public void setSubscriber(Subscriber subscriber) { this.subscriber = subscriber; }

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

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}
