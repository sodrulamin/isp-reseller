package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "internet_packages")
public class InternetPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer speedMbps;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(length = 255)
    private String description;

    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public InternetPackage() {}

    public InternetPackage(Reseller reseller, String name, Integer speedMbps, BigDecimal monthlyPrice, String description) {
        this.reseller = reseller;
        this.name = name;
        this.speedMbps = speedMbps;
        this.monthlyPrice = monthlyPrice;
        this.description = description;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSpeedMbps() { return speedMbps; }
    public void setSpeedMbps(Integer speedMbps) { this.speedMbps = speedMbps; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
