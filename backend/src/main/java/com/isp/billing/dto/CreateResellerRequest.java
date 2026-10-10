package com.isp.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateResellerRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String contactPerson;
    private String phone;
    private String email;
    private String address;

    private String motherIspName = "Mother ISP Network";

    @NotNull
    private BigDecimal motherIspDisbursementPercentage = new BigDecimal("49.00");

    @NotBlank
    private String adminUsername;

    @NotBlank
    private String adminPassword;

    private String adminFullName;

    public CreateResellerRequest() {}

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

    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }

    public String getAdminFullName() { return adminFullName; }
    public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
}
