package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ResellerDto {
    private Long id;
    private String name;
    private String code;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String motherIspName;
    private BigDecimal motherIspDisbursementPercentage;
    private String status;
    private long subscriberCount;
    private LocalDateTime createdAt;

    public ResellerDto() {}

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getSubscriberCount() { return subscriberCount; }
    public void setSubscriberCount(long subscriberCount) { this.subscriberCount = subscriberCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
