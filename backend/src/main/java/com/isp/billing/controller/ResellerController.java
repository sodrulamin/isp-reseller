package com.isp.billing.controller;

import com.isp.billing.dto.CreateResellerRequest;
import com.isp.billing.dto.ResellerDto;
import com.isp.billing.service.ResellerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resellers")
public class ResellerController {

    private final ResellerService resellerService;

    public ResellerController(ResellerService resellerService) {
        this.resellerService = resellerService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<ResellerDto>> getAllResellers() {
        return ResponseEntity.ok(resellerService.getAllResellers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ResellerDto> getReseller(@PathVariable Long id) {
        return ResponseEntity.ok(resellerService.getResellerDtoById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ResellerDto> createReseller(@Valid @RequestBody CreateResellerRequest req) {
        return ResponseEntity.ok(resellerService.createReseller(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ResellerDto> updateReseller(@PathVariable Long id, @RequestBody ResellerDto dto) {
        return ResponseEntity.ok(resellerService.updateReseller(id, dto));
    }
}
