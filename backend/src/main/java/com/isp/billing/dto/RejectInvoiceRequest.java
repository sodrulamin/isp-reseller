package com.isp.billing.dto;

public class RejectInvoiceRequest {
    private String reason;

    public RejectInvoiceRequest() {}

    public RejectInvoiceRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
