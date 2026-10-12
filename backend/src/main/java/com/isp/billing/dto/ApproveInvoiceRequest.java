package com.isp.billing.dto;

import java.math.BigDecimal;

public class ApproveInvoiceRequest {
    private BigDecimal amount;
    private String paymentChannel = "DIRECT_RESELLER";
    private String paymentMethod = "CASH";
    private String transactionReference;
    private String notes;

    public ApproveInvoiceRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentChannel() { return paymentChannel; }
    public void setPaymentChannel(String paymentChannel) { this.paymentChannel = paymentChannel; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
