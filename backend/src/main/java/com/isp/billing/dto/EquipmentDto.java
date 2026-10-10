package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EquipmentDto {
    private Long id;
    private String name;
    private String itemType;
    private String serialNumber;
    private BigDecimal purchaseCost;
    private LocalDate purchaseDate;
    private Long subscriberId;
    private String subscriberName;
    private String subscriberCode;
    private boolean billedToSubscriber;
    private BigDecimal customerBilledAmount;
    private BigDecimal customerPaidAmount;
    private String paymentStatus;
    private String status;
    private String notes;

    public EquipmentDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public String getSubscriberCode() { return subscriberCode; }
    public void setSubscriberCode(String subscriberCode) { this.subscriberCode = subscriberCode; }

    public boolean isBilledToSubscriber() { return billedToSubscriber; }
    public void setBilledToSubscriber(boolean billedToSubscriber) { this.billedToSubscriber = billedToSubscriber; }

    public BigDecimal getCustomerBilledAmount() { return customerBilledAmount; }
    public void setCustomerBilledAmount(BigDecimal customerBilledAmount) { this.customerBilledAmount = customerBilledAmount; }

    public BigDecimal getCustomerPaidAmount() { return customerPaidAmount; }
    public void setCustomerPaidAmount(BigDecimal customerPaidAmount) { this.customerPaidAmount = customerPaidAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
