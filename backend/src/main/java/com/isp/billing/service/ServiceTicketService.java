package com.isp.billing.service;

import com.isp.billing.dto.CreateServiceTicketRequest;
import com.isp.billing.dto.ServiceTicketDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.ServiceTicket;
import com.isp.billing.entity.Subscriber;
import com.isp.billing.repository.ServiceTicketRepository;
import com.isp.billing.repository.SubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ServiceTicketService {

    private final ServiceTicketRepository serviceTicketRepository;
    private final SubscriberRepository subscriberRepository;

    public ServiceTicketService(ServiceTicketRepository serviceTicketRepository,
                                SubscriberRepository subscriberRepository) {
        this.serviceTicketRepository = serviceTicketRepository;
        this.subscriberRepository = subscriberRepository;
    }

    public List<ServiceTicketDto> getTicketsForReseller(Long resellerId) {
        return serviceTicketRepository.findByResellerIdOrderByReportedDateDesc(resellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceTicketDto createServiceTicket(Reseller reseller, CreateServiceTicketRequest req) {
        Subscriber sub = subscriberRepository.findById(req.getSubscriberId())
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!sub.getReseller().getId().equals(reseller.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        ServiceTicket ticket = new ServiceTicket();
        ticket.setReseller(reseller);
        ticket.setSubscriber(sub);
        ticket.setTicketNumber("TCK-" + System.currentTimeMillis() % 1000000);
        ticket.setIssueType(req.getIssueType());
        ticket.setDescription(req.getDescription());
        ticket.setTechnicianName(req.getTechnicianName());
        ticket.setOperationalCost(req.getOperationalCost() != null ? req.getOperationalCost() : BigDecimal.ZERO);
        ticket.setStatus(req.getStatus() != null ? req.getStatus() : "OPEN");
        ticket.setReportedDate(LocalDateTime.now());
        ticket.setResolutionNotes(req.getResolutionNotes());

        if ("RESOLVED".equalsIgnoreCase(ticket.getStatus())) {
            ticket.setResolvedDate(LocalDateTime.now());
        }

        return mapToDto(serviceTicketRepository.save(ticket));
    }

    @Transactional
    public ServiceTicketDto updateTicket(Long ticketId, Long resellerId, CreateServiceTicketRequest req) {
        ServiceTicket ticket = serviceTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (!ticket.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        ticket.setIssueType(req.getIssueType());
        ticket.setDescription(req.getDescription());
        ticket.setTechnicianName(req.getTechnicianName());
        if (req.getOperationalCost() != null) {
            ticket.setOperationalCost(req.getOperationalCost());
        }
        ticket.setStatus(req.getStatus());
        ticket.setResolutionNotes(req.getResolutionNotes());

        if ("RESOLVED".equalsIgnoreCase(req.getStatus()) && ticket.getResolvedDate() == null) {
            ticket.setResolvedDate(LocalDateTime.now());
        }

        return mapToDto(serviceTicketRepository.save(ticket));
    }

    public ServiceTicketDto mapToDto(ServiceTicket t) {
        ServiceTicketDto dto = new ServiceTicketDto();
        dto.setId(t.getId());
        dto.setSubscriberId(t.getSubscriber().getId());
        dto.setSubscriberName(t.getSubscriber().getName());
        dto.setSubscriberCode(t.getSubscriber().getSubscriberCode());
        dto.setTicketNumber(t.getTicketNumber());
        dto.setIssueType(t.getIssueType());
        dto.setDescription(t.getDescription());
        dto.setTechnicianName(t.getTechnicianName());
        dto.setOperationalCost(t.getOperationalCost());
        dto.setReportedDate(t.getReportedDate());
        dto.setResolvedDate(t.getResolvedDate());
        dto.setStatus(t.getStatus());
        dto.setResolutionNotes(t.getResolutionNotes());
        return dto;
    }
}
