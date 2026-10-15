package com.isp.billing.controller;

import com.isp.billing.dto.ResellerDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.ResellerService;
import com.isp.billing.repository.ResellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    private final WorkspaceContext workspaceContext;
    private final ResellerService resellerService;
    private final ResellerRepository resellerRepository;

    public WorkspaceController(WorkspaceContext workspaceContext, ResellerService resellerService, ResellerRepository resellerRepository) {
        this.workspaceContext = workspaceContext;
        this.resellerService = resellerService;
        this.resellerRepository = resellerRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentWorkspace() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            BigDecimal totalBalance = resellerRepository.sumTotalMotherIspResellerBalance();
            ResellerDto globalDto = new ResellerDto();
            globalDto.setName("Global Platform Overview");
            globalDto.setCode("GLOBAL");
            globalDto.setMotherIspName("All Mother ISPs");
            globalDto.setMotherIspDisbursementPercentage(new BigDecimal("49.00"));
            globalDto.setMotherIspResellerBalance(totalBalance);
            globalDto.setStatus("ACTIVE");
            return ResponseEntity.ok(globalDto);
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
