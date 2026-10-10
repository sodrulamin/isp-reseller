package com.isp.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateEquipmentRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String itemType;

    private String serialNumber;

    @NotNull
    private BigDecimal purchaseCost;

    private LocalDate purchaseDate;

    private Long subscriberId;

    private boolean billedToSubscriber = false;

    private BigDecimal customerBilledAmount = BigDecimal.ZERO;

    private BigDecimal customerPaidAmount = BigDecimal.ZERO;

    private String status = "IN_STOCK";

    private String notes;

    public CreateEquipmentRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public Long getSubscriberId() { return subscriberId; }
    public void setSubscriberId(Long subscriberId) { this.subscriberId = subscriberId; }

    public boolean isBilledToSubscriber() { return billedToSubscriber; }
    public void setBilledToSubscriber(boolean billedToSubscriber) { this.billedToSubscriber = billedToSubscriber; }

    public BigDecimal getCustomerBilledAmount() { return customerBilledAmount; }
    public void setCustomerBilledAmount(BigDecimal customerBilledAmount) { this.customerBilledAmount = customerBilledAmount; }

    public BigDecimal getCustomerPaidAmount() { return customerPaidAmount; }
    public void setCustomerPaidAmount(BigDecimal customerPaidAmount) { this.customerPaidAmount = customerPaidAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
