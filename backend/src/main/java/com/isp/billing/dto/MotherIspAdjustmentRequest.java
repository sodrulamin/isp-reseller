package com.isp.billing.dto;

import java.math.BigDecimal;

public class MotherIspAdjustmentRequest {
    private BigDecimal amount;
    private String paymentMethod; // CASH, BKASH, NAGAD, BANK_TRANSFER, ONLINE_PORTAL
    private String transactionRef;
    private String notes;

    public MotherIspAdjustmentRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
