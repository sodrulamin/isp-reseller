package com.isp.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateServiceTicketRequest {
    @NotNull
    private Long subscriberId;

    @NotBlank
    private String issueType;

    @NotBlank
    private String description;

    private String technicianName;

    // Operational cost incurred by reseller (e.g. technician conveyance, splicing, repair parts)
    private BigDecimal operationalCost = BigDecimal.ZERO;

    private String status = "OPEN";
    private String resolutionNotes;

    public CreateServiceTicketRequest() {}

    public Long getSubscriberId() { return subscriberId; }
    public void setSubscriberId(Long subscriberId) { this.subscriberId = subscriberId; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public BigDecimal getOperationalCost() { return operationalCost; }
    public void setOperationalCost(BigDecimal operationalCost) { this.operationalCost = operationalCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
