package com.isp.billing.service;

import com.isp.billing.dto.ApproveInvoiceRequest;
import com.isp.billing.dto.RejectInvoiceRequest;
import com.isp.billing.dto.InvoiceDto;
import com.isp.billing.dto.MotherIspPayoutDto;
import com.isp.billing.dto.WalletDepositRequest;
import com.isp.billing.dto.WalletTransactionDto;
import com.isp.billing.entity.*;
import com.isp.billing.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final SubscriberRepository subscriberRepository;
    private final MotherIspPayoutRepository motherIspPayoutRepository;
    private final SubscriberWalletTransactionRepository walletTransactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final ResellerRepository resellerRepository;

    public BillingService(SubscriberRepository subscriberRepository,
                          MotherIspPayoutRepository motherIspPayoutRepository,
                          SubscriberWalletTransactionRepository walletTransactionRepository,
                          InvoiceRepository invoiceRepository,
                          ResellerRepository resellerRepository) {
        this.subscriberRepository = subscriberRepository;
        this.motherIspPayoutRepository = motherIspPayoutRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.invoiceRepository = invoiceRepository;
        this.resellerRepository = resellerRepository;
    }

    /**
     * Run daily automated cycle check (at 01:00 AM every night)
     */
    @Scheduled(cron = "${billing.cycle.cron:0 0 1 * * ?}", zone = "${billing.cycle.zone:Asia/Dhaka}")
    @Transactional
    public int runDailyBillingCycle() {
        log.info("Executing scheduled billing cycle check for active subscribers...");
        LocalDate today = LocalDate.now();
        List<Subscriber> dueSubscribers = subscriberRepository.findSubscribersDueForRenewal(today);
        log.info("Found {} active subscribers with next billing date in the past or due today", dueSubscribers.size());

        int processed = 0;
        for (Subscriber sub : dueSubscribers) {
            try {
                if (processMonthlyCycleRenewal(sub, sub.getNextBillingDate())) {
                    processed++;
                }
            } catch (Exception e) {
                log.error("Failed to process billing cycle for subscriber {}: {}", sub.getSubscriberCode(), e.getMessage());
            }
        }
        log.info("Daily billing cycle completed: {}/{} subscribers renewed successfully", processed, dueSubscribers.size());
        return processed;
    }

    /**
     * On-demand manual trigger for a reseller workspace
     */
    @Transactional
    public int runOnDemandBillingCycle(Long resellerId) {
        LocalDate today = LocalDate.now();
        List<Subscriber> dueSubscribers = subscriberRepository.findSubscribersDueForRenewalByReseller(resellerId, today);
        int processed = 0;
        for (Subscriber sub : dueSubscribers) {
            try {
                if (processMonthlyCycleRenewal(sub, sub.getNextBillingDate())) {
                    processed++;
                }
            } catch (Exception e) {
                log.error("Failed to process billing cycle for subscriber {}: {}", sub.getSubscriberCode(), e.getMessage());
            }
        }
        return processed;
    }

    /**
     * Force-process cycle renewal for a single subscriber (e.g. early renewal or testing)
     */
    @Transactional
    public void forceRenewSubscriber(Long subscriberId, Long resellerId) {
        Subscriber sub = subscriberRepository.findById(subscriberId)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!sub.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        processMonthlyCycleRenewal(sub, sub.getNextBillingDate());
    }

    /**
     * Core monthly billing renewal algorithm:
     * When bill cycle is run:
     * 1. Check next billing date for the users.
     * 2. If any user is found whose next billing date is in the past (or due today) and no bill is found for running month, create a new bill for those customers.
     * 3. Set next billing date to next month with today's date (cycle day updated to today's day of month).
     * 4. If the user is not active, skip it.
     */
    @Transactional
    public boolean processMonthlyCycleRenewal(Subscriber subscriber, LocalDate cycleDate) {
        // 4. If the user is not active, skip it.
        if (subscriber.getStatus() != SubscriberStatus.ACTIVE) {
            log.info("Skipping subscriber {} because status is {}", subscriber.getSubscriberCode(), subscriber.getStatus());
            return false;
        }

        LocalDate today = LocalDate.now();

        // 1 & 2. Check if an active (non-rejected) bill is already found for the running month (same year & month as today)
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        boolean billExistsThisMonth = invoiceRepository.findBySubscriberIdOrderByInvoiceDateDesc(subscriber.getId()).stream()
                .filter(inv -> !"REJECTED".equals(inv.getStatus()))
                .anyMatch(inv -> (inv.getInvoiceDate() != null && !inv.getInvoiceDate().isBefore(monthStart) && !inv.getInvoiceDate().isAfter(monthEnd))
                        || (inv.getBillingPeriodStart() != null && !inv.getBillingPeriodStart().isBefore(monthStart) && !inv.getBillingPeriodStart().isAfter(monthEnd)));

        if (billExistsThisMonth) {
            log.info("Skipping subscriber {} as an active bill is already generated for running month ({}-{})",
                    subscriber.getSubscriberCode(), today.getYear(), today.getMonthValue());
            return false;
        }

        Reseller reseller = subscriber.getReseller();
        InternetPackage pkg = subscriber.getInternetPackage();
        BigDecimal packagePrice = pkg.getMonthlyPrice();

        // 1. Debit Subscriber Wallet for new month package fee
        BigDecimal balanceBefore = subscriber.getWalletBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(packagePrice);
        subscriber.setWalletBalance(balanceAfter);

        // Calculate next billing date: next month with today's date
        int todayDay = today.getDayOfMonth();
        LocalDate nextCycleMonth = today.plusMonths(1);
        int targetDay = Math.min(todayDay, nextCycleMonth.lengthOfMonth());
        LocalDate nextCycle = nextCycleMonth.withDayOfMonth(targetDay);

        SubscriberWalletTransaction deductionTx = new SubscriberWalletTransaction(
                reseller,
                subscriber,
                "MONTHLY_PACKAGE_DEDUCTION",
                packagePrice,
                balanceBefore,
                balanceAfter,
                "WALLET_BALANCE",
                "FEE-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId(),
                "Monthly package fee for " + pkg.getName() + " (" + today + " to " + nextCycle.minusDays(1) + ")"
        );
        walletTransactionRepository.save(deductionTx);

        // 2. Create Invoice for running month
        Invoice invoice = new Invoice();
        invoice.setReseller(reseller);
        invoice.setSubscriber(subscriber);
        invoice.setInvoiceNumber("INV-" + today.format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" + subscriber.getSubscriberCode());
        invoice.setInvoiceDate(today);
        invoice.setDueDate(today.plusDays(7));
        invoice.setBillingPeriodStart(today);
        invoice.setBillingPeriodEnd(nextCycle.minusDays(1));
        invoice.setPackageAmount(packagePrice);
        invoice.setEquipmentAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(packagePrice);

        boolean isFullyCovered = balanceBefore.compareTo(packagePrice) >= 0;

        if (isFullyCovered) {
            // Paid in full from advance balance -> Automatically approved and disbursed
            invoice.setPaidAmount(packagePrice);
            invoice.setDueAmount(BigDecimal.ZERO);
            invoice.setStatus("PAID");
            invoice.setMotherIspDisbursed(true);
            invoice.setNotes("Settled automatically from subscriber advance balance. Automatically approved and disbursed to Mother ISP.");
            subscriber.setStatus(SubscriberStatus.ACTIVE);

            // Record Mother ISP payout automatically since advance payment is already collected
            recordMotherIspPayoutForCycle(reseller, subscriber, today,
                    "Automatic disbursement for advance-paid cycle starting " + today);
        } else if (balanceBefore.compareTo(BigDecimal.ZERO) > 0) {
            // Partially covered by existing balance -> Created in partial due, Mother ISP disbursed upfront
            invoice.setPaidAmount(balanceBefore);
            invoice.setDueAmount(packagePrice.subtract(balanceBefore));
            invoice.setStatus("PARTIAL");
            invoice.setMotherIspDisbursed(true);
            invoice.setNotes("Partially deducted from advance balance. Remaining due: " + invoice.getDueAmount() + ". Mother ISP disbursed upfront.");
            subscriber.setStatus(SubscriberStatus.ACTIVE);

            // Record Mother ISP payout upfront even though remaining amount is due
            recordMotherIspPayoutForCycle(reseller, subscriber, today,
                    "Disbursement for cycle starting " + today + " (created in partial due)");
        } else {
            // Unpaid / delayed payment -> Created in due, Mother ISP disbursed upfront
            invoice.setPaidAmount(BigDecimal.ZERO);
            invoice.setDueAmount(packagePrice);
            invoice.setStatus("DUE");
            invoice.setMotherIspDisbursed(true);
            invoice.setNotes("Delayed payment. Added to subscriber wallet overdue balance. Mother ISP disbursed upfront.");
            subscriber.setStatus(SubscriberStatus.ACTIVE);

            // Record Mother ISP payout upfront even though created in due
            recordMotherIspPayoutForCycle(reseller, subscriber, today,
                    "Disbursement for cycle starting " + today + " (created in due)");
        }
        invoiceRepository.save(invoice);

        // 3. Set next billing date to next month with today's date (update the cycle date)
        subscriber.setBillingCycleDay(todayDay);
        subscriber.setCurrentBillingPeriodStart(today);
        subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));
        subscriber.setNextBillingDate(nextCycle);

        subscriberRepository.save(subscriber);
        log.info("Successfully processed cycle for subscriber {} (status: {}, next billing date: {})", 
                subscriber.getSubscriberCode(), subscriber.getStatus(), nextCycle);
        return true;
    }

    /**
     * Subscriber deposits payment into wallet (Advance payment or Delayed payment clearance)
     */
    @Transactional
    public Subscriber depositToWallet(Long subscriberId, Long resellerId, WalletDepositRequest req) {
        Subscriber subscriber = subscriberRepository.findById(subscriberId)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!subscriber.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        BigDecimal depositAmount = req.getAmount();
        if (depositAmount == null || depositAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero");
        }

        BigDecimal balanceBefore = subscriber.getWalletBalance();
        BigDecimal balanceAfter = balanceBefore.add(depositAmount);
        subscriber.setWalletBalance(balanceAfter);

        String ref = req.getTransactionReference() != null && !req.getTransactionReference().isBlank()
                ? req.getTransactionReference()
                : "DEP-" + System.currentTimeMillis();

        String channel = (req.getPaymentChannel() != null && req.getPaymentChannel().equalsIgnoreCase("MOTHER_ISP_PORTAL"))
                ? "MOTHER_ISP_PORTAL"
                : "DIRECT_RESELLER";

        Reseller reseller = subscriber.getReseller();
        BigDecimal motherIspRate = subscriber.getMotherIspRateOverride() != null
                ? subscriber.getMotherIspRateOverride()
                : reseller.getMotherIspDisbursementPercentage();

        BigDecimal motherIspRetained = BigDecimal.ZERO;
        BigDecimal resellerCredited = BigDecimal.ZERO;

        if ("MOTHER_ISP_PORTAL".equals(channel)) {
            // Mother ISP immediately retains her configured % and reseller gets remaining % into their Mother ISP balance
            motherIspRetained = depositAmount.multiply(motherIspRate)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            resellerCredited = depositAmount.subtract(motherIspRetained);

            BigDecimal currentBalance = reseller.getMotherIspResellerBalance() != null
                    ? reseller.getMotherIspResellerBalance()
                    : BigDecimal.ZERO;
            reseller.setMotherIspResellerBalance(currentBalance.add(resellerCredited));
            resellerRepository.save(reseller);
        }

        SubscriberWalletTransaction tx = new SubscriberWalletTransaction(
                reseller,
                subscriber,
                "DEPOSIT",
                depositAmount,
                balanceBefore,
                balanceAfter,
                req.getPaymentMethod(),
                ref,
                req.getNotes() != null ? req.getNotes() : ("Subscriber payment deposit via " + ("MOTHER_ISP_PORTAL".equals(channel) ? "Mother ISP Portal" : "Direct Collection"))
        );
        tx.setPaymentChannel(channel);
        tx.setMotherIspRetainedAmount(motherIspRetained);
        tx.setResellerCreditedAmount(resellerCredited);
        walletTransactionRepository.save(tx);

        // Reconcile open DUE invoices for this subscriber
        List<Invoice> openInvoices = invoiceRepository.findBySubscriberIdOrderByInvoiceDateDesc(subscriberId).stream()
                .filter(inv -> "DUE".equals(inv.getStatus()) || "PARTIAL".equals(inv.getStatus()))
                .collect(Collectors.toList());

        BigDecimal available = depositAmount;
        for (Invoice inv : openInvoices) {
            if (available.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal needed = inv.getDueAmount();
            if (available.compareTo(needed) >= 0) {
                inv.setPaidAmount(inv.getPaidAmount().add(needed));
                inv.setDueAmount(BigDecimal.ZERO);
                inv.setStatus("PAID");
                inv.setNotes((inv.getNotes() != null ? inv.getNotes() + " | " : "") + "Cleared by deposit " + ref);
                available = available.subtract(needed);
            } else {
                inv.setPaidAmount(inv.getPaidAmount().add(available));
                inv.setDueAmount(inv.getDueAmount().subtract(available));
                inv.setStatus("PARTIAL");
                inv.setNotes((inv.getNotes() != null ? inv.getNotes() + " | " : "") + "Partial payment of " + available + " from deposit " + ref);
                available = BigDecimal.ZERO;
            }
            invoiceRepository.save(inv);
        }

        // Restore active subscriber status if dues are settled
        if (subscriber.getWalletBalance().compareTo(BigDecimal.ZERO) >= 0 && 
                (subscriber.getStatus() == SubscriberStatus.SUSPENDED || subscriber.getStatus() == SubscriberStatus.EXPIRED)) {
            subscriber.setStatus(SubscriberStatus.ACTIVE);
        }

        // If requested, update/reset the subscriber's billing cycle period and next billing date
        if (req.isUpdateBillingCycle()) {
            LocalDate startDate;
            if (req.getNewBillingStartDate() != null && !req.getNewBillingStartDate().isBlank()) {
                startDate = LocalDate.parse(req.getNewBillingStartDate());
            } else {
                startDate = LocalDate.now();
            }

            int cycleDay = req.getNewBillingCycleDay() != null && req.getNewBillingCycleDay() >= 1 && req.getNewBillingCycleDay() <= 31
                    ? req.getNewBillingCycleDay()
                    : startDate.getDayOfMonth();

            subscriber.setBillingCycleDay(cycleDay);
            subscriber.setCurrentBillingPeriodStart(startDate);

            LocalDate nextCycle = startDate.plusMonths(1);
            int targetDay = Math.min(cycleDay, nextCycle.lengthOfMonth());
            nextCycle = nextCycle.withDayOfMonth(targetDay);

            subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));
            subscriber.setNextBillingDate(nextCycle);
            subscriber.setStatus(SubscriberStatus.ACTIVE);

            log.info("Reset billing cycle for subscriber {} to start {} (next: {})", subscriber.getSubscriberCode(), startDate, nextCycle);
        }

        return subscriberRepository.save(subscriber);
    }

    public List<MotherIspPayoutDto> getMotherIspPayouts(Long resellerId) {
        return motherIspPayoutRepository.findByResellerIdOrderByPaymentDateDesc(resellerId).stream()
                .map(this::mapPayoutToDto)
                .collect(Collectors.toList());
    }

    public List<MotherIspPayoutDto> getAllMotherIspPayouts() {
        return motherIspPayoutRepository.findAllByOrderByPaymentDateDesc().stream()
                .map(this::mapPayoutToDto)
                .collect(Collectors.toList());
    }

    public List<WalletTransactionDto> getWalletTransactions(Long resellerId, Long subscriberId) {
        List<SubscriberWalletTransaction> list;
        if (subscriberId != null) {
            list = walletTransactionRepository.findByResellerIdAndSubscriberIdOrderByTransactionDateDesc(resellerId, subscriberId);
        } else {
            list = walletTransactionRepository.findByResellerIdOrderByTransactionDateDesc(resellerId);
        }
        return list.stream().map(this::mapTxToDto).collect(Collectors.toList());
    }

    public List<InvoiceDto> getInvoices(Long resellerId, Long subscriberId) {
        List<Invoice> list;
        if (subscriberId != null) {
            list = invoiceRepository.findBySubscriberIdOrderByInvoiceDateDesc(subscriberId);
        } else {
            list = invoiceRepository.findByResellerIdOrderByInvoiceDateDesc(resellerId);
        }
        return list.stream().map(this::mapInvoiceToDto).collect(Collectors.toList());
    }

    public MotherIspPayoutDto mapPayoutToDto(MotherIspPayout p) {
        MotherIspPayoutDto dto = new MotherIspPayoutDto();
        dto.setId(p.getId());
        dto.setResellerId(p.getReseller().getId());
        dto.setResellerName(p.getReseller().getName());
        dto.setSubscriberId(p.getSubscriber().getId());
        dto.setSubscriberName(p.getSubscriber().getName());
        dto.setSubscriberCode(p.getSubscriber().getSubscriberCode());
        dto.setPackageName(p.getInternetPackage() != null ? p.getInternetPackage().getName() : "-");
        dto.setCycleDate(p.getCycleDate());
        dto.setPackagePrice(p.getPackagePrice());
        dto.setDisbursementPercentage(p.getDisbursementPercentage());
        dto.setAmountPaid(p.getAmountPaid());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setTransactionRef(p.getTransactionRef());
        dto.setNotes(p.getNotes());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    public WalletTransactionDto mapTxToDto(SubscriberWalletTransaction tx) {
        WalletTransactionDto dto = new WalletTransactionDto();
        dto.setId(tx.getId());
        dto.setSubscriberId(tx.getSubscriber().getId());
        dto.setSubscriberName(tx.getSubscriber().getName());
        dto.setSubscriberCode(tx.getSubscriber().getSubscriberCode());
        dto.setTransactionType(tx.getTransactionType());
        dto.setAmount(tx.getAmount());
        dto.setBalanceBefore(tx.getBalanceBefore());
        dto.setBalanceAfter(tx.getBalanceAfter());
        dto.setPaymentMethod(tx.getPaymentMethod());
        dto.setPaymentChannel(tx.getPaymentChannel());
        dto.setMotherIspRetainedAmount(tx.getMotherIspRetainedAmount());
        dto.setResellerCreditedAmount(tx.getResellerCreditedAmount());
        dto.setTransactionReference(tx.getTransactionReference());
        dto.setNotes(tx.getNotes());
        dto.setTransactionDate(tx.getTransactionDate());
        return dto;
    }

    @Transactional
    public InvoiceDto approveInvoice(Long invoiceId, Long resellerId, ApproveInvoiceRequest req) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        if (!invoice.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized: invoice does not belong to your workspace");
        }

        if ("REJECTED".equals(invoice.getStatus())) {
            throw new IllegalArgumentException("Cannot approve a rejected invoice");
        }

        if (invoice.isMotherIspDisbursed() && invoice.getDueAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invoice is already approved and disbursed to Mother ISP");
        }

        Subscriber subscriber = invoice.getSubscriber();
        Reseller reseller = invoice.getReseller();
        BigDecimal dueAmount = invoice.getDueAmount();

        // 1. Settle due amount if outstanding
        if (dueAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal payAmount = (req != null && req.getAmount() != null && req.getAmount().compareTo(BigDecimal.ZERO) > 0)
                    ? req.getAmount()
                    : dueAmount;

            WalletDepositRequest depositReq = new WalletDepositRequest();
            depositReq.setAmount(payAmount);
            depositReq.setPaymentChannel(req != null && req.getPaymentChannel() != null ? req.getPaymentChannel() : "DIRECT_RESELLER");
            depositReq.setPaymentMethod(req != null && req.getPaymentMethod() != null ? req.getPaymentMethod() : "CASH");
            depositReq.setTransactionReference(req != null && req.getTransactionReference() != null && !req.getTransactionReference().isBlank()
                    ? req.getTransactionReference()
                    : "INV-APPV-" + invoice.getInvoiceNumber());
            depositReq.setNotes(req != null && req.getNotes() != null && !req.getNotes().isBlank()
                    ? req.getNotes()
                    : ("Approved due bill settlement for " + invoice.getInvoiceNumber()));

            depositToWallet(subscriber.getId(), resellerId, depositReq);

            invoice = invoiceRepository.findById(invoiceId).orElse(invoice);
        }

        // 2. DISBURSE TO MOTHER ISP (if not already disbursed upfront)
        LocalDate cycleDate = invoice.getBillingPeriodStart() != null ? invoice.getBillingPeriodStart() : invoice.getInvoiceDate();
        if (!invoice.isMotherIspDisbursed()) {
            recordMotherIspPayoutForCycle(reseller, subscriber, cycleDate, 
                    "Disbursement on approval of invoice " + invoice.getInvoiceNumber());
            invoice.setMotherIspDisbursed(true);
        }
        if (invoice.getDueAmount().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("PAID");
        }
        invoice = invoiceRepository.save(invoice);

        // Keep / restore subscriber line to ACTIVE
        subscriber.setStatus(SubscriberStatus.ACTIVE);
        subscriberRepository.save(subscriber);

        log.info("Invoice {} approved. Mother ISP disbursed and subscriber {} line active.", 
                invoice.getInvoiceNumber(), subscriber.getSubscriberCode());
        return mapInvoiceToDto(invoice);
    }

    @Transactional
    public InvoiceDto rejectInvoice(Long invoiceId, Long resellerId, RejectInvoiceRequest req) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        if (!invoice.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized: invoice does not belong to your workspace");
        }

        if ("PAID".equals(invoice.getStatus())) {
            throw new IllegalArgumentException("Cannot reject an invoice that is already paid in full");
        }
        if ("REJECTED".equals(invoice.getStatus())) {
            throw new IllegalArgumentException("Invoice is already marked as rejected");
        }

        BigDecimal dueAmount = invoice.getDueAmount();
        Subscriber subscriber = invoice.getSubscriber();
        Reseller reseller = invoice.getReseller();
        LocalDate cycleStart = invoice.getBillingPeriodStart() != null ? invoice.getBillingPeriodStart() : invoice.getInvoiceDate();

        String reason = (req != null && req.getReason() != null && !req.getReason().isBlank())
                ? req.getReason().trim()
                : "Due bill rejected by admin";

        // Reverse the due portion that was debited from subscriber's wallet
        if (dueAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal balanceBefore = subscriber.getWalletBalance();
            BigDecimal balanceAfter = balanceBefore.add(dueAmount);
            subscriber.setWalletBalance(balanceAfter);

            SubscriberWalletTransaction tx = new SubscriberWalletTransaction(
                    reseller,
                    subscriber,
                    "INVOICE_REJECTION_REVERSAL",
                    dueAmount,
                    balanceBefore,
                    balanceAfter,
                    "SYSTEM_REVERSAL",
                    "REV-" + invoice.getInvoiceNumber(),
                    "Reversal for rejected due invoice " + invoice.getInvoiceNumber() + ": " + reason
            );
            walletTransactionRepository.save(tx);
        }

        // Undo Mother ISP Disbursement if it was disbursed upfront for this cycle
        if (invoice.isMotherIspDisbursed() && cycleStart != null) {
            List<MotherIspPayout> payouts = motherIspPayoutRepository.findBySubscriberIdAndCycleDate(subscriber.getId(), cycleStart);
            for (MotherIspPayout p : payouts) {
                motherIspPayoutRepository.delete(p);
                log.info("Undid Mother ISP payout id {} of ৳{} for subscriber {} on cycle {} due to rejection", 
                        p.getId(), p.getAmountPaid(), subscriber.getSubscriberCode(), cycleStart);
            }
            invoice.setMotherIspDisbursed(false);
        }

        // Mark user as suspended on rejection
        subscriber.setStatus(SubscriberStatus.SUSPENDED);

        // Reset customer's next billing date to cycleStart of rejected invoice
        if (cycleStart != null) {
            subscriber.setNextBillingDate(cycleStart);
            subscriber.setCurrentBillingPeriodStart(cycleStart);
        }
        subscriberRepository.save(subscriber);

        invoice.setStatus("REJECTED");
        invoice.setDueAmount(BigDecimal.ZERO);
        invoice.setNotes((invoice.getNotes() != null ? invoice.getNotes() + " | " : "") + "Rejected: " + reason);
        invoice = invoiceRepository.save(invoice);

        log.info("Invoice {} rejected for subscriber {} (marked SUSPENDED, Mother ISP disbursement undone). Reason: {}", 
                invoice.getInvoiceNumber(), subscriber.getSubscriberCode(), reason);
        return mapInvoiceToDto(invoice);
    }

    /**
     * Delete an invoice and undo all related calculations:
     * 1. Undo wallet deductions / payments made against this invoice.
     * 2. Remove any Mother ISP disbursement recorded for this invoice's billing period.
     * 3. Roll back subscriber billing cycle dates if this was the latest invoice.
     * 4. Remove the invoice record.
     */
    @Transactional
    public void deleteInvoice(Long invoiceId, Long resellerId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + invoiceId));
        if (!invoice.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized: invoice does not belong to your workspace");
        }

        Subscriber subscriber = invoice.getSubscriber();
        Reseller reseller = invoice.getReseller();
        LocalDate cycleStart = invoice.getBillingPeriodStart() != null ? invoice.getBillingPeriodStart() : invoice.getInvoiceDate();

        // 1. Undo Wallet Impact
        // If the invoice was not REJECTED (where due portion was already reversed):
        // Re-credit the package fee / deduction that was charged for this cycle.
        if (!"REJECTED".equals(invoice.getStatus())) {
            BigDecimal packageAmount = invoice.getPackageAmount() != null ? invoice.getPackageAmount() : invoice.getTotalAmount();
            if (packageAmount != null && packageAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal balanceBefore = subscriber.getWalletBalance();
                BigDecimal balanceAfter = balanceBefore.add(packageAmount);
                subscriber.setWalletBalance(balanceAfter);

                SubscriberWalletTransaction refundTx = new SubscriberWalletTransaction(
                        reseller,
                        subscriber,
                        "INVOICE_DELETION_REFUND",
                        packageAmount,
                        balanceBefore,
                        balanceAfter,
                        "SYSTEM_ROLLBACK",
                        "DEL-INV-" + invoice.getInvoiceNumber(),
                        "Rollback package charge due to deletion of invoice " + invoice.getInvoiceNumber()
                );
                walletTransactionRepository.save(refundTx);
            }
        }

        // 2. Undo Mother ISP Disbursement if it was disbursed for this cycle
        if (invoice.isMotherIspDisbursed() && cycleStart != null) {
            List<MotherIspPayout> payouts = motherIspPayoutRepository.findBySubscriberIdAndCycleDate(subscriber.getId(), cycleStart);
            for (MotherIspPayout p : payouts) {
                motherIspPayoutRepository.delete(p);
                log.info("Undid Mother ISP payout id {} of ৳{} for subscriber {} on cycle {}", 
                        p.getId(), p.getAmountPaid(), subscriber.getSubscriberCode(), cycleStart);
            }
        }

        // 3. Delete the invoice itself first
        invoiceRepository.delete(invoice);

        // 4. Reset customer's next billing date & cycle dates
        LocalDate cycleStartOfDeletedInvoice = invoice.getBillingPeriodStart() != null ? invoice.getBillingPeriodStart() : invoice.getInvoiceDate();
        List<Invoice> remainingInvoices = invoiceRepository.findBySubscriberIdOrderByInvoiceDateDesc(subscriber.getId());
        
        if (remainingInvoices.isEmpty()) {
            // No other invoices left: reset next billing date back to the cycle start date of the deleted bill
            // (or joinDate if earlier) so customer can be rebilled for this period
            if (cycleStartOfDeletedInvoice != null) {
                subscriber.setNextBillingDate(cycleStartOfDeletedInvoice);
                subscriber.setCurrentBillingPeriodStart(cycleStartOfDeletedInvoice);
                int cycleDay = cycleStartOfDeletedInvoice.getDayOfMonth();
                subscriber.setBillingCycleDay(cycleDay);
                LocalDate nextCycle = cycleStartOfDeletedInvoice.plusMonths(1);
                int targetDay = Math.min(cycleDay, nextCycle.lengthOfMonth());
                nextCycle = nextCycle.withDayOfMonth(targetDay);
                subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));
            } else {
                LocalDate join = subscriber.getJoinDate() != null ? subscriber.getJoinDate() : LocalDate.now();
                subscriber.setNextBillingDate(join);
                subscriber.setCurrentBillingPeriodStart(join);
                int cycleDay = subscriber.getBillingCycleDay() > 0 ? subscriber.getBillingCycleDay() : join.getDayOfMonth();
                LocalDate nextCycle = join.plusMonths(1);
                int targetDay = Math.min(cycleDay, nextCycle.lengthOfMonth());
                nextCycle = nextCycle.withDayOfMonth(targetDay);
                subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));
            }
        } else {
            // Other invoices exist: reset next billing date to cycle start of deleted invoice if it was the latest,
            // or to the end of the latest remaining invoice + 1 day
            Invoice latestInv = remainingInvoices.get(0);
            if (cycleStartOfDeletedInvoice != null && (latestInv.getBillingPeriodEnd() == null || cycleStartOfDeletedInvoice.isAfter(latestInv.getBillingPeriodEnd()))) {
                subscriber.setNextBillingDate(cycleStartOfDeletedInvoice);
                if (latestInv.getBillingPeriodStart() != null) {
                    subscriber.setCurrentBillingPeriodStart(latestInv.getBillingPeriodStart());
                    subscriber.setCurrentBillingPeriodEnd(latestInv.getBillingPeriodEnd());
                    subscriber.setBillingCycleDay(latestInv.getBillingPeriodStart().getDayOfMonth());
                }
            } else if (latestInv.getBillingPeriodEnd() != null) {
                LocalDate resetDate = latestInv.getBillingPeriodEnd().plusDays(1);
                subscriber.setNextBillingDate(resetDate);
                if (latestInv.getBillingPeriodStart() != null) {
                    subscriber.setCurrentBillingPeriodStart(latestInv.getBillingPeriodStart());
                    subscriber.setCurrentBillingPeriodEnd(latestInv.getBillingPeriodEnd());
                    subscriber.setBillingCycleDay(latestInv.getBillingPeriodStart().getDayOfMonth());
                }
            }
        }

        // 5. Update subscriber status based on wallet balance
        if (subscriber.getWalletBalance().compareTo(BigDecimal.ZERO) >= 0) {
            subscriber.setStatus(SubscriberStatus.ACTIVE);
        } else {
            subscriber.setStatus(SubscriberStatus.SUSPENDED);
        }
        subscriberRepository.save(subscriber);

        log.info("Successfully deleted invoice {} and rolled back calculations for subscriber {}", 
                invoice.getInvoiceNumber(), subscriber.getSubscriberCode());
    }

    @Transactional
    public void renewSubscriberOnCredit(Long subscriberId, Long resellerId) {
        Subscriber subscriber = subscriberRepository.findById(subscriberId)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));
        if (!subscriber.getReseller().getId().equals(resellerId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Reseller reseller = subscriber.getReseller();
        InternetPackage pkg = subscriber.getInternetPackage();
        BigDecimal packagePrice = pkg.getMonthlyPrice();
        LocalDate cycleDate = subscriber.getNextBillingDate() != null ? subscriber.getNextBillingDate() : LocalDate.now();

        // 1. Reseller explicitly pays Mother ISP out of own pocket to keep line active
        recordMotherIspPayoutForCycle(reseller, subscriber, cycleDate, "Renewed on reseller credit for period starting " + cycleDate);

        // 2. Debit Subscriber Wallet (customer due)
        BigDecimal balanceBefore = subscriber.getWalletBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(packagePrice);
        subscriber.setWalletBalance(balanceAfter);

        SubscriberWalletTransaction tx = new SubscriberWalletTransaction(
                reseller,
                subscriber,
                "CREDIT_RENEWAL",
                packagePrice,
                balanceBefore,
                balanceAfter,
                "RESELLER_CREDIT",
                "CRED-" + cycleDate.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId(),
                "Renewed on reseller credit for " + pkg.getName() + " (paid Mother ISP to keep line active)"
        );
        walletTransactionRepository.save(tx);

        // 3. Create DUE invoice
        Invoice invoice = new Invoice();
        invoice.setReseller(reseller);
        invoice.setSubscriber(subscriber);
        invoice.setInvoiceNumber("INV-" + cycleDate.format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" + subscriber.getSubscriberCode());
        invoice.setInvoiceDate(cycleDate);
        invoice.setDueDate(cycleDate.plusDays(7));
        invoice.setBillingPeriodStart(cycleDate);
        invoice.setBillingPeriodEnd(cycleDate.plusMonths(1).minusDays(1));
        invoice.setPackageAmount(packagePrice);
        invoice.setEquipmentAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(packagePrice);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setDueAmount(packagePrice);
        invoice.setStatus("DUE");
        invoice.setMotherIspDisbursed(true);
        invoice.setNotes("Line kept active via reseller credit (paid to Mother ISP). Customer due to be collected.");
        invoiceRepository.save(invoice);

        // 4. Advance cycle dates and ensure ACTIVE status
        subscriber.setStatus(SubscriberStatus.ACTIVE);
        subscriber.setCurrentBillingPeriodStart(cycleDate);
        LocalDate nextCycle = cycleDate.plusMonths(1);
        int targetDay = Math.min(subscriber.getBillingCycleDay(), nextCycle.lengthOfMonth());
        nextCycle = nextCycle.withDayOfMonth(targetDay);
        subscriber.setNextBillingDate(nextCycle);
        subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));

        subscriberRepository.save(subscriber);
        log.info("Subscriber {} renewed on credit. Mother ISP disbursed, customer line active.", subscriber.getSubscriberCode());
    }

    public MotherIspPayout recordMotherIspPayoutForCycle(Reseller reseller, Subscriber subscriber, LocalDate cycleDate, String notes) {
        if (cycleDate == null) {
            cycleDate = subscriber.getCurrentBillingPeriodStart() != null ? subscriber.getCurrentBillingPeriodStart() : LocalDate.now();
        }

        // Prevent duplicate disbursement for the same subscriber and cycle date
        if (motherIspPayoutRepository.existsBySubscriberIdAndCycleDate(subscriber.getId(), cycleDate)) {
            log.info("Mother ISP payout already exists for subscriber {} on cycle date {}", subscriber.getSubscriberCode(), cycleDate);
            return null;
        }

        InternetPackage pkg = subscriber.getInternetPackage();
        BigDecimal packagePrice = pkg.getMonthlyPrice();
        BigDecimal disbursementRate = subscriber.getMotherIspRateOverride() != null
                ? subscriber.getMotherIspRateOverride()
                : reseller.getMotherIspDisbursementPercentage();

        BigDecimal motherIspAmount = packagePrice.multiply(disbursementRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        MotherIspPayout payout = new MotherIspPayout(
                reseller,
                subscriber,
                pkg,
                cycleDate,
                packagePrice,
                disbursementRate,
                motherIspAmount,
                LocalDate.now(),
                "PAID",
                notes != null ? notes : ("Disbursement for period starting " + cycleDate)
        );
        payout.setTransactionRef("M-ISP-" + cycleDate.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId());
        MotherIspPayout saved = motherIspPayoutRepository.save(payout);
        log.info("Recorded Mother ISP payout of ৳{} for subscriber {} (cycle: {})", motherIspAmount, subscriber.getSubscriberCode(), cycleDate);
        return saved;
    }

    public InvoiceDto mapInvoiceToDto(Invoice inv) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(inv.getId());
        dto.setSubscriberId(inv.getSubscriber().getId());
        dto.setSubscriberName(inv.getSubscriber().getName());
        dto.setSubscriberCode(inv.getSubscriber().getSubscriberCode());
        dto.setPppoeUsername(inv.getSubscriber().getPppoeUsername());
        dto.setInvoiceNumber(inv.getInvoiceNumber());
        dto.setInvoiceDate(inv.getInvoiceDate());
        dto.setDueDate(inv.getDueDate());
        dto.setBillingPeriodStart(inv.getBillingPeriodStart());
        dto.setBillingPeriodEnd(inv.getBillingPeriodEnd());
        dto.setPackageAmount(inv.getPackageAmount());
        dto.setEquipmentAmount(inv.getEquipmentAmount());
        dto.setTotalAmount(inv.getTotalAmount());
        dto.setPaidAmount(inv.getPaidAmount());
        dto.setDueAmount(inv.getDueAmount());
        dto.setStatus(inv.getStatus());
        dto.setMotherIspDisbursed(inv.isMotherIspDisbursed());
        dto.setNotes(inv.getNotes());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
