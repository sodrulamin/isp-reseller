package com.isp.billing.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class FinancialSummaryDto {
    private String month;
    private String monthLabel;
    private Long resellerId;
    private String resellerName;
    private BigDecimal motherIspDisbursementPercentage;
    private BigDecimal resellerRetentionPercentage;

    // Revenue
    private BigDecimal packageCollections = BigDecimal.ZERO;
    private BigDecimal equipmentSalesCollections = BigDecimal.ZERO;
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    // Expenses
    private BigDecimal motherIspPayoutExpense = BigDecimal.ZERO;
    private BigDecimal equipmentPurchaseExpense = BigDecimal.ZERO;
    private BigDecimal physicalServiceExpense = BigDecimal.ZERO;
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    // Profits
    private BigDecimal packageGrossProfit = BigDecimal.ZERO; // packageCollections - motherIspPayoutExpense
    private BigDecimal packageGrossMarginPercent = BigDecimal.ZERO;
    private BigDecimal netMonthlyProfit = BigDecimal.ZERO; // totalRevenue - totalExpenses
    private BigDecimal netMarginPercent = BigDecimal.ZERO;

    // Operational Metrics
    private long totalSubscribers;
    private long activeSubscribers;
    private long serviceTicketsResolved;
    private long equipmentDeployed;
    private BigDecimal totalSubscriberOutstandingDue = BigDecimal.ZERO;
    private BigDecimal totalSubscriberWalletCredits = BigDecimal.ZERO;

    // Monthly Trends (for charts)
    private List<MonthlyTrendPoint> monthlyTrends;

    public static class MonthlyTrendPoint {
        private String month;
        private BigDecimal revenue;
        private BigDecimal motherIspExpense;
        private BigDecimal otherExpenses;
        private BigDecimal totalExpense;
        private BigDecimal netProfit;

        public MonthlyTrendPoint() {}

        public MonthlyTrendPoint(String month, BigDecimal revenue, BigDecimal motherIspExpense,
                                 BigDecimal otherExpenses, BigDecimal totalExpense, BigDecimal netProfit) {
            this.month = month;
            this.revenue = revenue;
            this.motherIspExpense = motherIspExpense;
            this.otherExpenses = otherExpenses;
            this.totalExpense = totalExpense;
            this.netProfit = netProfit;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

        public BigDecimal getMotherIspExpense() { return motherIspExpense; }
        public void setMotherIspExpense(BigDecimal motherIspExpense) { this.motherIspExpense = motherIspExpense; }

        public BigDecimal getOtherExpenses() { return otherExpenses; }
        public void setOtherExpenses(BigDecimal otherExpenses) { this.otherExpenses = otherExpenses; }

        public BigDecimal getTotalExpense() { return totalExpense; }
        public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }

        public BigDecimal getNetProfit() { return netProfit; }
        public void setNetProfit(BigDecimal netProfit) { this.netProfit = netProfit; }
    }

    public FinancialSummaryDto() {}

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public String getMonthLabel() { return monthLabel; }
    public void setMonthLabel(String monthLabel) { this.monthLabel = monthLabel; }

    public Long getResellerId() { return resellerId; }
    public void setResellerId(Long resellerId) { this.resellerId = resellerId; }

    public String getResellerName() { return resellerName; }
    public void setResellerName(String resellerName) { this.resellerName = resellerName; }

    public BigDecimal getMotherIspDisbursementPercentage() { return motherIspDisbursementPercentage; }
    public void setMotherIspDisbursementPercentage(BigDecimal motherIspDisbursementPercentage) {
        this.motherIspDisbursementPercentage = motherIspDisbursementPercentage;
    }

    public BigDecimal getResellerRetentionPercentage() { return resellerRetentionPercentage; }
    public void setResellerRetentionPercentage(BigDecimal resellerRetentionPercentage) {
        this.resellerRetentionPercentage = resellerRetentionPercentage;
    }

    public BigDecimal getPackageCollections() { return packageCollections; }
    public void setPackageCollections(BigDecimal packageCollections) { this.packageCollections = packageCollections; }

    public BigDecimal getEquipmentSalesCollections() { return equipmentSalesCollections; }
    public void setEquipmentSalesCollections(BigDecimal equipmentSalesCollections) {
        this.equipmentSalesCollections = equipmentSalesCollections;
    }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getMotherIspPayoutExpense() { return motherIspPayoutExpense; }
    public void setMotherIspPayoutExpense(BigDecimal motherIspPayoutExpense) {
        this.motherIspPayoutExpense = motherIspPayoutExpense;
    }

    public BigDecimal getEquipmentPurchaseExpense() { return equipmentPurchaseExpense; }
    public void setEquipmentPurchaseExpense(BigDecimal equipmentPurchaseExpense) {
        this.equipmentPurchaseExpense = equipmentPurchaseExpense;
    }

    public BigDecimal getPhysicalServiceExpense() { return physicalServiceExpense; }
    public void setPhysicalServiceExpense(BigDecimal physicalServiceExpense) {
        this.physicalServiceExpense = physicalServiceExpense;
    }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getPackageGrossProfit() { return packageGrossProfit; }
    public void setPackageGrossProfit(BigDecimal packageGrossProfit) { this.packageGrossProfit = packageGrossProfit; }

    public BigDecimal getPackageGrossMarginPercent() { return packageGrossMarginPercent; }
    public void setPackageGrossMarginPercent(BigDecimal packageGrossMarginPercent) {
        this.packageGrossMarginPercent = packageGrossMarginPercent;
    }

    public BigDecimal getNetMonthlyProfit() { return netMonthlyProfit; }
    public void setNetMonthlyProfit(BigDecimal netMonthlyProfit) { this.netMonthlyProfit = netMonthlyProfit; }

    public BigDecimal getNetMarginPercent() { return netMarginPercent; }
    public void setNetMarginPercent(BigDecimal netMarginPercent) { this.netMarginPercent = netMarginPercent; }

    public long getTotalSubscribers() { return totalSubscribers; }
    public void setTotalSubscribers(long totalSubscribers) { this.totalSubscribers = totalSubscribers; }

    public long getActiveSubscribers() { return activeSubscribers; }
    public void setActiveSubscribers(long activeSubscribers) { this.activeSubscribers = activeSubscribers; }

    public long getServiceTicketsResolved() { return serviceTicketsResolved; }
    public void setServiceTicketsResolved(long serviceTicketsResolved) {
        this.serviceTicketsResolved = serviceTicketsResolved;
    }

    public long getEquipmentDeployed() { return equipmentDeployed; }
    public void setEquipmentDeployed(long equipmentDeployed) { this.equipmentDeployed = equipmentDeployed; }

    public BigDecimal getTotalSubscriberOutstandingDue() { return totalSubscriberOutstandingDue; }
    public void setTotalSubscriberOutstandingDue(BigDecimal totalSubscriberOutstandingDue) {
        this.totalSubscriberOutstandingDue = totalSubscriberOutstandingDue;
    }

    public BigDecimal getTotalSubscriberWalletCredits() { return totalSubscriberWalletCredits; }
    public void setTotalSubscriberWalletCredits(BigDecimal totalSubscriberWalletCredits) {
        this.totalSubscriberWalletCredits = totalSubscriberWalletCredits;
    }

    public List<MonthlyTrendPoint> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<MonthlyTrendPoint> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
}
