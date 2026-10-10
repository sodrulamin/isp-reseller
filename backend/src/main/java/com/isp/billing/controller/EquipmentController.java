package com.isp.billing.controller;

import com.isp.billing.dto.CreateEquipmentRequest;
import com.isp.billing.dto.EquipmentDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final WorkspaceContext workspaceContext;

    public EquipmentController(EquipmentService equipmentService, WorkspaceContext workspaceContext) {
        this.equipmentService = equipmentService;
        this.workspaceContext = workspaceContext;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDto>> getEquipments() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(equipmentService.getEquipmentsForReseller(r.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createEquipment(@Valid @RequestBody CreateEquipmentRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(equipmentService.createEquipment(r, req));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignToSubscriber(@PathVariable Long id,
                                                @RequestParam Long subscriberId,
                                                @RequestParam(defaultValue = "false") boolean billedToSubscriber,
                                                @RequestParam(required = false) BigDecimal billedAmount,
                                                @RequestParam(required = false) BigDecimal paidAmount) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(equipmentService.assignEquipmentToSubscriber(
                id, r.getId(), subscriberId, billedToSubscriber, billedAmount, paidAmount));
    }
}
