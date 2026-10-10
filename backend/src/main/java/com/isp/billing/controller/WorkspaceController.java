package com.isp.billing.controller;

import com.isp.billing.dto.ResellerDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.ResellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    private final WorkspaceContext workspaceContext;
    private final ResellerService resellerService;

    public WorkspaceController(WorkspaceContext workspaceContext, ResellerService resellerService) {
        this.workspaceContext = workspaceContext;
        this.resellerService = resellerService;
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentWorkspace() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(Map.of("message", "Super Admin Global View (No single workspace active)"));
        }
        return ResponseEntity.ok(resellerService.mapToDto(r));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody ResellerDto dto) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No workspace selected"));
        }
        return ResponseEntity.ok(resellerService.updateReseller(r.getId(), dto));
    }
}
