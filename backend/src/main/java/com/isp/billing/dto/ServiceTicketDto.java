package com.isp.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ServiceTicketDto {
    private Long id;
    private Long subscriberId;
    private String subscriberName;
    private String subscriberCode;
    private String ticketNumber;
    private String issueType;
    private String description;
    private String technicianName;
    private BigDecimal operationalCost;
    private LocalDateTime reportedDate;
    private LocalDateTime resolvedDate;
    private String status;
    private String resolutionNotes;

    public ServiceTicketDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSubscriberId() { return subscriberId; }
    public void setSubscriberId(Long subscriberId) { this.subscriberId = subscriberId; }

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public String getSubscriberCode() { return subscriberCode; }
    public void setSubscriberCode(String subscriberCode) { this.subscriberCode = subscriberCode; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public BigDecimal getOperationalCost() { return operationalCost; }
    public void setOperationalCost(BigDecimal operationalCost) { this.operationalCost = operationalCost; }

    public LocalDateTime getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDateTime reportedDate) { this.reportedDate = reportedDate; }

    public LocalDateTime getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDateTime resolvedDate) { this.resolvedDate = resolvedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
