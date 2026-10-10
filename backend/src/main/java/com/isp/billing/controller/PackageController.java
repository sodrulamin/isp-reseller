package com.isp.billing.controller;

import com.isp.billing.dto.PackageDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    private final PackageService packageService;
    private final WorkspaceContext workspaceContext;

    public PackageController(PackageService packageService, WorkspaceContext workspaceContext) {
        this.packageService = packageService;
        this.workspaceContext = workspaceContext;
    }

    @GetMapping
    public ResponseEntity<List<PackageDto>> getPackages() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(packageService.getPackagesForReseller(r.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createPackage(@Valid @RequestBody PackageDto dto) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(packageService.createPackage(r, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody PackageDto dto) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(packageService.updatePackage(id, r.getId(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        packageService.deletePackage(id, r.getId());
        return ResponseEntity.ok(Map.of("message", "Package deactivated"));
    }
}
