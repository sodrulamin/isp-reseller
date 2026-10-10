package com.isp.billing.controller;

import com.isp.billing.dto.CreateServiceTicketRequest;
import com.isp.billing.dto.ServiceTicketDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.ServiceTicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-tickets")
public class ServiceTicketController {

    private final ServiceTicketService serviceTicketService;
    private final WorkspaceContext workspaceContext;

    public ServiceTicketController(ServiceTicketService serviceTicketService, WorkspaceContext workspaceContext) {
        this.serviceTicketService = serviceTicketService;
        this.workspaceContext = workspaceContext;
    }

    @GetMapping
    public ResponseEntity<List<ServiceTicketDto>> getTickets() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(serviceTicketService.getTicketsForReseller(r.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody CreateServiceTicketRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(serviceTicketService.createServiceTicket(r, req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id, @RequestBody CreateServiceTicketRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(serviceTicketService.updateTicket(id, r.getId(), req));
    }
}
