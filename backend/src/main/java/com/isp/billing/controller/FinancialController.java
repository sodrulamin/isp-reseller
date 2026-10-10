package com.isp.billing.controller;

import com.isp.billing.dto.FinancialSummaryDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.FinancialAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinancialController {

    private final FinancialAnalyticsService financialAnalyticsService;
    private final WorkspaceContext workspaceContext;

    public FinancialController(FinancialAnalyticsService financialAnalyticsService, WorkspaceContext workspaceContext) {
        this.financialAnalyticsService = financialAnalyticsService;
        this.workspaceContext = workspaceContext;
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<?> getMonthlySummary(@RequestParam(required = false) String month) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            // If super admin has no active workspace selected, return global summary
            return ResponseEntity.ok(financialAnalyticsService.getGlobalFinancialSummary(month));
        }
        return ResponseEntity.ok(financialAnalyticsService.getMonthlyFinancialSummary(r.getId(), month));
    }

    @GetMapping("/global-summary")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<FinancialSummaryDto> getGlobalSummary(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(financialAnalyticsService.getGlobalFinancialSummary(month));
    }
}
