package com.isp.billing.controller;

import com.isp.billing.dto.CreateSubscriberRequest;
import com.isp.billing.dto.SubscriberDto;
import com.isp.billing.dto.WalletDepositRequest;
import com.isp.billing.dto.WalletTransactionDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.Subscriber;
import com.isp.billing.entity.SubscriberStatus;
import com.isp.billing.security.WorkspaceContext;
import com.isp.billing.service.BillingService;
import com.isp.billing.service.SubscriberService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscribers")
public class SubscriberController {

    private final SubscriberService subscriberService;
    private final BillingService billingService;
    private final WorkspaceContext workspaceContext;

    public SubscriberController(SubscriberService subscriberService,
                                BillingService billingService,
                                WorkspaceContext workspaceContext) {
        this.subscriberService = subscriberService;
        this.billingService = billingService;
        this.workspaceContext = workspaceContext;
    }

    @GetMapping
    public ResponseEntity<List<SubscriberDto>> getSubscribers() {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(subscriberService.getSubscribersForReseller(r.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubscriber(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(subscriberService.getSubscriberDto(id, r.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createSubscriber(@Valid @RequestBody CreateSubscriberRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(subscriberService.createSubscriber(r, req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscriber(@PathVariable Long id, @RequestBody CreateSubscriberRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(subscriberService.updateSubscriber(id, r.getId(), req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam SubscriberStatus status) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        return ResponseEntity.ok(subscriberService.updateStatus(id, r.getId(), status));
    }

    @PostMapping("/{id}/wallet/deposit")
    public ResponseEntity<?> depositToWallet(@PathVariable Long id, @Valid @RequestBody WalletDepositRequest req) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Workspace context required"));
        }
        Subscriber updatedSub = billingService.depositToWallet(id, r.getId(), req);
        return ResponseEntity.ok(subscriberService.mapToDto(updatedSub));
    }

    @GetMapping("/{id}/wallet/transactions")
    public ResponseEntity<List<WalletTransactionDto>> getSubscriberWalletTransactions(@PathVariable Long id) {
        Reseller r = workspaceContext.getActiveReseller();
        if (r == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(billingService.getWalletTransactions(r.getId(), id));
    }
}
