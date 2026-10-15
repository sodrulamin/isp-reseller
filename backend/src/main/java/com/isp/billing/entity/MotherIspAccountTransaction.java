package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mother_isp_account_transactions")
public class MotherIspAccountTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id")
    private Subscriber subscriber;

    // CUSTOMER_PORTAL_PAYMENT, CYCLE_DISBURSEMENT, DISBURSEMENT_REVERSAL, RESELLER_TOPUP, RESELLER_WITHDRAWAL
    @Column(nullable = false, length = 40)
    private String transactionType;

    // Positive for credit into reseller's Mother ISP balance, negative for deduction
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceBefore;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAfter;

    @Column(length = 30)
    private String paymentMethod; // CASH, BKASH, NAGAD, BANK_TRANSFER, ONLINE_PORTAL, SYSTEM

    @Column(length = 80)
    private String transactionRef;

    @Column(length = 255)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    public MotherIspAccountTransaction() {}

    public MotherIspAccountTransaction(Reseller reseller, Subscriber subscriber, String transactionType,
                                       BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter,
                                       String paymentMethod, String transactionRef, String notes) {
        this.reseller = reseller;
        this.subscriber = subscriber;
        this.transactionType = transactionType;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.paymentMethod = paymentMethod;
        this.transactionRef = transactionRef;
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

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}
