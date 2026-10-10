package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mother_isp_payouts")
public class MotherIspPayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private Subscriber subscriber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internet_package_id")
    private InternetPackage internetPackage;

    // The billing period start date or cycle date this payout corresponds to
    @Column(nullable = false)
    private LocalDate cycleDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal packagePrice;

    // The percentage rate applied (e.g. 49.00)
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal disbursementPercentage;

    // amountPaid = packagePrice * (disbursementPercentage / 100)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, length = 30)
    private String paymentStatus = "PAID"; // PAID, PENDING

    @Column(length = 60)
    private String transactionRef;

    @Column(length = 255)
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public MotherIspPayout() {}

    public MotherIspPayout(Reseller reseller, Subscriber subscriber, InternetPackage internetPackage,
                           LocalDate cycleDate, BigDecimal packagePrice, BigDecimal disbursementPercentage,
                           BigDecimal amountPaid, LocalDate paymentDate, String paymentStatus, String notes) {
        this.reseller = reseller;
        this.subscriber = subscriber;
        this.internetPackage = internetPackage;
        this.cycleDate = cycleDate;
        this.packagePrice = packagePrice;
        this.disbursementPercentage = disbursementPercentage;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public Subscriber getSubscriber() { return subscriber; }
    public void setSubscriber(Subscriber subscriber) { this.subscriber = subscriber; }

    public InternetPackage getInternetPackage() { return internetPackage; }
    public void setInternetPackage(InternetPackage internetPackage) { this.internetPackage = internetPackage; }

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
