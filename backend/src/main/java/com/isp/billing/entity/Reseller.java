package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resellers")
public class Reseller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(length = 100)
    private String contactPerson;

    @Column(length = 30)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 120)
    private String motherIspName = "Default Mother ISP";

    // Disbursement percentage to mother ISP, e.g. 49.00 means 49% paid to Mother ISP, 51% retained
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal motherIspDisbursementPercentage = new BigDecimal("49.00");

    // Reseller's accumulated credit balance held at Mother ISP (from subscriber payments via Mother ISP portal)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal motherIspResellerBalance = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Reseller() {}

    public Reseller(String name, String code, String contactPerson, String phone, String email, 
                    String address, String motherIspName, BigDecimal motherIspDisbursementPercentage) {
        this.name = name;
        this.code = code;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.motherIspName = motherIspName != null ? motherIspName : "Default Mother ISP";
        this.motherIspDisbursementPercentage = motherIspDisbursementPercentage != null ? motherIspDisbursementPercentage : new BigDecimal("49.00");
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMotherIspName() { return motherIspName; }
    public void setMotherIspName(String motherIspName) { this.motherIspName = motherIspName; }

    public BigDecimal getMotherIspDisbursementPercentage() { return motherIspDisbursementPercentage; }
    public void setMotherIspDisbursementPercentage(BigDecimal motherIspDisbursementPercentage) {
        this.motherIspDisbursementPercentage = motherIspDisbursementPercentage;
    }

    public BigDecimal getMotherIspResellerBalance() { return motherIspResellerBalance; }
    public void setMotherIspResellerBalance(BigDecimal motherIspResellerBalance) {
        this.motherIspResellerBalance = motherIspResellerBalance;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
