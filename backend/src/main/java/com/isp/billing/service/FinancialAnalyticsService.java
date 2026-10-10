package com.isp.billing.service;

import com.isp.billing.dto.FinancialSummaryDto;
import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.Subscriber;
import com.isp.billing.entity.SubscriberStatus;
import com.isp.billing.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinancialAnalyticsService {

    private final ResellerRepository resellerRepository;
    private final SubscriberRepository subscriberRepository;
    private final MotherIspPayoutRepository motherIspPayoutRepository;
    private final EquipmentRepository equipmentRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    private final SubscriberWalletTransactionRepository walletTransactionRepository;

    public FinancialAnalyticsService(ResellerRepository resellerRepository,
                                     SubscriberRepository subscriberRepository,
                                     MotherIspPayoutRepository motherIspPayoutRepository,
                                     EquipmentRepository equipmentRepository,
                                     ServiceTicketRepository serviceTicketRepository,
                                     SubscriberWalletTransactionRepository walletTransactionRepository) {
        this.resellerRepository = resellerRepository;
        this.subscriberRepository = subscriberRepository;
        this.motherIspPayoutRepository = motherIspPayoutRepository;
        this.equipmentRepository = equipmentRepository;
        this.serviceTicketRepository = serviceTicketRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    public FinancialSummaryDto getMonthlyFinancialSummary(Long resellerId, String yearMonthStr) {
        Reseller reseller = resellerRepository.findById(resellerId)
                .orElseThrow(() -> new IllegalArgumentException("Reseller not found with id: " + resellerId));

        YearMonth ym = (yearMonthStr != null && !yearMonthStr.isBlank())
                ? YearMonth.parse(yearMonthStr)
                : YearMonth.now();

        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();
        LocalDateTime monthStartDt = monthStart.atStartOfDay();
        LocalDateTime monthEndDt = monthEnd.atTime(23, 59, 59);

        // Revenue calculations
        BigDecimal packageCollections = walletTransactionRepository.sumDepositsCollectedByResellerAndDateRange(resellerId, monthStartDt, monthEndDt);
        BigDecimal equipmentSales = equipmentRepository.sumCustomerPaidAmountByResellerAndDateRange(resellerId, monthStart, monthEnd);
        BigDecimal totalRevenue = packageCollections.add(equipmentSales);

        // Expense calculations
        // 1. Mother ISP package payout expense
        BigDecimal motherIspExpense = motherIspPayoutRepository.sumAmountPaidByResellerAndDateRange(resellerId, monthStart, monthEnd);
        // 2. Equipment purchase expense
        BigDecimal equipmentExpense = equipmentRepository.sumPurchaseCostByResellerAndDateRange(resellerId, monthStart, monthEnd);
        // 3. Physical service operational expense
        BigDecimal serviceExpense = serviceTicketRepository.sumOperationalCostByResellerAndDateRange(resellerId, monthStartDt, monthEndDt);

        BigDecimal totalExpenses = motherIspExpense.add(equipmentExpense).add(serviceExpense);

        // Profit calculations
        // Package Gross Profit = Amount collected from subscribers - Amount paid to Mother ISP
        BigDecimal packageGrossProfit = packageCollections.subtract(motherIspExpense);
        BigDecimal packageGrossMarginPercent = packageCollections.compareTo(BigDecimal.ZERO) > 0
                ? packageGrossProfit.multiply(new BigDecimal("100")).divide(packageCollections, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Net Reseller Profit = Total Revenue - Total Expenses
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        BigDecimal netMarginPercent = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Operational Metrics
        long totalSubscribers = subscriberRepository.countByResellerId(resellerId);
        long activeSubscribers = subscriberRepository.countByResellerIdAndStatus(resellerId, SubscriberStatus.ACTIVE);

        // Outstanding dues & wallet advance credits across all subscribers
        List<Subscriber> allSubscribers = subscriberRepository.findByResellerId(resellerId);
        BigDecimal totalOutstandingDue = BigDecimal.ZERO;
        BigDecimal totalWalletCredits = BigDecimal.ZERO;

        for (Subscriber s : allSubscribers) {
            BigDecimal bal = s.getWalletBalance();
            if (bal.compareTo(BigDecimal.ZERO) < 0) {
                totalOutstandingDue = totalOutstandingDue.add(bal.abs());
            } else {
                totalWalletCredits = totalWalletCredits.add(bal);
            }
        }

        FinancialSummaryDto dto = new FinancialSummaryDto();
        dto.setMonth(ym.toString());
        dto.setMonthLabel(ym.format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        dto.setResellerId(reseller.getId());
        dto.setResellerName(reseller.getName());
        dto.setMotherIspDisbursementPercentage(reseller.getMotherIspDisbursementPercentage());
        dto.setResellerRetentionPercentage(new BigDecimal("100.00").subtract(reseller.getMotherIspDisbursementPercentage()));

        dto.setPackageCollections(packageCollections);
        dto.setEquipmentSalesCollections(equipmentSales);
        dto.setTotalRevenue(totalRevenue);

        dto.setMotherIspPayoutExpense(motherIspExpense);
        dto.setEquipmentPurchaseExpense(equipmentExpense);
        dto.setPhysicalServiceExpense(serviceExpense);
        dto.setTotalExpenses(totalExpenses);

        dto.setPackageGrossProfit(packageGrossProfit);
        dto.setPackageGrossMarginPercent(packageGrossMarginPercent);
        dto.setNetMonthlyProfit(netProfit);
        dto.setNetMarginPercent(netMarginPercent);

        dto.setTotalSubscribers(totalSubscribers);
        dto.setActiveSubscribers(activeSubscribers);
        dto.setTotalSubscriberOutstandingDue(totalOutstandingDue);
        dto.setTotalSubscriberWalletCredits(totalWalletCredits);

        // Historical 6-Month Trend Points
        List<FinancialSummaryDto.MonthlyTrendPoint> trends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth historicalYm = ym.minusMonths(i);
            LocalDate hStart = historicalYm.atDay(1);
            LocalDate hEnd = historicalYm.atEndOfMonth();
            LocalDateTime hStartDt = hStart.atStartOfDay();
            LocalDateTime hEndDt = hEnd.atTime(23, 59, 59);

            BigDecimal hPkgRev = walletTransactionRepository.sumDepositsCollectedByResellerAndDateRange(resellerId, hStartDt, hEndDt);
            BigDecimal hEqRev = equipmentRepository.sumCustomerPaidAmountByResellerAndDateRange(resellerId, hStart, hEnd);
            BigDecimal hTotRev = hPkgRev.add(hEqRev);

            BigDecimal hMotherIsp = motherIspPayoutRepository.sumAmountPaidByResellerAndDateRange(resellerId, hStart, hEnd);
            BigDecimal hEqExp = equipmentRepository.sumPurchaseCostByResellerAndDateRange(resellerId, hStart, hEnd);
            BigDecimal hSvcExp = serviceTicketRepository.sumOperationalCostByResellerAndDateRange(resellerId, hStartDt, hEndDt);
            BigDecimal hOtherExp = hEqExp.add(hSvcExp);
            BigDecimal hTotExp = hMotherIsp.add(hOtherExp);
            BigDecimal hNetProfit = hTotRev.subtract(hTotExp);

            trends.add(new FinancialSummaryDto.MonthlyTrendPoint(
                    historicalYm.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                    hTotRev,
                    hMotherIsp,
                    hOtherExp,
                    hTotExp,
                    hNetProfit
            ));
        }
        dto.setMonthlyTrends(trends);

        return dto;
    }

    /**
     * Super Admin Global Overview across all resellers
     */
    public FinancialSummaryDto getGlobalFinancialSummary(String yearMonthStr) {
        YearMonth ym = (yearMonthStr != null && !yearMonthStr.isBlank())
                ? YearMonth.parse(yearMonthStr)
                : YearMonth.now();

        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();
        LocalDateTime monthStartDt = monthStart.atStartOfDay();
        LocalDateTime monthEndDt = monthEnd.atTime(23, 59, 59);

        BigDecimal packageCollections = walletTransactionRepository.sumTotalDepositsCollectedByDateRange(monthStartDt, monthEndDt);
        BigDecimal motherIspExpense = motherIspPayoutRepository.sumTotalAmountPaidByDateRange(monthStart, monthEnd);
        BigDecimal netProfit = packageCollections.subtract(motherIspExpense);

        FinancialSummaryDto dto = new FinancialSummaryDto();
        dto.setMonth(ym.toString());
        dto.setMonthLabel(ym.format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        dto.setResellerName("Global Platform Total");
        dto.setPackageCollections(packageCollections);
        dto.setTotalRevenue(packageCollections);
        dto.setMotherIspPayoutExpense(motherIspExpense);
        dto.setTotalExpenses(motherIspExpense);
        dto.setPackageGrossProfit(netProfit);
        dto.setNetMonthlyProfit(netProfit);
        dto.setTotalSubscribers(subscriberRepository.count());
        dto.setActiveSubscribers(subscriberRepository.findAll().stream().filter(s -> s.getStatus() == SubscriberStatus.ACTIVE).count());
        return dto;
    }
}
