package com.isp.billing.controller;

import com.isp.billing.dto.ApproveInvoiceRequest;
import com.isp.billing.dto.RejectInvoiceRequest;
import com.isp.billing.dto.InvoiceDto;
import com.isp.billing.dto.MotherIspAdjustmentRequest;
import com.isp.billing.dto.MotherIspPayoutDto;
import com.isp.billing.dto.MotherIspTransactionDto;
import com.isp.billing.dto.WalletTransactionDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;
    private final WorkspaceContext workspaceContext;

    public BillingController(BillingService billingService, WorkspaceContext workspaceContext) {
        this.billingService = billingService;
        this.workspaceContext = workspaceContext;
    }

    @PostMapping("/run-cycle")
    public ResponseEntity<?> runCycle() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r != null) {
            int processedCount = billingService.runOnDemandBillingCycle(r.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Billing cycle processed successfully for workspace: " + r.getName(),
                    "processedSubscribers", processedCount
            ));
        } else {
            // Global run across all workspaces (e.g. triggered by super admin)
            int processedCount = billingService.runDailyBillingCycle();
            return ResponseEntity.ok(Map.of(
                    "message", "Global billing cycle scheduler executed across all workspaces",
                    "processedSubscribers", processedCount
            ));
        }
    }

    @PostMapping("/subscribers/{id}/renew")
    public ResponseEntity<?> forceRenewSubscriber(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        billingService.forceRenewSubscriber(id, r.getId());
        return ResponseEntity.ok(Map.of("message", "Subscriber billing renewed successfully."));
    }

    @PostMapping("/subscribers/{id}/renew-credit")
    public ResponseEntity<?> renewSubscriberOnCredit(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        billingService.renewSubscriberOnCredit(id, r.getId());
        return ResponseEntity.ok(Map.of("message", "Subscriber renewed on reseller credit. Mother ISP fee disbursed and customer line kept active."));
    }

    @GetMapping("/mother-isp-payouts")
    public ResponseEntity<List<MotherIspPayoutDto>> getMotherIspPayouts() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(billingService.getAllMotherIspPayouts());
        }
        return ResponseEntity.ok(billingService.getMotherIspPayouts(r.getId()));
    }

    @GetMapping("/mother-isp-transactions")
    public ResponseEntity<List<MotherIspTransactionDto>> getMotherIspTransactions() {
        Reseller r = workspaceContext.getActiveReseller();
        return ResponseEntity.ok(billingService.getMotherIspTransactions(r != null ? r.getId() : null));
    }

    @PostMapping("/mother-isp/topup")
    public ResponseEntity<?> topupMotherIspBalance(@RequestBody MotherIspAdjustmentRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        MotherIspTransactionDto dto = billingService.topupMotherIspBalance(r.getId(), req);
        return ResponseEntity.ok(Map.of(
                "message", "Mother ISP balance topped up successfully",
                "transaction", dto
        ));
    }

    @PostMapping("/mother-isp/withdraw")
    public ResponseEntity<?> withdrawFromMotherIsp(@RequestBody MotherIspAdjustmentRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        MotherIspTransactionDto dto = billingService.withdrawFromMotherIsp(r.getId(), req);
        return ResponseEntity.ok(Map.of(
                "message", "Mother ISP balance withdrawal recorded successfully",
                "transaction", dto
        ));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDto>> getInvoices(@RequestParam(required = false) Long subscriberId) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(billingService.getInvoices(r.getId(), subscriberId));
    }

    @PostMapping("/invoices/{id}/approve")
    public ResponseEntity<?> approveInvoice(@PathVariable Long id, @RequestBody(required = false) ApproveInvoiceRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        if (req == null) {
            req = new ApproveInvoiceRequest();
        }
        InvoiceDto dto = billingService.approveInvoice(id, r.getId(), req);
        return ResponseEntity.ok(Map.of(
                "message", "Due bill approved and settled successfully",
                "invoice", dto
        ));
    }

    @PostMapping("/invoices/{id}/reject")
    public ResponseEntity<?> rejectInvoice(@PathVariable Long id, @RequestBody(required = false) RejectInvoiceRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        if (req == null) {
            req = new RejectInvoiceRequest();
        }
        InvoiceDto dto = billingService.rejectInvoice(id, r.getId(), req);
        return ResponseEntity.ok(Map.of(
                "message", "Due invoice rejected successfully",
                "invoice", dto
        ));
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        billingService.deleteInvoice(id, r.getId());
        return ResponseEntity.ok(Map.of("message", "Invoice deleted and related calculations reverted successfully"));
    }

    @GetMapping("/wallet-transactions")
    public ResponseEntity<List<WalletTransactionDto>> getWalletTransactions(@RequestParam(required = false) Long subscriberId) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(billingService.getWalletTransactions(r.getId(), subscriberId));
    }
}
