import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import { TrendBarChart, ExpenseBreakdownChart } from '../components/FinancialCharts';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Network,
  Boxes,
  Wrench,
  Users,
  Wallet,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user, isSuperAdmin, activeWorkspaceId } = useAuth();
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get('/finance/monthly-summary', { month: selectedMonth });
      setFinance(data);
    } catch (err) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [selectedMonth, activeWorkspaceId]);

  const monthOptions = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Financial &amp; Profit Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monthly revenue, Mother ISP disbursements, equipment, and service expenses.
          </p>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Config Ribbon */}
      {finance && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Network className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-blue-200 font-semibold">Configured Mother ISP Sharing</p>
              <h4 className="text-xl font-extrabold">
                {finance.motherIspDisbursementPercentage}% Mother ISP / {finance.resellerRetentionPercentage}% Reseller Retained
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <div>
              <p className="text-blue-200 text-xs uppercase font-medium">Active Subscribers</p>
              <p className="text-lg font-extrabold text-white mt-0.5">{finance.activeSubscribers} / {finance.totalSubscribers}</p>
            </div>
            <div className="border-l border-white/20 pl-8">
              <p className="text-blue-200 text-xs uppercase font-medium">Customer Advance Credits</p>
              <p className="text-lg font-extrabold text-emerald-400 mt-0.5">৳{Number(finance.totalSubscriberWalletCredits || 0).toFixed(2)}</p>
            </div>
            <div className="border-l border-white/20 pl-8">
              <p className="text-blue-200 text-xs uppercase font-medium">Customer Overdue / Delayed</p>
              <p className="text-lg font-extrabold text-rose-300 mt-0.5">৳{Number(finance.totalSubscriberOutstandingDue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Collections (Revenue)"
          value={`৳${Number(finance?.totalRevenue || 0).toFixed(2)}`}
          subtitle="Subscriber packages + equipment payments"
          icon={DollarSign}
          color="blue"
        />

        <MetricCard
          title="Mother ISP Payout (Expense #1)"
          value={`৳${Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}`}
          subtitle={`Disbursed at ${finance?.motherIspDisbursementPercentage || 49}% rate`}
          icon={Network}
          color="indigo"
        />

        <MetricCard
          title="Package Gross Profit"
          value={`৳${Number(finance?.packageGrossProfit || 0).toFixed(2)}`}
          subtitle={`${Number(finance?.packageGrossMarginPercent || 0).toFixed(1)}% gross margin`}
          icon={TrendingUp}
          color="emerald"
        />

        <MetricCard
          title="Net Monthly Profit"
          value={`৳${Number(finance?.netMonthlyProfit || 0).toFixed(2)}`}
          subtitle={`${Number(finance?.netMarginPercent || 0).toFixed(1)}% after all expenses`}
          icon={CheckCircle2}
          color={Number(finance?.netMonthlyProfit || 0) >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Expense Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mother ISP Packages</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">৳{Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipment Purchases (Expense #2)</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">৳{Number(finance?.equipmentPurchaseExpense || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Physical Servicing (Expense #3)</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">৳{Number(finance?.physicalServiceExpense || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <TrendBarChart trends={finance?.monthlyTrends || []} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <ExpenseBreakdownChart
            motherIsp={finance?.motherIspPayoutExpense || 0}
            equipment={finance?.equipmentPurchaseExpense || 0}
            service={finance?.physicalServiceExpense || 0}
          />
        </div>
      </div>

      {/* Financial Statement Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Statement Breakdown</h3>
            <p className="text-xs text-slate-500">{finance?.monthLabel || 'Current Month'}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
            Accounting Summary
          </span>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Revenue Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">1. Operating Revenue</h5>
              <div className="space-y-2 bg-slate-50 rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Internet Package Subscription Collections</span>
                  <span className="font-semibold text-slate-900">৳{Number(finance?.packageCollections || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subscriber Equipment Component Payments</span>
                  <span className="font-semibold text-slate-900">৳{Number(finance?.equipmentSalesCollections || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between items-center font-bold text-blue-600">
                  <span>Total Revenue Collected</span>
                  <span>৳{Number(finance?.totalRevenue || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. Reseller Operating Expenses</h5>
              <div className="space-y-2 bg-slate-50 rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mother ISP Reseller Package Disbursement ({finance?.motherIspDisbursementPercentage}%)</span>
                  <span className="font-semibold text-rose-600">- ৳{Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Equipment &amp; Hardware Purchases (Routers, ONU, Fiber Drop)</span>
                  <span className="font-semibold text-rose-600">- ৳{Number(finance?.equipmentPurchaseExpense || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Physical Service Operational Maintenance (Splicing, Line Repairs)</span>
                  <span className="font-semibold text-rose-600">- ৳{Number(finance?.physicalServiceExpense || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between items-center font-bold text-rose-700">
                  <span>Total Incurred Expenses</span>
                  <span>- ৳{Number(finance?.totalExpenses || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Profit Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">3. Profitability &amp; Margins</h5>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 font-medium">Package Gross Margin (Revenue - Mother ISP Payout)</span>
                  <span className="font-bold text-emerald-800 text-sm">৳{Number(finance?.packageGrossProfit || 0).toFixed(2)} ({Number(finance?.packageGrossMarginPercent || 0).toFixed(1)}%)</span>
                </div>
                <div className="border-t border-emerald-200/60 pt-2 flex justify-between items-center">
                  <span className="text-emerald-950 font-bold text-sm">Net Reseller Profit (Bottom Line)</span>
                  <span className="font-extrabold text-emerald-800 text-lg">৳{Number(finance?.netMonthlyProfit || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
