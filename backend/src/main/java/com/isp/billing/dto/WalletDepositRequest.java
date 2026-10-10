package com.isp.billing.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WalletDepositRequest {
    @NotNull
    private BigDecimal amount;

    private String paymentMethod = "CASH"; // CASH, BKASH, NAGAD, ROCKET, BANK_TRANSFER, ONLINE_PORTAL
    private String paymentChannel = "DIRECT_RESELLER"; // DIRECT_RESELLER or MOTHER_ISP_PORTAL
    private String transactionReference;
    private String notes;

    public WalletDepositRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentChannel() { return paymentChannel; }
    public void setPaymentChannel(String paymentChannel) { this.paymentChannel = paymentChannel; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
