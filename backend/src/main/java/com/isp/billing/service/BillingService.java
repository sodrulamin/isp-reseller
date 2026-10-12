package com.isp.billing.service;

import com.isp.billing.dto.ApproveInvoiceRequest;
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
        log.info("Found {} subscribers due for billing cycle renewal", dueSubscribers.size());

        int processed = 0;
        for (Subscriber sub : dueSubscribers) {
            try {
                processMonthlyCycleRenewal(sub, sub.getNextBillingDate());
                processed++;
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
        for (Subscriber sub : dueSubscribers) {
            processMonthlyCycleRenewal(sub, sub.getNextBillingDate());
        }
        return dueSubscribers.size();
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
     * 1. Reseller incurs obligation to pay Mother ISP for this subscriber's new month.
     * 2. Subscriber wallet is debited by package price (can go negative for delayed payment, or stay positive for advance).
     * 3. An invoice is generated for this billing cycle.
     * 4. Billing cycle period start and next billing date are advanced by 1 month.
     */
    @Transactional
    public void processMonthlyCycleRenewal(Subscriber subscriber, LocalDate cycleDate) {
        Reseller reseller = subscriber.getReseller();
        InternetPackage pkg = subscriber.getInternetPackage();
        BigDecimal packagePrice = pkg.getMonthlyPrice();

        // 1. Calculate and record Mother ISP Payout Expense
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
                "Cycle renewal for period starting " + cycleDate
        );
        payout.setTransactionRef("M-ISP-" + cycleDate.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId());
        motherIspPayoutRepository.save(payout);

        // 2. Debit Subscriber Wallet for new month package fee
        BigDecimal balanceBefore = subscriber.getWalletBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(packagePrice);
        subscriber.setWalletBalance(balanceAfter);

        SubscriberWalletTransaction deductionTx = new SubscriberWalletTransaction(
                reseller,
                subscriber,
                "MONTHLY_PACKAGE_DEDUCTION",
                packagePrice,
                balanceBefore,
                balanceAfter,
                "WALLET_BALANCE",
                "FEE-" + cycleDate.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId(),
                "Monthly package fee for " + pkg.getName() + " (" + cycleDate + " to " + cycleDate.plusMonths(1).minusDays(1) + ")"
        );
        walletTransactionRepository.save(deductionTx);

        // 3. Create Invoice
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

        if (balanceBefore.compareTo(packagePrice) >= 0) {
            // Paid in advance
            invoice.setPaidAmount(packagePrice);
            invoice.setDueAmount(BigDecimal.ZERO);
            invoice.setStatus("PAID");
            invoice.setNotes("Settled automatically from subscriber advance wallet balance");
        } else if (balanceBefore.compareTo(BigDecimal.ZERO) > 0) {
            // Partially covered by existing balance
            invoice.setPaidAmount(balanceBefore);
            invoice.setDueAmount(packagePrice.subtract(balanceBefore));
            invoice.setStatus("PARTIAL");
            invoice.setNotes("Partially deducted from advance balance. Remaining due: " + invoice.getDueAmount());
        } else {
            // Unpaid / delayed payment
            invoice.setPaidAmount(BigDecimal.ZERO);
            invoice.setDueAmount(packagePrice);
            invoice.setStatus("DUE");
            invoice.setNotes("Delayed payment. Added to subscriber wallet overdue balance.");
        }
        invoiceRepository.save(invoice);

        // 4. Advance billing dates to next month
        subscriber.setCurrentBillingPeriodStart(cycleDate);
        LocalDate nextCycle = cycleDate.plusMonths(1);
        // Adjust for day of month (e.g. 31st -> 28th/30th)
        int targetDay = Math.min(subscriber.getBillingCycleDay(), nextCycle.lengthOfMonth());
        nextCycle = nextCycle.withDayOfMonth(targetDay);
        subscriber.setNextBillingDate(nextCycle);
        subscriber.setCurrentBillingPeriodEnd(nextCycle.minusDays(1));

        subscriberRepository.save(subscriber);
        log.info("Successfully renewed cycle for subscriber {} (next cycle: {})", subscriber.getSubscriberCode(), nextCycle);
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

            // Record Mother ISP Payout for this newly activated/reconnected cycle period
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
                    startDate,
                    packagePrice,
                    disbursementRate,
                    motherIspAmount,
                    LocalDate.now(),
                    "PAID",
                    "Cycle renewed on payment starting " + startDate
            );
            payout.setTransactionRef("M-ISP-" + startDate.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + subscriber.getId());
            motherIspPayoutRepository.save(payout);

            log.info("Reset billing cycle for subscriber {} to start {} (next: {})", subscriber.getSubscriberCode(), startDate, nextCycle);
        }

        return subscriberRepository.save(subscriber);
    }

    public List<MotherIspPayoutDto> getMotherIspPayouts(Long resellerId) {
        return motherIspPayoutRepository.findByResellerIdOrderByPaymentDateDesc(resellerId).stream()
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

        BigDecimal dueAmount = invoice.getDueAmount();
        if (dueAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invoice is already paid in full");
        }

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

        depositToWallet(invoice.getSubscriber().getId(), resellerId, depositReq);

        invoice = invoiceRepository.findById(invoiceId).orElse(invoice);
        return mapInvoiceToDto(invoice);
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
        dto.setNotes(inv.getNotes());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
