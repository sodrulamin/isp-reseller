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

    // Optional billing cycle restart upon payment
    private boolean updateBillingCycle = false;
    private String newBillingStartDate; // "YYYY-MM-DD" e.g. today or reconnection date
    private Integer newBillingCycleDay;  // 1-31 (defaults to day of newBillingStartDate)

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

    public boolean isUpdateBillingCycle() { return updateBillingCycle; }
    public void setUpdateBillingCycle(boolean updateBillingCycle) { this.updateBillingCycle = updateBillingCycle; }

    public String getNewBillingStartDate() { return newBillingStartDate; }
    public void setNewBillingStartDate(String newBillingStartDate) { this.newBillingStartDate = newBillingStartDate; }

    public Integer getNewBillingCycleDay() { return newBillingCycleDay; }
    public void setNewBillingCycleDay(Integer newBillingCycleDay) { this.newBillingCycleDay = newBillingCycleDay; }
}
