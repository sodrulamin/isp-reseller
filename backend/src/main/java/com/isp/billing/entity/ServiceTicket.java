package com.isp.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_tickets")
public class ServiceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reseller_id", nullable = false)
    private Reseller reseller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private Subscriber subscriber;

    @Column(nullable = false, length = 60)
    private String ticketNumber;

    @Column(nullable = false, length = 60)
    private String issueType; // FIBER_CUT, LOS_RED_LIGHT, SLOW_SPEED, ROUTER_CONFIG, WIRE_RELOCATION, HARDWARE_ISSUE, OTHER

    @Column(nullable = false, length = 500)
    private String description;

    @Column(length = 100)
    private String technicianName;

    // Reseller Expense: Cost to provide the physical service (technician transport, tools, splicing consumables)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal operationalCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime reportedDate = LocalDateTime.now();

    private LocalDateTime resolvedDate;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CANCELLED

    @Column(length = 500)
    private String resolutionNotes;

    public ServiceTicket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reseller getReseller() { return reseller; }
    public void setReseller(Reseller reseller) { this.reseller = reseller; }

    public Subscriber getSubscriber() { return subscriber; }
    public void setSubscriber(Subscriber subscriber) { this.subscriber = subscriber; }

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
